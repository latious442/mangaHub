import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Admin_login from './Pages/Admin_login.jsx'
import Home from './Pages/Home.jsx'
import Register from './Pages/Register.jsx'
import Nav from './Nav.jsx'
import Admin_home from './Pages/Admin_home.jsx'
import Login from './Pages/Login.jsx'
import Edit from './Pages/Admin/Edit.jsx'
import Add from './Pages/Admin/Add.jsx'
import User from './Pages/Admin/User.jsx'
import Setting from './Pages/Admin/Setting.jsx'
import Verify from './Pages/Verify.jsx'
import Payment from './Pages/Payment.jsx'
import View from './Pages/View.jsx'
import Userlogin from './Pages/Userlogin.jsx'
import Admin_create from './Pages/Admin_create.jsx'
import { AuthContextProvider } from './contexts/AuthContext.jsx'
import Forget_pw from './Pages/Forget_pw.jsx'
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthContextProvider>
        <Nav />
        <Routes>
          <Route path="/ad" element={<AdminProtectedRoute><Admin_home /></AdminProtectedRoute>} />
          <Route path="/admin" element={<Admin_login />} />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/edit" element={<AdminProtectedRoute><Edit /></AdminProtectedRoute>} />
          <Route path="/add" element={<AdminProtectedRoute><Add /></AdminProtectedRoute>} />
          <Route path="/user" element={<AdminProtectedRoute><User /></AdminProtectedRoute>} />
          <Route path="/setting" element={<AdminProtectedRoute><Setting /></AdminProtectedRoute>} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/xin" element={<Userlogin />} />
          <Route path="/view/:id" element={<View />} />
          <Route path="/admin/create" element={<AdminProtectedRoute><Admin_create/></AdminProtectedRoute>} />
          <Route path="/forget" element={<Forget_pw/>} />

        </Routes>
      </AuthContextProvider>
    </Router>
  </StrictMode>,
)
