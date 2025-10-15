"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
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

interface SystemConfig {
  id: number
  systemType: string
  configKey: string
  configValue: string
  status: number | null
  createdAt: string | null
  updatedAt: string | null
  updater: string | null
  remark: string | null
}

export default function SystemConfigList() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editRemark, setEditRemark] = useState('')
  const [editStatus, setEditStatus] = useState<number>(1)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newConfig, setNewConfig] = useState({
    systemType: 'card_admin',
    configKey: '',
    configValue: '',
    status: 1,
    remark: '',
  })

  const { toast } = useToast()

  // 获取配置列表 - 固定获取 card_admin 类型
  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/system-config?systemType=card_admin')
      const data = await response.json()

      if (data.success) {
        setConfigs(data.data.list)
      } else {
        toast({
          title: "获取数据失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('获取配置列表失败:', error)
      toast({
        title: "获取数据失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 开始编辑
  const startEdit = (config: SystemConfig) => {
    setEditingId(config.id)
    setEditValue(config.configValue)
    setEditRemark(config.remark || '')
    setEditStatus(config.status || 1)
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
    setEditRemark('')
    setEditStatus(1)
  }

  // 保存编辑
  const saveEdit = async (id: number) => {
    try {
      const response = await fetch('/api/system-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          configValue: editValue,
          status: editStatus,
          remark: editRemark,
          updater: 'admin',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "更新成功",
          description: "配置已更新",
        })
        cancelEdit()
        fetchConfigs()
      } else {
        toast({
          title: "更新失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('更新配置失败:', error)
      toast({
        title: "更新失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 删除配置
  const deleteConfig = async (id: number) => {
    if (!confirm('确定要删除这个配置吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/system-config?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "删除成功",
          description: "配置已删除",
        })
        fetchConfigs()
      } else {
        toast({
          title: "删除失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('删除配置失败:', error)
      toast({
        title: "删除失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 添加新配置
  const addNewConfig = async () => {
    if (!newConfig.configKey || !newConfig.configValue) {
      toast({
        title: "请填写必填项",
        description: "配置键和配置值不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/system-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newConfig,
          updater: 'admin',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "添加成功",
          description: "新配置已添加",
        })
        setAddDialogOpen(false)
        setNewConfig({
          systemType: 'card_admin',
          configKey: '',
          configValue: '',
          status: 1,
          remark: '',
        })
        fetchConfigs()
      } else {
        toast({
          title: "添加失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('添加配置失败:', error)
      toast({
        title: "添加失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未知'
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

  // 页面加载时获取数据
  useEffect(() => {
    fetchConfigs()
  }, [])

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <Label className="text-lg font-semibold">Card Admin 配置管理</Label>
              </div>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  添加配置
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>添加新配置</DialogTitle>
                  <DialogDescription>
                    为 card_admin 系统添加新配置
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="configKey">配置键 *</Label>
                    <Input
                      id="configKey"
                      value={newConfig.configKey}
                      onChange={(e) => setNewConfig({ ...newConfig, configKey: e.target.value })}
                      placeholder="例如：api_url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="configValue">配置值 *</Label>
                    <Input
                      id="configValue"
                      value={newConfig.configValue}
                      onChange={(e) => setNewConfig({ ...newConfig, configValue: e.target.value })}
                      placeholder="输入配置值"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">状态</Label>
                    <Select
                      value={newConfig.status.toString()}
                      onValueChange={(value) => setNewConfig({ ...newConfig, status: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="1">启用</SelectItem>
                        <SelectItem value="0">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="remark">备注</Label>
                    <Input
                      id="remark"
                      value={newConfig.remark}
                      onChange={(e) => setNewConfig({ ...newConfig, remark: e.target.value })}
                      placeholder="可选"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={addNewConfig}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    确认添加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card className="shadow-sm border-0 ring-1 ring-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 py-4 w-16">ID</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">系统类型</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">配置键</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">配置值</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">状态</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">更新人</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">更新时间</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">备注</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((config, index) => (
                    <TableRow
                      key={config.id}
                      className={`transition-colors hover:bg-gray-50/50 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-600 text-center">
                          {config.id}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-blue-600">{config.systemType}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-mono text-sm text-gray-700">{config.configKey}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        {editingId === config.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm">{config.configValue}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {editingId === config.id ? (
                          <Select
                            value={editStatus.toString()}
                            onValueChange={(value) => setEditStatus(parseInt(value))}
                          >
                            <SelectTrigger className="w-24 bg-white border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                              <SelectItem value="1">启用</SelectItem>
                              <SelectItem value="0">禁用</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs ${
                            config.status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {config.status === 1 ? '启用' : '禁用'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-gray-600">{config.updater || '-'}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs text-gray-600">
                          {formatDate(config.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {editingId === config.id ? (
                          <Input
                            value={editRemark}
                            onChange={(e) => setEditRemark(e.target.value)}
                            placeholder="可选"
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{config.remark || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {editingId === config.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => saveEdit(config.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                保存
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                <X className="h-3 w-3 mr-1" />
                                取消
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(config)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                编辑
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => deleteConfig(config.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                删除
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
    </div>
  )
}
