import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { API } from '../config/api'
export default function Admin_home() {
const [paylist,setPaylist]=useState([]);
const [visiblePayPhotos, setVisiblePayPhotos] = useState({});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [vipInvites, setVipInvites] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/pay/get`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setPaylist(result);
      } catch (error) {
        console.log(error);
      } 
    };
    fetchData();
  }, []);

    async function handleSubmit(id) {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API}/vip/access/${id}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        })

        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(result.error || 'Failed to grant VIP')
        }

        setVipInvites(prev => ({ ...prev, [id]: result.message || 'VIP invite sent' }))
      } catch (err) {
        setError(err.message || 'Failed to grant VIP')
      } finally {
        setLoading(false)
      }
    }
  
  return (<>
    <div className="align-items-center justify-content p-4 bg-gray-800">
      <h1 className="text-2xl font-bold text-white">Admin Home</h1>
    </div>

    {/*for 4 button mother-frame */}
    <div className="grid grid-cols-2 gap-4">

      {/*editing books*/}
  <div className="card bg-gray-100 rounded-lg shadow-md p-6 max-w-sm mx-auto mt-10">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-15">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
</svg>

    <label className="block text-gray-700 font-bold mb-2 mt-4">editing books here</label>
    <NavLink to="/edit" className="bg-purple-500 text-white p-2 rounded mt-2 hover:bg-purple-700">
      Explore
    </NavLink>
    </div>

 {/*adding books*/}
   <div className="card bg-gray-100 rounded-lg shadow-md p-6 max-w-sm mx-auto mt-10">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-15">
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>

    <label className="block text-gray-700 font-bold mb-2 mt-4">adding books here</label>
    <NavLink to="/add" className="bg-purple-500 text-white p-2 rounded mt-2 hover:bg-purple-700">
      Explore
    </NavLink>
    </div>


{/*users*/}
     <div className="card bg-gray-100 rounded-lg shadow-md p-6 max-w-sm mx-auto mt-10">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-15">
  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
</svg>

    <label className="block text-gray-700 font-bold mb-2 mt-4">users lists are here</label>
    <NavLink to="/user" className="bg-purple-500 text-white p-2 rounded mt-2 hover:bg-purple-700">
      Explore
    </NavLink>
    </div>

{/*members*/}
     <div className="card bg-gray-100 rounded-lg shadow-md p-6 max-w-sm mx-auto mt-10">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
</svg>

    <label className="block text-gray-700 font-bold mb-2 mt-4">member access here</label>
    <NavLink to="/setting" className="bg-purple-500 text-white p-2 rounded mt-2 hover:bg-purple-700">
      Explore
    </NavLink>
    </div>
    </div>
<br/>
<br/>

    <div className="bg-indigo-400 text-white rounded-xl p-4 align-items-center justify-content">
      <ul>
        {paylist.map((item)=>(
          <li key={item._id} className="mb-4">
            <div className="mb-2">
              {item.username || 'Unknown user'} - {item.ph}
            </div>
            <button
              type="button"
              className="bg-white text-indigo-700 px-3 py-1 rounded mr-2"
              onClick={() => {
                setVisiblePayPhotos(prev => ({
                  ...prev,
                  [item._id]: !prev[item._id],
                }))
              }}
            >
              {visiblePayPhotos[item._id] ? 'Hide payment photo' : 'Show payment photo'}
            </button>
            {visiblePayPhotos[item._id] && (
              <img
                src={`${API}/uploads/${item.pay}`}
                alt="Payment proof"
                className="mt-3 max-w-full h-auto rounded shadow"
              />
            )}
            <div className="mt-3">
              <button
                type="button"
                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                onClick={() => handleSubmit(item._id)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Grant VIP'}
              </button>
              {vipInvites[item._id] && (
                <div className="mt-2 text-sm text-white">{vipInvites[item._id]}</div>
              )}
              {error && (
                <div className="mt-2 text-sm text-red-200">Error: {error}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
    
   
  </>
  )
}
