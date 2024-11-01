// app.listen(3001, () => console.log('Notification service running on port 3001'))
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const express = require('express')

const cors = require('cors') // Import cors
const app = express()

// Configure CORS
app.use(
  cors({
    origin: 'http://localhost:3003', // Allow only your frontend origin
    credentials: true // Allow cookies to be sent along with requests if using sessions
  })
)
app.use(express.json())
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

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

const sendEmail = async (to, subject, text) => {
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

// app.post('/send-email', async (req, res) => {
//   const { to, subject, text } = req.body
//   try {
//     const emailResult = await sendEmail(to, subject, text)
//     res.status(200).send(`Email sent: ${emailResult.messageId}`)
//     console.log(`Email sent: ${emailResult.messageId}`)
//   } catch (error) {
//     res.status(500).send(`Error sending email: ${error.message}`)
//     console.log(`Error sending email: ${error.message}`)
//   }
// })

module.exports = sendEmail
// app.listen(3001, () => console.log('Server running on port 3001'))
