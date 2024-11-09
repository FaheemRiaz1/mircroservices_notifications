const mysql = require('mysql2')
require('dotenv').config()

// Configure connection with JawsDB environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
})

// Define SQL queries for table creation
const createRequestsTable = `
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  urgency VARCHAR(50),
  superior_email VARCHAR(255),
  status VARCHAR(50),
  user_id INT,
  user_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(50)
);`

// Connect and run the queries
connection.connect(err => {
  if (err) {
    console.error('Error connecting to JawsDB:', err)
    return
  }
  console.log('Connected to JawsDB!')

  // Create tables
  connection.query(createRequestsTable, (err, results) => {
    if (err) throw err
    console.log('Requests table created or already exists.')
  })

  connection.query(createUsersTable, (err, results) => {
    if (err) throw err
    console.log('Users table created or already exists.')
  })

  // Close the connection
  connection.end()
})
