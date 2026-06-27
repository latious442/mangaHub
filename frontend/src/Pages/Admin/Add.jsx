import React from 'react'
import axios from 'axios'
import { API } from '../../config/api'
import { useEffect, useState } from 'react'

export default function Add() {
  const [serie, setSerie] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [selectedSeriesCategories, setSelectedSeriesCategories] = useState([]) // Store categories of selected series

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', e.target.name.value)
      formData.append('access', e.target.access.value)
      formData.append('seriesId', selectedSeries._id) // Send series ID
      formData.append('manga', e.target.manga.files[0])
      formData.append('image', e.target.image.files[0])
      formData.append('selectedSeriesCategories', JSON.stringify(selectedSeriesCategories)) // Use series categories
      formData.append('serie', selectedSeries?.name || '')
      
      await axios.post(`${API}/manga/`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      })
      alert('Added successfully')
      
      
      e.target.reset()
      setSelectedSeries(null)
      setSelectedSeriesCategories([])
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to add manga')
    }
  }

  // Handle series selection
  const handleSeriesChange = (e) => {
    const seriesId = e.target.value
    const series = serie.find(s => s._id === seriesId)
    setSelectedSeries(series)
    setSelectedSeriesCategories(series ? series.sort : []) // Get categories from series.sort
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/serie/get`)
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setSerie(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching series:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="text-center mt-10">Loading series...</div>
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-4/5 mx-auto mt-10 bg-gray-100 p-6 rounded-lg shadow-md">
        <p className="text-3xl mb-4">Add manga file here</p>

        <label className="block text-gray-700 font-bold mb-2">Select Series</label>
        <select 
          className="w-full px-3 py-2 border rounded-lg"
          onChange={handleSeriesChange}
          value={selectedSeries?._id || ''}
          required
        >
          <option value="">Select a series</option>
          {serie.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

<br/>
<br/>
 <label className="block text-gray-700 font-bold mb-2">Select aceesing book</label>
        <select 
          className="w-full px-3 py-2 border rounded-lg" name="access"
        >
          <option value="free">free</option>
          <option value="vip">vip</option>
        </select>


        {/* Display series categories */}
        {selectedSeries && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <label className="block text-gray-700 font-bold mb-2">
              Series Categories (auto-assigned)
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSeriesCategories.map((category, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-500 text-white text-sm rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              * Categories will be inherited from the series
            </p>
          </div>
        )}

        <label className="block text-gray-700 font-bold mb-2 mt-4">Manga Name</label>
        <input 
          type="text" 
          name="name" 
          required 
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />

        <label className="block text-gray-700 font-bold mb-2 mt-4">Manga File</label>
        <input 
          type="file" 
          name="manga" 
          required 
          accept=".pdf,.epub,.cbr,.cbz"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />

        <label className="block text-gray-700 font-bold mb-2 mt-4">Cover Image</label>
        <input 
          type="file" 
          name="image" 
          required 
          accept="image/*" 
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />

        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 transition-colors"
        >
          Add Manga
        </button>
      </form>
    </>
  )
}
