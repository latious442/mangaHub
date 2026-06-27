import React from 'react'
import { useState, useEffect } from 'react'
import { API } from '../config/api'

export default function Userlogin() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'))
      if (storedUser?.id) {
        const res = await fetch(`${API}/api/loginuser/${storedUser.id}`, {
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        setUser(data)
      }
    }
    fetchUser()
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-md rounded-lg bg-gray-900 p-5 shadow-md">
        {user?.name || 'Loading user...'}
      </div>
    </main>
  )
}
