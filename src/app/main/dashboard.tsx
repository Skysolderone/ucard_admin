"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  BarChart,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Edit,
  Trash,
  ChevronDown,
  Bell,
  Home,
  CalendarIcon,
  MessageSquare,
  Star,
  Award,
  CreditCard,
  Utensils,
  ShoppingBag,
  Truck,
  Clock,
  DollarSign,
  Filter,
  Download,
  Printer,
  MoreHorizontal,
  Menu,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import CardUsersList from "./components/card-users-list"

interface CardStats {
  totalCards: number
  normalCards: number
  pendingCards: number
  frozenCards: number
  totalBalance: number
  totalRecharge: number
  totalConsume: number
  totalWithdraw: number
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("stays")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cardStats, setCardStats] = useState<CardStats>({
    totalCards: 0,
    normalCards: 0,
    pendingCards: 0,
    frozenCards: 0,
    totalBalance: 0,
    totalRecharge: 0,
    totalConsume: 0,
    totalWithdraw: 0,
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const { toast } = useToast()

  // 获取开卡统计数据
  const fetchCardStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const response = await fetch('/api/card-users-mock/stats')
      const data = await response.json()
      
      if (data.success) {
        setCardStats(data.data)
      } else {
        toast({
          title: "获取统计数据失败",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      toast({
        title: "获取统计数据失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setStatsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    
    // 当切换到开卡数据页面时获取统计数据
    if (activeSection === "billing") {
      fetchCardStats()
    }

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [activeSection, fetchCardStats])

  // Sample data for charts
  const revenueData = [
    { name: "Sun", value: 8 },
    { name: "Mon", value: 10 },
    { name: "Tue", value: 12 },
    { name: "Wed", value: 11 },
    { name: "Thu", value: 9 },
    { name: "Fri", value: 11 },
    { name: "Sat", value: 12 },
  ]

  const guestsData = [
    { name: "Sun", value: 8000 },
    { name: "Mon", value: 10000 },
    { name: "Tue", value: 12000 },
    { name: "Wed", value: 9000 },
    { name: "Thu", value: 6000 },
    { name: "Fri", value: 8000 },
  ]

  const roomsData = [
    { name: "Sun", occupied: 15, booked: 10, available: 25 },
    { name: "Mon", occupied: 20, booked: 12, available: 18 },
    { name: "Tue", occupied: 18, booked: 15, available: 17 },
    { name: "Wed", occupied: 22, booked: 10, available: 18 },
    { name: "Thu", occupied: 20, booked: 15, available: 15 },
    { name: "Fri", occupied: 18, booked: 12, available: 20 },
    { name: "Sat", occupied: 15, booked: 10, available: 25 },
  ]

  const foodOrdersData = [
    { name: "Breakfast", value: 35 },
    { name: "Lunch", value: 45 },
    { name: "Dinner", value: 55 },
    { name: "Room Service", value: 25 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const bookingData = [
    {
      id: 1,
      name: "Ram Kailash",
      phone: "9905598912",
      bookingId: "SDK89635",
      nights: 2,
      roomType: "1 King Room",
      guests: 2,
      paid: "rsp.150",
      cost: "rsp.1500",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      name: "Samira Karki",
      phone: "9815394203",
      bookingId: "SDK89635",
      nights: 4,
      roomType: ["1 Queen", "1 King Room"],
      guests: 5,
      paid: "paid",
      cost: "rsp.5500",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      name: "Jeevan Rai",
      phone: "9865328452",
      bookingId: "SDK89635",
      nights: 1,
      roomType: ["1 Deluxe", "1 King Room"],
      guests: 3,
      paid: "rsp.150",
      cost: "rsp.2500",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      name: "Bindu Sharma",
      phone: "9845653124",
      bookingId: "SDK89635",
      nights: 3,
      roomType: ["1 Deluxe", "1 King Room"],
      guests: 2,
      paid: "rsp.150",
      cost: "rsp.3000",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const foodOrders = [
    {
      id: "FO-1234",
      guest: "Ram Kailash",
      room: "101",
      items: ["Chicken Curry", "Naan Bread", "Rice"],
      total: "rsp.850",
      status: "Delivered",
      time: "12:30 PM",
    },
    {
      id: "FO-1235",
      guest: "Samira Karki",
      room: "205",
      items: ["Vegetable Pasta", "Garlic Bread", "Tiramisu"],
      total: "rsp.1200",
      status: "Preparing",
      time: "1:15 PM",
    },
    {
      id: "FO-1236",
      guest: "Jeevan Rai",
      room: "310",
      items: ["Club Sandwich", "French Fries", "Coke"],
      total: "rsp.650",
      status: "On the way",
      time: "1:45 PM",
    },
  ]

  const invoices = [
    {
      id: "INV-2023-001",
      guest: "Ram Kailash",
      date: "26 Jul 2023",
      amount: "rsp.1500",
      status: "Paid",
      items: [
        { description: "Room Charges (2 nights)", amount: "rsp.1200" },
        { description: "Food & Beverages", amount: "rsp.300" },
      ],
    },
    {
      id: "INV-2023-002",
      guest: "Samira Karki",
      date: "25 Jul 2023",
      amount: "rsp.5500",
      status: "Paid",
      items: [
        { description: "Room Charges (4 nights)", amount: "rsp.4800" },
        { description: "Food & Beverages", amount: "rsp.700" },
      ],
    },
    {
      id: "INV-2023-003",
      guest: "Jeevan Rai",
      date: "24 Jul 2023",
      amount: "rsp.2500",
      status: "Pending",
      items: [
        { description: "Room Charges (1 night)", amount: "rsp.2000" },
        { description: "Food & Beverages", amount: "rsp.500" },
      ],
    },
  ]

  const calendarEvents = [
    { date: 2, guest: "Carl Larson II", nights: 2, guests: 2 },
    { date: 9, guest: "Mrs. Emmett Morar", nights: 2, guests: 2 },
    { date: 24, guest: "Marjorie Klocko", nights: 2, guests: 2 },
  ]

  const renderDashboard = () => (
    <>
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">欢迎使用 UCard 管理后台</h1>
          <p className="text-lg md:text-xl mb-6 text-blue-100">
            专业的数字卡片管理平台，为您提供完整的开卡数据管理和用户分析服务
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveSection("billing")}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              查看开卡数据 →
            </button>
          </div>
        </div>
      </div>

      {/* 功能介绍卡片 */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="bg-blue-50 p-3 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">开卡数据管理</CardTitle>
                <CardDescription>查看和管理所有用户的开卡信息</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 查看开卡统计数据</li>
              <li>• 管理用户开卡状态</li>
              <li>• 监控KYC审核进度</li>
              <li>• 分析卡片使用情况</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="bg-green-50 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">用户管理</CardTitle>
                <CardDescription>监控用户状态和活跃度</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 实时用户状态监控</li>
              <li>• KYC认证状态跟踪</li>
              <li>• 用户行为数据分析</li>
              <li>• 风险用户识别预警</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="bg-purple-50 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">财务管理</CardTitle>
                <CardDescription>卡片余额和交易数据分析</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 卡片余额实时监控</li>
              <li>• 充值提现交易跟踪</li>
              <li>• 消费数据统计分析</li>
              <li>• 财务报表生成导出</li>
            </ul>
          </CardContent>
        </Card>

      </div> */}

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <div className="bg-blue-50 p-2 rounded-lg mr-3">
                <BarChart className="h-6 w-6 text-blue-500" />
              </div>
              快速开始
            </CardTitle>
            <CardDescription>选择下方操作快速进入相关功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => setActiveSection("billing")}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium">开卡数据管理</p>
                  <p className="text-sm text-gray-500">查看和管理用户开卡信息</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <div className="bg-green-50 p-2 rounded-lg mr-3">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              系统状态
            </CardTitle>
            <CardDescription>当前系统运行状态一览</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API服务</span>
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">正常运行</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">数据库连接</span>
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">正常连接</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">数据同步</span>
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">实时同步</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用提示 */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">使用提示</CardTitle>
          <CardDescription>帮助您更好地使用UCard管理系统</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🚀 开始使用</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 点击左侧"开卡数据"菜单查看用户数据</li>
                <li>• 使用筛选功能快速找到目标用户</li>
                <li>• 点击用户详情查看完整信息</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 数据分析</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 统计卡片显示关键业务指标</li>
                <li>• 支持按时间范围筛选数据</li>
                <li>• 实时监控KYC状态变化</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* 隐藏原有复杂内容 */}
      {/* <div style={{ display: 'none' }}>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-2">Today Activities</p>
            <div className="flex justify-between mb-2">
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-1">
                  <span>5</span>
                </div>
                <p className="text-xs">
                  Room
                  <br />
                  Available
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-1">
                  <span>10</span>
                </div>
                <p className="text-xs">
                  Room
                  <br />
                  Blocked
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-1">
                  <span>15</span>
                </div>
                <p className="text-xs">Guest</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-lg font-bold">Rs.35k</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Charts */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Revenue</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  this week <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="text-xs">{`${payload[0].value} K`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Guests</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  this week <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={guestsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="text-xs">{`${payload[0].value}`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "white", stroke: "#3B82F6", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    fill="url(#colorUv)"
                  />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <area type="monotone" dataKey="value" stroke="none" fill="url(#colorUv)" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Rooms</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  this week <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xs mb-2">
              <div className="flex items-center justify-between">
                <p>Total 50 Rooms</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Available</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={roomsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="text-xs">{`Occupied: ${payload[0].value}`}</p>
                            <p className="text-xs">{`Booked: ${payload[1].value}`}</p>
                            <p className="text-xs">{`Available: ${payload[2].value}`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="occupied" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="booked" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="available" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Booking Table */}
      {/* <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">
            Todays Booking <span className="text-xs font-normal text-gray-500">(8 Guest today)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="stays" className="w-full">
            <TabsList className="mb-4 border-b w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="stays"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("stays")}
              >
                Stays
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("packages")}
              >
                Packages
              </TabsTrigger>
              <TabsTrigger
                value="arrivals"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("arrivals")}
              >
                Arrivals
              </TabsTrigger>
              <TabsTrigger
                value="departure"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("departure")}
              >
                Departure
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guest by name or phone number or booking ID"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
                />
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Booking
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        NAME <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">BOOKING ID</TableHead>
                    <TableHead className="whitespace-nowrap">NIGHTS</TableHead>
                    <TableHead className="whitespace-nowrap">ROOM TYPE</TableHead>
                    <TableHead className="whitespace-nowrap">GUESTS</TableHead>
                    <TableHead className="whitespace-nowrap">PAID</TableHead>
                    <TableHead className="whitespace-nowrap">COST</TableHead>
                    <TableHead className="whitespace-nowrap">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingData.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={booking.avatar} alt={booking.name} />
                            <AvatarFallback>
                              {booking.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{booking.name}</p>
                            <p className="text-xs text-gray-500">{booking.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.bookingId}</TableCell>
                      <TableCell>{booking.nights}</TableCell>
                      <TableCell>
                        {Array.isArray(booking.roomType) ? (
                          <div>
                            {booking.roomType.map((type, index) => (
                              <p key={index}>{type}</p>
                            ))}
                          </div>
                        ) : (
                          booking.roomType
                        )}
                      </TableCell>
                      <TableCell>{booking.guests} Guests</TableCell>
                      <TableCell>
                        {booking.paid === "paid" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">paid</span>
                        ) : (
                          booking.paid
                        )}
                      </TableCell>
                      <TableCell>{booking.cost}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="link" className="text-blue-500 hover:text-blue-600">
                See other Bookings
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card> */}

      {/* Calendar and Rating */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-medium">Calender</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium">August 2023</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <div className="py-1 font-medium">SU</div>
              <div className="py-1 font-medium">MO</div>
              <div className="py-1 font-medium">TU</div>
              <div className="py-1 font-medium">WE</div>
              <div className="py-1 font-medium">TH</div>
              <div className="py-1 font-medium">FR</div>
              <div className="py-1 font-medium">SA</div>

              <div className="py-1 text-gray-400">31</div>
              <div className="py-1">1</div>
              <div className="py-1 relative">
                2
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              </div>
              <div className="py-1">3</div>
              <div className="py-1">4</div>
              <div className="py-1">5</div>
              <div className="py-1">6</div>

              <div className="py-1">7</div>
              <div className="py-1">8</div>
              <div className="py-1 relative">
                9
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              </div>
              <div className="py-1">10</div>
              <div className="py-1">11</div>
              <div className="py-1">12</div>
              <div className="py-1">13</div>

              <div className="py-1">14</div>
              <div className="py-1">15</div>
              <div className="py-1">16</div>
              <div className="py-1">17</div>
              <div className="py-1">18</div>
              <div className="py-1">19</div>
              <div className="py-1">20</div>

              <div className="py-1">21</div>
              <div className="py-1">22</div>
              <div className="py-1">23</div>
              <div className="py-1 relative">
                24
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              </div>
              <div className="py-1">25</div>
              <div className="py-1">26</div>
              <div className="py-1">27</div>

              <div className="py-1">28</div>
              <div className="py-1">29</div>
              <div className="py-1">30</div>
              <div className="py-1">31</div>
              <div className="py-1 text-gray-400">1</div>
              <div className="py-1 text-gray-400">2</div>
              <div className="py-1 text-gray-400">3</div>
            </div>

            <div className="mt-6 border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">August 02, 2023 Booking Lists</h4>
              <p className="text-xs text-gray-500 mb-3">(3 Bookings)</p>

              <div className="space-y-3">
                {calendarEvents.map((event, index) => (
                  <div key={index} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={event.guest} />
                      <AvatarFallback>
                        {event.guest
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{event.guest}</p>
                      <p className="text-xs text-gray-500">
                        {event.nights} Nights | {event.guests} Guests
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
            <CardTitle className="text-base font-medium">Overall Rating</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  This Week <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-24">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M 0 50 A 50 50 0 0 1 100 50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <path d="M 0 50 A 50 50 0 0 1 90 50" fill="none" stroke="#3b82f6" strokeWidth="10" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-medium">Rating</p>
                    <p className="text-2xl font-bold">4.5/5</p>
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">+31%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cleanliness</span>
                <div className="flex items-center gap-2">
                  <Progress value={90} className="h-2 w-32" />
                  <span className="text-sm">4.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Facilities</span>
                <div className="flex items-center gap-2">
                  <Progress value={90} className="h-2 w-32" />
                  <span className="text-sm">4.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Location</span>
                <div className="flex items-center gap-2">
                  <Progress value={50} className="h-2 w-32" />
                  <span className="text-sm">2.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Room Comfort</span>
                <div className="flex items-center gap-2">
                  <Progress value={50} className="h-2 w-32" />
                  <span className="text-sm">2.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Service</span>
                <div className="flex items-center gap-2">
                  <Progress value={76} className="h-2 w-32" />
                  <span className="text-sm">3.8</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Value for money</span>
                <div className="flex items-center gap-2">
                  <Progress value={76} className="h-2 w-32" />
                  <span className="text-sm">3.8</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </>
  )

  const renderBillingSystem = () => (
    <>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-full mr-4">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总开卡数量</p>
              <h3 className="text-2xl font-bold">
                {statsLoading ? '...' : cardStats.totalCards}
              </h3>
              <p className="text-xs text-green-600">已支付开卡费用户</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">正常用户</p>
              <h3 className="text-2xl font-bold">
                {statsLoading ? '...' : cardStats.normalCards}
              </h3>
              <p className="text-xs text-green-600">卡片状态正常</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待完成开卡</p>
              <h3 className="text-2xl font-bold">
                {statsLoading ? '...' : cardStats.pendingCards}
              </h3>
              <p className="text-xs text-amber-600">逻辑开卡未完成</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-red-50 p-3 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总卡余额</p>
              <h3 className="text-2xl font-bold">
                {statsLoading ? '...' : `$${cardStats.totalBalance.toFixed(2)}`}
              </h3>
              <p className="text-xs text-gray-500">所有用户卡片余额</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <CardUsersList />
    </>
  )

  const renderFoodDelivery = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Food Delivery System</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-full mr-4">
              <Utensils className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">42</h3>
              <p className="text-xs text-green-600">+8% from yesterday</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-full mr-4">
              <ShoppingBag className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold">35</h3>
              <p className="text-xs text-green-600">83% of total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-full mr-4">
              <Truck className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <h3 className="text-2xl font-bold">7</h3>
              <p className="text-xs text-amber-600">17% of total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium">Active Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foodOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.guest}</TableCell>
                        <TableCell>{order.room}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {order.items.map((item, index) => (
                              <span key={index} className="text-xs">
                                {item}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{order.total}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "success"
                                : order.status === "Preparing"
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  toast({
                                    title: "Order details",
                                    description: `Viewing details for order ${order.id}`,
                                  })
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  toast({
                                    title: "Order status updated",
                                    description: `Order ${order.id} marked as delivered`,
                                  })
                                }}
                              >
                                Mark as Delivered
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  toast({
                                    title: "Order cancelled",
                                    description: `Order ${order.id} has been cancelled`,
                                    variant: "destructive",
                                  })
                                }}
                              >
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium">Order Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={foodOrdersData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {foodOrdersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {foodOrdersData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-xs">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">Place New Order</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Place New Food Order</DialogTitle>
            <DialogDescription>Create a new food order for a guest. Select items from the menu.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guest" className="text-right">
                Guest
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ram">Ram Kailash - Room 101</SelectItem>
                  <SelectItem value="samira">Samira Karki - Room 205</SelectItem>
                  <SelectItem value="jeevan">Jeevan Rai - Room 310</SelectItem>
                  <SelectItem value="bindu">Bindu Sharma - Room 402</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Menu Items</Label>
              <div className="col-span-3 border rounded-md p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="item1" />
                  <Label htmlFor="item1" className="flex justify-between w-full">
                    <span>Chicken Curry</span>
                    <span>Rs.450</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="item2" />
                  <Label htmlFor="item2" className="flex justify-between w-full">
                    <span>Vegetable Pasta</span>
                    <span>Rs.350</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="item3" />
                  <Label htmlFor="item3" className="flex justify-between w-full">
                    <span>Club Sandwich</span>
                    <span>Rs.250</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="item4" />
                  <Label htmlFor="item4" className="flex justify-between w-full">
                    <span>Naan Bread</span>
                    <span>Rs.50</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="item5" />
                  <Label htmlFor="item5" className="flex justify-between w-full">
                    <span>Rice</span>
                    <span>Rs.100</span>
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="special" className="text-right">
                Special Instructions
              </Label>
              <Textarea id="special" placeholder="Any special requests" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                toast({
                  title: "Order placed",
                  description: "Food order has been placed successfully",
                })
              }}
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`${isMobile ? "fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out" : "w-64"} ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"} bg-white border-r border-gray-200 flex flex-col`}
      >
        {isMobile && (
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-purple-600">Ucard Admin</h1>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "dashboard" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <BarChart className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            {/* <button
              onClick={() => setActiveSection("check-in-out")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "check-in-out" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              Check In-Out
            </button>
            <button
              onClick={() => setActiveSection("rooms")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "rooms" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Home className="mr-3 h-5 w-5" />
              Rooms
            </button>
            <button
              onClick={() => setActiveSection("messages")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "messages" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Messages
            </button>
            <button
              onClick={() => setActiveSection("customer-review")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "customer-review" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Star className="mr-3 h-5 w-5" />
              Customer Review
            </button> */}
            <button
              onClick={() => setActiveSection("billing")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "billing" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <CreditCard className="mr-3 h-5 w-5" />
              开卡数据
            </button>
            {/* <button
              onClick={() => setActiveSection("food-delivery")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "food-delivery" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Utensils className="mr-3 h-5 w-5" />
              Food Delivery
            </button>
            <button
              onClick={() => setActiveSection("premium")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "premium" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Award className="mr-3 h-5 w-5" />
              Try Premium Version
            </button> */}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-800">
              {activeSection === "dashboard"
                ? "Dashboard"
                : activeSection === "check-in-out"
                  ? "Check In-Out"
                  : activeSection === "rooms"
                    ? "Rooms"
                    : activeSection === "messages"
                      ? "Messages"
                      : activeSection === "customer-review"
                        ? "Customer Review"
                        : activeSection === "billing"
                          ? "开卡数据"
                          : activeSection === "food-delivery"
                            ? "Food Delivery"
                            : "Premium Version"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 px-3 py-2 h-auto">
                  <Image
                    src="/placeholder.svg?height=24&width=24"
                    width={24}
                    height={24}
                    alt="Hotel"
                    className="rounded"
                  />
                  <span className="hidden md:inline">Hotel Hilton Garden Inn</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Hotel Marriott</DropdownMenuItem>
                <DropdownMenuItem>Hotel Hyatt</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem
                  onClick={() => {
                    toast({
                      title: "个人资料",
                      description: "个人资料功能正在开发中",
                    })
                  }}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast({
                      title: "系统设置",
                      description: "系统设置功能正在开发中",
                    })
                  }}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    toast({
                      title: "退出登录",
                      description: "正在退出系统...",
                      variant: "destructive",
                    })
                    // 清除本地存储
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('token')
                      localStorage.removeItem('user')
                      // 延迟跳转，让用户看到提示
                      setTimeout(() => {
                        window.location.href = '/login'
                      }, 1000)
                    }
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "billing" && renderBillingSystem()}
          {activeSection === "food-delivery" && renderFoodDelivery()}
          {activeSection !== "dashboard" && activeSection !== "billing" && activeSection !== "food-delivery" && (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>This section is under development and will be available soon.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    The{" "}
                    {activeSection === "check-in-out"
                      ? "Check In-Out"
                      : activeSection === "rooms"
                        ? "Rooms"
                        : activeSection === "messages"
                          ? "Messages"
                          : activeSection === "customer-review"
                            ? "Customer Review"
                            : "Premium"}{" "}
                    module is currently being built. Please check back later.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveSection("dashboard")}>Return to Dashboard</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
