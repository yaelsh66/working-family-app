import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ColorSchemesExample() {
    
  const { user, dispatch } = useAuth();
  const navigate = useNavigate();
  

  const isDisabled = !user;
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">Home</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/parent">Parent</Nav.Link>
          <Nav.Link href="/child">Child</Nav.Link>
          <Nav.Link href="/newtask">New Task</Nav.Link>
          <Nav.Link href="/tastsList">Tasks</Nav.Link>

          <Nav.Link href='/signup'>Signup</Nav.Link>
          {!user && <Nav.Link href="/login">Login</Nav.Link>}
        </Nav>
        
        {user && (
          <div className="d-flex align-items-center text-white gap-3">
            <span>{user.email}</span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </Container>
    </Navbar>
  );
}

export default ColorSchemesExample;
