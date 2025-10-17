import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取卡类型文本
function getCardTypeLabel(cardType: string): string {
  switch (cardType.toUpperCase()) {
    case 'A': return '皇家卡';
    case 'B': return '爵士卡';
    case 'C': return '典藏卡';
    // 兼容数字类型
    case '1': return '皇家卡';
    case '2': return '爵士卡';
    case '3': return '典藏卡';
    default: return cardType;
  }
}

export async function GET() {
  try {
    // 从数据库查询实际存在的卡类型
    const distinctCardTypes = await prisma.cardInfo.findMany({
      where: {
        cardType: {
          not: null
        }
      },
      select: {
        cardType: true
      },
      distinct: ['cardType']
    });

    // 转换为前端需要的格式
    const cardTypes = distinctCardTypes
      .filter((item: { cardType: string | null }) => item.cardType)
      .map((item: { cardType: string | null }) => ({
        value: item.cardType!,
        label: getCardTypeLabel(item.cardType!)
      }));

    // 如果数据库中没有数据，使用默认选项
    const finalCardTypes = cardTypes.length > 0 ? cardTypes : [
      { value: "A", label: "皇家卡" },
      { value: "B", label: "爵士卡" },
      { value: "C", label: "典藏卡" }
    ];

    const options = {
      cardTypes: finalCardTypes,
      cardStatuses: [
        { value: 1, label: "正常" },
        { value: 2, label: "冻结" },
        { value: 3, label: "销卡" },
        { value: 4, label: "未开卡" }
      ],
      kycStatuses: [
        { value: 0, label: "未提交" },
        { value: 1, label: "正常" },
        { value: 2, label: "进行中" },
        { value: 3, label: "失败" }
      ]
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