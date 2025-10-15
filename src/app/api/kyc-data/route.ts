import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取KYC状态文本
function getKycStatusText(status: number | null | undefined): string {
  switch (status) {
    case 0: return '未提交';
    case 1: return '已通过';
    case 2: return '审核中';
    case 3: return '已拒绝';
    default: return '未知';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchKeyword = searchParams.get('searchKeyword') || '';
    const kycStatus = searchParams.get('kycStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const where: any = {};

    // 钱包地址或卡号搜索
    if (searchKeyword) {
      where.OR = [
        {
          wallet: {
            contains: searchKeyword,
          },
        },
        {
          cardId: {
            contains: searchKeyword,
          },
        },
        {
          cardHolderId: {
            contains: searchKeyword,
          },
        },
      ];
    }

    // KYC状态筛选
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
    const total = await prisma.kycAuding.count({ where });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // 查询KYC审核记录数据并关联KYC信息
    const kycAudingRecords = await prisma.kycAuding.findMany({
      where,
      include: {
        kycInfo: true, // 关联查询kyc_info表
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      skip,
      take: limit,
    });

    // 转换数据格式以匹配前端期望
    const formattedData = kycAudingRecords.map((record: any) => {
      const kycInfo = record.kycInfo;

      // 拼接姓名
      let fullName = '未填写';
      if (kycInfo && (kycInfo.firstName || kycInfo.lastName)) {
        fullName = `${kycInfo.firstName || ''} ${kycInfo.lastName || ''}`.trim();
      }

      // 格式化日期
      const formatDate = (date: Date | null) => {
        return date ? date.toISOString() : null;
      };

      return {
        // KYC审核记录信息
        id: record.id.toString(),
        wallet: record.wallet || '',
        cardId: record.cardId || '',
        cardBin: record.cardBin || '',
        cardHolderId: record.cardHolderId || '',
        kycStatus: record.kycStatus || 0,
        kycStatusText: getKycStatusText(record.kycStatus),
        createdAt: formatDate(record.createdAt),
        audingAt: formatDate(record.audingAt),
        reason: record.reason || '',
        updatedAt: formatDate(record.updatedAt),
        remark: record.remark || '',
        kycInfoId: record.kycInfoId || null,

        // KYC详细信息（从关联的kyc_info表）
        kycInfo: kycInfo ? {
          id: kycInfo.id,
          wallet: kycInfo.wallet || '',
          firstName: kycInfo.firstName || '',
          lastName: kycInfo.lastName || '',
          fullName: fullName,
          email: kycInfo.email || '',
          mobile: kycInfo.mobile || '',
          mobilePrefix: kycInfo.mobilePrefix || '',
          dateOfBirth: formatDate(kycInfo.dateOfBirth),
          certType: kycInfo.certType || '',
          portrait: kycInfo.portrait || '',
          reverseSide: kycInfo.reverseSide || '',
          nationalityCountryCode: kycInfo.nationalityCountryCode || '',
          postCode: kycInfo.postCode || '',
          country: kycInfo.country || '',
          state: kycInfo.state || '',
          city: kycInfo.city || '',
          address: kycInfo.address || '',
          createdAt: formatDate(kycInfo.createdAt),
          updatedAt: formatDate(kycInfo.updatedAt),
          remark: kycInfo.remark || '',
        } : null,
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
    console.error('获取KYC数据列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取KYC数据列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
