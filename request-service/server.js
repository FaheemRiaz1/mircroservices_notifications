const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const sendEmail = require('../notification-service/server')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'microservices_db'
})
db.connect(err => {
  if (err) throw err
  console.log('Connected to MySQL database')
})

// Route to create a new request
// Create a new request
app.post('/create-request', (req, res) => {
  const { title, description, type, urgency, superior_email, user_email } =
    req.body

  const customData = req.headers['x-custom-data']

  console.log('Custom Data:', req.body)

  // if (!userEmail) {
  //   return res.status(400).json({ error: 'User not authenticated' })
  // }

  const query =
    'INSERT INTO requests (title, description, type, urgency, superior_email, status, user_email) VALUES (?, ?, ?, ?, ?, ?,?)'
  db.query(
    query,
    [title, description, type, urgency, superior_email, 'Pending', user_email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      console.log('usermail', user_email)
      sendEmail(user_email, 'Request rcv', 'request rcv')
      sendEmail(superior_email, title, description)
      res.status(201).json({
        message: 'Request created successfully',
        requestId: result.insertId
      })
    }
  )
})
// Get all requests
app.get('/requests', (req, res) => {
  const query = 'SELECT * FROM requests'
  db.query(query, (err, results) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(results)
  })
})

// API to update the status of a request
app.patch('/update-status', (req, res) => {
  const { requestId, newStatus, userRole, superiorEmail, userEmail } = req.body

  console.log('requestId, newStatus', req.body)
  // Validate the new status value
  if (userRole.includes('admin')) {
    if (!['approved', 'approved'].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    // Update the request status in the database
    const sql = 'UPDATE requests SET status = ? WHERE id = ?'
    db.query(sql, [newStatus, requestId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' })
      }
      res.json({ message: 'Request status updated successfully' })
      sendEmail(superiorEmail, `Request ${newStatus}`, `Request ${newStatus}`)
      sendEmail(userEmail, `Request ${newStatus}`, `Request ${newStatus}`)
    })
  } else {
    return res.status(403).json({ error: 'Forbidden' })
  }
})

// Start the server
app.listen(3002, () => {
  console.log('Request service running on port 3002')
})
