'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Eye,
  Phone,
  MapPin,
  Home,
  Bed,
  Bath,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Activity,
  MessageSquare,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Zap,
  Award,
  Star,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ClipboardList
} from 'lucide-react'

interface Lead {
  id: string
  phone: string
  name: string | null
  city: string | null
}

interface CustomerRequest {
  id: string
  lead_id: string | null
  phone: string
  source_channel: string | null
  city: string | null
  district: string | null
  unit_type: string | null
  rooms: number | null
  baths: number | null
  furnished: boolean | null
  budget_min: number | null
  budget_max: number | null
  notes: string | null
  model_confidence: number | null
  created_at: string
  updated_at: string
  lead?: Lead
}

interface Modal {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view'
  data: CustomerRequest | null
}

const unitTypeLabels: { [key: string]: string } = {
  'villa': 'فيلا',
  'apartment': 'شقة',
  'floor': 'دور',
  'studio': 'استوديو',
  'duplex': 'دوبلكس',
  'land': 'أرض'
}

const sourceChannelLabels: { [key: string]: string } = {
  'whatsapp': 'واتساب',
  'telegram': 'تليجرام',
  'web': 'موقع إلكتروني',
  'phone': 'هاتف'
}

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChannel, setFilterChannel] = useState<string>('')
  const [filterUnitType, setFilterUnitType] = useState<string>('')
  const [filterCity, setFilterCity] = useState<string>('')
  const [modal, setModal] = useState<Modal>({ isOpen: false, mode: 'create', data: null })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  })

  // Form state
  const [phone, setPhone] = useState('')
  const [leadId, setLeadId] = useState('')
  const [sourceChannel, setSourceChannel] = useState('whatsapp')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [unitType, setUnitType] = useState('')
  const [rooms, setRooms] = useState('')
  const [baths, setBaths] = useState('')
  const [furnished, setFurnished] = useState(false)
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchRequests()
    fetchLeads()
  }, [])

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('lead_requests')
        .select(`
          *,
          lead:leads(id, phone, name, city)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, phone, name, city')
        .order('name')

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        request.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesChannel = !filterChannel || request.source_channel === filterChannel
      const matchesUnitType = !filterUnitType || request.unit_type === filterUnitType
      const matchesCity = !filterCity || request.city === filterCity

      return matchesSearch && matchesChannel && matchesUnitType && matchesCity
    })
  }, [requests, searchTerm, filterChannel, filterUnitType, filterCity])

  // Enhanced Analytics calculations
  const analytics = useMemo(() => {
    const totalRequests = requests.length
    const uniqueCities = [...new Set(requests.map(r => r.city).filter(Boolean))].length
    const uniqueLeads = [...new Set(requests.map(r => r.lead_id).filter(Boolean))].length
    
    const avgBudget = requests
      .filter(r => r.budget_min && r.budget_max)
      .reduce((sum, r) => sum + ((r.budget_min! + r.budget_max!) / 2), 0) / 
      requests.filter(r => r.budget_min && r.budget_max).length || 0

    const channelBreakdown = requests.reduce((acc, r) => {
      const channel = r.source_channel || 'unknown'
      acc[channel] = (acc[channel] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const unitTypeBreakdown = requests.reduce((acc, r) => {
      const type = r.unit_type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const cityBreakdown = requests.reduce((acc, r) => {
      const cityName = r.city || 'غير محدد'
      acc[cityName] = (acc[cityName] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const topCities = Object.entries(cityBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const furnishedCount = requests.filter(r => r.furnished).length
    const unfurnishedCount = requests.filter(r => r.furnished === false).length

    // Rooms distribution
    const roomsBreakdown = requests.reduce((acc, r) => {
      const roomCount = r.rooms?.toString() || 'غير محدد'
      acc[roomCount] = (acc[roomCount] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Budget ranges
    const budgetRanges = {
      '0-20k': requests.filter(r => r.budget_max && r.budget_max <= 20000).length,
      '20k-40k': requests.filter(r => r.budget_min && r.budget_max && r.budget_max > 20000 && r.budget_max <= 40000).length,
      '40k-60k': requests.filter(r => r.budget_min && r.budget_max && r.budget_max > 40000 && r.budget_max <= 60000).length,
      '60k+': requests.filter(r => r.budget_min && r.budget_max && r.budget_max > 60000).length,
    }

    // Model confidence average
    const avgConfidence = requests
      .filter(r => r.model_confidence)
      .reduce((sum, r) => sum + (r.model_confidence || 0), 0) / 
      requests.filter(r => r.model_confidence).length || 0

    const highConfidence = requests.filter(r => r.model_confidence && r.model_confidence >= 0.8).length
    const mediumConfidence = requests.filter(r => r.model_confidence && r.model_confidence >= 0.5 && r.model_confidence < 0.8).length
    const lowConfidence = requests.filter(r => r.model_confidence && r.model_confidence < 0.5).length

    // Time-based analytics (last 7 days vs previous)
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentRequests = requests.filter(r => new Date(r.created_at) >= last7Days).length
    const previousRequests = requests.filter(r => new Date(r.created_at) >= last14Days && new Date(r.created_at) < last7Days).length
    const growth = previousRequests > 0 ? ((recentRequests - previousRequests) / previousRequests) * 100 : 0

    return {
      totalRequests,
      uniqueCities,
      uniqueLeads,
      avgBudget,
      channelBreakdown,
      unitTypeBreakdown,
      cityBreakdown,
      topCities,
      furnishedCount,
      unfurnishedCount,
      roomsBreakdown,
      budgetRanges,
      avgConfidence,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      recentRequests,
      previousRequests,
      growth
    }
  }, [requests])

  const cities = useMemo(() => {
    return [...new Set(requests.map(r => r.city).filter((city): city is string => Boolean(city)))]
  }, [requests])

  function openCreateModal() {
    resetForm()
    setModal({ isOpen: true, mode: 'create', data: null })
  }

  function openEditModal(request: CustomerRequest) {
    setPhone(request.phone)
    setLeadId(request.lead_id || '')
    setSourceChannel(request.source_channel || 'whatsapp')
    setCity(request.city || '')
    setDistrict(request.district || '')
    setUnitType(request.unit_type || '')
    setRooms(request.rooms?.toString() || '')
    setBaths(request.baths?.toString() || '')
    setFurnished(request.furnished || false)
    setBudgetMin(request.budget_min?.toString() || '')
    setBudgetMax(request.budget_max?.toString() || '')
    setNotes(request.notes || '')
    setModal({ isOpen: true, mode: 'edit', data: request })
  }

  function openViewModal(request: CustomerRequest) {
    setModal({ isOpen: true, mode: 'view', data: request })
  }

  function closeModal() {
    setModal({ isOpen: false, mode: 'create', data: null })
    resetForm()
  }

  function resetForm() {
    setPhone('')
    setLeadId('')
    setSourceChannel('whatsapp')
    setCity('')
    setDistrict('')
    setUnitType('')
    setRooms('')
    setBaths('')
    setFurnished(false)
    setBudgetMin('')
    setBudgetMax('')
    setNotes('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const requestData = {
      phone,
      lead_id: leadId || null,
      source_channel: sourceChannel,
      city: city || null,
      district: district || null,
      unit_type: unitType || null,
      rooms: rooms ? parseInt(rooms) : null,
      baths: baths ? parseInt(baths) : null,
      furnished: furnished,
      budget_min: budgetMin ? parseInt(budgetMin) : null,
      budget_max: budgetMax ? parseInt(budgetMax) : null,
      notes: notes || null,
      updated_at: new Date().toISOString()
    }

    try {
      if (modal.mode === 'create') {
        const { error } = await supabase
          .from('lead_requests')
          .insert([requestData])

        if (error) throw error
        alert('تم إضافة الطلب بنجاح!')
      } else if (modal.mode === 'edit' && modal.data) {
        const { error } = await supabase
          .from('lead_requests')
          .update(requestData)
          .eq('id', modal.data.id)

        if (error) throw error
        alert('تم تحديث الطلب بنجاح!')
      }

      closeModal()
      fetchRequests()
    } catch (error: any) {
      console.error('Error saving request:', error)
      alert('حدث خطأ: ' + error.message)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteModal.id) return

    try {
      const { error } = await supabase
        .from('lead_requests')
        .delete()
        .eq('id', deleteModal.id)

      if (error) throw error

      alert('تم حذف الطلب بنجاح!')
      setDeleteModal({ isOpen: false, id: null })
      fetchRequests()
    } catch (error: any) {
      console.error('Error deleting request:', error)
      alert('حدث خطأ: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
              <ClipboardList className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                طلبات العملاء
              </h1>
              <p className="text-blue-100 text-lg">إدارة ومتابعة جميع طلبات العملاء بذكاء</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
          >
            <Plus className="w-6 h-6" />
            <span>إضافة طلب جديد</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="w-8 h-8" />
              </div>
              {analytics.growth !== 0 && (
                <div className={`flex items-center gap-1 ${analytics.growth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {analytics.growth > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  <span className="text-sm font-bold">{Math.abs(analytics.growth).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <p className="text-blue-100 text-sm mb-2">إجمالي الطلبات</p>
            <p className="text-4xl font-bold mb-1">{analytics.totalRequests}</p>
            <p className="text-blue-200 text-xs">آخر 7 أيام: {analytics.recentRequests}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
              <Star className="w-6 h-6 text-purple-200" />
            </div>
            <p className="text-purple-100 text-sm mb-2">عملاء مميزون</p>
            <p className="text-4xl font-bold mb-1">{analytics.uniqueLeads}</p>
            <p className="text-purple-200 text-xs">عملاء فريدون</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MapPin className="w-8 h-8" />
              </div>
              <Target className="w-6 h-6 text-green-200" />
            </div>
            <p className="text-green-100 text-sm mb-2">المدن المختلفة</p>
            <p className="text-4xl font-bold mb-1">{analytics.uniqueCities}</p>
            <p className="text-green-200 text-xs">مناطق جغرافية</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="w-8 h-8" />
              </div>
              <TrendingUp className="w-6 h-6 text-orange-200" />
            </div>
            <p className="text-orange-100 text-sm mb-2">متوسط الميزانية</p>
            <p className="text-3xl font-bold mb-1">
              {analytics.avgBudget > 0 ? Math.round(analytics.avgBudget).toLocaleString() : '0'}
            </p>
            <p className="text-orange-200 text-xs">ريال سعودي</p>
          </div>
        </div>
      </div>

      {/* AI Confidence Score Card */}
      {analytics.avgConfidence > 0 && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">مؤشر الذكاء الاصطناعي</h3>
              <p className="text-indigo-100">متوسط دقة النموذج: {(analytics.avgConfidence * 100).toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">دقة عالية</span>
                <Award className="w-5 h-5 text-green-300" />
              </div>
              <p className="text-3xl font-bold">{analytics.highConfidence}</p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${(analytics.highConfidence / analytics.totalRequests) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">دقة متوسطة</span>
                <Target className="w-5 h-5 text-yellow-300" />
              </div>
              <p className="text-3xl font-bold">{analytics.mediumConfidence}</p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${(analytics.mediumConfidence / analytics.totalRequests) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">دقة منخفضة</span>
                <TrendingDown className="w-5 h-5 text-red-300" />
              </div>
              <p className="text-3xl font-bold">{analytics.lowConfidence}</p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-red-400 h-2 rounded-full transition-all"
                  style={{ width: `${(analytics.lowConfidence / analytics.totalRequests) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">مصادر الطلبات</h3>
              <p className="text-sm text-gray-500">توزيع الطلبات حسب القناة</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.channelBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([channel, count], index) => {
                const percentage = (count / analytics.totalRequests) * 100
                const colors = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600']
                return (
                  <div key={channel} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg text-sm font-bold text-gray-700">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {sourceChannelLabels[channel] || channel}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 mr-2">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`absolute top-0 right-0 h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-1000 group-hover:scale-105`}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Unit Type Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">أنواع الوحدات المطلوبة</h3>
              <p className="text-sm text-gray-500">توزيع الطلبات حسب نوع الوحدة</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.unitTypeBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([type, count], index) => {
                const percentage = (count / analytics.totalRequests) * 100
                const colors = ['from-purple-500 to-purple-600', 'from-indigo-500 to-indigo-600', 'from-pink-500 to-pink-600', 'from-red-500 to-red-600', 'from-orange-500 to-orange-600', 'from-yellow-500 to-yellow-600']
                return (
                  <div key={type} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg text-sm font-bold text-gray-700">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {unitTypeLabels[type] || type}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 mr-2">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`absolute top-0 right-0 h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-1000 group-hover:scale-105`}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">أكثر المدن طلباً</h3>
              <p className="text-sm text-gray-500">أعلى 5 مدن</p>
            </div>
          </div>
          <div className="space-y-4">
            {analytics.topCities.map(([city, count], index) => {
              const percentage = (count / analytics.totalRequests) * 100
              const medals = ['🥇', '🥈', '🥉', '🏅', '🏅']
              return (
                <div key={city} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medals[index]}</span>
                      <span className="text-sm font-semibold text-gray-700">{city}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500 mr-2">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 right-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 group-hover:scale-105"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rooms Distribution */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
              <Bed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">توزيع عدد الغرف</h3>
              <p className="text-sm text-gray-500">الطلبات حسب عدد الغرف</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.roomsBreakdown)
              .sort(([a], [b]) => {
                if (a === 'غير محدد') return 1
                if (b === 'غير محدد') return -1
                return parseInt(a) - parseInt(b)
              })
              .slice(0, 6)
              .map(([room, count], index) => {
                const percentage = (count / analytics.totalRequests) * 100
                return (
                  <div key={room} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg">
                          <Bed className="w-4 h-4 text-cyan-700" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {room !== 'غير محدد' ? `${room} غرف` : room}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 mr-2">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="absolute top-0 right-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-1000 group-hover:scale-105"
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Budget Ranges */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">نطاقات الميزانية</h3>
              <p className="text-sm text-gray-500">توزيع الطلبات حسب الميزانية</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.budgetRanges).map(([range, count], index) => {
              const total = Object.values(analytics.budgetRanges).reduce((sum, val) => sum + val, 0)
              const percentage = total > 0 ? (count / total) * 100 : 0
              const colors = ['from-amber-400 to-amber-500', 'from-orange-400 to-orange-500', 'from-red-400 to-red-500', 'from-rose-400 to-rose-500']
              const labels: { [key: string]: string } = {
                '0-20k': '0 - 20,000 ريال',
                '20k-40k': '20,000 - 40,000 ريال',
                '40k-60k': '40,000 - 60,000 ريال',
                '60k+': 'أكثر من 60,000 ريال'
              }
              return (
                <div key={range} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{labels[range]}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500 mr-2">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className={`absolute top-0 right-0 h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-1000 group-hover:scale-105`}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Furnished vs Unfurnished */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">الوحدات المفروشة</h3>
              <p className="text-sm text-gray-500">المفروش مقابل غير المفروش</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">مفروش</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{analytics.furnishedCount}</span>
                  <span className="text-sm text-gray-500 mr-2">
                    ({((analytics.furnishedCount / (analytics.furnishedCount + analytics.unfurnishedCount || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 right-0 h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full transition-all duration-1000 group-hover:scale-105"
                  style={{ width: `${(analytics.furnishedCount / (analytics.furnishedCount + analytics.unfurnishedCount || 1)) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Home className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">غير مفروش</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{analytics.unfurnishedCount}</span>
                  <span className="text-sm text-gray-500 mr-2">
                    ({((analytics.unfurnishedCount / (analytics.furnishedCount + analytics.unfurnishedCount || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 right-0 h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full transition-all duration-1000 group-hover:scale-105"
                  style={{ width: `${(analytics.unfurnishedCount / (analytics.furnishedCount + analytics.unfurnishedCount || 1)) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="البحث بالهاتف، المدينة، أو الاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="appearance-none w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
            >
              <option value="">جميع القنوات</option>
              <option value="whatsapp">واتساب</option>
              <option value="telegram">تليجرام</option>
              <option value="web">موقع إلكتروني</option>
              <option value="phone">هاتف</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={filterUnitType}
              onChange={(e) => setFilterUnitType(e.target.value)}
              className="appearance-none w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
            >
              <option value="">جميع أنواع الوحدات</option>
              <option value="villa">فيلا</option>
              <option value="apartment">شقة</option>
              <option value="floor">دور</option>
              <option value="studio">استوديو</option>
              <option value="duplex">دوبلكس</option>
              <option value="land">أرض</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="appearance-none w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
            >
              <option value="">جميع المدن</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Table with ALL columns */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">جميع الطلبات ({filteredRequests.length})</h3>
            </div>
            <p className="text-sm text-gray-600">إجمالي: {analytics.totalRequests} طلب</p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
              <tr>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  #
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  العميل
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  الهاتف
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  القناة
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  المدينة
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  الحي
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  نوع الوحدة
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  الغرف
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  الحمامات
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  مفروش
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  الميزانية (من)
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  الميزانية (إلى)
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  دقة AI
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  تاريخ الإنشاء
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  آخر تحديث
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-gradient-to-r from-blue-50 to-purple-50">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-6 py-16 text-center">
                    <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-xl font-semibold mb-2">لا توجد طلبات</p>
                    <p className="text-gray-400 text-sm">جرب تغيير الفلاتر أو البحث</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request, index) => (
                  <tr key={request.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg text-sm font-bold text-blue-700">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {request.lead?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {request.lead?.name || 'غير محدد'}
                          </div>
                          {request.lead?.city && (
                            <div className="text-xs text-gray-500">{request.lead.city}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dir-ltr">{request.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                        {sourceChannelLabels[request.source_channel || ''] || request.source_channel || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{request.city || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{request.district || '-'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">
                        {unitTypeLabels[request.unit_type || ''] || request.unit_type || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {request.rooms ? (
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Bed className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{request.rooms}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {request.baths ? (
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Bath className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{request.baths}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {request.furnished ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                          <Sparkles className="w-3 h-3 ml-1" />
                          نعم
                        </span>
                      ) : request.furnished === false ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                          لا
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {request.budget_min ? (
                        <div className="text-sm font-semibold text-gray-900">
                          {request.budget_min.toLocaleString()}
                          <span className="text-xs text-gray-500 mr-1">ريال</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {request.budget_max ? (
                        <div className="text-sm font-semibold text-gray-900">
                          {request.budget_max.toLocaleString()}
                          <span className="text-xs text-gray-500 mr-1">ريال</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {request.model_confidence ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                request.model_confidence >= 0.8
                                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                                  : request.model_confidence >= 0.5
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                  : 'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                              style={{ width: `${request.model_confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            {(request.model_confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs font-medium text-gray-900">
                            {new Date(request.created_at).toLocaleDateString('ar-SA')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs font-medium text-gray-900">
                            {new Date(request.updated_at).toLocaleDateString('ar-SA')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.updated_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-purple-50 transition-all">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(request)}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(request)}
                          className="p-2.5 text-green-600 hover:bg-green-100 rounded-lg transition-all hover:scale-110"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: request.id })}
                          className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modal.isOpen && modal.mode !== 'view' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  {modal.mode === 'create' ? <Plus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                </div>
                <h2 className="text-2xl font-bold">
                  {modal.mode === 'create' ? 'إضافة طلب جديد' : 'تعديل الطلب'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    العميل (اختياري)
                  </label>
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <select
                      value={leadId}
                      onChange={(e) => setLeadId(e.target.value)}
                      className="appearance-none w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
                    >
                      <option value="">اختر عميل</option>
                      {leads.map(lead => (
                        <option key={lead.id} value={lead.id}>
                          {lead.name || lead.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    قناة المصدر
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <select
                      value={sourceChannel}
                      onChange={(e) => setSourceChannel(e.target.value)}
                      className="appearance-none w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
                    >
                      <option value="whatsapp">واتساب</option>
                      <option value="telegram">تليجرام</option>
                      <option value="web">موقع إلكتروني</option>
                      <option value="phone">هاتف</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    نوع الوحدة
                  </label>
                  <div className="relative">
                    <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value)}
                      className="appearance-none w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
                    >
                      <option value="">اختر النوع</option>
                      <option value="villa">فيلا</option>
                      <option value="apartment">شقة</option>
                      <option value="floor">دور</option>
                      <option value="studio">استوديو</option>
                      <option value="duplex">دوبلكس</option>
                      <option value="land">أرض</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المدينة
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="الرياض، جدة، إلخ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحي
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="اسم الحي"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    عدد الغرف
                  </label>
                  <div className="relative">
                    <Bed className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      min="0"
                      className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    عدد الحمامات
                  </label>
                  <div className="relative">
                    <Bath className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={baths}
                      onChange={(e) => setBaths(e.target.value)}
                      min="0"
                      className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحد الأدنى للميزانية (ريال)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      min="0"
                      className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحد الأقصى للميزانية (ريال)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      min="0"
                      className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="20000"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={furnished}
                    onChange={(e) => setFurnished(e.target.checked)}
                    className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-4"
                  />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-gray-800">وحدة مفروشة</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {modal.mode === 'create' ? 'إضافة الطلب' : 'تحديث الطلب'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal.isOpen && modal.mode === 'view' && modal.data && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 mb-1 uppercase">العميل</p>
                  <p className="text-lg font-bold text-gray-900">
                    {modal.data.lead?.name || 'غير محدد'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                  <p className="text-xs font-semibold text-green-600 mb-1 uppercase">رقم الهاتف</p>
                  <p className="text-lg font-bold text-gray-900 dir-ltr">{modal.data.phone}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 mb-1 uppercase">قناة المصدر</p>
                  <p className="text-lg font-bold text-gray-900">
                    {sourceChannelLabels[modal.data.source_channel || ''] || modal.data.source_channel || 'غير محدد'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border-2 border-pink-200">
                  <p className="text-xs font-semibold text-pink-600 mb-1 uppercase">نوع الوحدة</p>
                  <p className="text-lg font-bold text-gray-900">
                    {unitTypeLabels[modal.data.unit_type || ''] || modal.data.unit_type || 'غير محدد'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200">
                  <p className="text-xs font-semibold text-orange-600 mb-1 uppercase">المدينة</p>
                  <p className="text-lg font-bold text-gray-900">{modal.data.city || 'غير محدد'}</p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border-2 border-teal-200">
                  <p className="text-xs font-semibold text-teal-600 mb-1 uppercase">الحي</p>
                  <p className="text-lg font-bold text-gray-900">{modal.data.district || 'غير محدد'}</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 border-2 border-cyan-200">
                  <p className="text-xs font-semibold text-cyan-600 mb-1 uppercase">عدد الغرف</p>
                  <p className="text-lg font-bold text-gray-900">{modal.data.rooms || 'غير محدد'}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border-2 border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase">عدد الحمامات</p>
                  <p className="text-lg font-bold text-gray-900">{modal.data.baths || 'غير محدد'}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border-2 border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase">مفروش</p>
                  <p className="text-lg font-bold text-gray-900">
                    {modal.data.furnished ? '✨ نعم' : 'لا'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border-2 border-amber-200">
                  <p className="text-xs font-semibold text-amber-600 mb-1 uppercase">الميزانية</p>
                  <p className="text-lg font-bold text-gray-900">
                    {modal.data.budget_min && modal.data.budget_max
                      ? `${modal.data.budget_min.toLocaleString()} - ${modal.data.budget_max.toLocaleString()} ريال`
                      : 'غير محدد'}
                  </p>
                </div>

                {modal.data.model_confidence && (
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-5 border-2 border-violet-200">
                    <p className="text-xs font-semibold text-violet-600 mb-1 uppercase">دقة الذكاء الاصطناعي</p>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-gray-900">
                        {(modal.data.model_confidence * 100).toFixed(1)}%
                      </p>
                      <div className="flex-1 bg-white rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            modal.data.model_confidence >= 0.8
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : modal.data.model_confidence >= 0.5
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                              : 'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${modal.data.model_confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">تاريخ الإنشاء</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(modal.data.created_at).toLocaleString('ar-SA')}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">آخر تحديث</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(modal.data.updated_at).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>

              {modal.data.notes && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    ملاحظات
                  </p>
                  <p className="text-gray-800 leading-relaxed">{modal.data.notes}</p>
                </div>
              )}

              <button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-up">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600">هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg hover:shadow-xl"
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-all font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
