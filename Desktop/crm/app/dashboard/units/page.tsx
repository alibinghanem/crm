'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Home, MapPin, Bed, Bath, Square, DollarSign, Edit, Trash2, Eye, Filter, Calendar, User, Upload, X, Image as ImageIcon, Building, Phone, Sparkles, Map } from 'lucide-react'
import Modal from '@/components/Modal'
import Link from 'next/link'
import { GridSkeleton, DetailsSkeleton } from '@/components/SkeletonLoader'
import OptimizedImage from '@/components/OptimizedImage'

type PriceMode = 'sale' | 'rent_monthly' | 'rent_yearly'

interface Project {
  id: string
  project_no: number | null
  name: string
  city: string | null
  district: string | null
}

interface UnitType {
  id: string
  project_id: string
  name: string
  description: string | null
}

interface Unit {
  id: string
  project_id: string | null
  project_no: number | null
  unit_code: string | null
  unit_type: string | null
  unit_type_id: string | null
  floor_no: number | null
  floor_label: string | null
  rooms: number | null
  baths: number | null
  features: string | null
  guard_phone: string | null
  aqar_url: string | null
  location_desc: string | null
  map_url: string | null
  price: number | null
  price_mode: PriceMode | null
  primary_photo: string | null
  photos_paths: string[] | null
  active: boolean
  created_at: string
  projects?: Project
  unit_types?: UnitType
}

interface Appointment {
  id: string
  starts_at: string
  status: string
  agent: string | null
  leads: {
    name: string | null
    phone: string
  } | null
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  scheduled: 'مجدول',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  no_show: 'لم يحضر',
}

const priceModeLabels: Record<PriceMode, string> = {
  sale: 'للبيع',
  rent_monthly: 'إيجار شهري',
  rent_yearly: 'إيجار سنوي',
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])
  const [filterUnitTypes, setFilterUnitTypes] = useState<UnitType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterUnitType, setFilterUnitType] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  
  // Form states
  const [projectId, setProjectId] = useState<string>('')
  const [unitCode, setUnitCode] = useState('')
  const [unitType, setUnitType] = useState('')
  const [unitTypeId, setUnitTypeId] = useState<string>('')
  const [floorNo, setFloorNo] = useState<number | null>(null)
  const [floorLabel, setFloorLabel] = useState('')
  const [rooms, setRooms] = useState<number | null>(null)
  const [baths, setBaths] = useState<number | null>(null)
  const [features, setFeatures] = useState('')
  const [guardPhone, setGuardPhone] = useState('')
  const [aqarUrl, setAqarUrl] = useState('')
  const [locationDesc, setLocationDesc] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [price, setPrice] = useState<number | null>(null)
  const [priceMode, setPriceMode] = useState<PriceMode | ''>('')
  const [active, setActive] = useState(true)
  
  // Photo states
  const [primaryPhotoFile, setPrimaryPhotoFile] = useState<File | null>(null)
  const [primaryPhotoPreview, setPrimaryPhotoPreview] = useState<string>('')
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchUnits()
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_no, name, city, district')
        .eq('active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
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
      setUnitTypes([])
    }
  }

  // Load unit types when project changes in form
  useEffect(() => {
    if (projectId) {
      fetchUnitTypes(projectId)
    } else {
      setUnitTypes([])
      setUnitTypeId('')
    }
  }, [projectId])

  // Load unit types for filtering when filter project changes
  useEffect(() => {
    if (filterProject && filterProject !== 'all') {
      fetchFilterUnitTypes(filterProject)
    } else {
      setFilterUnitTypes([])
      setFilterUnitType('all')
    }
  }, [filterProject])

  async function fetchFilterUnitTypes(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('unit_types')
        .select('*')
        .eq('project_id', projectId)
        .order('name', { ascending: true })

      if (error) throw error
      setFilterUnitTypes(data || [])
    } catch (error) {
      console.error('Error fetching filter unit types:', error)
      setFilterUnitTypes([])
    }
  }

  async function fetchUnits() {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          projects:project_id (
            id,
            project_no,
            name,
            city,
            district
          ),
          unit_types:unit_type_id (
            id,
            name,
            description
          )
        `)

      if (error) throw error
      setUnits(data || [])
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAppointments(unitId: string) {
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
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const getPublicUrl = (path: string | null): string => {
    if (!path) return ''
    const { data } = supabase.storage.from('units').getPublicUrl(path)
    return data.publicUrl
  }

  const handleViewDetails = async (unit: Unit) => {
    setSelectedUnit(unit)
    await fetchAppointments(unit.id)
    setShowDetailModal(true)
  }

  const handleEdit = async (unit: Unit) => {
    setProjectId(unit.project_id || '')
    setUnitCode(unit.unit_code || '')
    setUnitType(unit.unit_type || '')
    setUnitTypeId(unit.unit_type_id || '')
    setFloorNo(unit.floor_no)
    setFloorLabel(unit.floor_label || '')
    setRooms(unit.rooms)
    setBaths(unit.baths)
    setFeatures(unit.features || '')
    setGuardPhone(unit.guard_phone || '')
    setAqarUrl(unit.aqar_url || '')
    setLocationDesc(unit.location_desc || '')
    setMapUrl(unit.map_url || '')
    setPrice(unit.price)
    setPriceMode(unit.price_mode || '')
    setActive(unit.active)
    
    // ⭐ IMPORTANT: Always clear old photos first, then set new ones if they exist
    // مسح الصور القديمة أولاً
    setPrimaryPhotoFile(null)
    setPrimaryPhotoPreview('')
    setGalleryFiles([])
    setGalleryPreviews([])
    
    // Set existing photo previews ONLY if they exist for THIS unit
    // عرض صور الوحدة الحالية فقط إذا كانت موجودة
    if (unit.primary_photo) {
      setPrimaryPhotoPreview(getPublicUrl(unit.primary_photo))
    }
    if (unit.photos_paths && unit.photos_paths.length > 0) {
      setGalleryPreviews(unit.photos_paths.map(p => getPublicUrl(p)))
    }
    
    // Load unit types for the project
    if (unit.project_id) {
      await fetchUnitTypes(unit.project_id)
    }
    
    setSelectedUnit(unit)
    setShowModal(true)
  }

  const handleDelete = (unit: Unit) => {
    setSelectedUnit(unit)
    setShowDeleteModal(true)
  }

  const handleCreate = () => {
    setSelectedUnit(null)
    setProjectId('')
    setUnitCode('')
    setUnitType('')
    setUnitTypeId('')
    setFloorNo(null)
    setFloorLabel('')
    setRooms(null)
    setBaths(null)
    setFeatures('')
    setGuardPhone('')
    setAqarUrl('')
    setLocationDesc('')
    setMapUrl('')
    setPrice(null)
    setPriceMode('')
    setActive(true)
    setPrimaryPhotoFile(null)
    setPrimaryPhotoPreview('')
    setGalleryFiles([])
    setGalleryPreviews([])
    setUnitTypes([])
    setShowModal(true)
  }

  const handlePrimaryPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPrimaryPhotoFile(file)
      setPrimaryPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleGalleryPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setGalleryFiles(prev => [...prev, ...files])
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeGalleryPhoto = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadPhotos = async (unitId: string) => {
    try {
      // Upload primary photo
      if (primaryPhotoFile) {
        const primaryPath = `${unitId}/primary/${primaryPhotoFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('units')
          .upload(primaryPath, primaryPhotoFile, { upsert: true })
        
        if (uploadError) throw uploadError
      }

      // Upload gallery photos
      for (const file of galleryFiles) {
        const galleryPath = `${unitId}/gallery/${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('units')
          .upload(galleryPath, file, { upsert: true })
        
        if (uploadError) throw uploadError
      }
    } catch (error) {
      console.error('Error uploading photos:', error)
      throw error
    }
  }

  const handleSave = async () => {
    try {
      setUploading(true)
      
      const unitData: any = {
        project_id: projectId || null,
        unit_code: unitCode || null,
        unit_type: unitType || null,
        unit_type_id: unitTypeId || null,
        floor_no: floorNo,
        floor_label: floorLabel || null,
        rooms: rooms,
        baths: baths,
        features: features || null,
        guard_phone: guardPhone || null,
        aqar_url: aqarUrl || null,
        location_desc: locationDesc || null,
        map_url: mapUrl || null,
        price: price,
        price_mode: priceMode || null,
        active: active,
      }

      let unitId: string

      if (selectedUnit) {
        // Update
        unitId = selectedUnit.id
        const { error } = await supabase
          .from('units')
          .update(unitData)
          .eq('id', unitId)

        if (error) throw error
      } else {
        // Create
        const { data, error } = await supabase
          .from('units')
          .insert(unitData)
          .select()
          .single()

        if (error) throw error
        unitId = data.id
      }

      // Upload photos
      if (primaryPhotoFile || galleryFiles.length > 0) {
        await uploadPhotos(unitId)
      }

      setShowModal(false)
      fetchUnits()
      alert('✅ تم حفظ الوحدة بنجاح!')
    } catch (error: any) {
      console.error('Error saving unit:', error)
      alert(`❌ خطأ: ${error.message || 'حدث خطأ'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedUnit) return

    try {
      // Delete photos from storage
      if (selectedUnit.primary_photo) {
        await supabase.storage.from('units').remove([selectedUnit.primary_photo])
      }
      if (selectedUnit.photos_paths && selectedUnit.photos_paths.length > 0) {
        await supabase.storage.from('units').remove(selectedUnit.photos_paths)
      }

      // Delete unit
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', selectedUnit.id)

      if (error) throw error

      setShowDeleteModal(false)
      setSelectedUnit(null)
      fetchUnits()
      alert('✅ تم حذف الوحدة بنجاح')
    } catch (error: any) {
      console.error('❌ Full error:', error)
      if (error.code === '23503') {
        alert('❌ لا يمكن حذف الوحدة لأنها مرتبطة بمواعيد. قم بحذف المواعيد أولاً.')
      } else {
        alert(`❌ خطأ: ${error.message || 'حدث خطأ عند الحذف'}`)
      }
    }
  }

  // Memoize filtered units for better performance
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      // إذا كان نص البحث فارغاً، نعرض كل شيء
      const matchesSearch = searchTerm.trim() === '' ? true : (
        unit.unit_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unit_types?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.location_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false // fallback إذا كانت جميع الحقول null
      )
      
      const matchesProject = filterProject === 'all' || unit.project_id === filterProject
      const matchesUnitType = filterUnitType === 'all' || unit.unit_type_id === filterUnitType
      
      return matchesSearch && matchesProject && matchesUnitType
    })
  }, [units, searchTerm, filterProject, filterUnitType])

  // Show skeleton loading
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 text-white animate-pulse">
          <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-green-200 to-teal-200 rounded-xl"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Units Grid Skeleton */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <GridSkeleton count={9} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 text-white mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Home className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1">الوحدات السكنية</h1>
                <p className="text-green-100">إدارة جميع الوحدات المتاحة</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة وحدة جديدة</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">إجمالي الوحدات</p>
              <p className="text-3xl font-bold">{units.length}</p>
            </div>
            <Home className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">الوحدات النشطة ✅</p>
              <p className="text-3xl font-bold">{units.filter(u => u.active).length}</p>
            </div>
            <Home className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">المشاريع</p>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
            <Building className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">للبيع</p>
              <p className="text-3xl font-bold">{units.filter(u => u.price_mode === 'sale').length}</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-80" />
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
              placeholder="البحث بالرقم، النوع، المشروع، أو الموقع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="appearance-none pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white min-w-[200px] text-gray-900"
            >
              <option value="all">جميع المشاريع</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          {/* Unit Type Filter */}
          {filterProject !== 'all' && (
            <div className="relative animate-fade-in">
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-500 w-5 h-5 z-10" />
              <select
                value={filterUnitType}
                onChange={(e) => setFilterUnitType(e.target.value)}
                className="appearance-none pr-12 pl-4 py-3 border-2 border-cyan-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 min-w-[200px] text-gray-900 font-medium"
              >
                <option value="all">جميع الأنواع</option>
                {filterUnitTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {(searchTerm || filterProject !== 'all' || filterUnitType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterProject('all')
                setFilterUnitType('all')
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
              title="إعادة تعيين الفلاتر"
            >
              ✖️ مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد وحدات</p>
          </div>
        ) : (
          filteredUnits.map((unit, index) => (
            <div
              key={unit.id}
              className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-green-300 hover:shadow-2xl transition-all duration-500 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image */}
              <div className={`h-56 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-200 flex items-center justify-center relative overflow-hidden ${!unit.active ? 'opacity-60' : ''}`}>
                {unit.primary_photo ? (
                  <div className="w-full h-full group-hover:scale-125 transition-transform duration-700">
                    <OptimizedImage
                      src={getPublicUrl(unit.primary_photo)}
                      alt={unit.unit_code || 'Unit'}
                      className="w-full h-56"
                      fallback={<Home className="w-20 h-20 text-green-400" />}
                    />
                  </div>
                ) : (
                  <Home className="w-20 h-20 text-green-400 group-hover:scale-110 transition-transform" />
                )}
                {!unit.active && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    ❌ غير نشط
                  </span>
                )}
                {unit.price_mode && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {priceModeLabels[unit.price_mode]}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {unit.unit_types?.name || unit.unit_type || 'وحدة سكنية'} {unit.unit_code && `- ${unit.unit_code}`}
                    </h3>
                    {unit.projects && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Building className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{unit.projects.name}</span>
                      </div>
                    )}
                    {unit.location_desc && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{unit.location_desc}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {unit.rooms && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Bed className="w-4 h-4 text-primary-600" />
                      <span>{unit.rooms}</span>
                    </div>
                  )}
                  {unit.baths && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Bath className="w-4 h-4 text-primary-600" />
                      <span>{unit.baths}</span>
                    </div>
                  )}
                  {unit.floor_label && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Building className="w-4 h-4 text-primary-600" />
                      <span>{unit.floor_label}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                {unit.price && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-2xl font-bold text-primary-600">
                      {unit.price.toLocaleString()} ر.س
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(unit)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Eye className="w-4 h-4" />
                    <span>التفاصيل</span>
                  </button>
                  <button
                    onClick={() => handleEdit(unit)}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(unit)}
                    className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-all"
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
        عرض {filteredUnits.length} من {units.length} وحدة
      </div>

      {/* Create/Edit Modal - Enhanced Design */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedUnit(null)
        }}
        title={selectedUnit ? '✏️ تعديل الوحدة' : '➕ إضافة وحدة جديدة'}
        size="xl"
      >
        <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2">
          
          {/* Section 1: Basic Info */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">المعلومات الأساسية</h3>
                <p className="text-sm text-gray-600">المشروع ونوع الوحدة</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">المشروع</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white"
              >
                <option value="">-- اختر المشروع --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

              {/* Unit Code */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Home className="w-4 h-4 text-purple-600" />
                  <span>رقم/رمز الوحدة</span>
                </label>
                <input
                  type="text"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="مثال: A-101"
                />
              </div>

              {/* Unit Type */}
              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع الوحدة
                {!projectId && <span className="text-xs text-gray-500 mr-2">(اختر المشروع أولاً)</span>}
              </label>
              {unitTypes.length > 0 ? (
                <select
                  value={unitTypeId}
                  onChange={(e) => setUnitTypeId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white"
                  disabled={!projectId}
                >
                  <option value="">-- اختر النوع --</option>
                  {unitTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} {type.description && `(${type.description})`}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500 text-center">
                  {projectId ? 'لا توجد أنواع وحدات محددة لهذا المشروع' : 'اختر المشروع لعرض أنواع الوحدات'}
                  {projectId && (
                    <Link
                      href="/dashboard/projects"
                      className="block mt-2 text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
                    >
                      ← إدارة أنواع الوحدات في صفحة المشاريع
                    </Link>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Section 2: Unit Details */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Square className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">تفاصيل الوحدة</h3>
                <p className="text-sm text-gray-600">الأدوار والغرف والمواصفات</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Floor No */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building className="w-4 h-4 text-green-600" />
                  <span>رقم الدور</span>
                </label>
                <input
                  type="number"
                  value={floorNo ?? ''}
                  onChange={(e) => setFloorNo(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="1، 2، 3..."
                />
              </div>

              {/* Floor Label */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Square className="w-4 h-4 text-green-600" />
                  <span>الدور (نص)</span>
                </label>
                <input
                  type="text"
                  value={floorLabel}
                  onChange={(e) => setFloorLabel(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="الأول، الثاني، الأرضي..."
                />
              </div>

              {/* Rooms */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Bed className="w-4 h-4 text-green-600" />
                  <span>عدد الغرف</span>
                </label>
                <input
                  type="number"
                  value={rooms ?? ''}
                  onChange={(e) => setRooms(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="عدد غرف النوم"
                />
              </div>

              {/* Baths */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Bath className="w-4 h-4 text-green-600" />
                  <span>عدد الحمامات</span>
                </label>
                <input
                  type="number"
                  value={baths ?? ''}
                  onChange={(e) => setBaths(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="عدد الحمامات"
                />
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>السعر (ر.س)</span>
                </label>
                <input
                  type="number"
                  value={price ?? ''}
                  onChange={(e) => setPrice(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="السعر بالريال السعودي"
                />
              </div>

              {/* Price Mode */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>نوع التسعير</span>
                </label>
                <select
                  value={priceMode}
                  onChange={(e) => setPriceMode(e.target.value as PriceMode | '')}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white transition-all"
                >
                  <option value="">-- اختر النوع --</option>
                  <option value="sale">💰 للبيع</option>
                  <option value="rent_monthly">📅 إيجار شهري</option>
                  <option value="rent_yearly">📆 إيجار سنوي</option>
                </select>
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span>المميزات</span>
                </label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none transition-all"
                  placeholder="مسبح، حديقة، موقف سيارات، مصعد..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Location & Links */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">الموقع والروابط</h3>
                <p className="text-sm text-gray-600">معلومات الموقع والاتصال</p>
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

              {/* Aqar URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building className="w-4 h-4 text-orange-600" />
                  <span>رابط عقار</span>
                </label>
                <input
                  type="url"
                  value={aqarUrl}
                  onChange={(e) => setAqarUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  placeholder="https://aqar.fm/..."
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

              {/* Location Desc */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>وصف الموقع</span>
                </label>
                <input
                  type="text"
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  placeholder="مثال: حي النرجس، شمال الرياض، بالقرب من مركز..."
                />
              </div>
            </div>
          </div>

          {/* Section 4: Photos */}
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl p-6 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">الصور والمعرض</h3>
                <p className="text-sm text-gray-600">أضف صور الوحدة</p>
              </div>
            </div>

            {/* Primary Photo Upload */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span>الصورة الرئيسية</span>
              </label>
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-6 bg-white/50 hover:bg-white transition-all">
                {primaryPhotoPreview ? (
                  <div className="relative inline-block">
                    <img src={primaryPhotoPreview} alt="Primary" className="h-48 w-48 object-cover rounded-2xl shadow-lg border-4 border-pink-200" />
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryPhotoFile(null)
                        setPrimaryPhotoPreview('')
                      }}
                      className="absolute -top-3 -right-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl">
                        <ImageIcon className="w-12 h-12 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-700">اضغط لاختيار الصورة الرئيسية</p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG حتى 10MB</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePrimaryPhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery Photos Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Upload className="w-4 h-4 text-pink-600" />
                <span>معرض الصور</span>
              </label>
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-6 bg-white/50">
                <label className="cursor-pointer block text-center mb-4">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">اضغط لإضافة صور (متعددة)</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryPhotosChange}
                    className="hidden"
                  />
                </label>
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryPreviews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <img src={preview} alt={`Gallery ${idx}`} className="h-24 w-full object-cover rounded-xl border-2 border-pink-200 shadow-md" />
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto(idx)}
                          className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Active Status */}
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
                  <p className="text-lg font-bold text-gray-900">{active ? '✅ وحدة نشطة' : '❌ وحدة غير نشطة'}</p>
                  <p className="text-sm text-gray-600">{active ? 'الوحدة ظاهرة للعملاء' : 'الوحدة مخفية عن العملاء'}</p>
                </div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all font-bold shadow-lg disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{selectedUnit ? 'حفظ التعديلات' : 'إضافة الوحدة'}</span>
                </>
              )}
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
          setSelectedUnit(null)
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
                  <OptimizedImage 
                    src={getPublicUrl(selectedUnit.primary_photo)} 
                    alt="Primary" 
                    className="w-full h-64 rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedUnit.unit_types?.name || selectedUnit.unit_type || 'وحدة سكنية'}
                    </h2>
                    {selectedUnit.price && (
                      <p className="text-2xl font-bold text-green-400">
                        {selectedUnit.price.toLocaleString()} ﷼
                        {selectedUnit.price_mode && <span className="text-base mr-2">({priceModeLabels[selectedUnit.price_mode]})</span>}
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
                    <OptimizedImage
                      key={idx}
                      src={getPublicUrl(path)}
                      alt={`Gallery ${idx}`}
                      className="w-full h-40 rounded-xl border-2 border-pink-200 shadow-lg hover:scale-105 transition-transform cursor-pointer"
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
                <h3 className="text-lg font-bold text-gray-900">المواعيد المرتبطة ({appointments.length})</h3>
              </div>
              {appointments.length === 0 ? (
                <div className="text-center py-8 bg-white/50 backdrop-blur-sm rounded-xl">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">لا توجد مواعيد مرتبطة بهذه الوحدة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200 hover:border-blue-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{new Date(apt.starts_at).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-sm text-gray-600 mt-1">🕐 {new Date(apt.starts_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                          {apt.leads && (
                            <p className="text-sm text-gray-600 mt-1">👤 {apt.leads.name || apt.leads.phone}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[apt.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[apt.status] || apt.status}
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

      {/* Delete Modal - keep existing */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="⚠️ تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-center">هل أنت متأكد من حذف هذه الوحدة؟</p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-bold"
            >
              حذف
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
