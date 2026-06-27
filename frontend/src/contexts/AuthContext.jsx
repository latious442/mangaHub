import { createContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

const AuthContextProvider=({children})=>{
    const location = useLocation()
    const [user, setUser] = useState(getStoredUser)

    useEffect(() => {
        setUser(getStoredUser())
    }, [location.pathname])

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('vipToken')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext,AuthContextProvider}
