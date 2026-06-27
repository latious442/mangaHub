import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../config/api'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    if (!name.trim() || !trimmedEmail || !password) {
      setError('Please fill in all fields')
      return
    }

    setSending(true)
    try {
      const response = await fetch(`${API}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          password,
        }),
      })

      const result = await response.json().catch(async () => {
        const text = await response.text()
        return { error: text || 'Unable to send OTP email' }
      })
      if (!response.ok) {
        throw new Error(result.error || result.detail || 'Unable to send OTP email')
      }

      navigate('/verify', {
        state: {
          name: name.trim(),
          email: trimmedEmail,
          password,
        },
      })
    } catch (err) {
      setError(err.message || 'Failed to send OTP email')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 sm:py-12">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-md sm:p-6">
        <p className="text-center text-2xl font-bold text-gray-900">Register</p>
        <div className="mt-6 space-y-4">
        <label className="block">
        <span className="mb-2 block font-medium text-gray-700">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="Enter your name"
        />
        </label>
        <label className="block">
        <span className="mb-2 block font-medium text-gray-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="Enter your email"
        />
        </label>
        <label className="block">
        <span className="mb-2 block font-medium text-gray-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="At least 6 characters"
        />
        </label>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="mt-5 w-full rounded-lg bg-blue-500 p-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'Sending OTP...' : 'Register'}
        </button>
      </form>
    </main>
  )
}
