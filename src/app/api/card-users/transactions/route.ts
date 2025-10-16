import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取交易类型文本
function getTradeTypeText(tradeType: string | null | undefined): string {
  switch (tradeType) {
    case 'deposit': return '充值';
    case 'withdraw': return '提现';
    case 'auth': return '消费';
    case 'refund': return '退款';
    default: return tradeType || '未知';
  }
}

// 获取交易状态文本
function getTradeStatusText(status: number | null | undefined): string {
  switch (status) {
    case 1: return '成功';
    case 2: return '进行中';
    case 3: return '失败';
    default: return '未知';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    const wallet = searchParams.get('wallet');

    if (!cardId || !wallet) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要参数: cardId 和 wallet'
        },
        { status: 400 }
      );
    }

    // 查询卡片基础交易记录（来自 t_card_action）
    const cardActions = await prisma.cardAction.findMany({
      where: {
        cardId: cardId,
        wallet: wallet,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 格式化基础交易数据
    const formattedCardActions = cardActions.map((action: any) => ({
      id: action.id.toString(),
      tradeType: action.tradeType,
      tradeTypeText: getTradeTypeText(action.tradeType),
      amount: Number(action.amount || 0),
      settlementFee: Number(action.settlementFee || 0),
      settlementFunds: Number(action.settlementFunds || 0),
      status: action.status,
      statusText: getTradeStatusText(action.status),
      transferId: action.transferId || '',
      transerHash: action.transerHash || '',
      cardType: action.cardType || '',
      createdAt: action.createdAt?.toISOString() || '',
      remark: action.remark || '',
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedCardActions,
        total: formattedCardActions.length,
      }
    });

  } catch (error) {
    console.error('获取交易明细失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取交易明细失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
