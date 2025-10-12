import mysql from 'mysql2/promise';

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ucard_admin',
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数
  queueLimit: 0, // 队列限制，0 表示无限制
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 执行查询
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 获取连接（用于事务）
export async function getConnection() {
  return await pool.getConnection();
}

// 关闭连接池
export async function closePool() {
  await pool.end();
}

export default pool;
