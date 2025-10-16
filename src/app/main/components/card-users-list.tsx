"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  CreditCard,
  Snowflake,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface CardUser {
  id: string // 数据库自增 ID
  cardId?: string // 业务卡片 ID
  walletAddress: string
  fullName: string
  firstName?: string
  lastName?: string
  paymentHash: string
  cardType: string
  cardStatus: number
  cardStatusText: string
  kycStatus: number
  kycStatusText: string
  cardBalance: number
  totalRecharge: number
  totalConsume: number
  totalWithdraw: number
  totalRefund: number
  cardNumber?: string
  expiryDate?: string
  logicalCardTime: string
  realCardTime?: string
}

interface FilterOptions {
  cardTypes: Array<{ value: string; label: string }>
  cardStatuses: Array<{ value: number; label: string }>
  kycStatuses: Array<{ value: number; label: string }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Transaction {
  id: string
  tradeType: string
  tradeTypeText: string
  amount: number
  settlementFee: number
  settlementFunds: number
  status: number
  statusText: string
  transferId: string
  transerHash: string
  cardType: string
  createdAt: string
  remark: string
}

interface TransactionsData {
  transactions: Transaction[]
  total: number
}

export default function CardUsersList() {
  const [cardUsers, setCardUsers] = useState<CardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    cardTypes: [],
    cardStatuses: [],
    kycStatuses: [],
  })

  // 筛选状态
  const [filters, setFilters] = useState({
    searchKeyword: '',
    cardType: '',
    cardStatus: '',
    kycStatus: '',
    startDate: '',
    endDate: '',
  })

  // 交易明细相关状态
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false)
  const [currentTransactions, setCurrentTransactions] = useState<TransactionsData | null>(null)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<CardUser | null>(null)

  const { toast } = useToast()

  // 复制到剪贴板
  const copyToClipboard = (text: string, label: string = "内容") => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: `${label}已复制到剪贴板`,
      })
    }).catch((err) => {
      console.error('复制失败:', err)
      toast({
        title: "复制失败",
        description: `请手动复制${label}`,
        variant: "destructive",
      })
    })
  }

  // 获取筛选选项
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/card-users/options')
      const data = await response.json()
      if (data.success) {
        setFilterOptions(data.data)
      }
    } catch (error) {
      console.error('获取筛选选项失败:', error)
    }
  }

  // 获取开卡用户列表
  const fetchCardUsers = useCallback(async (page = 1, customFilters = filters, customLimit?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        ...customFilters,
      })

      // 移除空值参数
      Object.keys(customFilters).forEach(key => {
        if (!customFilters[key as keyof typeof customFilters]) {
          params.delete(key)
        }
      })

      const response = await fetch(`/api/card-users?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCardUsers(data.data.list)
        setPagination(data.data.pagination)
      } else {
        toast({
          title: "获取数据失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('获取开卡用户列表失败:', error)
      toast({
        title: "获取数据失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit, toast])

  // 重置筛选条件
  const resetFilters = () => {
    const emptyFilters = {
      searchKeyword: '',
      cardType: '',
      cardStatus: '',
      kycStatus: '',
      startDate: '',
      endDate: '',
    }
    setFilters(emptyFilters)
    // 重置后立即刷新数据
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCardUsers(1, emptyFilters)
  }

  // 获取交易明细
  const fetchTransactions = async (user: CardUser) => {
    if (!user.cardId) {
      toast({
        title: "无法获取交易明细",
        description: "该用户缺少卡片ID",
        variant: "destructive",
      })
      return
    }

    setTransactionsLoading(true)
    setSelectedUser(user)
    setTransactionsDialogOpen(true)

    try {
      const params = new URLSearchParams({
        cardId: user.cardId,
        wallet: user.walletAddress,
      })

      const response = await fetch(`/api/card-users/transactions?${params}`)
      const data = await response.json()

      if (data.success) {
        setCurrentTransactions(data.data)
      } else {
        toast({
          title: "获取交易明细失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('获取交易明细失败:', error)
      toast({
        title: "获取交易明细失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setTransactionsLoading(false)
    }
  }

  // 获取卡片状态徽章组件
  const getCardStatusBadge = (status: number, statusText: string) => {
    const configs = {
      1: { // 正常
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
        iconColor: "text-green-600"
      },
      2: { // 冻结
        icon: Snowflake,
        className: "bg-red-100 text-red-800 border-red-200",
        iconColor: "text-red-600"
      },
      3: { // 未开卡
        icon: Clock,
        className: "bg-gray-100 text-gray-800 border-gray-200",
        iconColor: "text-gray-600"
      }
    }
    
    const config = configs[status as keyof typeof configs] || configs[3]
    const IconComponent = config.icon
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.className}`}>
        <IconComponent className={`w-3.5 h-3.5 ${config.iconColor}`} />
        {statusText}
      </div>
    )
  }

  // 获取KYC状态徽章组件
  const getKycStatusBadge = (status: number, statusText: string) => {
    const configs = {
      0: { // 未提交
        icon: Shield,
        className: "bg-gray-100 text-gray-700 border-gray-200",
        iconColor: "text-gray-500"
      },
      1: { // 正常
        icon: ShieldCheck,
        className: "bg-green-100 text-green-800 border-green-200",
        iconColor: "text-green-600"
      },
      2: { // 进行中
        icon: ShieldAlert,
        className: "bg-blue-100 text-blue-800 border-blue-200",
        iconColor: "text-blue-600"
      },
      3: { // 失败
        icon: ShieldX,
        className: "bg-red-100 text-red-800 border-red-200",
        iconColor: "text-red-600"
      }
    }

    const config = configs[status as keyof typeof configs] || configs[0]
    const IconComponent = config.icon

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.className}`}>
        <IconComponent className={`w-3.5 h-3.5 ${config.iconColor}`} />
        {statusText}
      </div>
    )
  }

  // 获取卡类型徽章组件
  const getCardTypeBadge = (cardType: string) => {
    const configs: Record<string, { className: string; iconColor: string }> = {
      '皇家卡': {
        className: "bg-gradient-to-r from-gray-900 to-black text-amber-400 border-amber-600",
        iconColor: "text-amber-400"
      },
      '爵士卡': {
        className: "bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 border-yellow-600",
        iconColor: "text-yellow-700"
      },
      '典藏卡': {
        className: "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 border-slate-400",
        iconColor: "text-slate-600"
      }
    }

    const config = configs[cardType] || {
      className: "bg-gray-100 text-gray-800 border-gray-300",
      iconColor: "text-gray-600"
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${config.className}`}>
        <CreditCard className={`w-3.5 h-3.5 ${config.iconColor}`} />
        {cardType}
      </div>
    )
  }

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return dateString // 如果日期无效（如"未提交"），直接返回原字符串
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    } catch {
      return dateString
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    fetchFilterOptions()
    fetchCardUsers()
  }, [fetchCardUsers])

  return (
    <div className="space-y-6">
      {/* 筛选面板 */}
      <Card>
        <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
              <div>
                <Label htmlFor="searchKeyword">钱包地址/卡号</Label>
                <Input
                  id="searchKeyword"
                  placeholder="输入钱包地址或卡号"
                  value={filters.searchKeyword}
                  onChange={(e) => {
                    const newFilters = { ...filters, searchKeyword: e.target.value }
                    setFilters(newFilters)
                    setPagination(prev => ({ ...prev, page: 1 }))
                    fetchCardUsers(1, newFilters)
                  }}
                />
              </div>

              <div>
                <Label htmlFor="cardType">开卡类型</Label>
                <Select
                  value={filters.cardType || 'all'}
                  onValueChange={(value) => {
                    const newCardType = value === 'all' ? '' : value
                    const newFilters = { ...filters, cardType: newCardType }
                    setFilters(newFilters)
                    setPagination(prev => ({ ...prev, page: 1 }))
                    fetchCardUsers(1, newFilters)
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <SelectItem value="all">全部</SelectItem>
                    {filterOptions.cardTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cardStatus">卡片状态</Label>
                <Select
                  value={filters.cardStatus || 'all'}
                  onValueChange={(value) => {
                    const newCardStatus = value === 'all' ? '' : value
                    const newFilters = { ...filters, cardStatus: newCardStatus }
                    setFilters(newFilters)
                    setPagination(prev => ({ ...prev, page: 1 }))
                    fetchCardUsers(1, newFilters)
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <SelectItem value="all">全部</SelectItem>
                    {filterOptions.cardStatuses.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="kycStatus">KYC状态</Label>
                <Select
                  value={filters.kycStatus || 'all'}
                  onValueChange={(value) => {
                    const newKycStatus = value === 'all' ? '' : value
                    const newFilters = { ...filters, kycStatus: newKycStatus }
                    setFilters(newFilters)
                    setPagination(prev => ({ ...prev, page: 1 }))
                    fetchCardUsers(1, newFilters)
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <SelectItem value="all">全部</SelectItem>
                    {filterOptions.kycStatuses.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">开始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => {
                    const newFilters = { ...filters, startDate: e.target.value }
                    setFilters(newFilters)
                    setPagination(prev => ({ ...prev, page: 1 }))
                    fetchCardUsers(1, newFilters)
                  }}
                />
              </div>

              <div>
                <Label htmlFor="endDate">结束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => {
                    const newFilters = { ...filters, endDate: e.target.value }
                    setFilters(newFilters)
                    setPagination(prev => ({ ...prev, page: 1 }))
                    fetchCardUsers(1, newFilters)
                  }}
                />
              </div>

              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors px-6"
                >
                  <RotateCcw className="h-4 w-4" />
                  重置筛选
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

      {/* 数据表格 */}
      <Card className="shadow-sm border-0 ring-1 ring-gray-200 dark:ring-gray-700 dark:bg-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 w-16">序号</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">姓名</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">钱包地址</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">支付哈希</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">开卡类型</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">卡片状态</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">KYC状态</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">卡余额</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">累计充值</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">累计消费</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">累计提现</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">累计退款</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">卡号</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">有效期</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">逻辑开卡时间</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">真实开卡时间</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : cardUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  cardUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/20 dark:bg-gray-900/20'
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-600 dark:text-gray-400 text-center">
                          {user.id}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user.fullName || '未填写'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="font-mono text-xs max-w-[120px] truncate bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer text-left"
                              title="点击查看完整地址"
                            >
                              {user.walletAddress}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>钱包地址</DialogTitle>
                              <DialogDescription>
                                点击下方按钮复制完整地址
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                                  {user.walletAddress}
                                </p>
                              </div>
                              <Button
                                onClick={() => copyToClipboard(user.walletAddress, "钱包地址")}
                                className="w-full"
                              >
                                复制地址
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.paymentHash ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                className="font-mono text-xs max-w-[120px] truncate bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer text-left"
                                title="点击查看完整哈希"
                              >
                                {user.paymentHash}
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>支付哈希</DialogTitle>
                                <DialogDescription>
                                  点击下方按钮复制完整哈希
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                                    {user.paymentHash}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => copyToClipboard(user.paymentHash, "支付哈希")}
                                  className="w-full"
                                >
                                  复制哈希
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                            未填写
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {getCardTypeBadge(user.cardType)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getCardStatusBadge(user.cardStatus, user.cardStatusText)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getKycStatusBadge(user.kycStatus, user.kycStatusText)}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-semibold text-green-600">{formatAmount(user.cardBalance)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-blue-600">{formatAmount(user.totalRecharge)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-red-600">{formatAmount(user.totalConsume)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-orange-600">{formatAmount(user.totalWithdraw)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-purple-600">{formatAmount(user.totalRefund)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.cardNumber ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                title="点击查看完整卡号"
                              >
                                {user.cardNumber}
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>卡号</DialogTitle>
                                <DialogDescription>
                                  点击下方按钮复制完整卡号
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                                    {user.cardNumber}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => copyToClipboard(user.cardNumber!, "卡号")}
                                  className="w-full"
                                >
                                  复制卡号
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                            未获取
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {user.expiryDate || '未获取'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                          {formatDate(user.logicalCardTime)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                          {user.realCardTime ? formatDate(user.realCardTime) : '未完成'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="查看详情"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>用户详情</DialogTitle>
                              <DialogDescription>
                                数据库ID: {user.id} {user.cardId && `| 卡片ID: ${user.cardId}`}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div>
                                <Label>数据库ID</Label>
                                <p className="mt-1 font-mono text-sm">{user.id}</p>
                              </div>
                              {user.cardId && (
                                <div>
                                  <Label>卡片ID</Label>
                                  <p className="mt-1 font-mono text-sm">{user.cardId}</p>
                                </div>
                              )}
                              <div>
                                <Label>姓名</Label>
                                <p className="mt-1">{user.fullName || '未填写'}</p>
                              </div>
                              <div>
                                <Label>钱包地址</Label>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="font-mono text-xs break-all flex-1">{user.walletAddress}</p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(user.walletAddress, "钱包地址")}
                                    className="shrink-0"
                                  >
                                    复制
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label>支付哈希</Label>
                                <p className="mt-1 font-mono text-xs break-all">{user.paymentHash}</p>
                              </div>
                              <div>
                                <Label>开卡类型</Label>
                                <div className="mt-2">
                                  {getCardTypeBadge(user.cardType)}
                                </div>
                              </div>
                              <div>
                                <Label>卡片状态</Label>
                                <div className="mt-2">
                                  {getCardStatusBadge(user.cardStatus, user.cardStatusText)}
                                </div>
                              </div>
                              <div>
                                <Label>KYC状态</Label>
                                <div className="mt-2">
                                  {getKycStatusBadge(user.kycStatus, user.kycStatusText)}
                                </div>
                              </div>
                              <div>
                                <Label>卡余额</Label>
                                <p className="mt-1">{formatAmount(user.cardBalance)}</p>
                              </div>
                              <div>
                                <Label>累计充值</Label>
                                <p className="mt-1">{formatAmount(user.totalRecharge)}</p>
                              </div>
                              <div>
                                <Label>累计消费</Label>
                                <p className="mt-1">{formatAmount(user.totalConsume)}</p>
                              </div>
                              <div>
                                <Label>累计提现</Label>
                                <p className="mt-1">{formatAmount(user.totalWithdraw)}</p>
                              </div>
                              <div>
                                <Label>累计退款</Label>
                                <p className="mt-1">{formatAmount(user.totalRefund)}</p>
                              </div>
                              <div>
                                <Label>卡号</Label>
                                {user.cardNumber ? (
                                  <div className="mt-1 flex items-center gap-2">
                                    <p className="font-mono text-xs break-all flex-1">{user.cardNumber}</p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(user.cardNumber!, "卡号")}
                                      className="shrink-0"
                                    >
                                      复制
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="mt-1 text-gray-500">未获取</p>
                                )}
                              </div>
                              <div>
                                <Label>有效期</Label>
                                <p className="mt-1">{user.expiryDate || '未获取'}</p>
                              </div>
                              <div>
                                <Label>逻辑开卡时间</Label>
                                <p className="mt-1">{formatDate(user.logicalCardTime)}</p>
                              </div>
                              <div>
                                <Label>真实开卡时间</Label>
                                <p className="mt-1">{user.realCardTime ? formatDate(user.realCardTime) : '未完成'}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          onClick={() => fetchTransactions(user)}
                          title="查看交易明细"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 分页 */}
      <div className="flex items-center justify-end gap-6">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">每页显示</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => {
                const newLimit = parseInt(value)
                const newPagination = {
                  ...pagination,
                  limit: newLimit,
                  page: 1
                }
                setPagination(newPagination)
                fetchCardUsers(1, filters, newLimit)
              }}
            >
              <SelectTrigger className="w-20 h-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500 dark:text-gray-400">条</span>
          </div>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCardUsers(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCardUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 交易明细对话框 */}
      <Dialog open={transactionsDialogOpen} onOpenChange={setTransactionsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">卡片交易明细</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedUser && `用户: ${selectedUser.fullName} | 钱包: ${selectedUser.walletAddress.substring(0, 10)}...`}
            </DialogDescription>
          </DialogHeader>

          {transactionsLoading ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">加载中...</p>
            </div>
          ) : currentTransactions && currentTransactions.transactions.length > 0 ? (
            <div className="py-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">交易类型</TableHead>
                      <TableHead className="dark:text-gray-300">金额</TableHead>
                      <TableHead className="dark:text-gray-300">结算费用</TableHead>
                      <TableHead className="dark:text-gray-300">结算资金</TableHead>
                      <TableHead className="dark:text-gray-300">状态</TableHead>
                      <TableHead className="dark:text-gray-300">交易ID</TableHead>
                      <TableHead className="dark:text-gray-300">时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTransactions.transactions.map((tx, index) => (
                      <TableRow key={tx.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/20 dark:bg-gray-900/20'} dark:border-gray-700`}>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.tradeType === 'deposit' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                            tx.tradeType === 'withdraw' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' :
                            tx.tradeType === 'auth' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                          }`}>
                            {tx.tradeTypeText}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium dark:text-gray-100">${tx.amount.toFixed(2)}</TableCell>
                        <TableCell className="dark:text-gray-300">${tx.settlementFee.toFixed(2)}</TableCell>
                        <TableCell className="dark:text-gray-300">${tx.settlementFunds.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.status === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                            tx.status === 2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                            tx.status === 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {tx.statusText}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tx.transferId ? (
                            <button
                              className="font-mono text-xs max-w-[120px] truncate bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                              onClick={() => copyToClipboard(tx.transferId, "交易ID")}
                              title={tx.transferId}
                            >
                              {tx.transferId}
                            </button>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs dark:text-gray-400">{formatDate(tx.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">暂无交易记录</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}