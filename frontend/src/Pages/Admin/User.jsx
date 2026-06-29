import React from 'react'
import { useState, useEffect } from 'react'
import { API } from '../../config/api'
import axios from 'axios'

export default function User() {
  const [book, setBook] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

async function handleSubmit(userId) {
  try {
    await axios.delete(`${API}/del/${userId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
      },
    })
    setBook((prev) => prev.filter((item) => item._id !== userId))
  } catch (error) {
    console.error('Delete failed:', error)
    setError(error)
  }
}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setBook(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4"> 
        <p className="text-gray-600">Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <p className="text-sm text-gray-700">Total users: {book.length}</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {book && book.length > 0 ? (
              book.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400"><button onClick={()=>handleSubmit(item._id)}>del</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
