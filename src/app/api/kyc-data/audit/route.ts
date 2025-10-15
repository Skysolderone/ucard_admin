import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, reason } = body;

    // 验证参数
    if (!id || !action) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要参数',
        },
        { status: 400 }
      );
    }

    // 验证审核动作
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        {
          success: false,
          message: '无效的审核动作',
        },
        { status: 400 }
      );
    }

    // 如果是拒绝，验证必须有拒绝原因
    if (action === 'reject' && !reason) {
      return NextResponse.json(
        {
          success: false,
          message: '拒绝审核必须填写原因',
        },
        { status: 400 }
      );
    }

    // 查询审核记录
    const audingRecord = await prisma.kycAuding.findUnique({
      where: { id: BigInt(id) },
    });

    if (!audingRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'KYC审核记录不存在',
        },
        { status: 404 }
      );
    }

    // 检查当前状态是否为审核中
    if (audingRecord.kycStatus !== 2) {
      return NextResponse.json(
        {
          success: false,
          message: '该记录不是审核中状态，无法审核',
        },
        { status: 400 }
      );
    }

    // 调用外部API
    try {
      const externalApiUrl = action === 'approve'
        ? 'http://ucard-api:9091/v1/card/approval'
        : 'http://ucard-api:9091/v1/card/reject';

      let requestBody: any;

      if (action === 'approve') {
        // 通过审核需要发送完整的KYC信息
        // 先查询KYC详细信息
        const kycInfo = audingRecord.kycInfoId
          ? await prisma.kycInfo.findUnique({
              where: { id: audingRecord.kycInfoId },
            })
          : null;

        if (!kycInfo) {
          return NextResponse.json(
            {
              success: false,
              message: '未找到KYC详细信息',
            },
            { status: 404 }
          );
        }

        // 查询wallet_id
        const userInfo = await prisma.$queryRaw<Array<{ id: number }>>`
          SELECT id FROM t_user_info WHERE wallet = ${audingRecord.wallet} LIMIT 1
        `;

        const walletId = userInfo.length > 0 ? userInfo[0].id : 0;

        requestBody = {
          wallet: audingRecord.wallet || '',
          wallet_id: walletId,
          kyc_id: parseInt(id),
          first_name: kycInfo.firstName || '',
          last_name: kycInfo.lastName || '',
          email: kycInfo.email || '',
          mobile: kycInfo.mobile || '',
          mobile_prefix: kycInfo.mobilePrefix || '',
          date_of_birth: kycInfo.dateOfBirth ? kycInfo.dateOfBirth.toISOString() : new Date().toISOString(),
          cert_type: kycInfo.certType || '',
          portrait: kycInfo.portrait || '',
          reverse_side: kycInfo.reverseSide || '',
          nationality_country_code: kycInfo.nationalityCountryCode || '',
          post_code: kycInfo.postCode || '',
          country: kycInfo.country || '',
          state: kycInfo.state || '',
          city: kycInfo.city || '',
          address: kycInfo.address || '',
        };
      } else {
        // 拒绝审核只需要基本信息
        requestBody = {
          wallet: audingRecord.wallet,
          kyc_id: parseInt(id),
          reason: reason,
        };
      }

      console.log('调用外部API:', externalApiUrl);
      console.log('请求体:', JSON.stringify(requestBody, null, 2));

      const externalResponse = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('外部API响应状态:', externalResponse.status);

      if (!externalResponse.ok) {
        const errorData = await externalResponse.json().catch(() => ({}));
        console.error('外部API调用失败:', errorData);
        return NextResponse.json(
          {
            success: false,
            message: `调用${action === 'approve' ? '通过' : '拒绝'}接口失败，请稍后重试`,
            error: errorData,
          },
          { status: 500 }
        );
      }

      const responseData = await externalResponse.json();
      console.log('外部API响应数据:', responseData);
    } catch (error) {
      console.error('调用外部API异常:', error);
      console.error('错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        {
          success: false,
          message: `网络错误，无法连接到${action === 'approve' ? '通过' : '拒绝'}接口`,
          error: error instanceof Error ? error.message : '未知错误',
        },
        { status: 500 }
      );
    }

    // 更新审核状态
    const newStatus = action === 'approve' ? 1 : 3;
    const now = new Date();

    const updateData: any = {
      kycStatus: newStatus,
      audingAt: now,
      updatedAt: now,
    };

    // 如果是拒绝，添加拒绝原因
    if (action === 'reject') {
      updateData.reason = reason;
    }

    // 更新审核记录
    await prisma.kycAuding.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    // 同时更新card_info表的kyc_status（如果有关联）
    if (audingRecord.cardId) {
      await prisma.cardInfo.updateMany({
        where: {
          cardId: audingRecord.cardId,
        },
        data: {
          kycStatus: newStatus,
          updatedAt: now,
        },
      });
    }

    // 更新user_info表的kyc_status（如果有关联）
    if (audingRecord.wallet) {
      await prisma.$executeRaw`
        UPDATE t_user_info
        SET kyc_status = ${newStatus}, updated_at = ${now}
        WHERE wallet = ${audingRecord.wallet}
      `;
    }

    return NextResponse.json({
      success: true,
      message: `审核${action === 'approve' ? '通过' : '拒绝'}成功`,
      data: {
        id,
        status: newStatus,
        audingAt: now.toISOString(),
      },
    });

  } catch (error) {
    console.error('KYC审核失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'KYC审核失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
