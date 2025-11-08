'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MessageCircle, Phone, Globe, Send, Search, Filter, Eye, User, Clock, MessageSquare } from 'lucide-react'
import Modal from '@/components/Modal'
import Link from 'next/link'
import { format } from 'date-fns'

interface Conversation {
  id: string
  lead_id: string
  channel: string
  topic_id: number | null
  started_at: string
  last_msg_at: string
  leads: {
    id: string
    name: string | null
    phone: string
    city: string | null
  } | null
  message_count?: number
}

interface Message {
  id: string
  conversation_id: string
  lead_id: string
  direction: string
  channel: string
  sender_type: string
  msg_type: string
  text: string | null
  media: any
  wa_message_id: string | null
  tg_message_id: string | null
  ts: string
}

const channelIcons: Record<string, any> = {
  whatsapp: MessageCircle,
  telegram: Send,
  web: Globe,
}

const channelColors: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-800 border-green-200',
  telegram: 'bg-blue-100 text-blue-800 border-blue-200',
  web: 'bg-purple-100 text-purple-800 border-purple-200',
}

const channelLabels: Record<string, string> = {
  whatsapp: 'واتساب',
  telegram: 'تيليجرام',
  web: 'ويب',
}

function ConversationsContent() {
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [showMessagesModal, setShowMessagesModal] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [hasOpenedFromUrl, setHasOpenedFromUrl] = useState(false)

  async function fetchConversations() {
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          leads:lead_id (id, name, phone, city)
        `)
        .order('last_msg_at', { ascending: false })

      if (error) throw error

      // احصل على عدد الرسائل لكل محادثة
      const conversationsWithCount = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)

          return {
            ...conv,
            message_count: count || 0,
          }
        })
      )

      setConversations(conversationsWithCount)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages(conversationId: string) {
    setMessagesLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('ts', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleViewMessages = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    await fetchMessages(conversation.id)
    setShowMessagesModal(true)
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    // فتح محادثة معينة إذا كان هناك conversation_id في الرابط
    if (!hasOpenedFromUrl && searchParams) {
      const conversationId = searchParams.get('conversation_id')
      if (conversationId && conversations.length > 0 && !showMessagesModal) {
        const conv = conversations.find(c => c.id === conversationId)
        if (conv) {
          setHasOpenedFromUrl(true)
          handleViewMessages(conv)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, searchParams, showMessagesModal, hasOpenedFromUrl])

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.leads?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.leads?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.leads?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChannel = filterChannel === 'all' || conv.channel === filterChannel
    return matchesSearch && matchesChannel
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
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 rounded-3xl shadow-2xl p-8 text-white mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">المحادثات</h1>
              <p className="text-purple-100">إدارة ومتابعة جميع المحادثات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">إجمالي المحادثات</p>
              <p className="text-3xl font-bold">{conversations.length}</p>
            </div>
            <MessageCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">واتساب</p>
              <p className="text-3xl font-bold">{conversations.filter(c => c.channel === 'whatsapp').length}</p>
            </div>
            <Send className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">تيليجرام</p>
              <p className="text-3xl font-bold">{conversations.filter(c => c.channel === 'telegram').length}</p>
            </div>
            <Send className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm mb-1">ويب</p>
              <p className="text-3xl font-bold">{conversations.filter(c => c.channel === 'web').length}</p>
            </div>
            <Globe className="w-12 h-12 opacity-80" />
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
              placeholder="البحث بالعميل، الهاتف، أو المدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="appearance-none pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white min-w-[200px] text-gray-900"
            >
              <option value="all">جميع القنوات</option>
              {Object.entries(channelLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد محادثات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation, index) => {
              const ChannelIcon = channelIcons[conversation.channel] || MessageCircle
              return (
                <div
                  key={conversation.id}
                  className="group relative p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer animate-slide-up border-l-4 border-transparent hover:border-purple-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleViewMessages(conversation)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl shadow-lg transition-all group-hover:scale-110 ${channelColors[conversation.channel] || 'bg-gray-100'}`}>
                      <ChannelIcon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                            {(conversation.leads?.name || 'غير محدد')[0]}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-indigo-600 transition-all">
                              {conversation.leads?.name || 'غير محدد'}
                            </h3>
                            <span className={`inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full border-2 ${channelColors[conversation.channel] || 'bg-gray-100 text-gray-800'}`}>
                              {channelLabels[conversation.channel] || conversation.channel}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{format(new Date(conversation.last_msg_at), 'dd MMM yyyy - HH:mm')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{conversation.leads?.phone}</span>
                        </div>
                        {conversation.leads?.city && (
                          <span>{conversation.leads.city}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-600">
                          {conversation.message_count || 0} رسالة
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          بدأت: {format(new Date(conversation.started_at), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewMessages(conversation)
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>عرض الرسائل</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 text-center">
        عرض {filteredConversations.length} من {conversations.length} محادثة
      </div>

      {/* Messages Modal */}
      <Modal
        isOpen={showMessagesModal}
        onClose={() => {
          setShowMessagesModal(false)
          setSelectedConversation(null)
          setMessages([])
        }}
        title={selectedConversation ? `محادثة: ${selectedConversation.leads?.name || selectedConversation.leads?.phone || 'غير محدد'}` : 'الرسائل'}
        size="xl"
      >
        {selectedConversation && (
          <div className="space-y-4">
            {/* Conversation Info */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200/50 shadow-xl">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-300/20 to-purple-300/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Channel Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl blur-md opacity-30 animate-pulse"></div>
                    <div className={`relative p-4 rounded-2xl shadow-lg transition-transform hover:scale-110 ${channelColors[selectedConversation.channel] || 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
                      {(() => {
                        const Icon = channelIcons[selectedConversation.channel] || MessageCircle
                        return <Icon className="w-6 h-6" />
                      })()}
                    </div>
                  </div>
                  
                  {/* Lead Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {(selectedConversation.leads?.name || 'ع')[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                          {selectedConversation.leads?.name || 'غير محدد'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold">{selectedConversation.leads?.phone}</span>
                          </div>
                          {selectedConversation.leads?.city && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{selectedConversation.leads.city}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
                        <span className="text-xs font-bold text-purple-700">
                          📊 {messages.length} رسالة
                        </span>
                      </div>
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                        <span className="text-xs font-bold text-blue-700">
                          🕐 {format(new Date(selectedConversation.last_msg_at), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* View Lead Button */}
                <Link
                  href={`/dashboard/leads`}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Eye className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">عرض العميل</span>
                </Link>
              </div>
            </div>

            {/* Messages */}
            <div className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 rounded-2xl p-6 max-h-[70vh] overflow-y-auto space-y-4 custom-scrollbar">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}></div>
              </div>
              
              {messagesLoading ? (
                <div className="flex items-center justify-center py-16 relative z-10">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"></div>
                    <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary-400 opacity-75"></div>
                  </div>
                  <p className="mr-4 text-gray-600 font-medium animate-pulse">جاري تحميل الرسائل...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-gray-500 relative z-10">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-full">
                      <MessageCircle className="w-16 h-16 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-700 mb-2">لا توجد رسائل بعد</p>
                  <p className="text-sm text-gray-400">ابدأ المحادثة مع العميل عبر القناة المفضلة</p>
                </div>
              ) : (
                <div className="relative z-10">
                  {messages.map((message, index) => {
                    const isIncoming = message.direction === 'in'
                    const prevMessage = index > 0 ? messages[index - 1] : null
                    const currentDate = new Date(message.ts).toDateString()
                    const prevDate = prevMessage ? new Date(prevMessage.ts).toDateString() : null
                    const showDate = !prevMessage || currentDate !== prevDate
                    const isConsecutive = prevMessage && prevMessage.direction === message.direction && !showDate
                    
                    return (
                      <div key={message.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        {showDate && (
                          <div className="flex items-center justify-center my-6">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-md opacity-20"></div>
                              <div className="relative glass-strong px-6 py-2 rounded-full border-2 border-purple-200/50 shadow-lg">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-bold text-gray-700">
                                    {format(new Date(message.ts), 'dd MMMM yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className={`flex items-end gap-2 mb-3 group ${isIncoming ? 'justify-start' : 'justify-end'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
                          {/* Avatar - only show if not consecutive */}
                          {!isConsecutive && (
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                              isIncoming
                                ? 'bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-gray-300'
                                : 'bg-gradient-to-br from-primary-500 to-primary-600 ring-2 ring-primary-400'
                            }`}>
                              {isIncoming ? (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                  {(selectedConversation?.leads?.name || 'ع')[0]}
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-primary-600 font-bold text-sm">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Message Bubble */}
                          <div className={`relative max-w-[75%] md:max-w-[65%] ${!isConsecutive ? '' : isIncoming ? 'mr-12' : 'ml-12'}`}>
                            {/* Message Tail */}
                            {!isConsecutive && (
                              <div 
                                className={`absolute ${isIncoming ? 'right-0 bottom-0' : 'left-0 bottom-0'} w-0 h-0 ${
                                  isIncoming
                                    ? 'border-t-[12px] border-t-transparent border-l-[12px] border-l-white'
                                    : 'border-t-[12px] border-t-transparent border-r-[12px] border-r-primary-600'
                                }`}
                                style={{ transform: 'translateY(100%)' }}
                              ></div>
                            )}
                            
                            <div className={`relative rounded-2xl px-5 py-3.5 shadow-lg transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02] ${
                              isIncoming
                                ? 'bg-white border-2 border-gray-200/80 rounded-tl-none glass'
                                : 'bg-gradient-to-br from-primary-600 via-primary-600 to-indigo-600 text-white rounded-tr-none relative overflow-hidden'
                            }`}>
                              {/* Gradient Shine Effect for Outgoing Messages */}
                              {!isIncoming && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              )}
                              
                              {/* Message Content */}
                              <div className="relative z-10">
                                {message.text && (
                                  <p className={`text-[15px] leading-relaxed font-medium ${isIncoming ? 'text-gray-900' : 'text-white'}`}>
                                    {message.text}
                                  </p>
                                )}
                                
                                {message.media && (
                                  <div className={`mt-3 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                                    isIncoming 
                                      ? 'bg-gradient-to-br from-gray-50 to-blue-50/50 border-blue-200/50' 
                                      : 'bg-white/20 backdrop-blur-sm border-white/30'
                                  }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`p-2 rounded-lg ${isIncoming ? 'bg-blue-100' : 'bg-white/30'}`}>
                                        <span className="text-lg">📎</span>
                                      </div>
                                      <div>
                                        <p className={`text-xs font-bold ${isIncoming ? 'text-blue-700' : 'text-white'}`}>
                                          {message.msg_type === 'image' ? '🖼️ صورة' : message.msg_type === 'video' ? '🎥 فيديو' : message.msg_type === 'audio' ? '🎵 صوت' : message.msg_type === 'file' ? '📄 ملف' : '📎 مرفق'}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isIncoming ? 'text-gray-500' : 'text-white/80'}`}>
                                          {message.msg_type}
                                        </p>
                                      </div>
                                    </div>
                                    {typeof message.media === 'object' && message.media.url && (
                                      <a 
                                        href={message.media.url} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 text-xs font-semibold mt-2 px-3 py-1.5 rounded-lg transition-all hover:scale-105 ${
                                          isIncoming 
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700' 
                                            : 'bg-white/30 backdrop-blur-sm text-white hover:bg-white/40'
                                        }`}
                                      >
                                        <span>👁️</span>
                                        <span>عرض المرفق</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                                
                                {/* Message Footer */}
                                <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-opacity-20" style={{
                                  borderColor: isIncoming ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'
                                }}>
                                  <div className="flex items-center gap-2">
                                    {/* Sender Type Badge */}
                                    <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                      isIncoming
                                        ? message.sender_type === 'customer' 
                                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                                          : message.sender_type === 'ai'
                                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200'
                                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        : 'bg-white/30 backdrop-blur-sm text-white'
                                    }`}>
                                      {message.sender_type === 'customer' && '👤 عميل'}
                                      {message.sender_type === 'staff' && '👨‍💼 فريق'}
                                      {message.sender_type === 'ai' && '🤖 ذكي'}
                                    </div>
                                    
                                    {/* Time */}
                                    <div className={`flex items-center gap-1 ${isIncoming ? 'text-gray-400' : 'text-white/80'}`}>
                                      <Clock className="w-3 h-3" />
                                      <span className="text-xs font-medium">
                                        {format(new Date(message.ts), 'HH:mm')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Channel Badge */}
                                  {message.channel && (
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                                      isIncoming
                                        ? channelColors[message.channel] || 'bg-gray-100 text-gray-600'
                                        : 'bg-white/30 backdrop-blur-sm text-white border border-white/20'
                                    }`}>
                                      <div className="flex items-center gap-1">
                                        {(() => {
                                          const Icon = channelIcons[message.channel]
                                          return Icon ? <Icon className="w-3 h-3" /> : null
                                        })()}
                                        <span>{channelLabels[message.channel] || message.channel}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Decorative Elements */}
                              {!isIncoming && (
                                <>
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl"></div>
                                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-lg"></div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ConversationsContent />
    </Suspense>
  )
}
