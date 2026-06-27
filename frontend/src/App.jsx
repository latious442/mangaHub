import React from 'react'
import './App.css'
import '../public/nnael.jpeg'
export default function App() {
  return (<>
    <div className="card bg-gray-100 rounded-lg shadow-md p-6 max-w-sm mx-auto mt-10">
    <img src="../public/nnael.jpeg" alt="nnael" className="w-64 h-auto rounded-lg shadow-md" />
    <label className="block text-gray-700 font-bold mb-2 mt-4">MangaHub</label>
    <button className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-700">
      Explore
    </button>
    </div>
  </>
  )
}
