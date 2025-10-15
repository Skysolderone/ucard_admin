import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const options = {
      kycStatuses: [
        { value: 0, label: "未提交" },
        { value: 1, label: "已通过" },
        { value: 2, label: "审核中" },
        { value: 3, label: "已拒绝" }
      ]
    };

    return NextResponse.json({
      success: true,
      data: options
    });

  } catch (error) {
    console.error('获取KYC筛选选项失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取KYC筛选选项失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
