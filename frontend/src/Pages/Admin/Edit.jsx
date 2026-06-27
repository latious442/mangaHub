import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../../config/api'

export default function Edit() {
  const [book, setBook] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/manga`, {
          credentials: 'include',
        })
        const result = await response.json()
        setBook(result)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/manga/del/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      })
      setBook((prev) => prev.filter((item) => item._id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
      setError(error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Edit</h1>
      {book.length === 0 ? (
        <p>No manga found.</p>
      ) : (
        book.map((item) => (
          <div
            key={item._id}
            className="card rounded-lg w-2/3 bg-gray-300 px-3 py-2 flex items-center justify-between gap-3"
          >
            <p className="m-0">{item.name}</p>
            <button
              type="button"
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
              onClick={() => deleteItem(item._id)}
            >
              del
            </button>
          </div>
        ))
      )}
    </div>
  )
}
