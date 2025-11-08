'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Layout from '@/components/Layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    getSession().then(session => {
      if (!session) {
        router.push('/login')
      }
    })
  }, [router])

  return <Layout>{children}</Layout>
}
