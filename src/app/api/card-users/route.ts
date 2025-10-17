import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取状态文本
function getCardStatusText(status: number | null | undefined): string {
  switch (status) {
    case 1: return '正常';
    case 2: return '冻结';
    case 3: return '销卡';
    case 4: return '未开卡';
    default: return '未知';
  }
}

function getKycStatusText(status: number | null | undefined): string {
  switch (status) {
    case 0: return '未提交';
    case 1: return '正常';
    case 2: return '进行中';
    case 3: return '失败';
    default: return '未知';
  }
}

// 获取卡类型文本（根据 card_type 值映射）
function getCardTypeText(cardType: string | null | undefined): string {
  // 根据实际数据库中的值进行映射
  if (!cardType) return '未知';

  // 卡类型映射：A-皇家卡, B-爵士卡
  switch (cardType.toUpperCase()) {
    case 'A': return '皇家卡';
    case 'B': return '爵士卡';
    case 'C': return '典藏卡';
    // 兼容数字类型
    case '1': return '皇家卡';
    case '2': return '爵士卡';
    case '3': return '典藏卡';
    default: return cardType; // 如果已经是中文，直接返回
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchKeyword = searchParams.get('searchKeyword') || '';
    const cardTypeParam = searchParams.get('cardType') || '';
    const cardStatus = searchParams.get('cardStatus');
    const kycStatus = searchParams.get('kycStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const where: any = {};

    if (searchKeyword) {
      where.OR = [
        {
          wallet: {
            contains: searchKeyword,
          },
        },
        {
          cardNo: {
            contains: searchKeyword,
          },
        },
      ];
    }

    if (cardTypeParam) {
      where.cardType = cardTypeParam;
    }

    // 如果卡片状态选择的是"未开卡"(4)，则查询 kyc_status=0 且 status!=3 的记录
    // 状态说明：1=正常, 2=冻结, 3=销卡, 4=未开卡
    if (cardStatus !== null && cardStatus !== '') {
      const cardStatusValue = parseInt(cardStatus);
      if (cardStatusValue === 4) {
        // 未开卡状态：查询 kyc_status=0 且排除已销卡(status=3)的记录
        where.kycStatus = 0;
        where.status = { not: 3 };
      } else {
        where.status = cardStatusValue;
      }
    }

    if (kycStatus !== null && kycStatus !== '') {
      where.kycStatus = parseInt(kycStatus);
    }

    // 日期筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // 查询总数
    const total = await prisma.cardInfo.count({ where });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // 查询数据 - 按逻辑开卡时间（createdAt）降序排列
    const cardInfos = await prisma.cardInfo.findMany({
      where,
      orderBy: [
        {
          createdAt: 'desc', // 优先按逻辑开卡时间降序
        },
        {
          updatedAt: 'desc', // 如果 createdAt 相同或为 null，则按真实开卡时间降序
        },
      ],
      skip,
      take: limit,
    });

    // 批量查询 KYC 信息以提升性能
    const cardHolderIds = cardInfos.map((card: any) => card.cardHolderId).filter(Boolean) as string[];
    const cardIds = cardInfos.map((card: any) => card.cardId).filter(Boolean) as string[];

    // 查询所有相关的 KYC 审核记录（kyc_status = 1）
    const kycAudings = await prisma.kycAuding.findMany({
      where: {
        cardHolderId: { in: cardHolderIds },
        kycStatus: 1,
      },
      select: {
        id: true,
        cardHolderId: true,
        kycInfoId: true,
      },
    });

    // 获取所有 kycInfoId
    const kycInfoIds = kycAudings
      .filter(record => record.kycInfoId)
      .map(record => record.kycInfoId as number);

    // 查询 KYC 信息
    let kycInfos: any[] = [];
    if (kycInfoIds.length > 0) {
      kycInfos = await prisma.kycInfo.findMany({
        where: {
          id: { in: kycInfoIds },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    // 创建 kycInfo 映射 (使用 id 作为 key)
    const kycInfoMap = new Map<number, { firstName: string | null; lastName: string | null }>();
    kycInfos.forEach((info: any) => {
      kycInfoMap.set(info.id, {
        firstName: info.firstName,
        lastName: info.lastName,
      });
    });

    // 查询所有相关的交易记录并按 wallet、card_id 和 trade_type 聚合
    const cardActions = await prisma.cardAction.groupBy({
      by: ['wallet', 'cardId', 'tradeType'],
      where: {
        cardId: { in: cardIds },
      },
      _sum: {
        amount: true,
      },
    });

    // 创建 KYC 映射表 (使用 card_holder_id 作为 key)
    const kycMap = new Map<string, { firstName: string | null; lastName: string | null }>();

    for (const auding of kycAudings) {
      if (auding.cardHolderId && auding.kycInfoId) {
        const kycInfo = kycInfoMap.get(auding.kycInfoId);
        if (kycInfo) {
          kycMap.set(auding.cardHolderId, {
            firstName: kycInfo.firstName,
            lastName: kycInfo.lastName,
          });
        }
      }
    }

    // 创建交易金额映射表 (使用 wallet_cardId 作为 key)
    const transactionMap = new Map<string, {
      totalRecharge: number;
      totalWithdraw: number;
      totalConsume: number;
      totalRefund: number;
    }>();

    for (const action of cardActions) {
      if (!action.wallet || !action.cardId) continue;

      const key = `${action.wallet}_${action.cardId}`;

      if (!transactionMap.has(key)) {
        transactionMap.set(key, {
          totalRecharge: 0,
          totalWithdraw: 0,
          totalConsume: 0,
          totalRefund: 0,
        });
      }

      const totals = transactionMap.get(key)!;
      const amount = Number(action._sum.amount || 0);

      switch (action.tradeType) {
        case 'deposit':
          totals.totalRecharge += amount;
          break;
        case 'withdraw':
          totals.totalWithdraw += amount;
          break;
        case 'auth':
          totals.totalConsume += amount;
          break;
        case 'refund':
          totals.totalRefund += amount;
          break;
      }
    }

    // 转换数据格式以匹配前端期望
    const formattedData = cardInfos.map((card: any) => {
      // 根据 card_holder_id 查找 KYC 信息
      const kycData = card.cardHolderId ? kycMap.get(card.cardHolderId) : undefined;

      // 拼接姓名
      let fullName = card.cardHolderId || '未填写';
      if (kycData && (kycData.firstName || kycData.lastName)) {
        fullName = `${kycData.firstName || ''} ${kycData.lastName || ''}`.trim();
      }

      // 根据 wallet + card_id 查找交易统计数据
      const transactionKey = `${card.wallet}_${card.cardId}`;
      const transactions = transactionMap.get(transactionKey);

      // 状态优先级：销卡(3) > 未开卡(4) > 其他状态
      // 如果已销卡(status=3)，则始终显示销卡状态
      // 否则如果 KYC 状态是未提交(0)，则显示为未开卡(4)
      // 否则使用数据库中的 status 字段（1=正常, 2=冻结）
      const actualCardStatus = (card.status === 3) ? 3 : (card.kycStatus === 0) ? 4 : (card.status || 0);

      // 如果已销卡，显示更新时间；如果 KYC 未提交且未销卡，显示"未提交"
      const actualRealCardTime = (card.status === 3) ? (card.updatedAt?.toISOString() || null) : 
                                 (card.kycStatus === 0) ? '未提交' : 
                                 (card.updatedAt?.toISOString() || null);

      return {
        id: card.id.toString(), // 使用数据库自增 ID
        cardId: card.cardId || '', // 业务卡片 ID
        walletAddress: card.wallet || '',
        firstName: kycData?.firstName || null,
        lastName: kycData?.lastName || null,
        fullName: fullName,
        paymentHash: card.transferHash || '', // 支付哈希来自 transfer_hash 字段
        cardType: getCardTypeText(card.cardType),
        cardStatus: actualCardStatus,
        cardStatusText: getCardStatusText(actualCardStatus),
        kycStatus: card.kycStatus || 0,
        kycStatusText: getKycStatusText(card.kycStatus),
        cardBalance: Number(card.cardAmount || 0),
        totalRecharge: transactions?.totalRecharge || 0,
        totalConsume: transactions?.totalConsume || 0,
        totalWithdraw: transactions?.totalWithdraw || 0,
        totalRefund: transactions?.totalRefund || 0,
        cardNumber: card.cardNo || null,
        expiryDate: card.expeireTime || null,
        logicalCardTime: card.createdAt?.toISOString() || new Date().toISOString(),
        realCardTime: actualRealCardTime,
        createdAt: card.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: card.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        list: formattedData,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('获取开卡用户列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取开卡用户列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
