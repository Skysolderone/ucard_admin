# UCard Admin Dockerfile - 优化版本
# 最终镜像大小: ~150MB (相比之前减少 50%+)

# ============================================
# 阶段 1: 依赖安装
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 只复制依赖文件
COPY package.json package-lock.json ./

# 安装生产依赖
RUN npm ci --production --ignore-scripts && \
    npm cache clean --force

# ============================================
# 阶段 2: 构建应用
# ============================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 复制依赖文件并安装所有依赖（包括 devDependencies，构建时需要）
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建 Next.js (standalone 模式)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ============================================
# 阶段 3: 运行环境 (最终镜像)
# ============================================
FROM node:20-alpine AS runner

# 安装运行时依赖
RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 创建用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 standalone 输出 (大幅减小体积)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 Prisma 文件
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# 切换到非 root 用户
USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/db-test || exit 1

CMD ["node", "server.js"]
