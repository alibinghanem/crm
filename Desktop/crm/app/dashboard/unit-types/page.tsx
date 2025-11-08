'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Edit, Trash2, Tag, Building, Sparkles, Home } from 'lucide-react'
import Modal from '@/components/Modal'

interface Project {
  id: string
  name: string
  city: string | null
  district: string | null
}

interface UnitType {
  id: string
  project_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  projects?: Project
  unit_count?: number
}

export default function UnitTypesPage() {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProject, setFilterProject] = useState<string>('')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null)
  
  // Form states
  const [projectId, setProjectId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    Promise.all([fetchUnitTypes(), fetchProjects()])
  }, [])

  async function fetchUnitTypes() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('unit_types')
        .select(`
          *,
          projects:project_id (id, name, city, district)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch unit count for each type
      const typesWithCounts = await Promise.all(
        (data || []).map(async (type) => {
          const { count } = await supabase
            .from('units')
            .select('*', { count: 'exact', head: true })
            .eq('unit_type_id', type.id)
          
          return { ...type, unit_count: count || 0 }
        })
      )

      setUnitTypes(typesWithCounts)
    } catch (error) {
      console.error('Error fetching unit types:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, city, district')
        .eq('active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleCreate = () => {
    setSelectedUnitType(null)
    setProjectId('')
    setName('')
    setDescription('')
    setShowModal(true)
  }

  const handleEdit = (unitType: UnitType) => {
    setSelectedUnitType(unitType)
    setProjectId(unitType.project_id)
    setName(unitType.name)
    setDescription(unitType.description || '')
    setShowModal(true)
  }

  const handleDelete = (unitType: UnitType) => {
    setSelectedUnitType(unitType)
    setShowDeleteModal(true)
  }

  const handleSave = async () => {
    if (!projectId || !name.trim()) {
      alert('⚠️ الرجاء إدخال المشروع واسم النوع')
      return
    }

    try {
      if (selectedUnitType) {
        // Update
        const { error } = await supabase
          .from('unit_types')
          .update({
            project_id: projectId,
            name: name.trim(),
            description: description.trim() || null,
          })
          .eq('id', selectedUnitType.id)

        if (error) throw error
        alert('✅ تم تحديث نوع الوحدة بنجاح')
      } else {
        // Create
        const { error } = await supabase
          .from('unit_types')
          .insert({
            project_id: projectId,
            name: name.trim(),
            description: description.trim() || null,
          })

        if (error) throw error
        alert('✅ تم إضافة نوع الوحدة بنجاح')
      }

      setShowModal(false)
      fetchUnitTypes()
    } catch (error: any) {
      console.error('Error saving unit type:', error)
      if (error.code === '23505') {
        alert('❌ هذا النوع موجود مسبقاً في المشروع')
      } else {
        alert(`❌ خطأ: ${error.message || 'حدث خطأ'}`)
      }
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedUnitType) return

    try {
      const { error } = await supabase
        .from('unit_types')
        .delete()
        .eq('id', selectedUnitType.id)

      if (error) throw error

      alert('✅ تم حذف نوع الوحدة بنجاح')
      setShowDeleteModal(false)
      fetchUnitTypes()
    } catch (error: any) {
      console.error('Error deleting unit type:', error)
      if (error.code === '23503') {
        alert('❌ لا يمكن حذف النوع لأنه مرتبط بوحدات. قم بتغيير نوع الوحدات أولاً.')
      } else {
        alert(`❌ خطأ: ${error.message || 'حدث خطأ عند الحذف'}`)
      }
    }
  }

  const filteredUnitTypes = unitTypes.filter(type => {
    const matchesSearch = !searchTerm || 
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.projects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesProject = !filterProject || type.project_id === filterProject
    
    return matchesSearch && matchesProject
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <Tag className="w-8 h-8 text-white" />
            </div>
            أنواع الوحدات
          </h1>
          <p className="text-gray-600">إدارة وتنظيم أنواع الوحدات في جميع المشاريع</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة نوع جديد</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">إجمالي الأنواع</p>
              <p className="text-3xl font-bold">{unitTypes.length}</p>
            </div>
            <Tag className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">المشاريع</p>
              <p className="text-3xl font-bold">{new Set(unitTypes.map(t => t.project_id)).size}</p>
            </div>
            <Building className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">الوحدات المصنفة</p>
              <p className="text-3xl font-bold">{unitTypes.reduce((sum, t) => sum + (t.unit_count || 0), 0)}</p>
            </div>
            <Home className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم، المشروع، أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <Building className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
            >
              <option value="">جميع المشاريع</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {(searchTerm || filterProject) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              عرض <span className="font-bold text-purple-600">{filteredUnitTypes.length}</span> من {unitTypes.length} نوع
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterProject('')
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Unit Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnitTypes.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد أنواع وحدات</p>
          </div>
        ) : (
          filteredUnitTypes.map((unitType, index) => (
            <div
              key={unitType.id}
              className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header */}
              <div className="h-32 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-200 flex items-center justify-center relative">
                <Tag className="w-12 h-12 text-purple-600 group-hover:scale-110 transition-transform" />
                {unitType.unit_count !== undefined && (
                  <span className="absolute top-3 left-3 bg-white text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {unitType.unit_count} وحدة
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                  {unitType.name}
                </h3>
                
                {unitType.projects && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 bg-purple-50 px-3 py-2 rounded-lg">
                    <Building className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">{unitType.projects.name}</span>
                    {unitType.projects.city && (
                      <span className="text-xs text-gray-500">• {unitType.projects.city}</span>
                    )}
                  </div>
                )}

                {unitType.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {unitType.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(unitType)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all font-semibold shadow-md"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDelete(unitType)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedUnitType(null)
        }}
        title={selectedUnitType ? '✏️ تعديل نوع الوحدة' : '➕ إضافة نوع وحدة جديد'}
        size="md"
      >
        <div className="space-y-6">
          {/* Project Selection */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">المشروع</h3>
            </div>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              required
            >
              <option value="">اختر المشروع *</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} {project.city && `- ${project.city}`}
                </option>
              ))}
            </select>
          </div>

          {/* Type Details */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">معلومات النوع</h3>
            </div>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span>اسم النوع *</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="مثال: 3 غرف وصالة"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span>الوصف</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none transition-all"
                  placeholder="وصف تفصيلي للنوع..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all font-bold shadow-lg"
            >
              <span>💾</span>
              <span>{selectedUnitType ? 'حفظ التعديلات' : 'إضافة النوع'}</span>
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedUnitType(null)
        }}
        title="⚠️ تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-center text-gray-700">
            هل أنت متأكد من حذف نوع الوحدة <span className="font-bold text-purple-600">{selectedUnitType?.name}</span>؟
          </p>
          {selectedUnitType && selectedUnitType.unit_count && selectedUnitType.unit_count > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ هذا النوع مرتبط بـ <span className="font-bold">{selectedUnitType.unit_count}</span> وحدة
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-bold transition-all"
            >
              حذف
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


