'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Info } from 'lucide-react'
import { supabase, AttendanceRecord } from '@/lib/supabase'
import { getCurrentUserProfile, signOut } from '@/lib/auth'

export default function AdminPage() {
  const router = useRouter()
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [eventFilter, setEventFilter] = useState<string>('default')
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    unique: 0
  })

  const loadAttendees = async () => {
    try {
      setLoading(true)
      
      // Load from Supabase
      const { data: records, error } = await supabase
        .from('qr_attendance')
        .select('*')
        .eq('event_id', eventFilter)
        .order('scanned_at', { ascending: false })

      if (error) {
        throw error
      }

      const attendanceRecords = (records || []) as AttendanceRecord[]
      setAttendees(attendanceRecords)

      // Calculate stats
      const total = attendanceRecords.length
      const today = attendanceRecords.filter(r => {
        const scanDate = new Date(r.scanned_at)
        const today = new Date()
        return scanDate.toDateString() === today.toDateString()
      }).length
      const unique = new Set(attendanceRecords.map(r => r.attendee_id)).size

      setStats({ total, today, unique })
    } catch (error) {
      console.error('Failed to load attendees:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentUserProfile()

        if (!profile) {
          router.push('/admin/login')
          return
        }

        if (profile.role !== 'admin') {
          // Not an admin - sign out and redirect
          await signOut()
          router.push('/admin/login?error=access_denied')
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!authorized) return

    loadAttendees()
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      loadAttendees()
    }, 3000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventFilter, authorized])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all attendance records? This cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('qr_attendance')
          .delete()
          .eq('event_id', eventFilter)

        if (error) throw error

        await loadAttendees()
      } catch (error) {
        console.error('Failed to clear records:', error)
        alert('Failed to clear records')
      }
    }
  }

  const handleExport = () => {
    const csv = [
      ['Attendee ID', 'Scanned At', 'Event ID'].join(','),
      ...attendees.map(a => [
        a.attendee_id,
        a.scanned_at,
        a.event_id || 'default'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 md:p-8 mb-6 shadow-lg border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">View and manage scanned attendees</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={handleExport}
                disabled={attendees.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={handleClear}
                disabled={attendees.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={loadAttendees}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total Scans</p>
            <p className="text-gray-900 text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Today&apos;s Scans</p>
            <p className="text-gray-900 text-3xl font-bold">{stats.today}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Unique Attendees</p>
            <p className="text-gray-900 text-3xl font-bold">{stats.unique}</p>
          </div>
        </div>

        {/* Event Filter */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-lg border border-gray-200">
          <label className="block text-gray-700 text-sm font-medium mb-2">Filter by Event</label>
          <input
            type="text"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            placeholder="default"
            className="w-full md:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Attendees List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-gray-600">Loading attendees...</div>
            </div>
          ) : attendees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-700 text-lg">No attendees scanned yet</p>
              <p className="text-gray-500 text-sm mt-2">Scan QR codes using the scanner app to see records here</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Attendee ID</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Scanned At</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Event ID</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendees.map((attendee) => {
                      const scanDate = new Date(attendee.scanned_at)
                      return (
                        <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-900 font-mono font-semibold">
                            {attendee.attendee_id}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {scanDate.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {attendee.event_id || 'default'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {scanDate.toLocaleTimeString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Showing {attendees.length} record{attendees.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-gray-700 text-sm">
              <p className="font-semibold mb-1 text-gray-900">Real-time sync</p>
              <p>All scans from your phone are automatically saved to Supabase and appear here. The page auto-refreshes every 3 seconds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

