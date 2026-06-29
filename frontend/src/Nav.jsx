import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { API } from './config/api'
import { AuthContext } from './contexts/AuthContext'

const linkClass = ({ isActive }) =>
  `inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
    isActive
      ? 'bg-indigo-500 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }`

export default function Nav() {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const user = auth?.user

  async function handleLogout() {
    try {
      await fetch(`${API}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      auth?.logout()
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <NavLink to="/" className="text-xl font-bold tracking-tight text-white">
          Manga<span className="text-indigo-400">Hub</span>
          
        </NavLink>

        <ul className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
          <li><NavLink to="/" className={linkClass} end>Home</NavLink></li>
{!user &&(
<>
  
  <li><NavLink to="/register" className={linkClass}>Register</NavLink></li>
  <li><NavLink to="/login" className={linkClass}>Login</NavLink></li>
</>
)
}

          
          {!!user&&(
            <>
            <li><NavLink to="/payment" className={linkClass}>Member</NavLink></li>
              <li>
            <button
              type="button"
              className="inline-flex min-h-10 items-center rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 sm:px-4"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
           <li className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-800 px-2 py-1">
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path d="M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  </div>

  <p className="max-w-28 truncate text-sm font-medium text-white sm:max-w-40">{user.name}</p>
</li>
        
            </>
          )
          
          
          }


        </ul>
      </nav>
    </header>
  )
}
