import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../config/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.vipToken) {
        localStorage.setItem('vipToken', result.vipToken)
      }

      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  function forget(e){
    e.preventDefault;
    navigate('/forget');
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-900 sm:py-12">
      <form
        className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-gray-100 p-5 shadow-md sm:p-6"
        onSubmit={handleSubmit}
      >
        <p className="text-2xl font-bold sm:text-3xl">Login</p>
        <div className="mt-6 space-y-4">
        <div>
        <label className="block text-gray-700 font-bold mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
          required
        />
        </div>

        <div>
        <label className="block text-gray-700 font-bold mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
          required
        />
        </div>
        </div>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}

        </button>
        <button type="button" className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50" onClick={forget}>forget password?</button>
      </form>
    </main>
  )
}
