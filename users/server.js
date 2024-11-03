// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/./.env' })

// Import required modules
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const jwt = require('jsonwebtoken')

// Initialize Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json()) // For parsing JSON requests

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})
// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message)
    return
  }
  console.log('Connected to MySQL database')
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret' // Use default in case env variable is not set

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] // Expect token in Authorization header
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' })
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(403).json({ message: 'Invalid token format' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' })
    }
    req.user = decoded // Save decoded info to req.user
    next()
  })
}

// Route to get user by token
app.get('/user', verifyToken, (req, res) => {
  const email = req.user.email // Get email from decoded token
  if (!email) {
    return res.status(400).json({ message: 'Email not found in token' })
  }

  const sqlQuery = 'SELECT * FROM users WHERE email = ?'
  db.query(sqlQuery, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(result[0]) // Return the first matched user
  })
})

// Route to get admin emails
app.get('/admin-emails', (req, res) => {
  const sqlQuery = 'SELECT email FROM users WHERE role = ?'

  db.query(sqlQuery, ['admin'], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'No admin users found' })
    }
    res.status(200).json(result)
  })
})

// Start the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
