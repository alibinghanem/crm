'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, getUser } from '@/lib/auth'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Home,
  LogOut,
  Menu,
  X,
  Building2,
  MessageCircle,
  ChevronDown,
  UserCheck,
  ClipboardList,
  Building,
  Sparkles,
  User,
  Settings,
  Bell,
  Shield,
  Tag
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [customersMenuOpen, setCustomersMenuOpen] = useState(false)
  const [realEstateMenuOpen, setRealEstateMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUser().then(setUser)
  }, [])

  useEffect(() => {
    // Auto-open customers menu if on a customers page
    if (pathname.includes('/leads') || pathname.includes('/customer-requests')) {
      setCustomersMenuOpen(true)
    }
    // Auto-open real estate menu if on a real estate page
    if (pathname.includes('/units') || pathname.includes('/projects') || pathname.includes('/unit-types')) {
      setRealEstateMenuOpen(true)
    }
  }, [pathname])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const navigation = [
    { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard, gradient: 'from-purple-500 to-indigo-600' },
    { name: 'المواعيد', href: '/dashboard/appointments', icon: Calendar, gradient: 'from-blue-500 to-cyan-600' },
    { name: 'المحادثات', href: '/dashboard/conversations', icon: MessageCircle, gradient: 'from-pink-500 to-rose-600' },
  ]

  const customersSubMenu = [
    { name: 'العملاء المحتملين', href: '/dashboard/leads', icon: UserCheck },
    { name: 'طلبات العملاء', href: '/dashboard/customer-requests', icon: ClipboardList },
  ]

  const realEstateSubMenu = [
    { name: 'المشاريع', href: '/dashboard/projects', icon: Building },
    { name: 'أنواع الوحدات', href: '/dashboard/unit-types', icon: Tag },
    { name: 'الوحدات', href: '/dashboard/units', icon: Home },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="font-black text-gray-900 text-lg">CRM</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-gradient-to-br from-purple-50 to-blue-50 transition-all duration-300 group"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 bottom-0 z-40
          bg-white/98 backdrop-blur-2xl border-l border-gray-200/50 shadow-2xl
          transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'right-0 w-72' : 'right-0 w-20 lg:block'}
          ${mobileMenuOpen ? 'block' : 'hidden lg:block'}
          pt-16 lg:pt-0
        `}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
          
          {/* Logo */}
          <div className="relative flex items-center justify-between px-6 py-6 border-b border-gray-200/50">
            {sidebarOpen && (
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-500 animate-pulse-slow"></div>
                  <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-3 rounded-2xl shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Building2 className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-ping" />
                </div>
                <div>
                  <span className="font-black text-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">CRM</span>
                  <p className="text-xs text-gray-500 font-medium">نظام متطور</p>
                </div>
              </div>
            )}
            {!sidebarOpen && (
              <div className="mx-auto relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-all"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-xl transform group-hover:scale-110 transition-all">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2.5 rounded-xl hover:bg-gradient-to-br from-purple-50 to-blue-50 transition-all duration-300 group"
            >
              <Menu className="w-5 h-5 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="relative flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative group flex items-center gap-3 px-4 py-3.5 rounded-2xl
                    transition-all duration-500 overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white font-bold shadow-xl scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 hover:scale-105 hover:shadow-lg'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </>
                  )}
                  <div className={`relative ${isActive ? 'animate-bounce-slow' : ''}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white drop-shadow-lg' : 'text-gray-500 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300'}`} />
                  </div>
                  {sidebarOpen && <span className="relative">{item.name}</span>}
                  {isActive && sidebarOpen && (
                    <Sparkles className="w-4 h-4 text-white/80 ml-auto animate-pulse" />
                  )}
                </Link>
              )
            })}

            {/* Customers Section with Submenu */}
            <div className="pt-2">
              <button
                onClick={() => setCustomersMenuOpen(!customersMenuOpen)}
                className={`
                  relative w-full group flex items-center gap-3 px-4 py-3.5 rounded-2xl
                  transition-all duration-500 overflow-hidden
                  ${pathname.includes('/leads') || pathname.includes('/customer-requests')
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-xl scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 hover:scale-105 hover:shadow-lg'
                  }
                `}
              >
                {(pathname.includes('/leads') || pathname.includes('/customer-requests')) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
                <Users className={`w-5 h-5 ${pathname.includes('/leads') || pathname.includes('/customer-requests') ? 'text-white drop-shadow-lg' : 'text-gray-500 group-hover:text-orange-600 group-hover:scale-110 transition-all'}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-right">العملاء</span>
                    <ChevronDown className={`w-4 h-4 transition-all duration-500 ${customersMenuOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Submenu */}
              {(customersMenuOpen || !sidebarOpen) && sidebarOpen && (
                <div className="mr-4 mt-2 space-y-1 border-r-2 border-gradient-to-b from-orange-300 to-amber-300 pr-2 animate-slide-in-right">
                  {customersSubMenu.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          relative group flex items-center gap-3 px-4 py-2.5 rounded-xl
                          transition-all duration-300 text-sm overflow-hidden
                          ${isActive
                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 font-bold shadow-md scale-105 border-2 border-orange-200'
                            : 'text-gray-600 hover:bg-gradient-to-r from-orange-50 to-amber-50 hover:scale-105'
                          }
                        `}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                        )}
                        <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-500 group-hover:scale-110 transition-all'}`} />
                        <span>{item.name}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full ml-auto animate-pulse"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Real Estate Section with Submenu */}
            <div className="pt-2">
              <button
                onClick={() => setRealEstateMenuOpen(!realEstateMenuOpen)}
                className={`
                  relative w-full group flex items-center gap-3 px-4 py-3.5 rounded-2xl
                  transition-all duration-500 overflow-hidden
                  ${pathname.includes('/units') || pathname.includes('/projects')
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-xl scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 hover:scale-105 hover:shadow-lg'
                  }
                `}
              >
                {(pathname.includes('/units') || pathname.includes('/projects')) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
                <Building2 className={`w-5 h-5 ${pathname.includes('/units') || pathname.includes('/projects') ? 'text-white drop-shadow-lg' : 'text-gray-500 group-hover:text-emerald-600 group-hover:scale-110 transition-all'}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-right">العقارات</span>
                    <ChevronDown className={`w-4 h-4 transition-all duration-500 ${realEstateMenuOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Submenu */}
              {(realEstateMenuOpen || !sidebarOpen) && sidebarOpen && (
                <div className="mr-4 mt-2 space-y-1 border-r-2 border-gradient-to-b from-emerald-300 to-teal-300 pr-2 animate-slide-in-right">
                  {realEstateSubMenu.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          relative group flex items-center gap-3 px-4 py-2.5 rounded-xl
                          transition-all duration-300 text-sm overflow-hidden
                          ${isActive
                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 font-bold shadow-md scale-105 border-2 border-emerald-200'
                            : 'text-gray-600 hover:bg-gradient-to-r from-emerald-50 to-teal-50 hover:scale-105'
                          }
                        `}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                        )}
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all'}`} />
                        <span>{item.name}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full ml-auto animate-pulse"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User section */}
          <div className="relative border-t border-gray-200/50 p-4 bg-gradient-to-b from-transparent to-gray-50/50" ref={profileMenuRef}>
            {user && (
              <div className="relative">
                {/* User Profile Button */}
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`
                    relative w-full group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 overflow-hidden
                    ${profileMenuOpen 
                      ? 'bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 shadow-lg' 
                      : 'hover:bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 hover:shadow-md'
                    }
                  `}
                >
                  {/* Animated background */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                  </div>
                  
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 text-right overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 font-medium">المسؤول</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && sidebarOpen && (
                  <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden animate-slide-down">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-xl border-2 border-white/30">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-black truncate">{user.email}</p>
                          <p className="text-xs text-white/80 font-medium">مدير النظام</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
                          <p className="text-xs text-white/80 mb-1">المشاريع</p>
                          <p className="text-lg font-black">12</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
                          <p className="text-xs text-white/80 mb-1">العملاء</p>
                          <p className="text-lg font-black">45</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-purple-50 to-blue-50 transition-all duration-300 group">
                        <div className="p-2 bg-purple-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-bold text-gray-900">الملف الشخصي</p>
                          <p className="text-xs text-gray-500">عرض وتعديل بياناتك</p>
                        </div>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-300 group">
                        <div className="p-2 bg-blue-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                          <Settings className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-bold text-gray-900">الإعدادات</p>
                          <p className="text-xs text-gray-500">تخصيص النظام</p>
                        </div>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-amber-50 to-orange-50 transition-all duration-300 group">
                        <div className="relative p-2 bg-amber-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                          <Bell className="w-4 h-4 text-amber-600" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-bold text-gray-900">الإشعارات</p>
                          <p className="text-xs text-gray-500">3 إشعارات جديدة</p>
                        </div>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 group">
                        <div className="p-2 bg-green-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-bold text-gray-900">الأمان والخصوصية</p>
                          <p className="text-xs text-gray-500">إدارة كلمة المرور</p>
                        </div>
                      </button>

                      <div className="my-2 border-t border-gray-200"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-red-50 to-pink-50 transition-all duration-300 group"
                      >
                        <div className="p-2 bg-red-100 rounded-xl group-hover:scale-110 group-hover:-rotate-12 transition-all">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-bold text-red-600">تسجيل الخروج</p>
                          <p className="text-xs text-gray-500">إنهاء الجلسة الحالية</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`
        transition-all duration-500
        ${sidebarOpen ? 'lg:mr-72' : 'lg:mr-20'}
        pt-16 lg:pt-0
      `}>
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
