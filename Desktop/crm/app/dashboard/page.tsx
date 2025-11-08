'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Calendar, Home, TrendingUp, ArrowUp, MessageCircle, Clock, DollarSign, Sparkles, ClipboardList, Building } from 'lucide-react'
import Link from 'next/link'
import Card from '@/components/ui/Card'

interface Stats {
  totalLeads: number
  totalAppointments: number
  totalUnits: number
  activeLeads: number
  newLeads: number
  scheduledAppointments: number
  totalCustomerRequests: number
  totalProjects: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalAppointments: 0,
    totalUnits: 0,
    activeLeads: 0,
    newLeads: 0,
    scheduledAppointments: 0,
    totalCustomerRequests: 0,
    totalProjects: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Total Leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Active Leads (not in completed stage)
      const { count: activeLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .neq('stage', 'completed')

      // New Leads (stage = 'new')
      const { count: newLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'new')

      // Total Appointments
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })

      // Scheduled Appointments
      const { count: scheduledAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled')

      // Total Units
      const { count: totalUnits } = await supabase
        .from('units')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

      // Total Customer Requests
      const { count: totalCustomerRequests } = await supabase
        .from('lead_requests')
        .select('*', { count: 'exact', head: true })

      // Total Projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalLeads: totalLeads || 0,
        totalAppointments: totalAppointments || 0,
        totalUnits: totalUnits || 0,
        activeLeads: activeLeads || 0,
        newLeads: newLeads || 0,
        scheduledAppointments: scheduledAppointments || 0,
        totalCustomerRequests: totalCustomerRequests || 0,
        totalProjects: totalProjects || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'إجمالي العملاء',
      value: stats.totalLeads,
      icon: Users,
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-600',
      href: '/dashboard/leads',
      trend: '+12%',
    },
    {
      title: 'العملاء النشطون',
      value: stats.activeLeads,
      icon: TrendingUp,
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-600',
      href: '/dashboard/leads',
      trend: '+8%',
    },
    {
      title: 'عملاء جدد',
      value: stats.newLeads,
      icon: ArrowUp,
      gradient: 'from-purple-500 via-purple-600 to-pink-700',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-600',
      href: '/dashboard/leads',
      trend: '+24%',
    },
    {
      title: 'المواعيد المجدولة',
      value: stats.scheduledAppointments,
      icon: Calendar,
      gradient: 'from-orange-500 via-amber-600 to-yellow-700',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-600',
      href: '/dashboard/appointments',
      trend: '+15%',
    },
    {
      title: 'إجمالي المواعيد',
      value: stats.totalAppointments,
      icon: Clock,
      gradient: 'from-indigo-500 via-blue-600 to-cyan-700',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-600',
      href: '/dashboard/appointments',
      trend: '+5%',
    },
    {
      title: 'الوحدات المتاحة',
      value: stats.totalUnits,
      icon: Home,
      gradient: 'from-pink-500 via-rose-600 to-red-700',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-600',
      href: '/dashboard/units',
      trend: '+3%',
    },
    {
      title: 'طلبات العملاء',
      value: stats.totalCustomerRequests,
      icon: ClipboardList,
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-600',
      href: '/dashboard/customer-requests',
      trend: '+18%',
    },
    {
      title: 'المشاريع',
      value: stats.totalProjects,
      icon: Building,
      gradient: 'from-cyan-500 via-teal-600 to-emerald-700',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-600',
      href: '/dashboard/projects',
      trend: '+10%',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-purple-600 border-r-blue-600"></div>
          {/* Middle rotating ring */}
          <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-indigo-500 border-b-purple-500" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          {/* Inner pulsing circle */}
          <div className="absolute inset-4 animate-pulse rounded-full bg-gradient-to-br from-purple-600 to-blue-600 blur-md opacity-50"></div>
          {/* Center icon */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-600 animate-bounce-slow" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-pink-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 rounded-3xl shadow-2xl p-10 text-white animate-zoom-in">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-full blur-2xl animate-float-slow"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 animate-pulse-slow transition-opacity"></div>
              {/* Icon container */}
              <div className="relative p-5 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl border-2 border-white/30 shadow-2xl group-hover:scale-110 transition-all duration-500">
                <Sparkles className="w-12 h-12 text-yellow-300 animate-bounce-slow" />
              </div>
              {/* Corner sparkles */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 rounded-full animate-ping animation-delay-500"></div>
            </div>
            <div className="flex-1 animate-slide-in-right">
              <h1 className="text-6xl font-black mb-3 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl">
                مرحباً بك في لوحة التحكم
              </h1>
              <p className="text-2xl text-white/90 font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                نظرة شاملة على أداء النظام
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-8">
            {[
              { label: 'المبيعات هذا الشهر', value: `${stats.activeLeads * 1200} ر.س`, progress: 75, icon: DollarSign, color: 'from-green-400 to-emerald-500' },
              { label: 'معدل التحويل', value: `${stats.totalLeads > 0 ? ((stats.activeLeads / stats.totalLeads) * 100).toFixed(1) : 0}%`, progress: stats.totalLeads > 0 ? (stats.activeLeads / stats.totalLeads) * 100 : 0, icon: TrendingUp, color: 'from-blue-400 to-cyan-500' },
              { label: 'المواعيد القادمة', value: stats.scheduledAppointments, progress: stats.totalAppointments > 0 ? (stats.scheduledAppointments / stats.totalAppointments) * 100 : 0, icon: Calendar, color: 'from-orange-400 to-amber-500' },
              { label: 'طلبات العملاء', value: stats.totalCustomerRequests, progress: Math.min((stats.totalCustomerRequests / 50) * 100, 100), icon: ClipboardList, color: 'from-purple-400 to-pink-500' },
              { label: 'المشاريع النشطة', value: stats.totalProjects, progress: Math.min((stats.totalProjects / 20) * 100, 100), icon: Building, color: 'from-cyan-400 to-teal-500' },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div 
                  key={index} 
                  className="relative glass-strong rounded-2xl p-6 border-2 border-white/40 hover:border-white/60 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 group overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Animated gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-white/90 font-bold">{item.label}</p>
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-4xl font-black text-white mb-3 group-hover:scale-105 transition-transform">{item.value}</p>
                    <div className="relative w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 right-0 bg-gradient-to-r ${item.color} rounded-full shadow-lg transition-all duration-1000 ease-out`}
                        style={{ width: `${item.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link
              key={index}
              href={card.href}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative h-full bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden transition-all duration-700 group-hover:shadow-2xl group-hover:scale-105 group-hover:-translate-y-2">
                {/* Animated gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-all duration-700`}></div>
                
                {/* Multiple shine effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Floating decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-300/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-blue-300/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative p-7 z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                          {card.title}
                        </p>
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      </div>
                      <div className="flex items-baseline gap-3 mb-3">
                        <p className={`text-6xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500`}>
                          {card.value}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-2xl border-2 border-green-200 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-black text-green-700">{card.trend}</span>
                      </div>
                    </div>
                    <div className="relative">
                      {/* Icon glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 animate-pulse-slow`}></div>
                      {/* Icon container */}
                      <div className={`relative ${card.iconBg} p-6 rounded-3xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-xl border-2 border-white`}>
                        <Icon className={`w-9 h-9 ${card.iconColor} group-hover:animate-bounce-slow`} />
                      </div>
                      {/* Corner sparkles */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity animation-delay-300"></div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3">
                      <span className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${card.gradient}`}></div>
                        مؤشر النمو
                      </span>
                      <span className="text-gray-700">{card.trend}</span>
                    </div>
                    <div className="relative h-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`absolute inset-y-0 right-0 bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                        style={{ width: `${Math.min((card.value / 100) * 100, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-transparent animate-shimmer"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom gradient line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
        {/* Quick Actions Card */}
        <Card className="relative p-8 overflow-hidden group">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-lg opacity-50 animate-pulse-slow"></div>
                <div className="relative p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">الإجراءات السريعة</h2>
                <p className="text-sm text-gray-600 font-medium">الوصول السريع للوظائف المهمة</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { href: '/dashboard/leads', icon: Users, title: 'العملاء', desc: 'إدارة العملاء والطلبات', gradient: 'from-blue-500 to-indigo-600' },
                { href: '/dashboard/appointments', icon: Calendar, title: 'المواعيد', desc: 'جدولة ومتابعة', gradient: 'from-orange-500 to-amber-600' },
                { href: '/dashboard/projects', icon: Building, title: 'المشاريع', desc: 'إدارة المشاريع العقارية', gradient: 'from-cyan-500 to-teal-600' },
                { href: '/dashboard/units', icon: Home, title: 'الوحدات', desc: 'إدارة الوحدات السكنية', gradient: 'from-green-500 to-emerald-600' },
                { href: '/dashboard/conversations', icon: MessageCircle, title: 'المحادثات', desc: 'رسائل العملاء', gradient: 'from-purple-500 to-pink-600' },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="relative group/item p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-transparent hover:scale-110 hover:-translate-y-1 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Hover gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover/item:opacity-10 transition-opacity duration-500`}></div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover/item:translate-x-[200%] transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      <div className={`inline-flex p-3 bg-gradient-to-br ${item.gradient} rounded-2xl shadow-lg mb-3 group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-black text-gray-900 mb-1">{item.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Performance Summary Card */}
        <Card className="relative overflow-hidden p-8">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 animate-gradient-x"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
          
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg animate-pulse"></div>
                <div className="relative p-4 bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/30 shadow-2xl">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black">ملخص الأداء</h2>
                <p className="text-sm text-white/90 font-medium">نظرة سريعة على الإحصائيات</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'إجمالي العملاء', value: stats.totalLeads, progress: 75 },
                { label: 'العملاء النشطون', value: stats.activeLeads, progress: stats.totalLeads > 0 ? (stats.activeLeads / stats.totalLeads) * 100 : 0 },
                { label: 'المواعيد المجدولة', value: stats.scheduledAppointments, progress: stats.totalAppointments > 0 ? (stats.scheduledAppointments / stats.totalAppointments) * 100 : 0 },
                { label: 'طلبات العملاء', value: stats.totalCustomerRequests, progress: Math.min((stats.totalCustomerRequests / 50) * 100, 100) },
                { label: 'المشاريع', value: stats.totalProjects, progress: Math.min((stats.totalProjects / 20) * 100, 100) },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group/stat overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/stat:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/95 font-bold">{item.label}</span>
                      <span className="text-3xl font-black group-hover/stat:scale-125 transition-transform">{item.value}</span>
                    </div>
                    <div className="relative w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className="absolute inset-y-0 right-0 bg-gradient-to-r from-white via-blue-200 to-white rounded-full shadow-lg transition-all duration-1000"
                        style={{ width: `${item.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}