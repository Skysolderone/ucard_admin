import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 模拟筛选选项数据
    const options = {
      cardTypes: [
        { value: "典藏卡", label: "典藏卡" },
        { value: "爵士卡", label: "爵士卡" },
        { value: "皇家卡", label: "皇家卡" }
      ],
      cardStatuses: [
        { value: 1, label: "正常" },
        { value: 2, label: "冻结" },
        { value: 3, label: "未开卡" }
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