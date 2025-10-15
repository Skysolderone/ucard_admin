import Redis from 'ioredis'

// 创建 Redis 客户端实例
const redis = new Redis({
  host: '192.168.3.20',
  port: 6379,
  password: 'drop@redis123',
  db: 0,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  lazyConnect: true, // 延迟连接，避免在模块加载时就连接
})

redis.on('error', (err) => {
  console.error('Redis 连接错误:', err)
})

redis.on('connect', () => {
  console.log('Redis 连接成功')
})

export { redis }
