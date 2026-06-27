import React, { useState } from 'react'
import axios from 'axios'
import { API } from '../config/api'

export default function Admin_create() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handelSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await axios.post(`${API}/admin/create`, {
        name,
        password,
      }, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      })
      setMessage('Admin created successfully')
      setName('')
      setPassword('')
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create admin'
      setError(errorMessage)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 sm:py-12">
      <form
        className="mx-auto w-full max-w-md rounded-lg bg-gray-100 p-5 shadow-md sm:p-6"
        onSubmit={handelSubmit}
      >
        <h2 className="mb-5 text-2xl font-bold text-gray-900">Create admin</h2>

        <label className="block mb-2">
          <span className="text-sm font-medium">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Enter your name"
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm font-medium">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Enter your password"
          />
        </label>

        <button
          type="submit"
          className="mt-3 w-full rounded-lg bg-blue-500 p-2.5 font-medium text-white hover:bg-blue-700"
        >
          Submit
        </button>

        {message && <p className="text-green-700 mt-3">{message}</p>}
        {error && <p className="text-red-700 mt-3">{error}</p>}
      </form>
    </main>
  )
}
