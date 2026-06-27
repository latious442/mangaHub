import { useMemo, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { API } from '../config/api'

export default function Home() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searching, setSearching] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [vipInvite, setVipInvite] = useState(false)
  const [vipMember, setVipMember] = useState(false)
  const [vipLoading, setVipLoading] = useState(false)
  const [vipError, setVipError] = useState('')
  
  const types = [
    { name: "Action & Adventure" },
    { name: "Romance" },
    { name: "Slice of Life" },
    { name: "Fantasy" },
    { name: "Supernatural & Horror" },
    { name: "Sport" },
    { name: "Comedy" },
    { name: "Mystery & thriller" },
    { name: "Drama" }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/manga`, {
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        
        setBooks(data)
      } catch (err) {
        setError(err)
        console.error('Error fetching manga:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchVipInvite = async () => {
      try {
        const response = await fetch(`${API}/vip/pending`, {
          credentials: 'include',
        })

        if (response.status === 401) return

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check VIP invite')
        }

        setVipInvite(Boolean(data.pending))
        setVipMember(Boolean(data.vipMember))
      } catch (err) {
        console.error('Error checking VIP invite:', err)
      }
    }

    fetchVipInvite()
  }, [])

  async function acceptVipInvite() {
    setVipLoading(true)
    setVipError('')

    try {
      const response = await fetch(`${API}/vip/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept VIP invite')
      }

      if (data.vipToken) {
        localStorage.setItem('vipToken', data.vipToken)
      }
      setVipInvite(false)
    } catch (err) {
      setVipError(err.message || 'Failed to accept VIP invite')
    } finally {
      setVipLoading(false)
    }
  }
 
  // Books store inherited series categories in selectedSeriesCategories.
  const getMangaCategories = (item) => {
    return item.selectedSeriesCategories || []
  }

  const filteredManga = useMemo(() => {
    let filtered = [...books] // Create a copy
    
    const searchTerm = searching.trim().toLowerCase()

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        getMangaCategories(item).some((category) =>
          category.toLowerCase().includes(searchTerm)
        )
      )
    }
    
    // Filter by selected categories (types)
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item => {
        const itemCategories = getMangaCategories(item)

        return selectedTypes.some(selectedType =>
          itemCategories.includes(selectedType)
        )
      })
    }
    
    return filtered
  }, [searching, selectedTypes, books])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="border-b border-gray-800 bg-gradient-to-b from-indigo-950/50 to-gray-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {vipInvite && (
            <div className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-950/60 p-4 text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold">VIP member access is ready</p>
                  <p className="text-sm text-emerald-100">Accept to unlock member-only manga on this account.</p>
                </div>
                <button
                  type="button"
                  onClick={acceptVipInvite}
                  disabled={vipLoading}
                  className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-gray-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {vipLoading ? 'Accepting...' : 'Accept VIP'}
                </button>
              </div>
              {vipError && <p className="mt-3 text-sm text-red-200">{vipError}</p>}
            </div>
          )}

          {!vipMember && !vipInvite && (
            <div className="mb-6 rounded-lg border border-yellow-500/40 bg-yellow-950/60 p-4 text-white">
              <p className="text-lg font-semibold">Member-only manga is hidden</p>
              <p className="text-sm text-yellow-100">Upgrade to VIP to see books marked as member-only.</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="search"
                value={searching}
                onChange={(e) => setSearching(e.target.value)}
                placeholder="Search manga or category..."
                className="h-12 w-full rounded-lg border border-gray-700 bg-gray-900 pl-12 pr-12 text-white placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {searching && (
                <button
                  type="button"
                  onClick={() => setSearching('')}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
                  aria-label="Clear search"
                >
                  X
                </button>
              )}
            </label>
            <p className="text-sm text-gray-400">
              {filteredManga.length} {filteredManga.length === 1 ? 'result' : 'results'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {types.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setSelectedTypes(prev =>
                    prev.includes(item.name) 
                      ? prev.filter(t => t !== item.name)
                      : [...prev, item.name]
                  )
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTypes.includes(item.name)
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-700 hover:bg-purple-600 text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
          
        </div>
      </section>
     
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
                <div className="aspect-[3/4] animate-pulse bg-gray-800"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-10 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-center text-red-300">
            Error: {error.message}
          </p>
        )}

        {!loading && !error && filteredManga.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500">No manga found.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredManga.map((item) => (
            <article
              key={item._id}
              className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-lg transition hover:border-indigo-500/50"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-800">
                <img
                  src={`${API}/uploads/${item.image}`}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="truncate text-lg font-semibold text-white">{item.name}</h2>
                
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {getMangaCategories(item).map((cat, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
                      {cat}
                    </span>
                  ))}
                  {getMangaCategories(item).length === 0 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-500">
                      No categories
                    </span>
                  )}
               <NavLink to={`/view/${item._id}`} className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-500 hover:text-blac ">Read</NavLink>
                </div>
                
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
