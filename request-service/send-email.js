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
