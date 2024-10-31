const express = require('express')
const app = express()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const session = require('express-session')
const { google } = require('googleapis')
const cors = require('cors') // Import cors
const mysql = require('mysql2')

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

const CLIENT_ID =
  '838396296508-mifvtljb51p4ut6lg9fa9ko4h63lqqft.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REFRESH_TOKEN =
  '1//04kLmz4izKA6MCgYIARAAGAQSNwF-L9IrAPHCxymag3RbwO4dkr0vwcl_C0S2zQ863Q4mstkqou0Q5XXEX5Qnm4wioykFq23zKa8'
const ACCESSTOKEN =
  'ya29.a0AeDClZCKkTkH791-337s5cFlwSgqH8YrgH677Zi6nEbvGY2kxVOxSvmAa7WwLjxDdTfDE6dp1j677UFMp9CStkA2O9YeKppfDce1XVk1n0mMWkiSUMrd10ilSu6PzOxBgF3uL_6dAMY8sPuE-PucXdtO15yyoHRBuuahIOttaCgYKAQASARESFQHGX2MiJNO2R6Zgo4okJaH6TzSLnw0175'

const REDIRECT_URI = 'https://developers.google.com/oauthplayground'

// const CLIENT_ID = 'YOUR_CLIENT_ID'
// const CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
// const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN'

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

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
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

const nodemailer = require('nodemailer')

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email provider
  auth: {
    user: 'your-email@gmail.com', // Replace with your email
    pass: 'your-email-password' // Replace with your email password or app-specific password
  }
})

// Function to send email
async function sendEmail (to, subject, text) {
  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'faheemriaz177@gmail.com',
        clientId:
          '838396296508-mifvtljb51p4ut6lg9fa9ko4h63lqqft.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken:
          '1//04kLmz4izKA6MCgYIARAAGAQSNwF-L9IrAPHCxymag3RbwO4dkr0vwcl_C0S2zQ863Q4mstkqou0Q5XXEX5Qnm4wioykFq23zKa8',
        accessToken:
          'ya29.a0AeDClZCKkTkH791-337s5cFlwSgqH8YrgH677Zi6nEbvGY2kxVOxSvmAa7WwLjxDdTfDE6dp1j677UFMp9CStkA2O9YeKppfDce1XVk1n0mMWkiSUMrd10ilSu6PzOxBgF3uL_6dAMY8sPuE-PucXdtO15yyoHRBuuahIOttaCgYKAQASARESFQHGX2MiJNO2R6Zgo4okJaH6TzSLnw0175'
      }
    })

    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      subject,
      text
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // res.redirect('http://localhost:3003/dashboard')
    if (req.user) {
      const google_id = req.user.id
      const email = req.user.emails[0].value
      const name = req.user.displayName

      // Insert user into the database if not already exists
      const sql =
        'INSERT INTO users (google_id, email, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email=email'
      db.query(sql, [google_id, email, name], (err, result) => {
        if (err) throw err
        console.log('User saved/exists in DB.')
      })

      console.log(req.user, req.user.emails[0].value)
      if (req.user.emails[0].value) {
        sendEmail(req.user.emails[0].value)
        res.redirect('http://localhost:3003/dashboard')
      }
    } else {
      res.redirect('/')
    }
  }
)

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'))
})

app.listen(3000, () => console.log('Auth service running on port 3000'))
