import { useEffect, useState } from 'react'
import axios from 'axios'
import { API } from '../config/api'
export default function Payment() {
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/api/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in')
        return res.json()
      })
      .catch((err) => console.error('Not logged in', err))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const formData = new FormData()
      formData.append('pay', e.target.pay.files[0])
      formData.append('ph', e.target.ph.value)

      await axios.post(`${API}/pay/post`, formData, { withCredentials: true })
      alert('added successfully')
      e.target.reset()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to add payment')
    }
  }
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form className="rounded-lg bg-gray-100 p-5 shadow-md sm:p-6" onSubmit={handleSubmit}>
 <p className="text-2xl font-bold text-gray-900 sm:text-3xl">Member access</p>
 <div className="mt-6 space-y-4">
     <div>
     <label className="block text-gray-700 font-bold mb-2">ph-no</label>
     <input type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter ph-no" name="ph" />
     </div>
     
     <div>
     <label className="block text-gray-700 font-bold mb-2">transfer-ss</label>
      <input type="file" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" name="pay" />
      </div>
      </div>
      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      <button type="submit" className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-2.5 font-medium text-white hover:bg-blue-700 sm:w-auto">Submit payment</button>
    </form>

     <div className="rounded-lg bg-gray-100 p-5 shadow-md sm:p-6">
     <h2 className="text-xl font-bold text-gray-800 mb-4">
        kpay-no:09-250046947<br />
        acc-name:MyoMyatAung
     </h2>
      <p className="text-gray-700">We make our payment-system user-friendly to our best.Please enter your ph-no and transfer-ss to get membership.We will respond to your payment within 12 hrs.</p>
    </div>
    </div>
    </main>
  )
}
