import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../../config/api'

export default function Edit() {
  const [book, setBook] = useState([])
  const [serie, setSerie] = useState([])
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


  useEffect(() => {
    const fetchSerie = async () => {
      try {
        const response = await fetch(`${API}/serie/get`, {
          credentials: 'include',
        })
        const result = await response.json()
        setSerie(result)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchSerie()
  }, [])

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this manga?')) return
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


  const deleteSerie = async (id) => {
    if (!window.confirm('Delete this serie?')) return
    try {
      await axios.delete(`${API}/serie/del/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      })
      setSerie((prev) => prev.filter((item) => item._id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
      setError(error)
    }
  }


  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error?.message || String(error)}</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold text-indigo-600 mb-4">Manga list</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manga list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Manga ({book.length})</h2>
          </div>

          {book.length === 0 ? (
            <p className="text-sm text-gray-500">No manga found.</p>
          ) : (
            <div className="space-y-3">
              {book.map((item) => (
                <div
                key={item._id}
                className="bg-white shadow-sm rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.author && <p className="text-xs text-gray-500">{item.author}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => deleteItem(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Series list */}
          <h1 className="text-2xl font-semibold text-indigo-600 mb-4">Serie List</h1>
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Series ({serie.length})</h2>
          </div>

          {serie.length === 0 ? (
            <p className="text-sm text-gray-500">No series found.</p>
          ) : (
            <div className="space-y-3">
              {serie.map((item) => (
                <div
                  key={item._id || item.name}
                  className="bg-white shadow-sm rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => deleteSerie(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
