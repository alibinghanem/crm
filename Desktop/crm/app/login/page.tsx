'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { Building2, Lock, Mail, AlertCircle, Sparkles, Zap, Shield, Rocket } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await signIn(email, password)
      
      if (signInError) {
        setError(signInError.message || 'خطأ في تسجيل الدخول')
      } else if (data?.session) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-blue-600/20 animate-gradient"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-blue-500/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Mesh Gradient */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xMDQuOS0yIDItMnMyIC44OTYgMiAyLS45IDItMiAyLTItLjg5Ni0yLTJ6bS0yMCAwYzAtMS4xMDQuOS0yIDItMnMyIC44OTYgMiAyLS45IDItMiAyLTItLjg5Ni0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        {/* Light Particles */}
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping animation-delay-300"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping animation-delay-700"></div>
        <div className="absolute top-2/3 right-1/5 w-2 h-2 bg-violet-300 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-2/3 w-1 h-1 bg-indigo-300 rounded-full animate-ping animation-delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Brand Section */}
          <div className="hidden lg:block text-white space-y-10 animate-slide-in-left">
            {/* Logo & Brand */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-700 animate-pulse-slow"></div>
                  
                  {/* Icon Container */}
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                    <Building2 className="w-20 h-20 text-white drop-shadow-2xl" />
                  </div>
                  
                  {/* Corner Accents */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full blur-sm"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full blur-sm"></div>
                </div>
                
                <div>
                  <h1 className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                    CRM
                  </h1>
                  <p className="text-purple-200 text-xl font-light tracking-wider mt-1">نظام إدارة متطور</p>
                </div>
              </div>

              {/* Tagline */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                <p className="relative text-2xl font-light text-white/90 leading-relaxed backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                  حول <span className="font-bold text-purple-300">بياناتك</span> إلى 
                  <span className="font-bold text-blue-300"> قرارات</span> ذكية
                </p>
              </div>
            </div>

            {/* Features with Modern Icons */}
            <div className="space-y-6">
              <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
                  <div className="relative p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-purple-400/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Zap className="w-7 h-7 text-purple-300" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">سرعة فائقة</h3>
                  <p className="text-white/70 text-sm leading-relaxed">واجهات سريعة وسلسة لتجربة مستخدم استثنائية</p>
                </div>
              </div>

              <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
                  <div className="relative p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl border border-blue-400/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Shield className="w-7 h-7 text-blue-300" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors">أمان عالي</h3>
                  <p className="text-white/70 text-sm leading-relaxed">حماية متقدمة لبيانات عملائك ومعلوماتك الحساسة</p>
                </div>
              </div>

              <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
                  <div className="relative p-4 bg-gradient-to-br from-violet-500/20 to-violet-600/20 backdrop-blur-sm rounded-2xl border border-violet-400/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Rocket className="w-7 h-7 text-violet-300" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-300 transition-colors">نمو مستمر</h3>
                  <p className="text-white/70 text-sm leading-relaxed">أدوات تحليل متطورة لتنمية أعمالك بذكاء</p>
                </div>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="pt-8 border-t border-white/10">
              <p className="text-white/50 text-sm">
                <span className="text-white/90 font-semibold">انضم إلينا</span> واستمتع بتجربة إدارة عملاء لا مثيل لها
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="animate-slide-in-right">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl blur-2xl opacity-50 animate-pulse-slow"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl">
                    <Building2 className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-black text-white mb-2">CRM System</h1>
              <p className="text-purple-200 text-lg">نظام إدارة متطور</p>
            </div>

            {/* Login Card */}
            <div className="relative group">
              {/* Animated Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-1000 animate-gradient-x"></div>
              
              {/* Glass Card */}
              <div className="relative bg-white/98 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden">
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x"></div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="relative p-10 md:p-12">
                  {/* Header */}
                  <div className="text-center mb-10">
                    {/* Welcome Badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 px-5 py-2.5 rounded-full border border-purple-100 mb-6 shadow-sm">
                      <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                      <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        مرحباً بعودتك
                      </span>
                      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse animation-delay-300" />
                    </div>
                    
                    <h2 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 bg-clip-text text-transparent mb-3">
                      تسجيل الدخول
                    </h2>
                    <p className="text-gray-600 text-base">ادخل بياناتك للوصول إلى حسابك</p>
                  </div>

                  {/* Form */}
                  <form className="space-y-7" onSubmit={handleSubmit}>
                    {error && (
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-4 animate-shake shadow-sm">
                        <div className="p-2.5 bg-red-100 rounded-xl">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <span className="text-sm font-semibold">{error}</span>
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="group/input">
                      <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-3">
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none z-10">
                          <Mail className="h-5 w-5 text-gray-400 group-focus-within/input:text-purple-600 transition-all duration-300" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="appearance-none block w-full pr-14 pl-5 py-4 bg-gray-50/80 border-2 border-gray-200 rounded-2xl placeholder-gray-400 text-gray-900 font-medium
                                   focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white 
                                   transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="group/input">
                      <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-3">
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none z-10">
                          <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-purple-600 transition-all duration-300" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="appearance-none block w-full pr-14 pl-5 py-4 bg-gray-50/80 border-2 border-gray-200 rounded-2xl placeholder-gray-400 text-gray-900 font-medium
                                   focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white 
                                   transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                          placeholder="••••••••••"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full group/btn overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
                      >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] animate-gradient-x"></div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
                        
                        {/* Button Content */}
                        <div className="relative flex justify-center items-center py-5 px-8 text-white font-bold text-lg">
                          {loading ? (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>جاري تسجيل الدخول...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 group-hover/btn:scale-105 transition-transform duration-300">
                              <span>تسجيل الدخول</span>
                              <Sparkles className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-700" />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-semibold">أو</span>
                    </div>
                  </div>

                  {/* Footer Links */}
                  <div className="text-center space-y-4">
                    <a href="#" className="block text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors hover:underline">
                      نسيت كلمة المرور؟
                    </a>
                    <p className="text-sm text-gray-600">
                      ليس لديك حساب؟{' '}
                      <a href="#" className="font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline">
                        تواصل معنا
                      </a>
                    </p>
                  </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-50"></div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-center text-sm text-white/70 mt-8 font-medium">
              © 2024 <span className="text-white font-bold">CRM System</span> - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
