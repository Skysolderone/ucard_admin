import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 统计数据API - 从真实数据库查询
export async function GET() {
  try {
    // 查询总开卡数量
    const totalCards = await prisma.cardInfo.count();

    // 查询各状态卡片数量
    const normalCards = await prisma.cardInfo.count({
      where: { status: 1 }
    });

    const pendingCards = await prisma.cardInfo.count({
      where: { status: 3 }
    });

    const frozenCards = await prisma.cardInfo.count({
      where: { status: 2 }
    });

    // 使用聚合查询计算总卡余额
    const balanceAggregate = await prisma.cardInfo.aggregate({
      _sum: {
        cardAmount: true,
      }
    });

    const totalBalance = Number(balanceAggregate._sum.cardAmount || 0);

    // 从 t_card_action 表聚合充值、消费、提现数据，只统计 status=1 的记录
    const rechargeAggregate = await prisma.cardAction.aggregate({
      where: {
        tradeType: 'deposit',
        status: 1, // 只统计状态为1的交易记录
      },
      _sum: {
        amount: true,
      }
    });

    const consumeAggregate = await prisma.cardAction.aggregate({
      where: {
        tradeType: 'auth',
        status: 1, // 只统计状态为1的交易记录
      },
      _sum: {
        amount: true,
      }
    });

    const withdrawAggregate = await prisma.cardAction.aggregate({
      where: {
        tradeType: 'withdraw',
        status: 1, // 只统计状态为1的交易记录
      },
      _sum: {
        amount: true,
      }
    });

    const totalRecharge = Number(rechargeAggregate._sum.amount || 0);
    const totalConsume = Number(consumeAggregate._sum.amount || 0);
    const totalWithdraw = Number(withdrawAggregate._sum.amount || 0);

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
