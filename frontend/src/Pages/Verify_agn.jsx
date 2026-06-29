import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API } from '../config/api'

export default function Verify_agn() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email } = location.state || {}
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  if (!email) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-12">
        <div className="mx-auto max-w-md rounded-lg bg-gray-100 p-6 text-center shadow-md">
          <p className="mb-4 text-red-600">No email found. Please request a password reset first.</p>
          <button
            type="button"
            onClick={() => navigate('/forget')}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </main>
    )
  }

  async function handleResend() {
    setError('')
    setResending(true)
    try {
      await axios.post(`${API}/send-email/again`, { email })
      alert('A new OTP has been sent to your email')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setVerifying(true)
    try {
      const response = await axios.post(`${API}/verify-otp/again`, {
        email,
        otp,
        password,
      })

      if (!response.data.ok) {
        setError('Sorry, wrong OTP code')
        return
      }

      alert('Password reset successfully. Please login again.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Password reset failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <>
    <div className="align-items-center justify-content p-4 bg-gray-900 w-1/3 mx-auto mt-20 rounded-lg">
        <span className="relative flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-sky-500 text-white"></span>
        </span>
        <h1 className="text-2xl font-bold text-white mt-4">Verification in progress...</h1>
      </div>
      <form className="w-1/3 mx-auto mt-10 bg-gray-100 p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <label className="block text-gray-700 font-bold mb-2">Enter OTP:</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter OTP"
          required
        />
        <label className="mt-4 block text-gray-700 font-bold mb-2">New Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter new password"
          required
        />
        <label className="mt-4 block text-gray-700 font-bold mb-2">Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Confirm new password"
          required
        />
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={verifying}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    <div className="w-1/3 mx-auto mt-4 text-center">
      <p className="text-gray-600">
        Didn't receive the OTP?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-blue-500 hover:underline disabled:opacity-50"
        >
          {resending ? 'Resending...' : 'Resend OTP'}
        </button>
      </p>
    </div>
     <div className="w-1/3 mx-auto mt-10 bg-gray-100 p-6 rounded-lg shadow-md">
     <h2 className="text-xl font-bold text-gray-800 mb-4">Why OTP Verification?</h2>
      <p className="text-gray-700">OTP (One-Time Password) verification adds an extra layer of security to your account. It ensures that only you can access your account by requiring a unique code sent to your registered email.</p>
    </div>
     <div className="w-1/3 mx-auto mt-10 bg-gray-100 p-6 rounded-lg shadow-md">
     <h2 className="text-xl font-bold text-gray-800 mb-4">Tips for OTP Verification:</h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Ensure your contact information is up to date.</li>
        <li>Check your spam folder if you don't receive the OTP.</li>
        <li>Do not share your OTP with anyone.</li>
      </ul>
    </div>
     <div className="w-1/3 mx-auto mt-10 bg-gray-100 p-6 rounded-lg shadow-md">
     <h2 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h2>
      <p className="text-gray-700">If you're having trouble with OTP verification, please contact our support team for assistance.</p>
    </div>
     <div className="w-1/3 mx-auto mt-10 bg-gray-100 p-6 rounded-lg shadow-md">
     <h2 className="text-xl font-bold text-gray-800 mb-4">Security Reminder:</h2>
      <p className="text-gray-700">Always keep your OTP confidential and never share it with anyone, even if they claim to be from our support team.</p>
    </div>
     <div className="w-1/3 mx-auto mt-10 bg-gray-100 p-6 rounded-lg shadow-md">
     <h2 className="text-xl font-bold text-gray-800 mb-4">Thank You!</h2>
      <p className="text-gray-700">Thank you for taking the time to verify your account. Your security is our top priority!</p>
    </div>
    </>
  )
}
