import React from 'react'
import Dashboard from './dashboard'
import Login from './login'
import CreateRequest from './create-request'
import RequestList from './get-request-list'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// const Dashboard = () => <div>Dashboard</div>
// const Login = () => <div>Login</div>

const App = () => {
  console.log('Rendering App Component')
  return (
    <Router>
      <Routes>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/submit-request' element={<CreateRequest />} />
        <Route path='/request-list' element={<RequestList />} />
        <Route path='/' element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
