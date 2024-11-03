async function sendEmail (to, subject, text) {
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
