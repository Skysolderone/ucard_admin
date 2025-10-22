import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // const wallet = searchParams.get('wallet');

    // if (!wallet) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: '缺少钱包地址参数',
    //     },
    //     { status: 400 }
    //   );
    // }

    // 调用外部API获取卡bin数据
    const externalApiUrl = `http://ucard-api:9091/v1/system/getCardbin`;
    // const externalApiUrl = `http://localhost:9091/v1/system/getCardbin`;

    console.log('调用卡bin API:', externalApiUrl);

    const externalResponse = await fetch(externalApiUrl, {
      method: 'GET',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    });

    console.log('外部API响应状态:', externalResponse.status);

    if (!externalResponse.ok) {
      const errorData = await externalResponse.json().catch(() => ({}));
      console.error('外部API调用失败:', errorData);
      return NextResponse.json(
        {
          success: false,
          message: '获取卡bin数据失败，请稍后重试',
          error: errorData,
        },
        { status: 500 }
      );
    }

    const responseData = await externalResponse.json();
    console.log('外部API响应数据:', responseData);

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('获取卡bin数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取卡bin数据失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

