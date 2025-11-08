'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Edit, Eye, Trash2, User, Phone, MapPin, DollarSign, Home, Building, Calendar, MessageCircle, ClipboardList, Sparkles, Bed, Bath, BarChart3, TrendingUp, PieChart as PieChartIcon, Target, Award } from 'lucide-react'
import Modal from '@/components/Modal'
import Link from 'next/link'
import { GridSkeleton } from '@/components/SkeletonLoader'

interface Lead {
  id: string
  phone: string
  name: string | null
  city: string | null
  budget: number | null
  rooms: number | null
  furnished: boolean | null
  stage: string
  assigned_agent: string | null
  last_msg: string | null
  updated_at: string
  topic_id: number | null
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
}

const stageColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  qualified: 'bg-purple-100 text-purple-800 border-purple-200',
  viewing: 'bg-green-100 text-green-800 border-green-200',
  offer: 'bg-orange-100 text-orange-800 border-orange-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const stageLabels: Record<string, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  qualified: 'مؤهل',
  viewing: 'جولة معاينة',
  offer: 'عرض',
  closed: 'مغلق',
  completed: 'مكتمل',
}

const appointmentStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
}

const appointmentStatusLabels: Record<string, string> = {
  scheduled: 'مجدول',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  no_show: 'لم يحضر',
}

const unitTypeLabels: Record<string, string> = {
  villa: 'فيلا',
  apartment: 'شقة',
  floor: 'دور',
  studio: 'استوديو',
  duplex: 'دوبلكس',
  land: 'أرض'
}

const sourceChannelLabels: Record<string, string> = {
  whatsapp: 'واتساب',
  telegram: 'تليجرام',
  web: 'موقع إلكتروني',
  phone: 'هاتف'
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([])
  
  // Form fields as separate state (like login page)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState<number | null>(null)
  const [rooms, setRooms] = useState<number | null>(null)
  const [furnished, setFurnished] = useState(false)
  const [stage, setStage] = useState('new')
  const [assignedAgent, setAssignedAgent] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [])

  // Fill form when modal opens with selected lead
  useEffect(() => {
    if (showModal && selectedLead) {
      setName(selectedLead.name ?? '')
      setPhone(selectedLead.phone ?? '')
      setCity(selectedLead.city ?? '')
      setBudget(selectedLead.budget ?? null)
      setRooms(selectedLead.rooms ?? null)
      setFurnished(selectedLead.furnished ?? false)
      setStage(selectedLead.stage ?? 'new')
      setAssignedAgent(selectedLead.assigned_agent ?? '')
    }
  }, [showModal, selectedLead])


  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAppointments(leadId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          units:unit_id (
            id, 
            project_id,
            unit_code, 
            unit_type, 
            floor_no,
            location_desc,
            price,
            price_mode,
            projects:project_id (name, city, district)
          )
        `)
        .eq('lead_id', leadId)
        .order('starts_at', { ascending: false })

      if (error) {
        console.error('Supabase error fetching appointments:', error)
        throw error
      }
      console.log('Fetched appointments for lead:', data)
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  async function fetchCustomerRequests(leadId: string) {
    try {
      const { data, error } = await supabase
        .from('lead_requests')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomerRequests(data || [])
    } catch (error) {
      console.error('Error fetching customer requests:', error)
    }
  }

  const handleViewDetails = async (lead: Lead) => {
    setSelectedLead(lead)
    await Promise.all([
      fetchAppointments(lead.id),
      fetchCustomerRequests(lead.id)
    ])
    setShowDetailModal(true)
  }

  const handleViewConversation = async (lead: Lead) => {
    // جلب المحادثة الخاصة بهذا العميل
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('lead_id', lead.id)
        .order('last_msg_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (conversations && conversations.length > 0) {
        // الانتقال إلى صفحة المحادثات مع فتح رسائل هذه المحادثة
        window.location.href = `/dashboard/conversations?conversation_id=${conversations[0].id}`
      } else {
        alert('لا توجد محادثة لهذا العميل')
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      alert('حدث خطأ عند جلب المحادثة')
    }
  }

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setShowModal(true)
  }

  const handleDelete = (lead: Lead) => {
    setSelectedLead(lead)
    setShowDeleteModal(true)
  }

  const handleCreate = () => {
    setSelectedLead(null)
    // Clear all fields (like login page)
    setName('')
    setPhone('')
    setCity('')
    setBudget(null)
    setRooms(null)
    setFurnished(false)
    setStage('new')
    setAssignedAgent('')
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (selectedLead) {
        // Update
        const { error } = await supabase
          .from('leads')
          .update({
            name: name || null,
            phone: phone,
            city: city || null,
            budget: budget || null,
            rooms: rooms || null,
            furnished: furnished || false,
            stage: stage || 'new',
            assigned_agent: assignedAgent || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedLead.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('leads')
          .insert({
            name: name || null,
            phone: phone,
            city: city || null,
            budget: budget || null,
            rooms: rooms || null,
            furnished: furnished || false,
            stage: stage || 'new',
            assigned_agent: assignedAgent || null,
          })

        if (error) throw error
      }

      setShowModal(false)
      fetchLeads()
      // Clear fields after save
      setName('')
      setPhone('')
      setCity('')
      setBudget(null)
      setRooms(null)
      setFurnished(false)
      setStage('new')
      setAssignedAgent('')
    } catch (error: any) {
      alert(error.message || 'حدث خطأ')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedLead) return

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', selectedLead.id)

      if (error) throw error

      setShowDeleteModal(false)
      setSelectedLead(null)
      fetchLeads()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ عند الحذف')
    }
  }

  // Memoize filtered leads for better performance
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.city?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStage = selectedStage === 'all' || lead.stage === selectedStage
      return matchesSearch && matchesStage
    })
  }, [leads, searchTerm, selectedStage])

  // Show skeleton loading
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white animate-pulse">
          <div className="h-10 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Leads Grid Skeleton */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <GridSkeleton count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 glass-strong rounded-3xl shadow-xl animate-pulse-glow">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent gradient-animated">
                  العملاء المحتملين
                </h1>
                <p className="text-lg text-primary-100">إدارة ومتابعة جميع العملاء المحتملين</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 glass-strong text-primary-900 px-6 py-4 rounded-2xl hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 font-bold backdrop-blur-sm border border-white/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 shine-effect opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">إجمالي العملاء</p>
              <p className="text-3xl font-bold">{leads.length}</p>
            </div>
            <User className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">عملاء جدد</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.stage === 'new').length}</p>
            </div>
            <User className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">مؤهلين</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.stage === 'qualified').length}</p>
            </div>
            <User className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">في الجولات</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.stage === 'viewing').length}</p>
            </div>
            <User className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم، الهاتف، أو المدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="appearance-none pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white min-w-[200px] text-gray-900"
            >
              <option value="all">جميع المراحل</option>
              {Object.entries(stageLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد نتائج</p>
          </div>
        ) : (
          filteredLeads.map((lead, index) => (
            <div
              key={lead.id}
              className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-2xl transition-all duration-500 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-primary-100/0 to-blue-50/0 group-hover:from-primary-50 group-hover:via-primary-100 group-hover:to-blue-50 transition-all duration-700 pointer-events-none"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 shine-effect opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              {/* Animated Border Gradient */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 p-[2px]">
                  <div className="w-full h-full rounded-3xl bg-white"></div>
                </div>
              </div>
              
              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="relative z-10">{(lead.name || 'غير محدد')[0]}</span>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-500 animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-primary-700 to-gray-700 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:via-primary-700 group-hover:to-blue-600 transition-all gradient-animated">
                          {lead.name || 'غير محدد'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <div className="p-1.5 bg-primary-50 rounded-lg">
                            <Phone className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="font-semibold">{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm transition-all ${stageColors[lead.stage] || 'bg-gray-100 text-gray-800 border-gray-200'} group-hover:scale-110`}>
                    {stageLabels[lead.stage] || lead.stage}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {lead.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <span>{lead.city}</span>
                    </div>
                  )}
                  {lead.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>{lead.budget.toLocaleString()} ر.س</span>
                    </div>
                  )}
                  {lead.rooms && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Home className="w-4 h-4 text-blue-600" />
                      <span>{lead.rooms} غرف</span>
                      {lead.furnished && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">مفروش</span>}
                    </div>
                  )}
                  {lead.assigned_agent && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-purple-600" />
                      <span>{lead.assigned_agent}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(lead)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2.5 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>التفاصيل</span>
                  </button>
                  <button
                    onClick={() => handleViewConversation(lead)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                    title="عرض المحادثة"
                    aria-label="عرض المحادثة"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(lead)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
                    aria-label="تعديل العميل"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lead)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                    aria-label="حذف العميل"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-gray-500 text-center">
        عرض {filteredLeads.length} من {leads.length} عميل
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedLead(null)
          // Clear all fields
          setName('')
          setPhone('')
          setCity('')
          setBudget(null)
          setRooms(null)
          setFurnished(false)
          setStage('new')
          setAssignedAgent('')
        }}
        title={selectedLead ? '✏️ تعديل العميل' : '➕ إضافة عميل جديد'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Edit Mode Indicator */}
          {selectedLead && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Edit className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">وضع التعديل</p>
                <p className="text-sm text-gray-600">أنت تقوم بتعديل عميل: <strong>{selectedLead.name || selectedLead.phone}</strong></p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="lead-name" className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="lead-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white hover:border-gray-300"
                  placeholder="اسم العميل"
                  aria-label="اسم العميل"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lead-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                الهاتف <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="lead-phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white hover:border-gray-300"
                  placeholder="05xxxxxxxx"
                  required
                  aria-label="رقم الهاتف"
                  aria-required="true"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lead-city" className="block text-sm font-semibold text-gray-700 mb-2">المدينة</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  id="lead-city"
                  name="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white hover:border-gray-300"
                  placeholder="المدينة"
                  aria-label="المدينة"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lead-budget" className="block text-sm font-semibold text-gray-700 mb-2">الميزانية</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  id="lead-budget"
                  name="budget"
                  type="number"
                  value={budget ?? ''}
                  onChange={(e) => setBudget(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white hover:border-gray-300"
                  placeholder="الميزانية بالريال"
                  aria-label="الميزانية"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lead-rooms" className="block text-sm font-semibold text-gray-700 mb-2">عدد الغرف</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Home className="w-5 h-5" />
                </div>
                <input
                  id="lead-rooms"
                  name="rooms"
                  type="number"
                  value={rooms ?? ''}
                  onChange={(e) => setRooms(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white hover:border-gray-300"
                  placeholder="عدد الغرف"
                  aria-label="عدد الغرف"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lead-stage" className="block text-sm font-semibold text-gray-700 mb-2">المرحلة</label>
              <select
                id="lead-stage"
                name="stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white hover:border-gray-300 appearance-none"
                aria-label="المرحلة"
              >
                {Object.entries(stageLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lead-agent" className="block text-sm font-semibold text-gray-700 mb-2">الوكيل</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="lead-agent"
                  name="assigned_agent"
                  type="text"
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white hover:border-gray-300"
                  placeholder="اسم الوكيل"
                  aria-label="الوكيل المسؤول"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all cursor-pointer group" onClick={() => setFurnished(!furnished)}>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="lead-furnished"
                    name="furnished"
                    checked={furnished}
                    onChange={(e) => setFurnished(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    aria-label="الوحدة مفروشة"
                  />
                </div>
                <label htmlFor="lead-furnished" className="text-sm font-semibold text-gray-700 cursor-pointer flex-1">
                  🏠 الوحدة مفروشة
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 text-white px-6 py-4 rounded-xl hover:from-primary-700 hover:via-primary-800 hover:to-indigo-800 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {selectedLead ? (
                <>
                  <span>💾</span>
                  <span>حفظ التعديلات</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>إضافة العميل</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowModal(false)
                // Clear all fields
                setName('')
                setPhone('')
                setCity('')
                setBudget(null)
                setRooms(null)
                setFurnished(false)
                setStage('new')
                setAssignedAgent('')
              }}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedLead(null)
          setAppointments([])
          setCustomerRequests([])
        }}
        title={`👤 تفاصيل العميل: ${selectedLead?.name || 'غير محدد'}`}
        size="xl"
      >
        {selectedLead && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Actions */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {(selectedLead.name || 'غير محدد')[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedLead.name || 'غير محدد'}</h3>
                  <p className="text-sm text-gray-600">{selectedLead.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleEdit(selectedLead)
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Edit className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleViewConversation(selectedLead)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>المحادثة</span>
                </button>
              </div>
            </div>

            {/* Lead Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">الاسم</p>
                    <p className="text-lg font-bold text-gray-900">{selectedLead.name || 'غير محدد'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">الهاتف</p>
                    <p className="text-lg font-bold text-gray-900">{selectedLead.phone}</p>
                  </div>
                </div>
              </div>
              {selectedLead.city && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">المدينة</p>
                      <p className="text-lg font-bold text-gray-900">{selectedLead.city}</p>
                    </div>
                  </div>
                </div>
              )}
              {selectedLead.budget && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">الميزانية</p>
                      <p className="text-lg font-bold text-gray-900">{selectedLead.budget.toLocaleString()} ر.س</p>
                    </div>
                  </div>
                </div>
              )}
              {selectedLead.rooms && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">الغرف</p>
                      <p className="text-lg font-bold text-gray-900">{selectedLead.rooms} غرف</p>
                      {selectedLead.furnished && (
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          🏠 مفروش
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {selectedLead.assigned_agent && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">الوكيل</p>
                      <p className="text-lg font-bold text-gray-900">{selectedLead.assigned_agent}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <span className={`text-white text-lg font-bold px-3 py-1 rounded-lg ${stageColors[selectedLead.stage] || 'bg-gray-600'}`}>
                      {stageLabels[selectedLead.stage] || selectedLead.stage}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">المرحلة</p>
                    <p className="text-lg font-bold text-gray-900">{stageLabels[selectedLead.stage] || selectedLead.stage}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary-600" />
                  المواعيد المرتبطة
                </h3>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {appointments.length} موعد
                </span>
              </div>
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                  <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">لا توجد مواعيد مرتبطة</p>
                  <p className="text-sm text-gray-400 mt-1">يمكنك جدولة موعد جديد من صفحة المواعيد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/dashboard/appointments`}
                      className="block group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">
                              {new Date(apt.starts_at).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-sm font-semibold text-gray-600">
                                🕐 {new Date(apt.starts_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {apt.agent && (
                                <p className="text-sm text-gray-500">👤 {apt.agent}</p>
                              )}
                            </div>
                            {apt.units && (
                              <div className="mt-2 flex items-center gap-2">
                                <Home className="w-4 h-4 text-primary-600" />
                                <p className="text-sm font-medium text-gray-700">
                                  {apt.units.unit_types?.name || apt.units.unit_type || 'غير محدد'} - {apt.units.unit_code || 'بدون رمز'}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {apt.units.projects?.name || 'مشروع غير محدد'}
                                  {apt.units.projects?.city ? ` - ${apt.units.projects.city}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-left">
                          <span className={`inline-block px-4 py-2 text-xs font-bold rounded-xl border-2 shadow-sm ${appointmentStatusColors[apt.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {appointmentStatusLabels[apt.status] || apt.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Requests Analytics */}
            {customerRequests.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">تحليلات طلبات العميل</h3>
                    <p className="text-sm text-gray-600">نظرة شاملة على جميع طلبات العميل</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <ClipboardList className="w-8 h-8 text-purple-600" />
                      <span className="text-2xl font-bold text-gray-900">{customerRequests.length}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">إجمالي الطلبات</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Home className="w-8 h-8 text-blue-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {Array.from(new Set(customerRequests.map(r => r.unit_type).filter(Boolean))).length}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">أنواع وحدات مختلفة</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin className="w-8 h-8 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {Array.from(new Set(customerRequests.map(r => r.city).filter(Boolean))).length}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">مدن مختلفة</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-amber-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-8 h-8 text-amber-600" />
                      <span className="text-lg font-bold text-gray-900">
                        {(() => {
                          const budgets = customerRequests.filter(r => r.budget_min && r.budget_max)
                          if (budgets.length === 0) return '0'
                          const avg = budgets.reduce((sum, r) => sum + ((r.budget_min! + r.budget_max!) / 2), 0) / budgets.length
                          return Math.round(avg).toLocaleString()
                        })()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">متوسط الميزانية</p>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Unit Types Chart */}
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <PieChartIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">أنواع الوحدات المطلوبة</h4>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const unitTypeCounts = customerRequests.reduce((acc, r) => {
                          const type = r.unit_type || 'غير محدد'
                          acc[type] = (acc[type] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        const colors = ['from-purple-500 to-purple-600', 'from-pink-500 to-pink-600', 'from-indigo-500 to-indigo-600', 'from-blue-500 to-blue-600']
                        return Object.entries(unitTypeCounts)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([type, count], index) => {
                            const percentage = (count / customerRequests.length) * 100
                            return (
                              <div key={type}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {unitTypeLabels[type] || type}
                                  </span>
                                  <span className="text-sm font-bold text-gray-900">
                                    {count} ({percentage.toFixed(0)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className={`h-2.5 bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })
                      })()}
                    </div>
                  </div>

                  {/* Cities Chart */}
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">المدن المطلوبة</h4>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const cityCounts = customerRequests.reduce((acc, r) => {
                          const city = r.city || 'غير محدد'
                          acc[city] = (acc[city] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        return Object.entries(cityCounts)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([city, count], index) => {
                            const percentage = (count / customerRequests.length) * 100
                            const medals = ['🥇', '🥈', '🥉', '🏅', '🏅']
                            return (
                              <div key={city}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{medals[index]}</span>
                                    <span className="text-sm font-semibold text-gray-700">{city}</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900">
                                    {count} ({percentage.toFixed(0)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="h-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })
                      })()}
                    </div>
                  </div>

                  {/* Rooms Distribution */}
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <Bed className="w-5 h-5 text-cyan-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">توزيع عدد الغرف</h4>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const roomsCounts = customerRequests.reduce((acc, r) => {
                          const rooms = r.rooms?.toString() || 'غير محدد'
                          acc[rooms] = (acc[rooms] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        return Object.entries(roomsCounts)
                          .sort(([a], [b]) => {
                            if (a === 'غير محدد') return 1
                            if (b === 'غير محدد') return -1
                            return parseInt(a) - parseInt(b)
                          })
                          .slice(0, 5)
                          .map(([rooms, count]) => {
                            const percentage = (count / customerRequests.length) * 100
                            return (
                              <div key={rooms}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {rooms !== 'غير محدد' ? `${rooms} غرف` : rooms}
                                  </span>
                                  <span className="text-sm font-bold text-gray-900">
                                    {count} ({percentage.toFixed(0)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="h-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })
                      })()}
                    </div>
                  </div>

                  {/* Budget Ranges */}
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">نطاقات الميزانية</h4>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const budgetRanges = {
                          '0-20k': { label: '0 - 20,000 ريال', count: customerRequests.filter(r => r.budget_max && r.budget_max <= 20000).length },
                          '20k-40k': { label: '20,000 - 40,000 ريال', count: customerRequests.filter(r => r.budget_max && r.budget_max > 20000 && r.budget_max <= 40000).length },
                          '40k-60k': { label: '40,000 - 60,000 ريال', count: customerRequests.filter(r => r.budget_max && r.budget_max > 40000 && r.budget_max <= 60000).length },
                          '60k+': { label: 'أكثر من 60,000 ريال', count: customerRequests.filter(r => r.budget_max && r.budget_max > 60000).length }
                        }
                        const total = Object.values(budgetRanges).reduce((sum, range) => sum + range.count, 0)
                        const colors = ['from-amber-400 to-amber-500', 'from-orange-400 to-orange-500', 'from-red-400 to-red-500', 'from-rose-400 to-rose-500']
                        
                        return Object.entries(budgetRanges).map(([key, range], index) => {
                          const percentage = total > 0 ? (range.count / total) * 100 : 0
                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-700">{range.label}</span>
                                <span className="text-sm font-bold text-gray-900">
                                  {range.count} ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-2.5 bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {customerRequests.filter(r => r.furnished).length}
                        </p>
                        <p className="text-sm font-semibold text-gray-600">طلبات مفروشة</p>
                        <p className="text-xs text-gray-500">
                          {((customerRequests.filter(r => r.furnished).length / customerRequests.length) * 100).toFixed(0)}% من الطلبات
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const confidences = customerRequests.filter(r => r.model_confidence)
                            if (confidences.length === 0) return '0'
                            const avg = confidences.reduce((sum, r) => sum + (r.model_confidence! * 100), 0) / confidences.length
                            return avg.toFixed(0)
                          })()}%
                        </p>
                        <p className="text-sm font-semibold text-gray-600">متوسط دقة AI</p>
                        <p className="text-xs text-gray-500">
                          {customerRequests.filter(r => r.model_confidence).length} طلب مع تقييم
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const mostRequested = Object.entries(
                              customerRequests.reduce((acc, r) => {
                                const type = r.unit_type || 'غير محدد'
                                acc[type] = (acc[type] || 0) + 1
                                return acc
                              }, {} as Record<string, number>)
                            ).sort(([, a], [, b]) => b - a)[0]
                            return mostRequested ? unitTypeLabels[mostRequested[0]] || mostRequested[0] : '-'
                          })()}
                        </p>
                        <p className="text-sm font-semibold text-gray-600">الأكثر طلباً</p>
                        <p className="text-xs text-gray-500">نوع الوحدة المفضل</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Requests */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-purple-600" />
                  تفاصيل الطلبات
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {customerRequests.length} طلب
                  </span>
                  <Link
                    href={`/dashboard/customer-requests`}
                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-xs font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    عرض الكل →
                  </Link>
                </div>
              </div>
              {customerRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-300">
                  <ClipboardList className="w-16 h-16 mx-auto mb-3 text-purple-300" />
                  <p className="text-lg font-medium">لا توجد طلبات مسجلة</p>
                  <p className="text-sm text-gray-400 mt-1">يمكنك إضافة طلب جديد من صفحة طلبات العملاء</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerRequests.map((request) => (
                    <div
                      key={request.id}
                      className="group bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-2xl p-5 hover:border-purple-400 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                              <Home className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {request.unit_type && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-sm font-bold rounded-lg">
                                    {unitTypeLabels[request.unit_type] || request.unit_type}
                                  </span>
                                )}
                                {request.source_channel && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                                    {sourceChannelLabels[request.source_channel] || request.source_channel}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                📅 {new Date(request.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {request.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="text-xs text-gray-500">المدينة</p>
                                  <p className="text-sm font-semibold text-gray-900">{request.city}</p>
                                </div>
                              </div>
                            )}
                            {request.district && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-teal-600" />
                                <div>
                                  <p className="text-xs text-gray-500">الحي</p>
                                  <p className="text-sm font-semibold text-gray-900">{request.district}</p>
                                </div>
                              </div>
                            )}
                            {request.rooms && (
                              <div className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-cyan-600" />
                                <div>
                                  <p className="text-xs text-gray-500">الغرف</p>
                                  <p className="text-sm font-semibold text-gray-900">{request.rooms} غرف</p>
                                </div>
                              </div>
                            )}
                            {request.baths && (
                              <div className="flex items-center gap-2">
                                <Bath className="w-4 h-4 text-indigo-600" />
                                <div>
                                  <p className="text-xs text-gray-500">الحمامات</p>
                                  <p className="text-sm font-semibold text-gray-900">{request.baths}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Budget */}
                          {(request.budget_min || request.budget_max) && (
                            <div className="mt-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-amber-600" />
                              <div>
                                <p className="text-xs text-gray-500">الميزانية</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {request.budget_min && request.budget_max
                                    ? `${request.budget_min.toLocaleString()} - ${request.budget_max.toLocaleString()} ريال`
                                    : request.budget_min
                                    ? `من ${request.budget_min.toLocaleString()} ريال`
                                    : request.budget_max
                                    ? `حتى ${request.budget_max.toLocaleString()} ريال`
                                    : ''}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Furnished Badge */}
                          {request.furnished && (
                            <div className="mt-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-bold rounded-full">
                                <Sparkles className="w-3 h-3" />
                                مفروش
                              </span>
                            </div>
                          )}

                          {/* Notes */}
                          {request.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 line-clamp-2">
                                💬 {request.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* AI Confidence */}
                        {request.model_confidence && (
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-indigo-200 shadow-sm">
                              <div className="text-center">
                                <p className="text-xs text-indigo-600 font-semibold">AI</p>
                                <p className="text-lg font-bold text-indigo-700">
                                  {(request.model_confidence * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 w-16 bg-gray-200 rounded-full h-2">
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
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedLead(null)
        }}
        title="⚠️ تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">هل أنت متأكد؟</h3>
            <p className="text-gray-600 mb-1">
              سيتم حذف العميل <strong className="text-gray-900">{selectedLead?.name || selectedLead?.phone}</strong>
            </p>
            <p className="text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg inline-block">
              ⚠️ هذه العملية لا يمكن التراجع عنها
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <Trash2 className="w-5 h-5" />
              <span>حذف نهائي</span>
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedLead(null)
              }}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}