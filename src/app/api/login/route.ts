import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 使用 Prisma 查询用户
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        status: true,
      },
    });

    // 检查用户是否存在
    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户状态
    if (user.status !== 1) {
      return NextResponse.json(
        { success: false, message: '账户已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 验证密码（注意：这里是明文比对，生产环境应使用加密）
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 登录成功，返回用户信息
    return NextResponse.json(
      {
        success: true,
        message: '登录成功',
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          token: 'token-' + user.id + '-' + Date.now(), // 简单的 token 生成
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: '登录请求处理失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
