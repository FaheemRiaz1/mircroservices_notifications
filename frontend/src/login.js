import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()

  // Check if there is a token in the URL after Google login redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      // Store the token in localStorage for future requests
      localStorage.setItem('token', token)

      // Clear the URL params
      window.history.replaceState({}, document.title, '/dashboard')

      // Redirect to dashboard or another page
      navigate('/dashboard')
    }
  }, [navigate])

  // Function to initiate Google login
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google'
  }

  // Typewriter Effect Component
  const Typewriter = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [index, setIndex] = useState(0)

    useEffect(() => {
      if (index < text.length) {
        const timeoutId = setTimeout(() => {
          setDisplayedText(prev => prev + text[index])
          setIndex(index + 1)
        }, 100) // Adjust the delay for typing speed

        return () => clearTimeout(timeoutId)
      }
    }, [index, text])

    return (
      <div className='typewriter-container'>
        <span className='typewriter-text'>{displayedText}</span>
        <span className='caret'>|</span> {/* Blinking caret */}
      </div>
    )
  }

  return (
    <Container
      fluid
      className='login-main-div container-fluid vh-100 d-flex flex-column justify-content-center align-items-center'
    >
      <Row>
        <Col>
          <div className='inner-div'>
            <Typewriter text='Welcome to my Microservices Challenge project!' />
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button className='google-btn' onClick={handleLogin}>
            <img
              src='https://img.icons8.com/color/48/000000/google-logo.png'
              alt='Google Logo'
            />
            <span>Continue with Google</span>
          </Button>
        </Col>
      </Row>
    </Container>
  )
}

export default Login
