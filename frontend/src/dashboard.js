// import React, { useState, useEffect } from 'react'
// import axios from 'axios'
// import CreateRequest from './create-request'
// import RequestList from './get-request-list'
// import Navigationbar from './navbar'
// import { useLocation } from 'react-router-dom'

// const Dashboard = () => {
//   const [requests, setRequests] = useState([]) // State to store request data
//   const location = useLocation() // Get location from react-router-dom for parsing URL params

//   const jwtSecret = process.env.JWT_SECRET

//   console.log('const jwtSecret = process.env.JWT_SECRET', jwtSecret)
//   console.log('Environment Variables:', process.env)

//   useEffect(() => {
//     // Get token from the URL and store it in localStorage
//     const params = new URLSearchParams(location.search)
//     const token = params.get('token')

//     if (token) {
//       localStorage.setItem('token', token) // Store token in localStorage
//       console.log('Token stored successfully:', token)
//     } else {
//       console.error('No token found in URL')
//     }
//   }, [location])

//   // Retrieve token from localStorage
//   const token = localStorage.getItem('token')

//   // Protected API call using the token in headers
//   useEffect(() => {
//     if (token) {
//       axios
//         .get('http://localhost:3000/protected-endpoint', {
//           headers: {
//             Authorization: `Bearer ${token}` // Set token in Authorization header
//           }
//         })
//         .then(response => {
//           console.log(response.data) // Log response data
//         })
//         .catch(error => {
//           console.error('Error:', error) // Log any errors
//         })
//     }
//   }, [token])

//   return (
//     <div>
//       <h1>Request Management</h1>
//       <Navigationbar />

//       {/* Add a button or form here to call createRequest with actual data */}
//     </div>
//   )
// }

// export default Dashboard

import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap'
import { Pie } from 'react-chartjs-2'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navigationbar from './navbar'
import { useLocation } from 'react-router-dom'

// Import necessary components from Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Register the components
ChartJS.register(ArcElement, Tooltip, Legend)

const Dashboard = () => {
  const [approvedRequests, setApprovedRequests] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [rejectedRequests, setRejectedRequests] = useState(0)
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([]) // State to store request data
  const location = useLocation() // Get location from react-router-dom for parsing URL params

  const jwtSecret = process.env.JWT_SECRET

  console.log('const jwtSecret = process.env.JWT_SECRET', jwtSecret)
  console.log('Environment Variables:', process.env)

  useEffect(() => {
    // Get token from the URL and store it in localStorage
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token) // Store token in localStorage
      console.log('Token stored successfully:', token)
    } else {
      console.error('No token found in URL')
    }
  }, [location])

  // Retrieve token from localStorage
  const token = localStorage.getItem('token')

  // Protected API call using the token in headers
  useEffect(() => {
    if (token) {
      axios
        .get('http://localhost:3000/protected-endpoint', {
          headers: {
            Authorization: `Bearer ${token}` // Set token in Authorization header
          }
        })
        .then(response => {
          console.log(response.data) // Log response data
        })
        .catch(error => {
          console.error('Error:', error) // Log any errors
        })
    }
  }, [token])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:3002/requests', {
          headers: { Authorization: `Bearer ${token}` }
        })

        // Count requests based on their status
        const requests = response.data
        const approved = requests.filter(
          request => request.status.toLowerCase() === 'approved'
        ).length
        const pending = requests.filter(
          request => request.status.toLowerCase() === 'pending'
        ).length
        const rejected = requests.filter(
          request => request.status.toLowerCase() === 'rejected'
        ).length

        setApprovedRequests(approved)
        setPendingRequests(pending)
        setRejectedRequests(rejected)
      } catch (error) {
        console.error('Error fetching request data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const pieData = (label, data, backgroundColor) => ({
    labels: [label],
    datasets: [
      {
        label: label,
        data: [data, 100 - data],
        backgroundColor: [backgroundColor, '#e0e0e0'],
        borderWidth: 1
      }
    ]
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    cutout: '70%'
  }
  const sum = approvedRequests + pendingRequests + rejectedRequests

  const calculatePercentage = count => ((count / sum) * 100).toFixed(2)
  return (
    <div>
      <Navigationbar />

      <Container fluid className='py-5 dashboard-div'>
        {/* <h2 className='text-center mb-4 dashboard-h2'>Dashboard</h2> */}
        {loading ? (
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ height: '50vh' }}
          >
            <Spinner animation='border' variant='primary' />
          </div>
        ) : (
          <Row className='justify-content-center'>
            <Col md={4} className='mb-4'>
              <Card className='shadow-sm border-0'>
                <Card.Body>
                  <h5 className='text-center' style={{ color: '#28a745' }}>
                    {approvedRequests} Approved Requests
                  </h5>
                  <div style={{ height: '200px' }}>
                    <Pie
                      data={pieData('Approved', approvedRequests, '#28a745')}
                      options={chartOptions}
                    />
                  </div>
                  <p
                    className='text-center mt-3'
                    style={{ fontSize: '1.2rem' }}
                  >
                    {calculatePercentage(approvedRequests)}% Approved
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className='mb-4'>
              <Card className='shadow-sm border-0'>
                <Card.Body>
                  <h5 className='text-center' style={{ color: '#ffc107' }}>
                    {pendingRequests} Pending Requests
                  </h5>
                  <div style={{ height: '200px' }}>
                    <Pie
                      data={pieData('Pending', pendingRequests, '#ffc107')}
                      options={chartOptions}
                    />
                  </div>
                  <p
                    className='text-center mt-3'
                    style={{ fontSize: '1.2rem' }}
                  >
                    {calculatePercentage(pendingRequests)}% Pending
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className='mb-4'>
              <Card className='shadow-sm border-0'>
                <Card.Body>
                  <h5 className='text-center' style={{ color: '#dc3545' }}>
                    {rejectedRequests} Rejected Requests
                  </h5>
                  <div style={{ height: '200px' }}>
                    <Pie
                      data={pieData('Rejected', rejectedRequests, '#dc3545')}
                      options={chartOptions}
                    />
                  </div>
                  <p
                    className='text-center mt-3'
                    style={{ fontSize: '1.2rem' }}
                  >
                    {calculatePercentage(rejectedRequests)}% Rejected
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  )
}

export default Dashboard
