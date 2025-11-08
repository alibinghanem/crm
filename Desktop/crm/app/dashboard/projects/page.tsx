'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Building, MapPin, Edit, Trash2, Eye, Phone, Map, FileText, Tag, Sparkles, Home, DollarSign, Square, Bed, Bath, Image as ImageIcon, Calendar } from 'lucide-react'
import Modal from '@/components/Modal'

interface Project {
  id: string
  project_no: number | null
  name: string
  city: string | null
  district: string | null
  address: string | null
  location_desc: string | null
  map_url: string | null
  guard_phone: string | null
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

interface UnitType {
  id: string
  project_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

interface Unit {
  id: string
  unit_code: string | null
  unit_type: string | null
  unit_type_id: string | null
  price: number | null
  price_mode: 'monthly' | 'yearly' | 'sell' | null
  floor_no: number | null
  floor_label: string | null
  rooms: number | null
  baths: number | null
  features: string | null
  location_desc: string | null
  guard_phone: string | null
  map_url: string | null
  aqar_url: string | null
  primary_photo: string | null
  photos_paths: string[] | null
  active: boolean
  unit_types?: UnitType
  projects?: Project
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectUnits, setProjectUnits] = useState<Unit[]>([])
  
  // Unit Types Management
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])
  const [showUnitTypeModal, setShowUnitTypeModal] = useState(false)
  const [showDeleteUnitTypeModal, setShowDeleteUnitTypeModal] = useState(false)
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null)
  const [unitTypeName, setUnitTypeName] = useState('')
  const [unitTypeDescription, setUnitTypeDescription] = useState('')
  
  // Unit Detail Modal
  const [showUnitDetailModal, setShowUnitDetailModal] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [unitAppointments, setUnitAppointments] = useState<any[]>([])
  
  // Form states
  const [projectNo, setProjectNo] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [locationDesc, setLocationDesc] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [guardPhone, setGuardPhone] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProjectUnits(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          id, 
          unit_code, 
          unit_type, 
          unit_type_id,
          price,
          price_mode,
          floor_no,
          floor_label,
          rooms,
          baths,
          features,
          location_desc,
          guard_phone,
          map_url,
          aqar_url,
          primary_photo,
          photos_paths,
          active,
          unit_types:unit_type_id (id, name, description),
          projects:project_id (id, name, city, district)
        `)
        .eq('project_id', projectId)
        .order('unit_code', { ascending: true })

      if (error) throw error
      setProjectUnits(data || [])
    } catch (error) {
      console.error('Error fetching project units:', error)
    }
  }

  async function fetchUnitTypes(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('unit_types')
        .select('*')
        .eq('project_id', projectId)
        .order('name', { ascending: true })

      if (error) throw error
      setUnitTypes(data || [])
    } catch (error) {
      console.error('Error fetching unit types:', error)
    }
  }

  const handleViewDetails = async (project: Project) => {
    setSelectedProject(project)
    await Promise.all([
      fetchProjectUnits(project.id),
      fetchUnitTypes(project.id)
    ])
    setShowDetailModal(true)
  }

  const handleViewUnitDetails = async (unit: Unit) => {
    setSelectedUnit(unit)
    
    // Fetch appointments for this unit
    await fetchUnitAppointments(unit.id)
    
    setShowUnitDetailModal(true)
  }
  
  async function fetchUnitAppointments(unitId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          leads:lead_id (name, phone)
        `)
        .eq('unit_id', unitId)
        .order('starts_at', { ascending: false })
      
      if (error) throw error
      setUnitAppointments(data || [])
    } catch (error) {
      console.error('Error fetching unit appointments:', error)
      setUnitAppointments([])
    }
  }
  
  // Helper function to get public URL for Supabase Storage images
  const getPublicUrl = (path: string | null): string => {
    if (!path) return ''
    const { data } = supabase.storage.from('units').getPublicUrl(path)
    return data.publicUrl
  }

  const handleCreateUnitType = () => {
    if (!selectedProject) return
    setSelectedUnitType(null)
    setUnitTypeName('')
    setUnitTypeDescription('')
    setShowUnitTypeModal(true)
  }

  const handleEditUnitType = (unitType: UnitType) => {
    setSelectedUnitType(unitType)
    setUnitTypeName(unitType.name)
    setUnitTypeDescription(unitType.description || '')
    setShowUnitTypeModal(true)
  }

  const handleDeleteUnitType = (unitType: UnitType) => {
    setSelectedUnitType(unitType)
    setShowDeleteUnitTypeModal(true)
  }

  const handleSaveUnitType = async () => {
    if (!selectedProject || !unitTypeName.trim()) {
      alert('❌ يرجى إدخال اسم نوع الوحدة')
      return
    }

    try {
      const unitTypeData = {
        project_id: selectedProject.id,
        name: unitTypeName.trim(),
        description: unitTypeDescription.trim() || null,
      }

      if (selectedUnitType) {
        // Update
        const { error } = await supabase
          .from('unit_types')
          .update(unitTypeData)
          .eq('id', selectedUnitType.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('unit_types')
          .insert(unitTypeData)

        if (error) throw error
      }

      setShowUnitTypeModal(false)
      await fetchUnitTypes(selectedProject.id)
      alert('✅ تم حفظ نوع الوحدة بنجاح!')
    } catch (error: any) {
      console.error('Error saving unit type:', error)
      if (error.code === '23505') {
        alert('❌ هذا النوع موجود مسبقاً في المشروع')
      } else {
        alert(`❌ خطأ: ${error.message || 'حدث خطأ'}`)
      }
    }
  }

  const handleConfirmDeleteUnitType = async () => {
    if (!selectedUnitType) return

    try {
      const { error } = await supabase
        .from('unit_types')
        .delete()
        .eq('id', selectedUnitType.id)

      if (error) throw error

      setShowDeleteUnitTypeModal(false)
      setSelectedUnitType(null)
      if (selectedProject) {
        await fetchUnitTypes(selectedProject.id)
      }
      alert('✅ تم حذف نوع الوحدة بنجاح')
    } catch (error: any) {
      console.error('Error deleting unit type:', error)
      if (error.code === '23503') {
        alert('❌ لا يمكن حذف النوع لأنه مرتبط بوحدات. قم بتغيير نوع الوحدات أولاً.')
      } else {
        alert(`❌ خطأ: ${error.message || 'حدث خطأ عند الحذف'}`)
      }
    }
  }

  const handleEdit = (project: Project) => {
    setProjectNo(project.project_no)
    setName(project.name)
    setCity(project.city || '')
    setDistrict(project.district || '')
    setAddress(project.address || '')
    setLocationDesc(project.location_desc || '')
    setMapUrl(project.map_url || '')
    setGuardPhone(project.guard_phone || '')
    setDescription(project.description || '')
    setActive(project.active)
    setSelectedProject(project)
    setShowModal(true)
  }

  const handleDelete = (project: Project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const handleCreate = () => {
    setSelectedProject(null)
    setProjectNo(null)
    setName('')
    setCity('')
    setDistrict('')
    setAddress('')
    setLocationDesc('')
    setMapUrl('')
    setGuardPhone('')
    setDescription('')
    setActive(true)
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const projectData: any = {
        project_no: projectNo,
        name: name,
        city: city || null,
        district: district || null,
        address: address || null,
        location_desc: locationDesc || null,
        map_url: mapUrl || null,
        guard_phone: guardPhone || null,
        description: description || null,
        active: active,
      }

      if (selectedProject) {
        // Update
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', selectedProject.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('projects')
          .insert(projectData)

        if (error) throw error
      }

      setShowModal(false)
      fetchProjects()
      alert('✅ تم حفظ المشروع بنجاح!')
    } catch (error: any) {
      console.error('Error saving project:', error)
      alert(`❌ خطأ: ${error.message || 'حدث خطأ'}`)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedProject) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id)

      if (error) throw error

      setShowDeleteModal(false)
      setSelectedProject(null)
      fetchProjects()
      alert('✅ تم حذف المشروع بنجاح')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      if (error.code === '23503') {
        alert('❌ لا يمكن حذف المشروع لأنه مرتبط بوحدات. قم بحذف الوحدات أولاً.')
      } else {
        alert(`❌ خطأ: ${error.message || 'حدث خطأ عند الحذف'}`)
      }
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.district?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 rounded-3xl shadow-2xl p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1">المشاريع</h1>
                <p className="text-purple-100">إدارة جميع المشاريع العقارية</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة مشروع جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">إجمالي المشاريع</p>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
            <Building className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">المشاريع النشطة</p>
              <p className="text-3xl font-bold">{projects.filter(p => p.active).length}</p>
            </div>
            <Building className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">المدن</p>
              <p className="text-3xl font-bold">{new Set(projects.map(p => p.city).filter(Boolean)).size}</p>
            </div>
            <MapPin className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">غير نشط</p>
              <p className="text-3xl font-bold">{projects.filter(p => !p.active).length}</p>
            </div>
            <Building className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث بالاسم، المدينة، أو الحي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد مشاريع</p>
          </div>
        ) : (
          filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header */}
              <div className={`h-40 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-200 flex items-center justify-center relative ${!project.active ? 'opacity-60' : ''}`}>
                <Building className="w-16 h-16 text-purple-600 group-hover:scale-110 transition-transform" />
                {!project.active && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    ❌ غير نشط
                  </span>
                )}
                {project.project_no && (
                  <span className="absolute top-3 left-3 bg-white text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    #{project.project_no}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                  {project.name}
                </h3>
                
                {(project.city || project.district) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>{project.city} {project.district && `- ${project.district}`}</span>
                  </div>
                )}

                {project.guard_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{project.guard_phone}</span>
                  </div>
                )}

                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(project)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all font-semibold shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>التفاصيل</span>
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="flex items-center justify-center bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-all"
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
        عرض {filteredProjects.length} من {projects.length} مشروع
      </div>

      {/* Create/Edit Modal - Enhanced Design */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedProject(null)
        }}
        title={selectedProject ? '✏️ تعديل المشروع' : '➕ إضافة مشروع جديد'}
        size="lg"
      >
        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
          
          {/* Section 1: Basic Info */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">معلومات المشروع</h3>
                <p className="text-sm text-gray-600">الاسم والرقم</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project No */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span>رقم المشروع (فريد)</span>
                </label>
                <input
                  type="number"
                  value={projectNo ?? ''}
                  onChange={(e) => setProjectNo(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="مثال: 1001"
                />
              </div>

              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>اسم المشروع *</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="مثال: مشروع النرجس"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">الموقع</h3>
                <p className="text-sm text-gray-600">المدينة والحي والعنوان</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>المدينة</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="الرياض"
                />
              </div>

              {/* District */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>الحي</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="النرجس"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>العنوان</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="العنوان بالتفصيل"
                />
              </div>

              {/* Location Desc */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>وصف الموقع</span>
                </label>
                <input
                  type="text"
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="وصف تفصيلي للموقع..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Links */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">الاتصال والروابط</h3>
                <p className="text-sm text-gray-600">التواصل والخرائط</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guard Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span>رقم الحارس</span>
                </label>
                <input
                  type="tel"
                  value={guardPhone}
                  onChange={(e) => setGuardPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  placeholder="05xxxxxxxx"
                />
              </div>

              {/* Map URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Map className="w-4 h-4 text-orange-600" />
                  <span>رابط الخريطة</span>
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>الوصف</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none transition-all"
                  placeholder="وصف المشروع..."
                />
              </div>
            </div>
          </div>

          {/* Section 4: Active Status */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-2xl p-6 border-2 border-blue-200">
            <label className="flex items-center gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-6 h-6 text-blue-600 border-blue-300 rounded focus:ring-blue-500 transition-all"
              />
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl shadow-lg transition-all ${active ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-400'}`}>
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{active ? '✅ مشروع نشط' : '❌ مشروع غير نشط'}</p>
                  <p className="text-sm text-gray-600">{active ? 'المشروع ظاهر ويمكن إضافة وحدات له' : 'المشروع مخفي'}</p>
                </div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all font-bold shadow-lg"
            >
              <span>💾</span>
              <span>{selectedProject ? 'حفظ التعديلات' : 'إضافة المشروع'}</span>
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal - Enhanced Professional Design */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedProject(null)
          setProjectUnits([])
        }}
        title={`🏗️ تفاصيل المشروع ${selectedProject?.project_no ? `#${selectedProject.project_no}` : ''}`}
        size="xl"
      >
        {selectedProject && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            
            {/* Hero Section */}
            <div className="relative h-48 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Building className="w-32 h-32 text-white/30" />
              </div>
              <div className="relative z-10 p-8">
                <h2 className="text-4xl font-bold text-white mb-2">{selectedProject.name}</h2>
                {selectedProject.city && (
                  <p className="text-xl text-purple-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{selectedProject.city} {selectedProject.district && `- ${selectedProject.district}`}</span>
                  </p>
                )}
              </div>
              {selectedProject.active ? (
                <span className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                  ✅ نشط
                </span>
              ) : (
                <span className="absolute top-4 right-4 px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-bold shadow-lg">
                  ❌ غير نشط
                </span>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">المعلومات الأساسية</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedProject.project_no && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200 text-center">
                    <Building className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">#{selectedProject.project_no}</p>
                    <p className="text-xs text-gray-600">رقم المشروع</p>
                  </div>
                )}
                {selectedProject.city && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200 text-center">
                    <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">{selectedProject.city}</p>
                    <p className="text-xs text-gray-600">المدينة</p>
                  </div>
                )}
                {selectedProject.district && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200 text-center">
                    <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">{selectedProject.district}</p>
                    <p className="text-xs text-gray-600">الحي</p>
                  </div>
                )}
                {selectedProject.guard_phone && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200 text-center">
                    <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <a href={`tel:${selectedProject.guard_phone}`} className="text-lg font-bold text-purple-600 hover:text-purple-700 block">
                      {selectedProject.guard_phone}
                    </a>
                    <p className="text-xs text-gray-600">رقم الحارس</p>
                  </div>
                )}
              </div>
              
              {(selectedProject.address || selectedProject.location_desc) && (
                <div className="mt-4 space-y-3">
                  {selectedProject.address && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold">العنوان</span>
                      </p>
                      <p className="text-gray-800">{selectedProject.address}</p>
                    </div>
                  )}
                  {selectedProject.location_desc && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold">وصف الموقع</span>
                      </p>
                      <p className="text-gray-800">{selectedProject.location_desc}</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedProject.description && (
                <div className="mt-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">الوصف</span>
                  </p>
                  <p className="text-gray-800">{selectedProject.description}</p>
                </div>
              )}
              
              {selectedProject.map_url && (
                <div className="mt-4">
                  <a
                    href={selectedProject.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg"
                  >
                    <Map className="w-5 h-5" />
                    <span>عرض على الخريطة</span>
                  </a>
                </div>
              )}
            </div>

            {/* Unit Types Section - Beautiful Design */}
            <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-cyan-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">أنواع الوحدات</h3>
                    <p className="text-sm text-gray-600">إدارة أنواع الوحدات المتاحة في المشروع</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                    {unitTypes.length} نوع
                  </span>
                  <button
                    onClick={handleCreateUnitType}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة نوع</span>
                  </button>
                </div>
              </div>
              
              {unitTypes.length === 0 ? (
                <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-cyan-300">
                  <Tag className="w-16 h-16 mx-auto mb-3 text-cyan-300" />
                  <p className="text-lg font-medium text-gray-500 mb-2">لا توجد أنواع وحدات محددة</p>
                  <p className="text-sm text-gray-400">ابدأ بإضافة أنواع الوحدات المتوفرة في هذا المشروع</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unitTypes.map((unitType) => (
                    <div
                      key={unitType.id}
                      className="group bg-white/80 backdrop-blur-sm border-2 border-cyan-200 rounded-xl p-4 hover:border-cyan-400 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-cyan-600" />
                            <h4 className="font-bold text-gray-900">{unitType.name}</h4>
                          </div>
                          {unitType.description && (
                            <p className="text-sm text-gray-600 mb-2">{unitType.description}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            تاريخ الإنشاء: {new Date(unitType.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditUnitType(unitType)}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUnitType(unitType)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Units Grouped by Type - Creative Design */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">الوحدات حسب النوع</h3>
                    <p className="text-sm text-gray-600">عرض مُنظّم لجميع الوحدات</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold shadow-sm">
                  {projectUnits.length} وحدة
                </span>
              </div>
              
              {projectUnits.length === 0 ? (
                <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-purple-300">
                  <Building className="w-16 h-16 mx-auto mb-3 text-purple-300" />
                  <p className="text-lg font-medium text-gray-500">لا توجد وحدات في هذا المشروع</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group units by type */}
                  {(() => {
                    // Group units by unit_type_id
                    const groupedUnits: Record<string, typeof projectUnits> = {}
                    const unclassifiedUnits: typeof projectUnits = []
                    
                    projectUnits.forEach(unit => {
                      if (unit.unit_type_id && unit.unit_types) {
                        const typeId = unit.unit_type_id
                        if (!groupedUnits[typeId]) {
                          groupedUnits[typeId] = []
                        }
                        groupedUnits[typeId].push(unit)
                      } else {
                        unclassifiedUnits.push(unit)
                      }
                    })
                    
                    return (
                      <>
                        {/* Display units grouped by type */}
                        {Object.entries(groupedUnits).map(([typeId, units], index) => {
                          const unitType = units[0]?.unit_types
                          const gradients = [
                            'from-blue-500 to-cyan-600',
                            'from-purple-500 to-pink-600',
                            'from-green-500 to-emerald-600',
                            'from-orange-500 to-red-600',
                            'from-indigo-500 to-purple-600',
                            'from-teal-500 to-blue-600',
                          ]
                          const gradient = gradients[index % gradients.length]
                          
                          return (
                            <div key={typeId} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-200 shadow-md hover:shadow-lg transition-all">
                              {/* Type Header */}
                              <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-purple-100">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2.5 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
                                    <Sparkles className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900">{unitType?.name || 'نوع غير محدد'}</h4>
                                    {unitType?.description && (
                                      <p className="text-sm text-gray-600">{unitType.description}</p>
                                    )}
                                  </div>
                                </div>
                                <span className={`px-3 py-1.5 bg-gradient-to-r ${gradient} text-white rounded-full text-sm font-bold shadow-md`}>
                                  {units.length} وحدة
                                </span>
                              </div>
                              
                              {/* Units Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {units.map((unit) => (
                                  <button
                                    key={unit.id}
                                    onClick={() => handleViewUnitDetails(unit)}
                                    className="group text-right bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Home className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                                        <p className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                          {unit.unit_code || 'بدون رمز'}
                                        </p>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${unit.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {unit.active ? '✓' : '✗'}
                                      </span>
                                    </div>
                                    {unit.price && (
                                      <div className="flex items-center gap-1 mt-2">
                                        <DollarSign className="w-4 h-4 text-purple-600" />
                                        <p className="text-sm text-purple-600 font-bold">
                                          {unit.price.toLocaleString()} ر.س
                                        </p>
                                      </div>
                                    )}
                                    {unit.floor_label && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        📍 {unit.floor_label}
                                      </p>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Unclassified Units */}
                        {unclassifiedUnits.length > 0 && (
                          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-dashed border-gray-300">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gray-400 rounded-xl">
                                  <Building className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-700">وحدات غير مُصنّفة</h4>
                                  <p className="text-sm text-gray-500">لم يتم تحديد نوع لهذه الوحدات</p>
                                </div>
                              </div>
                              <span className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-bold">
                                {unclassifiedUnits.length} وحدة
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {unclassifiedUnits.map((unit) => (
                                <button
                                  key={unit.id}
                                  onClick={() => handleViewUnitDetails(unit)}
                                  className="text-right bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:shadow-lg transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-bold text-gray-900">
                                        {unit.unit_type || 'وحدة'} {unit.unit_code && `- ${unit.unit_code}`}
                                      </p>
                                      {unit.price && (
                                        <p className="text-sm text-gray-600 font-semibold mt-1">
                                          {unit.price.toLocaleString()} ر.س
                                        </p>
                                      )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${unit.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                      {unit.active ? '✅' : '❌'}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Unit Detail Modal - Enhanced Professional Design */}
      <Modal
        isOpen={showUnitDetailModal}
        onClose={() => {
          setShowUnitDetailModal(false)
          setSelectedUnit(null)
          setUnitAppointments([])
        }}
        title={`🏠 تفاصيل الوحدة ${selectedUnit?.unit_code ? `- ${selectedUnit.unit_code}` : ''}`}
        size="xl"
      >
        {selectedUnit && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            
            {/* Hero Section with Primary Photo */}
            <div className="relative">
              {selectedUnit.primary_photo ? (
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={getPublicUrl(selectedUnit.primary_photo)} 
                    alt="Primary" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedUnit.unit_types?.name || selectedUnit.unit_type || 'وحدة سكنية'}
                    </h2>
                    {selectedUnit.price && (
                      <p className="text-2xl font-bold text-green-400">
                        {selectedUnit.price.toLocaleString()} ر.س
                        {selectedUnit.price_mode && (
                          <span className="text-base mr-2">
                            ({selectedUnit.price_mode === 'monthly' ? 'شهري' : selectedUnit.price_mode === 'yearly' ? 'سنوي' : 'للبيع'})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {selectedUnit.active ? (
                    <span className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                      ✅ نشط
                    </span>
                  ) : (
                    <span className="absolute top-4 right-4 px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-bold shadow-lg">
                      ❌ غير نشط
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <ImageIcon className="w-20 h-20 mx-auto text-gray-400 mb-3" />
                    <p className="text-lg text-gray-600">لا توجد صورة رئيسية</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 1: Basic Info */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">المعلومات الأساسية</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Home className="w-4 h-4 text-purple-600" />
                    <span>رمز الوحدة</span>
                  </p>
                  <p className="text-lg font-bold text-gray-900">{selectedUnit.unit_code || 'غير محدد'}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>نوع الوحدة</span>
                  </p>
                  <p className="text-lg font-bold text-gray-900">{selectedUnit.unit_types?.name || selectedUnit.unit_type || 'غير محدد'}</p>
                </div>
                {selectedUnit.projects && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200 col-span-2">
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-600" />
                      <span>المشروع</span>
                    </p>
                    <p className="text-lg font-bold text-gray-900">{selectedUnit.projects.name}</p>
                    {selectedUnit.projects.city && (
                      <p className="text-sm text-gray-600 mt-1">📍 {selectedUnit.projects.city} {selectedUnit.projects.district && `- ${selectedUnit.projects.district}`}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Unit Details */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <Square className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">تفاصيل الوحدة</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedUnit.floor_label && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200 text-center">
                    <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedUnit.floor_label}</p>
                    <p className="text-xs text-gray-600">الدور</p>
                  </div>
                )}
                {selectedUnit.rooms !== null && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200 text-center">
                    <Bed className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedUnit.rooms}</p>
                    <p className="text-xs text-gray-600">غرف</p>
                  </div>
                )}
                {selectedUnit.baths !== null && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200 text-center">
                    <Bath className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedUnit.baths}</p>
                    <p className="text-xs text-gray-600">حمامات</p>
                  </div>
                )}
                {selectedUnit.price && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200 text-center">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xl font-bold text-green-600">{selectedUnit.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">ر.س</p>
                  </div>
                )}
                {selectedUnit.features && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200 col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">المميزات</span>
                    </p>
                    <p className="text-gray-800">{selectedUnit.features}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Location & Contact */}
            {(selectedUnit.location_desc || selectedUnit.guard_phone || selectedUnit.map_url || selectedUnit.aqar_url) && (
              <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">الموقع والتواصل</h3>
                </div>
                <div className="space-y-3">
                  {selectedUnit.location_desc && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span>الموقع</span>
                      </p>
                      <p className="text-gray-800">{selectedUnit.location_desc}</p>
                    </div>
                  )}
                  {selectedUnit.guard_phone && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-600" />
                        <span>رقم الحارس</span>
                      </p>
                      <a href={`tel:${selectedUnit.guard_phone}`} className="text-lg font-bold text-orange-600 hover:text-orange-700">
                        {selectedUnit.guard_phone}
                      </a>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedUnit.map_url && (
                      <a 
                        href={selectedUnit.map_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg"
                      >
                        <Map className="w-5 h-5" />
                        <span>الخريطة</span>
                      </a>
                    )}
                    {selectedUnit.aqar_url && (
                      <a 
                        href={selectedUnit.aqar_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all font-semibold shadow-lg"
                      >
                        <Building className="w-5 h-5" />
                        <span>عقار</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Photos Gallery */}
            {selectedUnit.photos_paths && selectedUnit.photos_paths.length > 0 && (
              <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl p-6 border-2 border-pink-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">معرض الصور ({selectedUnit.photos_paths.length})</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedUnit.photos_paths.map((path, idx) => (
                    <img
                      key={idx}
                      src={getPublicUrl(path)}
                      alt={`Gallery ${idx}`}
                      className="w-full h-40 object-cover rounded-xl border-2 border-pink-200 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Appointments Section */}
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">المواعيد المرتبطة ({unitAppointments.length})</h3>
              </div>
              {unitAppointments.length === 0 ? (
                <div className="text-center py-8 bg-white/50 backdrop-blur-sm rounded-xl">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">لا توجد مواعيد مرتبطة بهذه الوحدة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unitAppointments.map(apt => (
                    <div key={apt.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200 hover:border-blue-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{new Date(apt.starts_at).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-sm text-gray-600 mt-1">🕐 {new Date(apt.starts_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                          {apt.leads && (
                            <p className="text-sm text-gray-600 mt-1">👤 {apt.leads.name || apt.leads.phone}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status === 'scheduled' ? 'مجدول' :
                           apt.status === 'completed' ? 'مكتمل' :
                           apt.status === 'cancelled' ? 'ملغي' : apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedProject(null)
        }}
        title="⚠️ تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">هل أنت متأكد؟</h3>
            <p className="text-gray-600">
              سيتم حذف المشروع <strong>{selectedProject?.name}</strong>
            </p>
            <p className="text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg inline-block mt-3">
              ⚠️ هذه العملية لا يمكن التراجع عنها
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
              <span>حذف نهائي</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Unit Type Create/Edit Modal */}
      <Modal
        isOpen={showUnitTypeModal}
        onClose={() => {
          setShowUnitTypeModal(false)
          setSelectedUnitType(null)
        }}
        title={selectedUnitType ? '✏️ تعديل نوع الوحدة' : '➕ إضافة نوع وحدة جديد'}
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">معلومات نوع الوحدة</h4>
                <p className="text-sm text-gray-600">حدد اسم ووصف النوع</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              اسم النوع *
              <span className="text-gray-500 font-normal mr-2">(مثال: 3 غرف وصالة، 4 غرف وصالتين)</span>
            </label>
            <input
              type="text"
              value={unitTypeName}
              onChange={(e) => setUnitTypeName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              placeholder="مثال: 3 غرف وصالة"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (اختياري)</label>
            <textarea
              value={unitTypeDescription}
              onChange={(e) => setUnitTypeDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 resize-none"
              placeholder="وصف تفصيلي لنوع الوحدة..."
            />
          </div>

          <div className="flex items-center gap-3 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handleSaveUnitType}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-bold shadow-lg"
            >
              <span>💾</span>
              <span>{selectedUnitType ? 'حفظ التعديلات' : 'إضافة النوع'}</span>
            </button>
            <button
              onClick={() => setShowUnitTypeModal(false)}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Unit Type Delete Modal */}
      <Modal
        isOpen={showDeleteUnitTypeModal}
        onClose={() => {
          setShowDeleteUnitTypeModal(false)
          setSelectedUnitType(null)
        }}
        title="⚠️ تأكيد حذف نوع الوحدة"
        size="sm"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">هل أنت متأكد؟</h3>
            <p className="text-gray-600">
              سيتم حذف نوع الوحدة <strong>{selectedUnitType?.name}</strong>
            </p>
            <p className="text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg inline-block mt-3">
              ⚠️ هذه العملية لا يمكن التراجع عنها
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={handleConfirmDeleteUnitType}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
              <span>حذف نهائي</span>
            </button>
            <button
              onClick={() => setShowDeleteUnitTypeModal(false)}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

