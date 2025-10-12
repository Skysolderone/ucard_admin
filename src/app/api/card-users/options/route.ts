import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取所有可用的筛选选项
    const [cardTypes, cardStatuses, kycStatuses] = await Promise.all([
      // 获取所有开卡类型
      prisma.cardUser.findMany({
        select: {
          cardType: true
        },
        distinct: ['cardType']
      }),
      // 获取所有卡片状态
      prisma.cardUser.findMany({
        select: {
          cardStatus: true
        },
        distinct: ['cardStatus']
      }),
      // 获取所有KYC状态
      prisma.cardUser.findMany({
        select: {
          kycStatus: true
        },
        distinct: ['kycStatus']
      })
    ]);

    // 格式化选项数据
    const options = {
      cardTypes: cardTypes.map(item => ({
        value: item.cardType,
        label: item.cardType
      })),
      cardStatuses: cardStatuses.map(item => ({
        value: item.cardStatus,
        label: getCardStatusText(item.cardStatus)
      })),
      kycStatuses: kycStatuses.map(item => ({
        value: item.kycStatus,
        label: getKycStatusText(item.kycStatus)
      }))
    };

    return NextResponse.json({
      success: true,
      data: options
    });

  } catch (error) {
    console.error('获取筛选选项失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取筛选选项失败',
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