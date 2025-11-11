/**
 * Client-side caching utility for frequently accessed data
 * Implements cache invalidation and TTL (Time To Live)
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const CACHE_PREFIX = "app_cache_"

export class ClientCache {
  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  static set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
    } catch (error) {
      console.warn("Failed to set cache:", error)
    }
  }

  /**
   * Get data from cache if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key)
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      const now = Date.now()

      // Check if cache is expired
      if (now - entry.timestamp > entry.ttl) {
        this.remove(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn("Failed to get cache:", error)
      return null
    }
  }

  /**
   * Remove specific cache entry
   * @param key Cache key
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key)
    } catch (error) {
      console.warn("Failed to remove cache:", error)
    }
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn("Failed to clear cache:", error)
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern String pattern to match
   */
  static invalidatePattern(pattern: string): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn("Failed to invalidate cache pattern:", error)
    }
  }
}

/**
 * React hook for cached data fetching
 * @param key Cache key
 * @param fetcher Function to fetch data
 * @param ttl Cache TTL in milliseconds
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async (useCache: boolean = true) => {
    try {
      setLoading(true)
      setError(null)

      // Try to get from cache first
      if (useCache) {
        const cached = ClientCache.get<T>(key)
        if (cached) {
          setData(cached)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      const result = await fetcher()
      setData(result)
      ClientCache.set(key, result, ttl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
      setError(errorMessage)
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = React.useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Import React for the hook
import React from "react"
