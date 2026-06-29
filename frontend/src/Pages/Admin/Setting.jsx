import React from 'react'
import axios from 'axios';
import {useState} from 'react'
import { API } from '../../config/api'

export default function Setting() {
  const categories = [
    {name:"Action & Adventure"},
    {name:"Romance"},
    {name:"Slice of Life"},
    {name:"Fantasy"},
    {name:"Supernatural & Horror"},
    {name:"Sport"},
    {name:"Comedy"},
    {name:"Mystery & thriller"},
    {name:"Drama"}
  ]
  
  const [name, setName] = useState("")
  const [photo, setPhoto] = useState("")
  const [sort, setSort] = useState([])  // This is your state variable

  const toggleType = (category) => {
    setSort((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    )
  }
  
  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', e.target.name.value)
      formData.append('photo', e.target.photo.files[0])
      formData.append('sort', JSON.stringify(sort))  // Send the sort array as JSON

      await axios.post(`${API}/serie/create`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      })
      alert('added successfully')
      
      // Reset form after successful submission
      e.target.reset()
      setSort([])
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to add manga')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}
        className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto mt-10 bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md"
      >
        <p className="text-2xl sm:text-3xl text-center">Creating series here</p>
        <br />
        
        <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">Serie Name</label>
        <input
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Enter series name" 
          name="name"
          required
        />

        <br />
        <br />
        
        <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">Serie photo</label>
        <input
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          type="file" 
          name="photo"
          required 
        />
        
        <br />
        <br />
        
        <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">Categories</label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {categories.map((cat) => {
            const selected = sort.includes(cat.name)  // FIXED: changed 'types' to 'sort'
            return (
              <label
                key={cat.name}
                className={`flex items-center p-2 sm:p-3 cursor-pointer rounded-lg border transition-all ${
                  selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selected}
                  onChange={() => toggleType(cat.name)}  // Removed 'value="sort"'
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-1 sm:mr-2 flex items-center justify-center flex-shrink-0 border-2 ${
                  selected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                }`}>
                  <svg
                    className={`w-2 h-2 sm:w-3 sm:h-3 text-white ${selected ? 'block' : 'hidden'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">{cat.name}</span>
              </label>
            )
          })}
        </div>

        <p className="mt-4 text-sm text-gray-700">
          Selected categories: {sort.length > 0 ? sort.join(', ') : 'None'}  {/* FIXED: changed 'types' to 'sort' */}
        </p>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded mt-6 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Create Series
        </button>
      </form>
    </div>
  )
}
