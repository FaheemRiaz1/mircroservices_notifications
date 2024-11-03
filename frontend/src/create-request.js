import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, Button, Form, Alert } from 'react-bootstrap'
import Navigationbar from './navbar'
import { useNavigate } from 'react-router-dom'

const CreateRequest = () => {
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' }) // Alert state
  const navigate = useNavigate() // Initialize navigate for redirection
  const [errors, setErrors] = useState({})
  const [user, setUser] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    urgency: '',
    superior_email: '',
    user_email: '' // Set by backend based on token
  })

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('No token found, redirecting to login...')
          window.location.href = '/'
          return
        }

        const response = await axios.get('http://localhost:3001/user', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data) // Save user data to state
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  // Validate form fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.title) newErrors.title = 'Title is required'
    if (!formData.description) newErrors.description = 'Description is required'
    if (!formData.type) newErrors.type = 'Type is required'
    if (!formData.urgency) newErrors.urgency = 'Urgency is required'
    if (
      !formData.superior_email ||
      !/\S+@\S+\.\S+/.test(formData.superior_email)
    ) {
      newErrors.superior_email = 'A valid superior email is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    if (validateForm()) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(
          'http://localhost:3002/create-request',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        console.log('Request created successfully:', response.data)
        showAlert('success', 'Form submitted successfully!')
        navigate('/request-list') // Redirect to Request List page
      } catch (error) {
        console.error('Error creating request:', error)
        const errorMessage =
          error.response?.data?.error || 'Error creating request.'
        showAlert('danger', errorMessage) // Show exact error from server
      }
    } else {
      showAlert('danger', 'Form submission failed due to validation errors.')
    }
  }
  // Function to show alert
  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message })
    // Hide alert after 03 seconds
    setTimeout(() => {
      setAlert({ show: false, variant: '', message: '' })
    }, 3000)
  }

  return (
    <div>
      <Navigationbar />
      <Container
        fluid
        className='d-flex align-items-center justify-content-center create-request-div vh-100'
      >
        <div
          className='p-4 shadow-lg rounded'
          style={{ width: '100%', backgroundColor: '#f9f9f9' }}
        >
          {alert.show && ( // Conditionally render Alert based on state
            <Alert
              variant={alert.variant}
              onClose={() => setAlert({ show: false })}
              dismissible
            >
              {alert.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <h3 className='text-center mb-4' style={{ color: '#007bff' }}>
              Submit Request
            </h3>

            <Form.Group controlId='formTitle' className='mb-3'>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter request title'
                name='title'
                value={formData.title}
                onChange={handleChange}
                isInvalid={!!errors.title}
                className='form-control-sm'
              />
              <Form.Control.Feedback type='invalid'>
                {errors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='formDescription' className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={2}
                placeholder='Enter request description'
                name='description'
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!errors.description}
                className='form-control-sm'
              />
              <Form.Control.Feedback type='invalid'>
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='formType' className='mb-3'>
              <Form.Label>Type of Request</Form.Label>
              <Form.Select
                name='type'
                value={formData.type}
                onChange={handleChange}
                isInvalid={!!errors.type}
                className='form-control-sm'
              >
                <option value=''>Select Type</option>
                <option value='Leave'>Leave</option>
                <option value='Equipment'>Equipment</option>
                <option value='Overtime'>Overtime</option>
              </Form.Select>
              <Form.Control.Feedback type='invalid'>
                {errors.type}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='formUrgency' className='mb-3'>
              <Form.Label>Urgency</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter urgency level'
                name='urgency'
                value={formData.urgency}
                onChange={handleChange}
                isInvalid={!!errors.urgency}
                className='form-control-sm'
              />
              <Form.Control.Feedback type='invalid'>
                {errors.urgency}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='formSuperiorEmail' className='mb-3'>
              <Form.Label>Superior Email</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter superior email'
                name='superior_email'
                value={formData.superior_email}
                onChange={handleChange}
                isInvalid={!!errors.superior_email}
                className='form-control-sm'
              />
              <Form.Control.Feedback type='invalid'>
                {errors.superior_email}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant='primary' type='submit' className='w-100 btn-sm'>
              Submit Request
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  )
}

export default CreateRequest
