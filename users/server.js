// Import required modules
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')

// Initialize Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json()) // For parsing JSON requests

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'microservices_db'
})

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message)
    return
  }
  console.log('Connected to MySQL database')
})

// Route to get user by email
app.get('/user', (req, res) => {
  console.log('req.query.gmail', req.query)
  const email = req.query.gmail // Get email from query parameter

  if (!email) {
    return res
      .status(400)
      .json({ message: 'Email query parameter is required' })
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

// Start the server
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
