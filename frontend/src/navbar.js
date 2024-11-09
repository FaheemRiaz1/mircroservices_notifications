import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Navigationbar = () => {
  // Call the logout function
  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // Call the backend logout endpoint to invalidate the token
        await axios.post(
          `${process.env.REACT_APP_AUTH_SERVICE_URL}/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        // Remove the token from localStorage
        localStorage.removeItem('token')

        // Redirect to the login page
        window.location.href = '/'
      } catch (error) {
        console.error('Error logging out:', error)
        alert('Logout failed. Please try again.')
      }
    } else {
      // If no token is present, just redirect to login
      window.location.href = '/'
    }
  }

  return (
    <Navbar bg='dark' variant='dark' expand='lg' className='shadow'>
      <Container>
        <Navbar.Brand
          as={Link}
          to={`/dashboard`}
          className='fw-bold text-uppercase'
        >
          Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ms-auto'>
            <Nav.Link as={Link} to={`/submit-request`} className='mx-2'>
              Submit Request
            </Nav.Link>
            <Nav.Link as={Link} to={`/request-list`} className='mx-2'>
              Request List
            </Nav.Link>
          </Nav>
          <Button variant='outline-light' onClick={handleLogout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
export default Navigationbar
