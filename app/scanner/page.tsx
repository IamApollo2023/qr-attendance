'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '@/components/QRScanner'
import { getCurrentUserProfile, signOut } from '@/lib/auth'

export default function ScannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentUserProfile()

        if (!profile) {
          router.push('/scanner/login')
          return
        }

        if (profile.role !== 'scanner') {
          // Not a scanner - sign out and redirect
          await signOut()
          router.push('/scanner/login?error=access_denied')
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/scanner/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/scanner/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="relative">
      <QRScanner eventId="default" />
      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-lg border border-gray-200"
      >
        Sign Out
      </button>
    </div>
  )
}

