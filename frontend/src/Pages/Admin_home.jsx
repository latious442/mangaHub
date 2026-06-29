import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { API } from '../config/api'

const durationOptions = [
  { value: '1m', label: '1 month' },
  { value: '2m', label: '2 months' },
  { value: '3m', label: '3 months' },
]

const adminLinks = [
  {
    to: '/edit',
    title: 'Edit Books',
    copy: 'Update or delete manga entries.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7.5 4.5h6l3 3v12h-9a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    to: '/add',
    title: 'Add Books',
    copy: 'Upload manga files and covers.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
    ),
  },
  {
    to: '/user',
    title: 'Users',
    copy: 'View registered user accounts.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
    ),
  },
  {
    to: '/setting',
    title: 'Series',
    copy: 'Create series and categories.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15" />
    ),
  },
]

export default function Admin_home() {
  const [paylist, setPaylist] = useState([])
  const [visiblePayPhotos, setVisiblePayPhotos] = useState({})
  const [durations, setDurations] = useState({})
  const [busyId, setBusyId] = useState('')
  const [messages, setMessages] = useState({})
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/pay/get`)
        const result = await response.json().catch(() => [])
        if (!response.ok) {
          throw new Error(result.error || 'Failed to load payment requests')
        }
        setPaylist(result)
      } catch (error) {
        setPageError(error.message || 'Failed to load payment requests')
      }
    }

    fetchData()
  }, [])

  async function grantVip(id) {
    setBusyId(id)
    setMessages((prev) => ({ ...prev, [id]: '' }))

    try {
      const response = await fetch(`${API}/vip/access/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          duration: durations[id] || '1m',
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || 'Failed to grant VIP')
      }

      setMessages((prev) => ({ ...prev, [id]: result.message || 'VIP invite sent' }))
    } catch (err) {
      setMessages((prev) => ({ ...prev, [id]: err.message || 'Failed to grant VIP' }))
    } finally {
      setBusyId('')
    }
  }

  async function revokeVip(id) {
    setBusyId(id)
    setMessages((prev) => ({ ...prev, [id]: '' }))

    try {
      const response = await fetch(`${API}/vip/del/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove VIP')
      }

      setMessages((prev) => ({ ...prev, [id]: result.message || 'VIP access removed' }))
    } catch (err) {
      setMessages((prev) => ({ ...prev, [id]: err.message || 'Failed to remove VIP' }))
    } finally {
      setBusyId('')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <section className="border-b border-gray-800 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-300">MangaHub Admin</p>
            <h1 className="text-3xl font-bold tracking-normal text-white">Dashboard</h1>
          </div>
          <p className="text-sm text-gray-400">{paylist.length} payment request{paylist.length === 1 ? '' : 's'}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition hover:border-indigo-500 hover:bg-gray-900/80"
          >
            <svg className="h-8 w-8 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {link.icon}
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-white">{link.title}</h2>
            <p className="mt-1 text-sm text-gray-400">{link.copy}</p>
          </NavLink>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">VIP Requests</h2>
            <p className="text-sm text-gray-400">Choose a duration before sending a VIP invite.</p>
          </div>
        </div>

        {pageError && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/50 p-3 text-sm text-red-100">
            {pageError}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
          {paylist.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No payment requests yet.</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {paylist.map((item) => (
                <li key={item._id} className="p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{item.username || 'Unknown user'}</p>
                      <p className="mt-1 text-sm text-gray-400">Phone: {item.ph || 'No phone number'}</p>
                      {messages[item._id] && (
                        <p className="mt-2 text-sm text-indigo-200">{messages[item._id]}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                      <select
                        value={durations[item._id] || '1m'}
                        onChange={(event) => {
                          setDurations((prev) => ({ ...prev, [item._id]: event.target.value }))
                        }}
                        className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        {durationOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="h-10 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-gray-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => grantVip(item._id)}
                        disabled={busyId === item._id}
                      >
                        {busyId === item._id ? 'Processing...' : 'Grant VIP'}
                      </button>

                      <button
                        type="button"
                        className="h-10 rounded-lg bg-red-500 px-4 text-sm font-medium text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => revokeVip(item._id)}
                        disabled={busyId === item._id}
                      >
                        {busyId === item._id ? 'Processing...' : 'Back VIP'}
                      </button>

                      <button
                        type="button"
                        className="h-10 rounded-lg border border-gray-700 px-4 text-sm font-medium text-gray-100 hover:bg-gray-800"
                        onClick={() => {
                          setVisiblePayPhotos((prev) => ({
                            ...prev,
                            [item._id]: !prev[item._id],
                          }))
                        }}
                      >
                        {visiblePayPhotos[item._id] ? 'Hide Photo' : 'Show Photo'}
                      </button>
                    </div>
                  </div>

                  {visiblePayPhotos[item._id] && (
                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
                      <img
                        src={`${API}/uploads/${item.pay}`}
                        alt="Payment proof"
                        className="max-h-[520px] w-full object-contain"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
