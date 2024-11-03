require('dotenv').config({ path: __dirname + '/./.env' }) // Load environment variables from .env file
const express = require('express')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const cors = require('cors')

const app = express()

// Configure CORS to allow only frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
)
app.use(express.json())

// OAuth2 client setup with environment variables
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
)
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

// Function to send an email
const sendEmail = async (to, subject, text) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER, // Use email from .env
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token // Use dynamic access token
      }
    })

    const mailOptions = {
      from: process.env.GMAIL_USER, // Set "from" email from .env
      to,
      subject,
      text
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

module.exports = sendEmail
