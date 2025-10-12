import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const walletAddress = searchParams.get('walletAddress') || '';
    const cardType = searchParams.get('cardType') || '';
    const cardStatus = searchParams.get('cardStatus');
    const kycStatus = searchParams.get('kycStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (walletAddress) {
      where.walletAddress = {
        contains: walletAddress
      };
    }

    if (cardType) {
      where.cardType = cardType;
    }

    if (cardStatus !== null && cardStatus !== '') {
      where.cardStatus = parseInt(cardStatus);
    }

    if (kycStatus !== null && kycStatus !== '') {
      where.kycStatus = parseInt(kycStatus);
    }

    // 时间范围筛选（基于逻辑开卡时间）
    if (startDate || endDate) {
      where.logicalCardTime = {};
      if (startDate) {
        where.logicalCardTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.logicalCardTime.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // 计算偏移量
    const skip = (page - 1) * limit;

    // 查询数据
    const [cardUsers, total] = await Promise.all([
      prisma.cardUser.findMany({
        where,
        orderBy: {
          logicalCardTime: 'desc' // 按开卡时间倒序
        },
        skip,
        take: limit,
        select: {
          id: true,
          walletAddress: true,
          firstName: true,
          lastName: true,
          paymentHash: true,
          cardType: true,
          cardStatus: true,
          kycStatus: true,
          cardBalance: true,
          totalRecharge: true,
          totalConsume: true,
          totalWithdraw: true,
          totalRefund: true,
          cardNumber: true,
          expiryDate: true,
          logicalCardTime: true,
          realCardTime: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.cardUser.count({ where })
    ]);

    // 格式化数据
    const formattedUsers = cardUsers.map(user => ({
      ...user,
      fullName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : '',
      cardStatusText: getCardStatusText(user.cardStatus),
      kycStatusText: getKycStatusText(user.kycStatus),
      cardBalance: Number(user.cardBalance),
      totalRecharge: Number(user.totalRecharge),
      totalConsume: Number(user.totalConsume),
      totalWithdraw: Number(user.totalWithdraw),
      totalRefund: Number(user.totalRefund)
    }));

    return NextResponse.json({
      success: true,
      data: {
        list: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
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

// 获取卡片状态文本
function getCardStatusText(status: number): string {
  switch (status) {
    case 1:
      return '正常';
    case 2:
      return '冻结';
    case 3:
      return '未开卡';
    default:
      return '未知';
  }
}

// 获取KYC状态文本
function getKycStatusText(status: number): string {
  switch (status) {
    case 0:
      return '未提交';
    case 1:
      return '正常';
    case 2:
      return '进行中';
    case 3:
      return '失败';
    default:
      return '未知';
  }
}