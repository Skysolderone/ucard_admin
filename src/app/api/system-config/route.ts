import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemType = searchParams.get('systemType') || '';

    // 构建查询条件
    const where: any = {};
    if (systemType) {
      where.system_type = systemType;
    }

    // 查询配置列表
    const configs = await prisma.t_system_config.findMany({
      where,
      orderBy: [
        { system_type: 'asc' },
        { config_key: 'asc' },
      ],
    });

    // 获取所有不重复的system_type
    const systemTypes = await prisma.t_system_config.findMany({
      select: {
        system_type: true,
      },
      distinct: ['system_type'],
      orderBy: {
        system_type: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        list: configs.map((config) => ({
          id: config.id,
          systemType: config.system_type,
          configKey: config.config_key,
          configValue: config.config_value,
          status: config.status,
          createdAt: config.created_at?.toISOString() || null,
          updatedAt: config.updated_at?.toISOString() || null,
          updater: config.updater,
          remark: config.remark,
        })),
        systemTypes: systemTypes.map((item) => item.system_type),
      },
    });
  } catch (error) {
    console.error('获取系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取系统配置失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, configValue, status, remark, updater } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少配置ID',
        },
        { status: 400 }
      );
    }

    // 更新配置
    const updated = await prisma.t_system_config.update({
      where: { id: parseInt(id) },
      data: {
        config_value: configValue,
        status: status !== undefined ? status : undefined,
        remark: remark !== undefined ? remark : undefined,
        updater: updater || 'admin',
        updated_at: new Date(),
      },
    });

    // 如果更新成功，同步更新 Redis 中的 approval 键
    if (updated.config_key === 'approval' && configValue !== undefined) {
      try {
        await redis.set('approval', configValue);
        console.log(`Redis approval 键已更新为: ${configValue}`);
      } catch (redisError) {
        console.error('更新 Redis 失败，删除该键:', redisError);
        try {
          await redis.del('approval');
          console.log('已删除 Redis approval 键');
        } catch (delError) {
          console.error('删除 Redis 键失败:', delError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '配置更新成功',
      data: {
        id: updated.id,
        configValue: updated.config_value,
        status: updated.status,
        updatedAt: updated.updated_at?.toISOString(),
      },
    });
  } catch (error) {
    console.error('更新系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '更新系统配置失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemType, configKey, configValue, status, remark, updater } = body;

    if (!systemType || !configKey || !configValue) {
      return NextResponse.json(
        {
          success: false,
          message: '系统类型、配置键和配置值不能为空',
        },
        { status: 400 }
      );
    }

    // 创建新配置
    const newConfig = await prisma.t_system_config.create({
      data: {
        system_type: systemType,
        config_key: configKey,
        config_value: configValue,
        status: status !== undefined ? status : 1,
        remark: remark || null,
        updater: updater || 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 如果创建的是 approval 配置，同步更新 Redis 键
    if (configKey === 'approval' && configValue) {
      try {
        await redis.set('approval', configValue);
        console.log(`Redis approval 键已创建为: ${configValue}`);
      } catch (redisError) {
        console.error('创建 Redis 键失败，删除该键:', redisError);
        try {
          await redis.del('approval');
          console.log('已删除 Redis approval 键');
        } catch (delError) {
          console.error('删除 Redis 键失败:', delError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '配置创建成功',
      data: {
        id: newConfig.id,
        systemType: newConfig.system_type,
        configKey: newConfig.config_key,
        configValue: newConfig.config_value,
      },
    });
  } catch (error) {
    console.error('创建系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '创建系统配置失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少配置ID',
        },
        { status: 400 }
      );
    }

    // 先查询配置信息，用于判断是否需要删除 Redis 键
    const config = await prisma.t_system_config.findUnique({
      where: { id: parseInt(id) },
    });

    // 删除配置
    await prisma.t_system_config.delete({
      where: { id: parseInt(id) },
    });

    // 如果删除的是 approval 配置，同步删除 Redis 键
    if (config?.config_key === 'approval') {
      try {
        await redis.del('approval');
        console.log('已删除 Redis approval 键');
      } catch (redisError) {
        console.error('删除 Redis 键失败:', redisError);
      }
    }

    return NextResponse.json({
      success: true,
      message: '配置删除成功',
    });
  } catch (error) {
    console.error('删除系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '删除系统配置失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
