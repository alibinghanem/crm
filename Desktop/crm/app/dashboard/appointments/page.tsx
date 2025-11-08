'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Calendar, Clock, User, MapPin, Edit, Trash2, Eye, Search, Filter, Phone, Home } from 'lucide-react'
import { format } from 'date-fns'
import Modal from '@/components/Modal'
import Link from 'next/link'

interface Appointment {
  id: string
  lead_id: string
  unit_id: string | null
  starts_at: string
  status: string
  agent: string | null
  notes: string | null
  created_at: string
  leads: {
    id: string
    name: string | null
    phone: string
    city: string | null
  } | null
  units: {
    id: string
    project_id: string | null
    unit_code: string | null
    unit_type: string | null
    unit_type_id: string | null
    floor_no: number | null
    location_desc: string | null
    price: number | null
    price_mode: string | null
    projects: {
      name: string | null
      city: string | null
      district: string | null
    } | null
    unit_types: {
      id: string
      name: string
      description: string | null
    } | null
  } | null
}

interface Lead {
  id: string
  name: string | null
  phone: string
}

interface UnitType {
  id: string
  name: string
  description: string | null
}

interface Unit {
  id: string
  project_id: string | null
  unit_code: string | null
  unit_type: string | null
  unit_type_id: string | null
  price: number | null
  projects: {
    name: string | null
    city: string | null
  } | null
  unit_types: UnitType | null
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusLabels: Record<string, string> = {
  scheduled: 'مجدول',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  no_show: 'لم يحضر',
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [leads, setLeads] = useState<Lead[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  useEffect(() => {
    fetchAppointments()
    fetchLeads()
    fetchUnits()
  }, [])


  async function fetchAppointments() {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          leads:lead_id (id, name, phone, city),
          units:unit_id (
            id, 
            project_id,
            unit_code, 
            unit_type,
            unit_type_id, 
            floor_no,
            location_desc,
            price,
            price_mode,
            projects:project_id (name, city, district),
            unit_types:unit_type_id (id, name, description)
          )
        `)
        .order('starts_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      console.log('Fetched appointments:', data)
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, phone')
        .order('name')

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  async function fetchUnits() {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          id, 
          project_id,
          unit_code, 
          unit_type,
          unit_type_id, 
          price,
          projects:project_id (name, city),
          unit_types:unit_type_id (id, name, description)
        `)
        .eq('active', true)
        .order('unit_code')

      if (error) throw error
      
      // تحويل البيانات لضمان التوافق مع الـ interface
      const transformedData = (data || []).map((unit: any) => ({
        ...unit,
        projects: Array.isArray(unit.projects) ? unit.projects[0] || null : unit.projects,
        unit_types: Array.isArray(unit.unit_types) ? unit.unit_types[0] || null : unit.unit_types
      }))
      
      setUnits(transformedData)
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const handleViewDetails = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setShowDetailModal(true)
  }

  const handleEdit = (apt: Appointment) => {
    // Fill form data immediately with all values
    const dateTimeValue = apt.starts_at ? new Date(apt.starts_at).toISOString().slice(0, 16) : ''
    
    const newFormData = {
      lead_id: apt.lead_id ?? '',
      unit_id: apt.unit_id ?? '',
      starts_at: dateTimeValue,
      status: apt.status ?? 'scheduled',
      agent: apt.agent ?? '',
      notes: apt.notes ?? '',
    }
    
    console.log('Filling appointment form data:', newFormData) // Debug log
    setFormData(newFormData)
    setSelectedAppointment(apt)
    // Use setTimeout to ensure formData is set before modal opens
    setTimeout(() => {
      setShowModal(true)
    }, 10)
  }

  const handleDelete = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setShowDeleteModal(true)
  }

  const handleCreate = () => {
    setSelectedAppointment(null)
    setFormData({
      lead_id: '',
      unit_id: '',
      starts_at: '',
      status: 'scheduled',
      agent: '',
      notes: '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const appointmentData: any = {
        lead_id: formData.lead_id,
        unit_id: formData.unit_id || null,
        starts_at: formData.starts_at,
        status: formData.status,
        agent: formData.agent || null,
        notes: formData.notes || null,
      }

      if (selectedAppointment) {
        // Update
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', selectedAppointment.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentData)

        if (error) throw error
      }

      setShowModal(false)
      fetchAppointments()
      setFormData({})
    } catch (error: any) {
      alert(error.message || 'حدث خطأ')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedAppointment) return

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointment.id)

      if (error) throw error

      setShowDeleteModal(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ عند الحذف')
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    const matchesSearch = 
      apt.leads?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.leads?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.agent?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 rounded-3xl shadow-2xl p-8 text-white mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1">المواعيد</h1>
                <p className="text-orange-100">إدارة ومتابعة جميع المواعيد</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-white text-orange-700 px-6 py-3 rounded-xl hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة موعد جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">إجمالي المواعيد</p>
              <p className="text-3xl font-bold">{appointments.length}</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">مجدولة</p>
              <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'scheduled').length}</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">مؤكدة</p>
              <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'confirmed').length}</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">مكتملة</p>
              <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'completed').length}</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
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
              placeholder="البحث بالعميل أو الوكيل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white min-w-[200px] text-gray-900"
            >
              <option value="all">جميع الحالات</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد مواعيد</p>
          </div>
        ) : (
          filteredAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-500 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-amber-100/0 to-yellow-50/0 group-hover:from-orange-50 group-hover:via-amber-100 group-hover:to-yellow-50 transition-all duration-700 pointer-events-none"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 shine-effect opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-orange-700 group-hover:to-orange-600 transition-all">
                          {appointment.leads?.name || 'غير محدد'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Phone className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">{appointment.leads?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm transition-all ${statusColors[appointment.status] || 'bg-gray-100 text-gray-800 border-gray-200'} group-hover:scale-110`}>
                    {statusLabels[appointment.status] || appointment.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span>{format(new Date(appointment.starts_at), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{format(new Date(appointment.starts_at), 'hh:mm a')}</span>
                  </div>
                  {appointment.agent && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-purple-600" />
                      <span>{appointment.agent}</span>
                    </div>
                  )}
                  {appointment.units && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>
                        {appointment.units.projects?.name || 'مشروع غير محدد'}
                        {appointment.units.projects?.city ? ` - ${appointment.units.projects.city}` : ''}
                      </span>
                    </div>
                  )}
                  {appointment.units && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Home className="w-4 h-4 text-blue-600" />
                      <span>{appointment.units.unit_type || 'غير محدد'} {appointment.units.unit_code ? `- ${appointment.units.unit_code}` : ''}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>التفاصيل</span>
                  </button>
                  <button
                    onClick={() => handleEdit(appointment)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(appointment)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
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
        عرض {filteredAppointments.length} من {appointments.length} موعد
      </div>

      {/* Create/Edit Modal */}
      <Modal
        key={selectedAppointment?.id || 'new'}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setFormData({})
          setSelectedAppointment(null)
        }}
        title={selectedAppointment ? '✏️ تعديل الموعد' : '➕ إضافة موعد جديد'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Edit Mode Indicator */}
          {selectedAppointment && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                <Edit className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">وضع التعديل</p>
                <p className="text-sm text-gray-600">
                  أنت تقوم بتعديل موعد: <strong>{selectedAppointment.leads?.name || 'غير محدد'}</strong>
                  {' - '}
                  {format(new Date(selectedAppointment.starts_at), 'dd MMM yyyy - HH:mm')}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                العميل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <select
                  value={formData.lead_id ?? ''}
                  onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white hover:border-gray-300 appearance-none"
                  required
                >
                  <option value="">اختر العميل</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name || 'غير محدد'} - {lead.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوحدة</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Home className="w-5 h-5" />
                </div>
                <select
                  value={formData.unit_id ?? ''}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white hover:border-gray-300 appearance-none"
                >
                  <option value="">اختر الوحدة (اختياري)</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_types?.name || unit.unit_type || 'غير محدد'} - {unit.unit_code || 'بدون رمز'} - {unit.projects?.name || 'مشروع غير محدد'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                التاريخ والوقت <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="datetime-local"
                  value={formData.starts_at ?? ''}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white hover:border-gray-300"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
              <select
                value={formData.status ?? 'scheduled'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white hover:border-gray-300 appearance-none"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوكيل</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={formData.agent ?? ''}
                  onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white hover:border-gray-300"
                  placeholder="اسم الوكيل"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 ملاحظات</label>
            <textarea
              value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white hover:border-gray-300 resize-none"
              placeholder="ملاحظات إضافية..."
            />
          </div>
          <div className="flex items-center gap-3 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 text-white px-6 py-4 rounded-xl hover:from-orange-700 hover:via-orange-800 hover:to-amber-800 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {selectedAppointment ? (
                <>
                  <span>💾</span>
                  <span>حفظ التعديلات</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>إضافة الموعد</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowModal(false)
                setFormData({})
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
          setSelectedAppointment(null)
        }}
        title={`📅 تفاصيل الموعد`}
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Actions */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {format(new Date(selectedAppointment.starts_at), 'dd MMM yyyy')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedAppointment.starts_at), 'hh:mm a')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  handleEdit(selectedAppointment)
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2.5 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Edit className="w-4 h-4" />
                <span>تعديل</span>
              </button>
            </div>

            {/* Appointment Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">التاريخ</p>
                    <p className="text-lg font-bold text-gray-900">{format(new Date(selectedAppointment.starts_at), 'dd MMM yyyy')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">الوقت</p>
                    <p className="text-lg font-bold text-gray-900">{format(new Date(selectedAppointment.starts_at), 'hh:mm a')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <span className={`text-white text-lg font-bold px-3 py-1 rounded-lg inline-block ${statusColors[selectedAppointment.status] || 'bg-gray-600'}`}>
                      {statusLabels[selectedAppointment.status] || selectedAppointment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">الحالة</p>
                    <p className="text-lg font-bold text-gray-900">{statusLabels[selectedAppointment.status] || selectedAppointment.status}</p>
                  </div>
                </div>
              </div>
              {selectedAppointment.agent && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">الوكيل</p>
                      <p className="text-lg font-bold text-gray-900">{selectedAppointment.agent}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedAppointment.leads && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-primary-600" />
                    معلومات العميل
                  </h3>
                  <Link
                    href={`/dashboard/leads`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1"
                  >
                    عرض العميل →
                  </Link>
                </div>
                <Link
                  href={`/dashboard/leads`}
                  className="block group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {(selectedAppointment.leads.name || 'غير محدد')[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{selectedAppointment.leads.name || 'غير محدد'}</p>
                      <p className="text-sm font-semibold text-gray-600 mt-1">{selectedAppointment.leads.phone}</p>
                      {selectedAppointment.leads.city && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedAppointment.leads.city}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {selectedAppointment.units && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Home className="w-6 h-6 text-green-600" />
                    معلومات الوحدة
                  </h3>
                  <Link
                    href={`/dashboard/units`}
                    className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1"
                  >
                    عرض الوحدة →
                  </Link>
                </div>
                <Link
                  href={`/dashboard/units`}
                  className="block group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:border-green-300 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">
                        {selectedAppointment.units.unit_type || 'غير محدد'} - {selectedAppointment.units.unit_code || 'بدون رمز'}
                      </p>
                      <p className="text-sm font-semibold text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedAppointment.units.projects?.name || 'مشروع غير محدد'}
                        {selectedAppointment.units.projects?.city ? ` - ${selectedAppointment.units.projects.city}` : ''}
                      </p>
                      {selectedAppointment.units.price && (
                        <p className="text-sm text-green-600 font-bold mt-1">
                          {selectedAppointment.units.price.toLocaleString()} ر.س
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {selectedAppointment.notes && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📝</span>
                  ملاحظات
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{selectedAppointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedAppointment(null)
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
            <p className="text-gray-600 mb-1">سيتم حذف هذا الموعد نهائياً</p>
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
                setSelectedAppointment(null)
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