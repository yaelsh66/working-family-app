import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Add Link
import { useAuth } from '../context/AuthContext';

function ColorSchemesExample() {
  const { user, dispatch } = useAuth();
  const navigate = useNavigate();

  const isDisabled = !user;
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const getHomeLink = () => {
    if (!user) return '/';
    if (user.role === 'parent') return '/parent';
    if (user.role === 'child') return '/child';
    return '/';
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to={getHomeLink()}>Home</Navbar.Brand> {/* ✅ Use Link */}
        <Nav className="me-auto">
          {user && (
            <>
              <Nav.Link as={Link} to="/newtask">New Task</Nav.Link> {/* ✅ */}
              <Nav.Link as={Link} to="/tastsList">Tasks</Nav.Link>   {/* ✅ */}
            </>
          )}
          {!user && (
            <>
              <Nav.Link as={Link} to="/signup">Signup</Nav.Link>    {/* ✅ */}
              <Nav.Link as={Link} to="/login">Login</Nav.Link>      {/* ✅ */}
            </>
          )}
        </Nav>

        {user && (
          <div className="d-flex align-items-center text-white gap-3">
            <span>
              👋 Hi, {user.nickname || user.email}
            </span>

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
