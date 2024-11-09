import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Table, Modal, Button, Badge, Alert } from 'react-bootstrap'
import Navigationbar from './navbar'

const RequestList = () => {
  const [requests, setRequests] = useState([])
  const [user, setUser] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })

  // Function to open modal with the selected request
  const openModal = request => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setShowModal(false)
  }

  // Function to update the request status
  const updateStatus = async (requestId, newStatus, requestee_email) => {
    try {
      const token = localStorage.getItem('token') // Get token from localStorage
      const response = await axios.patch(
        `${process.env.REACT_APP_REQUEST_SERVICE_URL}/update-status`,
        {
          requestId,
          newStatus,
          requestee_email
        },
        {
          headers: { Authorization: `Bearer ${token}` } // Send token in Authorization header
        }
      )
      setAlert({ type: 'success', message: response.data.message })
      closeModal()
      fetchRequests() // Refresh the list after status update
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.error || 'Failed to update status'
      })
    }
  }

  // Function to fetch requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token') // Retrieve token from localStorage
      if (!token) {
        console.error('No token found, redirecting to login...')
        window.location.href = '/'
        return
      }

      const response = await axios.get(
        `${process.env.REACT_APP_REQUEST_SERVICE_URL}/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}` // Pass the token in Authorization header
          }
        }
      )
      setRequests(response.data)
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.error || 'Error fetching requests'
      })
    }
  }

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.REACT_APP_USER_URL}/user`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setUser(response.data)
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.error || 'Error fetching user data'
      })
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchUserData()
    fetchRequests()
  }, [])

  return (
    <div>
      <Navigationbar />
      <Container
        fluid
        className='d-flex align-items-center justify-content-center'
        style={{ padding: '60px' }}
      >
        <div className='p-4 shadow-lg rounded table-wrapper'>
          <h2 className='text-center mb-4' style={{ color: '#007bff' }}>
            Request List
          </h2>

          {alert.message && (
            <Alert
              variant={alert.type}
              onClose={() => setAlert({ type: '', message: '' })}
              dismissible
            >
              {alert.message}
            </Alert>
          )}

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>S/R</th>
                <th>Title</th>
                <th>Description</th>
                <th>Type</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, i) => (
                <tr key={request.id}>
                  <td>{i + 1}</td>
                  <td>{request.title}</td>
                  <td>{request.description}</td>
                  <td>{request.type}</td>
                  <td>{request.urgency}</td>
                  <td>
                    <Badge
                      bg={
                        request.status.toLowerCase() === 'approved'
                          ? 'success'
                          : request.status.toLowerCase() === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    {user?.email === request.superior_email ? (
                      <Button
                        variant='primary'
                        onClick={() => openModal(request)}
                      >
                        Approve/Reject
                      </Button>
                    ) : (
                      <p className='mb-0' style={{ color: '#007bff' }}>
                        No Actions Available
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>

      {/* Modal for Approve/Reject actions */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Request Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to update the status of "
            {selectedRequest?.title}"?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='success'
            onClick={() =>
              updateStatus(
                selectedRequest.id,
                'approved',
                selectedRequest.user_email
              )
            }
          >
            Approve
          </Button>
          <Button
            variant='danger'
            onClick={() =>
              updateStatus(
                selectedRequest.id,
                'rejected',
                selectedRequest.user_email
              )
            }
          >
            Reject
          </Button>
          <Button variant='secondary' onClick={closeModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default RequestList
