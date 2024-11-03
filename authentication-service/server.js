require('dotenv').config({ path: __dirname + '/./.env' })
const express = require('express')
const app = express()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const session = require('express-session')
const cors = require('cors')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const sendEmail = require('../notification-service/server')

// Configure CORS to allow requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3003', // Frontend URL
    credentials: true
  })
)

// Session configuration for Passport
app.use(
  session({
    secret: 'your_secret_key', // Set session secret
    resave: false,
    saveUninitialized: true
  })
)

// Initialize Passport and session
app.use(passport.initialize())
app.use(passport.session())

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

db.connect(err => {
  if (err) throw err
  console.log('MySQL connected.')
})

// Configure Google Strategy for Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile)
    }
  )
)

// Serialize and deserialize user sessions
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

// Login route with Google authentication
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// Google callback route with JWT creation
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    if (req.user) {
      const google_id = req.user.id
      const email = req.user.emails[0].value
      const name = req.user.displayName
      // Check if this is the first user
      db.query('SELECT COUNT(*) AS count FROM users', (err, result) => {
        if (err) {
          return res.status(500).send('Server Error') // Return here to avoid further execution
        }

        // Set the role to 'admin' if this is the first user
        let role = 'user'
        if (result[0].count === 0) {
          role = 'admin'
        }

        // Generate JWT token
        const token = jwt.sign(
          { google_id, email, name, role },
          process.env.JWT_SECRET,
          {
            expiresIn: '1h'
          }
        )

        // Insert into the database (with the role)
        const sql = `INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=email`
        db.query(sql, [google_id, email, name, role], (err, result) => {
          if (err) {
            return res.status(500).send('Server Error') // Return here to avoid further execution
          }

          console.log('User saved/exists in DB.')
          const redirectUrl = `http://localhost:3003/dashboard?token=${token}`
          sendEmail(
            email,
            'Successful Login',
            'You have been logged in successfully'
          )

          // Only redirect once, and exit the function afterward
          return res.redirect(redirectUrl)
        })
      })
    } else {
      console.error('User authentication failed')
      res.redirect('/')
    }
  }
)

// Logout route
app.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const tokenBlacklist = new Set()
  if (!token) {
    return res.status(400).json({ message: 'No token provided' })
  }

  // Verify and decode the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' })
    }

    const userEmail = decoded.email // Extract email from decoded token
    sendEmail(
      userEmail,
      'Logout Notification',
      'You have been successfully Logout'
    )
    // Optional: Add the token to a blacklist (in-memory array or Redis)
    tokenBlacklist.add(token)

    // Send a response indicating logout success
    res.status(200).json({ message: 'Logged out successfully' })
  })
})
// Protected route example to verify JWT
app.get('/protected-endpoint', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1] // Get token from header

  if (!token)
    return res.status(401).json({ message: 'Unauthorized: No token provided' })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Forbidden: Invalid token' })

    // Token is valid, proceed with the request
    res.json({ message: 'Access granted', user })
  })
})

// Start the server
app.listen(3000, () => console.log('Auth service running on port 3000'))
