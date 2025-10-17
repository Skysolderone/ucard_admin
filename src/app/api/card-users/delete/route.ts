import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要参数：id',
        },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const cardInfo = await prisma.cardInfo.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!cardInfo) {
      return NextResponse.json(
        {
          success: false,
          message: '用户不存在',
        },
        { status: 404 }
      );
    }

    // 更新 status 为 3（销卡状态）
    await prisma.cardInfo.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: 3,
      },
    });

    return NextResponse.json({
      success: true,
      message: '销卡成功',
    });

  } catch (error) {
    console.error('销卡失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '销卡失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

