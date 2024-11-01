const express = require('express')
const app = express()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const session = require('express-session')
const { google } = require('googleapis')
const cors = require('cors') // Import cors
const mysql = require('mysql2')
const sendEmail = require('../notification-service/server')
const nodemailer = require('nodemailer')

// Configure CORS
app.use(
  cors({
    origin: 'http://localhost:3003', // Allow only your frontend origin
    credentials: true // Allow cookies to be sent along with requests if using sessions
  })
)
app.use(
  session({ secret: 'your_secret_key', resave: false, saveUninitialized: true })
)
app.use(passport.initialize())
app.use(passport.session())

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'microservices_db'
})

db.connect(err => {
  if (err) throw err
  console.log('MySQL connected.')
})

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '838396296508-lvv5q7v7p512g1hcp082pav55i4sbc7d.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile)
    }
  )
)

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

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
          console.error('Error checking user count:', err)
          return res.status(500).send('Server Error')
        }

        // Set the role to 'admin' if this is the first user
        let role = 'user'
        if (result[0].count === 0) {
          role = 'admin'
        }

        // Insert into the database (with the role)
        const sql = `INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=email`
        db.query(sql, [google_id, email, name, role], (err, result) => {
          if (err) {
            console.error('Error saving user:', err)
          } else {
            console.log('User saved/exists in DB.')
            sendEmail(
              email,
              'Successfull Login',
              'You have logged in successfully'
            )
          }

          // Send a redirect with email as query parameter
          res.redirect(`http://localhost:3003/dashboard?gmail=${email}`)
        })
      })
    }
  }
)

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'))
})

app.listen(3000, () => console.log('Auth service running on port 3000'))
