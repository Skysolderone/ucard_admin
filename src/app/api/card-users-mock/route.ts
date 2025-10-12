import { NextRequest, NextResponse } from 'next/server';

// 模拟数据，用于演示
const mockCardUsers = [
  {
    id: "XR1964949282646220800",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    firstName: "张",
    lastName: "三",
    fullName: "张 三",
    paymentHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    cardType: "典藏卡",
    cardStatus: 1,
    cardStatusText: "正常",
    kycStatus: 1,
    kycStatusText: "正常",
    cardBalance: 1250.50,
    totalRecharge: 2000.00,
    totalConsume: 749.50,
    totalWithdraw: 0.00,
    totalRefund: 0.00,
    cardNumber: "527375******4891",
    expiryDate: "04/28",
    logicalCardTime: "2025-01-10T15:34:59.000Z",
    realCardTime: "2025-01-10T15:45:30.000Z",
    createdAt: "2025-01-10T15:34:59.000Z",
    updatedAt: "2025-01-10T15:45:30.000Z"
  },
  {
    id: "XR1964949282646220801",
    walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
    firstName: "李",
    lastName: "四",
    fullName: "李 四",
    paymentHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    cardType: "爵士卡",
    cardStatus: 1,
    cardStatusText: "正常",
    kycStatus: 2,
    kycStatusText: "进行中",
    cardBalance: 850.25,
    totalRecharge: 1500.00,
    totalConsume: 649.75,
    totalWithdraw: 0.00,
    totalRefund: 0.00,
    cardNumber: "527375******8764",
    expiryDate: "06/29",
    logicalCardTime: "2025-01-09T14:20:15.000Z",
    realCardTime: "2025-01-09T14:35:42.000Z",
    createdAt: "2025-01-09T14:20:15.000Z",
    updatedAt: "2025-01-09T14:35:42.000Z"
  },
  {
    id: "XR1964949282646220802", 
    walletAddress: "0x5555666677778888999900001111222233334444",
    firstName: null,
    lastName: null,
    fullName: "",
    paymentHash: "0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff",
    cardType: "皇家卡",
    cardStatus: 3,
    cardStatusText: "未开卡",
    kycStatus: 0,
    kycStatusText: "未提交",
    cardBalance: 0.00,
    totalRecharge: 0.00,
    totalConsume: 0.00,
    totalWithdraw: 0.00,
    totalRefund: 0.00,
    cardNumber: null,
    expiryDate: null,
    logicalCardTime: "2025-01-08T10:15:30.000Z",
    realCardTime: null,
    createdAt: "2025-01-08T10:15:30.000Z",
    updatedAt: "2025-01-08T10:15:30.000Z"
  },
  {
    id: "XR1964949282646220803",
    walletAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    firstName: "王",
    lastName: "五",
    fullName: "王 五",
    paymentHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    cardType: "典藏卡",
    cardStatus: 2,
    cardStatusText: "冻结",
    kycStatus: 3,
    kycStatusText: "失败",
    cardBalance: 450.00,
    totalRecharge: 1000.00,
    totalConsume: 350.00,
    totalWithdraw: 200.00,
    totalRefund: 0.00,
    cardNumber: "527375******1234",
    expiryDate: "03/27",
    logicalCardTime: "2025-01-07T09:45:20.000Z",
    realCardTime: "2025-01-07T10:12:35.000Z",
    createdAt: "2025-01-07T09:45:20.000Z",
    updatedAt: "2025-01-07T10:12:35.000Z"
  },
  {
    id: "XR1964949282646220804",
    walletAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    firstName: "赵",
    lastName: "六",
    fullName: "赵 六",
    paymentHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    cardType: "爵士卡",
    cardStatus: 1,
    cardStatusText: "正常",
    kycStatus: 1,
    kycStatusText: "正常",
    cardBalance: 2150.75,
    totalRecharge: 3000.00,
    totalConsume: 849.25,
    totalWithdraw: 0.00,
    totalRefund: 0.00,
    cardNumber: "527375******5678",
    expiryDate: "08/30",
    logicalCardTime: "2025-01-06T16:30:45.000Z",
    realCardTime: "2025-01-06T16:50:12.000Z",
    createdAt: "2025-01-06T16:30:45.000Z",
    updatedAt: "2025-01-06T16:50:12.000Z"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const walletAddress = searchParams.get('walletAddress') || '';
    const cardType = searchParams.get('cardType') || '';
    const cardStatus = searchParams.get('cardStatus');
    const kycStatus = searchParams.get('kycStatus');

    // 应用筛选
    const filteredUsers = mockCardUsers.filter(user => {
      if (walletAddress && !user.walletAddress.toLowerCase().includes(walletAddress.toLowerCase())) {
        return false;
      }
      if (cardType && user.cardType !== cardType) {
        return false;
      }
      if (cardStatus !== null && cardStatus !== '' && user.cardStatus !== parseInt(cardStatus)) {
        return false;
      }
      if (kycStatus !== null && kycStatus !== '' && user.kycStatus !== parseInt(kycStatus)) {
        return false;
      }
      return true;
    });

    // 按逻辑开卡时间倒序排序
    filteredUsers.sort((a, b) => new Date(b.logicalCardTime).getTime() - new Date(a.logicalCardTime).getTime());

    // 分页
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        list: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('获取开卡用户列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取开卡用户列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}