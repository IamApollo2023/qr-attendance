/**
 * IndexedDB storage utility for attendance records
 * Replaces Supabase with local browser storage
 */

export interface AttendanceRecord {
  id?: string
  attendee_id: string
  scanned_at: string
  event_id?: string
}

const DB_NAME = 'qr-attendance-db'
const STORE_NAME = 'attendance'
const DB_VERSION = 1

class AttendanceStorage {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * Initialize IndexedDB database
   */
  private async init(): Promise<void> {
    if (this.db) {
      return Promise.resolve()
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: false
          })

          // Create indexes for efficient queries
          objectStore.createIndex('attendee_id', 'attendee_id', { unique: false })
          objectStore.createIndex('event_id', 'event_id', { unique: false })
          objectStore.createIndex('scanned_at', 'scanned_at', { unique: false })
          objectStore.createIndex('attendee_event', ['attendee_id', 'event_id'], {
            unique: false
          })
        }
      }
    })

    return this.initPromise
  }

  /**
   * Generate a unique ID for a record
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Insert a new attendance record
   */
  async insert(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    await this.init()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const recordWithId: AttendanceRecord = {
        ...record,
        id: this.generateId(),
        scanned_at: record.scanned_at || new Date().toISOString(),
        event_id: record.event_id || 'default'
      }

      const request = store.add(recordWithId)

      request.onsuccess = () => {
        resolve(recordWithId)
      }

      request.onerror = () => {
        reject(new Error('Failed to insert record'))
      }
    })
  }

  /**
   * Query attendance records
   */
  async query(filters?: {
    attendee_id?: string
    event_id?: string
    limit?: number
    orderBy?: 'scanned_at'
    orderDirection?: 'asc' | 'desc'
  }): Promise<AttendanceRecord[]> {
    await this.init()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      let request: IDBRequest

      // Use appropriate index based on filters
      if (filters?.attendee_id && filters?.event_id) {
        const index = store.index('attendee_event')
        const keyRange = IDBKeyRange.only([filters.attendee_id, filters.event_id])
        request = index.getAll(keyRange)
      } else if (filters?.attendee_id) {
        const index = store.index('attendee_id')
        request = index.getAll(filters.attendee_id)
      } else if (filters?.event_id) {
        const index = store.index('event_id')
        request = index.getAll(filters.event_id)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => {
        let results = request.result as AttendanceRecord[]

        // Sort results
        if (filters?.orderBy === 'scanned_at') {
          results.sort((a, b) => {
            const dateA = new Date(a.scanned_at).getTime()
            const dateB = new Date(b.scanned_at).getTime()
            return filters.orderDirection === 'asc' ? dateA - dateB : dateB - dateA
          })
        }

        // Apply limit
        if (filters?.limit) {
          results = results.slice(0, filters.limit)
        }

        resolve(results)
      }

      request.onerror = () => {
        reject(new Error('Failed to query records'))
      }
    })
  }

  /**
   * Get the most recent attendance record for an attendee and event
   */
  async getLatest(
    attendee_id: string,
    event_id: string = 'default'
  ): Promise<AttendanceRecord | null> {
    const results = await this.query({
      attendee_id,
      event_id,
      orderBy: 'scanned_at',
      orderDirection: 'desc',
      limit: 1
    })

    return results.length > 0 ? results[0] : null
  }

  /**
   * Get all records for an event, ordered by scan time
   */
  async getAllForEvent(
    event_id: string = 'default',
    limit?: number
  ): Promise<AttendanceRecord[]> {
    return this.query({
      event_id,
      orderBy: 'scanned_at',
      orderDirection: 'desc',
      limit
    })
  }

  /**
   * Delete all records (useful for clearing data)
   */
  async clear(): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to clear records'))
      }
    })
  }

  /**
   * Get total count of records
   */
  async count(): Promise<number> {
    await this.init()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.count()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error('Failed to count records'))
      }
    })
  }
}

// Export singleton instance
export const attendanceStorage = new AttendanceStorage()



