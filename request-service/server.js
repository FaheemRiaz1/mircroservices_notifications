require('dotenv').config({ path: __dirname + '/./.env' }) // Load environment variables from .env file

const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const sendEmail = require('../notification-service/server')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// JWT Secret key
const JWT_SECRET = process.env.JWT_SECRET

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

db.connect(err => {
  if (err) throw err
  console.log('Connected to MySQL database')
})

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] // Extract token from Bearer
  if (!token) {
    return res.status(403).json({ error: 'No token provided' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' })
    }
    req.user = decoded // Attach decoded token (user data) to request
    next()
  })
}

// Route to create a new request
app.post('/create-request', verifyToken, (req, res) => {
  const { title, description, type, urgency, superior_email } = req.body
  const user_email = req.user.email // Get user email from decoded token

  if (user_email === superior_email) {
    return res
      .status(400)
      .json({ error: 'You cannot set yourself as the superior' })
  }

  const query =
    'INSERT INTO requests (title, description, type, urgency, superior_email, status, user_email) VALUES (?, ?, ?, ?, ?, ?, ?)'
  db.query(
    query,
    [title, description, type, urgency, superior_email, 'Pending', user_email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      // Notify both user and superior by email
      sendEmail(user_email, 'Request Sent', 'Your request has been sended.')
      sendEmail(
        superior_email,
        'New Request Assigned',
        'A new request requires your approval.'
      )

      res.status(201).json({
        message: 'Request created successfully',
        requestId: result.insertId
      })
    }
  )
})

// Route to get requests relevant to the logged-in user
app.get('/requests', verifyToken, (req, res) => {
  const userEmail = req.user.email // Extract email from JWT

  const query = `
    SELECT * FROM requests 
    WHERE user_email = ? OR superior_email = ?
  `
  db.query(query, [userEmail, userEmail], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(results)
  })
})

// API to update the status of a request
app.patch('/update-status', verifyToken, (req, res) => {
  const { requestId, newStatus, requestee_email } = req.body
  const userEmail = req.user.email // Get the current user's email from decoded token

  if (!['approved', 'rejected'].includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid status value' })
  }

  // Check if the current user is the assigned superior for the request
  const checkSuperiorQuery =
    'SELECT * FROM requests WHERE id = ? AND superior_email = ?'
  db.query(checkSuperiorQuery, [requestId, userEmail], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    if (results.length === 0) {
      return res.status(403).json({
        error: 'Forbidden: Only the assigned superior can update request status'
      })
    }

    // Update the request status in the database
    const updateStatusQuery = 'UPDATE requests SET status = ? WHERE id = ?'
    db.query(updateStatusQuery, [newStatus, requestId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' })
      }
      res.json({ message: 'Request status updated successfully' })
      sendEmail(
        userEmail,
        `Request ${newStatus}`,
        `You have ${newStatus} the request of ${requestee_email}.`
      )
      sendEmail(
        requestee_email,
        `Request ${newStatus}`,
        `Your request has been ${newStatus} by ${userEmail}.`
      )
    })
  })
})

// Start the server
app.listen(3002, () => {
  console.log('Request service running on port 3002')
})
