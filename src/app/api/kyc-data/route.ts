import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

    // 先查询KYC审核记录（不包含关联）
    const kycAudingRecords = await prisma.kycAuding.findMany({
      where,
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      skip,
      take: limit,
    });

    // 获取所有需要的 kycInfoId
    const kycInfoIds = kycAudingRecords
      .filter(record => record.kycInfoId)
      .map(record => record.kycInfoId as number);

    // 获取所有需要的 cardId 用于查询 card_no
    const cardIds = kycAudingRecords
      .filter(record => record.cardId)
      .map(record => record.cardId as string);

    // 使用原始查询获取 KYC 信息，避免日期解析问题
    let kycInfosRaw: any[] = [];
    if (kycInfoIds.length > 0) {
      // 构建安全的 IN 查询
      const placeholders = kycInfoIds.map(() => '?').join(',');
      kycInfosRaw = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          id,
          wallet,
          first_name,
          last_name,
          email,
          mobile,
          mobile_prefix,
          DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth_str,
          cert_type,
          portrait,
          reverse_side,
          person,
          nationality_country_code,
          post_code,
          country,
          state,
          city,
          address,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at_str,
          DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at_str,
          remark
        FROM t_kyc_info
        WHERE id IN (${placeholders})
      `, ...kycInfoIds);
    }

    // 辅助函数：将字符串日期转换为 Date 对象，过滤无效日期
    const parseDate = (dateStr: string | null): Date | null => {
      if (!dateStr || dateStr.startsWith('0000-00-00')) {
        return null;
      }
      try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    };

    // 创建 kycInfo 映射 - 使用 Number 类型确保一致性
    const kycInfoMap = new Map();
    kycInfosRaw.forEach((info: any) => {
      // 确保 ID 是数字类型
      const infoId = typeof info.id === 'bigint' ? Number(info.id) : Number(info.id);
      kycInfoMap.set(infoId, {
        id: infoId,
        wallet: info.wallet,
        firstName: info.first_name,
        lastName: info.last_name,
        email: info.email,
        mobile: info.mobile,
        mobilePrefix: info.mobile_prefix,
        dateOfBirth: parseDate(info.date_of_birth_str),
        certType: info.cert_type,
        portrait: info.portrait,
        reverseSide: info.reverse_side,
        person: info.person,
        nationalityCountryCode: info.nationality_country_code,
        postCode: info.post_code,
        country: info.country,
        state: info.state,
        city: info.city,
        address: info.address,
        createdAt: parseDate(info.created_at_str),
        updatedAt: parseDate(info.updated_at_str),
        remark: info.remark,
      });
    });

    // 查询 card_no 数据
    let cardInfosRaw: any[] = [];
    if (cardIds.length > 0) {
      const placeholders = cardIds.map(() => '?').join(',');
      cardInfosRaw = await prisma.$queryRawUnsafe<any[]>(`
        SELECT card_id, card_no
        FROM t_card_info
        WHERE card_id IN (${placeholders})
      `, ...cardIds);
    }

    // 创建 cardInfo 映射
    const cardNoMap = new Map();
    cardInfosRaw.forEach((cardInfo: any) => {
      cardNoMap.set(cardInfo.card_id, cardInfo.card_no);
    });

    console.log('kycInfoIds:', kycInfoIds);
    console.log('kycInfosRaw count:', kycInfosRaw.length);
    console.log('kycInfoMap keys:', Array.from(kycInfoMap.keys()));

    // 转换数据格式以匹配前端期望
    const formattedData = kycAudingRecords.map((record: any) => {
      // 确保 kycInfoId 转换为数字类型进行查找
      const lookupId = record.kycInfoId ? Number(record.kycInfoId) : null;
      const kycInfo = lookupId ? kycInfoMap.get(lookupId) : null;

      if (lookupId && !kycInfo) {
        console.log('找不到 kycInfo:', lookupId, 'record.kycInfoId:', record.kycInfoId, 'type:', typeof record.kycInfoId);
      }

      // 拼接姓名
      let fullName = '未填写';
      if (kycInfo && (kycInfo.firstName || kycInfo.lastName)) {
        fullName = `${kycInfo.firstName || ''} ${kycInfo.lastName || ''}`.trim();
      }

      // 格式化日期
      const formatDate = (date: Date | null) => {
        return date ? date.toISOString() : null;
      };

      // 获取 card_no
      const cardNo = record.cardId ? cardNoMap.get(record.cardId) : null;

      return {
        // KYC审核记录信息
        id: record.id.toString(),
        wallet: record.wallet || '',
        cardId: record.cardId || '',
        cardNo: cardNo || '',
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
          person: kycInfo.person || '',
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
