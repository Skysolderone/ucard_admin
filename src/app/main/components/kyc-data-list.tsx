"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  FileText,
  User,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
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

interface KycInfo {
  id: number
  wallet: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  mobile: string
  mobilePrefix: string
  dateOfBirth: string | null
  certType: string
  portrait: string
  reverseSide: string
  nationalityCountryCode: string
  postCode: string
  country: string
  state: string
  city: string
  address: string
  createdAt: string | null
  updatedAt: string | null
  remark: string
}

interface KycData {
  id: string
  wallet: string
  cardId: string
  cardBin: string
  cardHolderId: string
  kycStatus: number
  kycStatusText: string
  createdAt: string | null
  audingAt: string | null
  reason: string
  updatedAt: string | null
  remark: string
  kycInfoId: number | null
  kycInfo: KycInfo | null
}

interface FilterOptions {
  kycStatuses: Array<{ value: number; label: string }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function KycDataList() {
  const [kycData, setKycData] = useState<KycData[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    kycStatuses: [],
  })
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<KycData | null>(null)
  const [auditAction, setAuditAction] = useState<'approve' | 'reject' | null>(null)
  const [auditReason, setAuditReason] = useState('')
  const [auditLoading, setAuditLoading] = useState(false)

  // 筛选状态
  const [filters, setFilters] = useState({
    searchKeyword: '',
    kycStatus: '',
    startDate: '',
    endDate: '',
  })

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
      const response = await fetch('/api/kyc-data/options')
      const data = await response.json()
      if (data.success) {
        setFilterOptions(data.data)
      }
    } catch (error) {
      console.error('获取筛选选项失败:', error)
    }
  }

  // 获取KYC数据列表
  const fetchKycData = useCallback(async (page = 1, customFilters = filters, customLimit?: number) => {
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

      const response = await fetch(`/api/kyc-data?${params}`)
      const data = await response.json()

      if (data.success) {
        setKycData(data.data.list)
        setPagination(data.data.pagination)
      } else {
        toast({
          title: "获取数据失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('获取KYC数据列表失败:', error)
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
      kycStatus: '',
      startDate: '',
      endDate: '',
    }
    setFilters(emptyFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchKycData(1, emptyFilters)
  }

  // 获取KYC状态徽章组件
  const getKycStatusBadge = (status: number, statusText: string) => {
    const configs = {
      0: {
        icon: Shield,
        className: "bg-gray-100 text-gray-700 border-gray-200",
        iconColor: "text-gray-500"
      },
      1: {
        icon: ShieldCheck,
        className: "bg-green-100 text-green-800 border-green-200",
        iconColor: "text-green-600"
      },
      2: {
        icon: ShieldAlert,
        className: "bg-blue-100 text-blue-800 border-blue-200",
        iconColor: "text-blue-600"
      },
      3: {
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

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未填写'
    try {
      const date = new Date(dateString)
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

  // 获取证件类型显示文本
  const getCertTypeText = (certType: string | null) => {
    if (!certType) return '未填写'
    return certType.toLowerCase() === 'id_card' ? '身份证' : '护照'
  }

  // 打开审核对话框
  const openAuditDialog = (record: KycData, action: 'approve' | 'reject') => {
    setSelectedRecord(record)
    setAuditAction(action)
    setAuditReason('')
    setAuditDialogOpen(true)
  }

  // 提交审核
  const handleAudit = async () => {
    if (!selectedRecord || !auditAction) return

    setAuditLoading(true)
    try {
      const response = await fetch('/api/kyc-data/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRecord.id,
          action: auditAction,
          reason: auditReason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "审核成功",
          description: `已${auditAction === 'approve' ? '通过' : '拒绝'}该KYC申请`,
        })
        setAuditDialogOpen(false)
        // 刷新数据
        fetchKycData(pagination.page)
      } else {
        toast({
          title: "审核失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('审核失败:', error)
      toast({
        title: "审核失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setAuditLoading(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    fetchFilterOptions()
    fetchKycData()
  }, [fetchKycData])

  return (
    <div className="space-y-6">
      {/* 筛选面板 */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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
                  fetchKycData(1, newFilters)
                }}
              />
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
                  fetchKycData(1, newFilters)
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
                  fetchKycData(1, newFilters)
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
                  fetchKycData(1, newFilters)
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
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">钱包地址</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">姓名</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">卡号</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">持卡人ID</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">KYC状态</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">提交时间</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">审核时间</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : kycData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  kycData.map((record, index) => (
                    <TableRow
                      key={record.id}
                      className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/20 dark:bg-gray-900/20'
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-600 dark:text-gray-400 text-center">
                          {record.id}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="font-mono text-xs max-w-[120px] truncate bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer text-left"
                              title="点击查看完整地址"
                            >
                              {record.wallet}
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
                                  {record.wallet}
                                </p>
                              </div>
                              <Button
                                onClick={() => copyToClipboard(record.wallet, "钱包地址")}
                                className="w-full"
                              >
                                复制地址
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {record.kycInfo?.fullName || '未填写'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {record.cardId || '未填写'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                          {record.cardHolderId || '未填写'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        {getKycStatusBadge(record.kycStatus, record.kycStatusText)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                          {formatDate(record.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                          {formatDate(record.audingAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                查看
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>KYC详细信息</DialogTitle>
                              <DialogDescription>
                                审核记录ID: {record.id} | KYC信息ID: {record.kycInfoId || '未关联'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              {/* 审核信息 */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                  <h3 className="text-lg font-semibold">审核信息</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div>
                                    <Label className="text-gray-600 dark:text-gray-400">钱包地址</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                      <p className="font-mono text-xs break-all flex-1">{record.wallet}</p>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(record.wallet, "钱包地址")}
                                        className="shrink-0"
                                      >
                                        复制
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">KYC状态</Label>
                                    <div className="mt-2">
                                      {getKycStatusBadge(record.kycStatus, record.kycStatusText)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">卡号</Label>
                                    <p className="mt-1 font-mono text-sm">{record.cardId || '未填写'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">持卡人ID</Label>
                                    <p className="mt-1 font-mono text-sm">{record.cardHolderId || '未填写'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">提交时间</Label>
                                    <p className="mt-1 text-sm">{formatDate(record.createdAt)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">审核时间</Label>
                                    <p className="mt-1 text-sm">{formatDate(record.audingAt)}</p>
                                  </div>
                                  {record.reason && (
                                    <div className="col-span-2">
                                      <Label className="text-gray-600">审核原因</Label>
                                      <p className="mt-1 text-sm">{record.reason}</p>
                                    </div>
                                  )}
                                  {record.remark && (
                                    <div className="col-span-2">
                                      <Label className="text-gray-600">备注</Label>
                                      <p className="mt-1 text-sm">{record.remark}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* KYC详细信息 */}
                              {record.kycInfo && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <User className="h-5 w-5 text-green-600" />
                                    <h3 className="text-lg font-semibold">用户信息</h3>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                                    <div>
                                      <Label className="text-gray-600">姓名</Label>
                                      <p className="mt-1 font-medium">{record.kycInfo.fullName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">邮箱</Label>
                                      <p className="mt-1">{record.kycInfo.email || '未填写'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">手机号</Label>
                                      <p className="mt-1">
                                        {record.kycInfo.mobilePrefix && record.kycInfo.mobile
                                          ? `${record.kycInfo.mobilePrefix} ${record.kycInfo.mobile}`
                                          : '未填写'}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">出生日期</Label>
                                      <p className="mt-1">{formatDate(record.kycInfo.dateOfBirth)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">证件类型</Label>
                                      <p className="mt-1">{getCertTypeText(record.kycInfo.certType)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">国籍</Label>
                                      <p className="mt-1">{record.kycInfo.nationalityCountryCode || '未填写'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">国家</Label>
                                      <p className="mt-1">{record.kycInfo.country || '未填写'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">州/省</Label>
                                      <p className="mt-1">{record.kycInfo.state || '未填写'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">城市</Label>
                                      <p className="mt-1">{record.kycInfo.city || '未填写'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">邮编</Label>
                                      <p className="mt-1">{record.kycInfo.postCode || '未填写'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label className="text-gray-600">地址</Label>
                                      <p className="mt-1">{record.kycInfo.address || '未填写'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 证件图片 */}
                              {record.kycInfo && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ImageIcon className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold">证件图片</h3>
                                  </div>
                                  <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                      {/* 正面 */}
                                      <div>
                                        <Label className="text-gray-600 mb-2 block">
                                          {getCertTypeText(record.kycInfo.certType) === '身份证' ? '身份证正面' : '护照'}
                                        </Label>
                                        <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200">
                                          <img
                                            src={record.kycInfo.portrait || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="16"%3E暂无图片%3C/text%3E%3C/svg%3E'}
                                            alt="证件正面"
                                            className="w-full h-auto max-h-80 object-contain"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="16"%3E图片加载失败%3C/text%3E%3C/svg%3E'
                                            }}
                                          />
                                        </div>
                                      </div>
                                      {/* 反面 */}
                                      {getCertTypeText(record.kycInfo.certType) === '身份证' && (
                                        <div>
                                          <Label className="text-gray-600 mb-2 block">身份证反面</Label>
                                          <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                              src={record.kycInfo.reverseSide || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="16"%3E暂无图片%3C/text%3E%3C/svg%3E'}
                                              alt="证件反面"
                                              className="w-full h-auto max-h-80 object-contain"
                                              onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="16"%3E图片加载失败%3C/text%3E%3C/svg%3E'
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* 详情弹窗底部审核按钮 */}
                            {record.kycStatus === 2 && (
                              <div className="flex gap-3 pt-4 border-t mt-4">
                                <Button
                                  onClick={() => openAuditDialog(record, 'approve')}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  通过审核
                                </Button>
                                <Button
                                  onClick={() => openAuditDialog(record, 'reject')}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  拒绝审核
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {/* 表格操作列审核按钮 */}
                        {record.kycStatus === 2 && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openAuditDialog(record, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              通过
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openAuditDialog(record, 'reject')}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              拒绝
                            </Button>
                          </>
                        )}
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
                fetchKycData(1, filters, newLimit)
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
              onClick={() => fetchKycData(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchKycData(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 审核对话框 */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {auditAction === 'approve' ? '通过审核' : '拒绝审核'}
            </DialogTitle>
            <DialogDescription>
              {auditAction === 'approve'
                ? '确认通过该用户的KYC审核吗？'
                : '请填写拒绝原因'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRecord && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">钱包地址:</span>
                  <span className="font-mono text-xs">{selectedRecord.wallet.slice(0, 10)}...{selectedRecord.wallet.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">姓名:</span>
                  <span>{selectedRecord.kycInfo?.fullName || '未填写'}</span>
                </div>
              </div>
            )}
            {auditAction === 'reject' && (
              <div>
                <Label htmlFor="auditReason">拒绝原因 *</Label>
                <textarea
                  id="auditReason"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="请输入拒绝原因..."
                  className="w-full mt-2 min-h-[100px] p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setAuditDialogOpen(false)}
              disabled={auditLoading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleAudit}
              disabled={auditLoading || (auditAction === 'reject' && !auditReason.trim())}
              className={`flex-1 ${auditAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              variant={auditAction === 'reject' ? 'destructive' : 'default'}
            >
              {auditLoading ? '处理中...' : '确认'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
