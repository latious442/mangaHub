import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API } from '../config/api'

export default function View() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [sameSerieBooks, setSameSerieBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [bookResponse, booksResponse] = await Promise.all([
          fetch(`${API}/manga/read/${id}`, {
            credentials: 'include',
          }),
          fetch(`${API}/manga`, {
            credentials: 'include',
          }),
        ])

        if (!bookResponse.ok || !booksResponse.ok) {
          throw new Error('Network response was not ok')
        }

        const selectedBook = await bookResponse.json()
        const allBooks = await booksResponse.json()

        setBook(selectedBook)
        setSameSerieBooks(
          allBooks.filter((item) =>
            
            item.serie &&
            selectedBook.serie &&
            item.serie === selectedBook.serie
          )
        )
      } catch (err) {
        setError(err)
        console.error('Error fetching manga:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-950 p-4 text-white">Loading...</div>
  if (error) return <div className="min-h-screen bg-gray-950 p-4 text-red-200">Error: {error.message}</div>
  if (!book) return <div className="min-h-screen bg-gray-950 p-4 text-white">No manga found.</div>

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-lg bg-gray-100 p-4 shadow-md sm:p-6">
        <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">{book.name}</h1>
        {book.serie && (
          <p className="mt-1 text-sm text-gray-600">Series: {book.serie}</p>
        )}

        <div className="mt-4">
          <h2 className="font-semibold">Other manga in this series</h2>
          {sameSerieBooks.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No other manga found in this series.</p>
          ) : (
            <select
              className="mt-2 w-full rounded-lg border px-3 py-2 sm:max-w-md"
              value={id}
              onChange={(e) => {
                const selectedId = e.target.value
                if (selectedId) navigate(`/view/${selectedId}`)
              }}
            >
              {sameSerieBooks.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {book.selectedSeriesCategories && (
        <div className="mx-auto mt-6 max-w-6xl overflow-hidden rounded-lg bg-gray-900">
      
          <object
  data={`${API}/uploads/${book.manga}`}
  type="application/pdf"
  width="100%"
  height="700px"
  className="min-h-[70vh]"
>
  <p>
    Your browser does not support embedded PDFs.
    <a href={`${API}/uploads/${book.manga}`} target="_blank" rel="noreferrer">
      Open PDF
    </a>
  </p>
</object>
        </div>
      )}
    </main>
  )
}
