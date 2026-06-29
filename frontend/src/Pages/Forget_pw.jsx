import React, { useState } from 'react'
import { API } from '../config/api';
import { useNavigate } from 'react-router-dom';
export default function Forget_pw() {
  const navigate=useNavigate();
  const[email,setEmail]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');


  async function handleSubmit(e){
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email')
      return
    }
    setLoading(true)
    try{
      const response=await fetch(`${API}/send-email/again`,{
        method:'POST',
        credentials:'include',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          email: trimmedEmail
        })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || result.detail || 'Request failed')
      }
      navigate('/otp-again', { state: { email: trimmedEmail } })
    }
     catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <form className="mx-auto max-w-md rounded-lg bg-gray-900 p-5 shadow-md sm:p-6" onSubmit={handleSubmit}>
        <p className="text-lg font-semibold">Please enter your gmail and we will send otp code to you</p>
        <input
          className="mt-4 w-full rounded-lg border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
       <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Confirm'}
        </button>
      </form>
    </main>
  )
}
