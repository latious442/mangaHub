import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API } from '../config/api'

export default function Admin_login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post(`${API}/admin/login`, {
        name,
        password,
      }, {
        withCredentials: true,
      })
      if (response.data?.ok) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('vipToken')
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('admin', JSON.stringify(response.data.admin))
        navigate(location.state?.from?.pathname || '/ad', { replace: true })
      } else {
        setError(response.data?.error || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 sm:py-12">
      <form
        className="mx-auto w-full max-w-md rounded-lg bg-gray-100 p-5 shadow-md sm:p-6"
        onSubmit={handleSubmit}
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Admin Login</h2>
        <label className="block mb-2">
          <span className="text-sm font-medium">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Enter admin name"
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm font-medium">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Enter admin password"
          />
        </label>

        <button type="submit" className="mt-3 w-full rounded-lg bg-blue-500 p-2.5 font-medium text-white hover:bg-blue-700">
          Submit
        </button>

        {error && <p className="text-red-700 mt-3">{error}</p>}
      </form>
    </main>
  )
}
