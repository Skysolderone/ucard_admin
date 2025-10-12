import { NextResponse } from 'next/server';

// 模拟统计数据API
export async function GET() {
  try {
    // 从模拟数据计算统计信息
    const mockCardUsers = [
      {
        cardStatus: 1, // 正常
        cardBalance: 1250.50,
        totalRecharge: 2000.00,
        totalConsume: 749.50,
        totalWithdraw: 0.00,
        totalRefund: 0.00,
      },
      {
        cardStatus: 1, // 正常
        cardBalance: 850.25,
        totalRecharge: 1500.00,
        totalConsume: 649.75,
        totalWithdraw: 0.00,
        totalRefund: 0.00,
      },
      {
        cardStatus: 3, // 未开卡
        cardBalance: 0.00,
        totalRecharge: 0.00,
        totalConsume: 0.00,
        totalWithdraw: 0.00,
        totalRefund: 0.00,
      },
      {
        cardStatus: 2, // 冻结
        cardBalance: 450.00,
        totalRecharge: 1000.00,
        totalConsume: 350.00,
        totalWithdraw: 200.00,
        totalRefund: 0.00,
      },
      {
        cardStatus: 1, // 正常
        cardBalance: 2150.75,
        totalRecharge: 3000.00,
        totalConsume: 849.25,
        totalWithdraw: 0.00,
        totalRefund: 0.00,
      },
    ];

    // 计算统计数据
    const totalCards = mockCardUsers.length;
    const normalCards = mockCardUsers.filter(user => user.cardStatus === 1).length;
    const pendingCards = mockCardUsers.filter(user => user.cardStatus === 3).length;
    const frozenCards = mockCardUsers.filter(user => user.cardStatus === 2).length;
    
    // 总卡余额
    const totalBalance = mockCardUsers.reduce((sum, user) => sum + user.cardBalance, 0);
    
    // 总充值金额
    const totalRecharge = mockCardUsers.reduce((sum, user) => sum + user.totalRecharge, 0);
    
    // 总消费金额
    const totalConsume = mockCardUsers.reduce((sum, user) => sum + user.totalConsume, 0);
    
    // 总提现金额
    const totalWithdraw = mockCardUsers.reduce((sum, user) => sum + user.totalWithdraw, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalCards,
        normalCards,
        pendingCards,
        frozenCards,
        totalBalance: Number(totalBalance.toFixed(2)),
        totalRecharge: Number(totalRecharge.toFixed(2)),
        totalConsume: Number(totalConsume.toFixed(2)),
        totalWithdraw: Number(totalWithdraw.toFixed(2)),
      }
    });

  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}