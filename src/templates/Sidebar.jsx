import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Offcanvas, Button, Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useScreenTime } from '../context/ScreenTimeContext';
import { updateUserData } from '../api/firebaseUser';
import AmountBox from '../components/AmountBox';

function Sidebar() {
  const { user, dispatch } = useAuth();
  const { totalScreenTime, pendingScreenTime } = useScreenTime();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [backgroundColor, setBackgroundColor] = useState(
    user?.backgroundColor || localStorage.getItem('backgroundColor') || '#ffffff'
  );
  const [backgroundImage, setBackgroundImage] = useState(
    user?.backgroundImage || localStorage.getItem('backgroundImage') || ''
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBackgroundImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('backgroundImage', backgroundImage);
    if (user?.uid && user?.token) {
      await updateUserData(user.uid, { backgroundColor, backgroundImage }, user.token);
      dispatch({ type: 'UPDATE_BACKGROUND', payload: { backgroundColor, backgroundImage } });
    }
  };

  const handleDelete = async () => {
    setBackgroundColor('#ffffff');
    setBackgroundImage('');
    localStorage.removeItem('backgroundColor');
    localStorage.removeItem('backgroundImage');
    if (user?.uid && user?.token) {
      await updateUserData(user.uid, { backgroundColor: '', backgroundImage: '' }, user.token);
      dispatch({ type: 'UPDATE_BACKGROUND', payload: { backgroundColor: '', backgroundImage: '' } });
    }
  };

  return (
    <>
      <Button variant="light" onClick={handleShow} className="m-2">☰ Menu</Button>

      <Offcanvas show={show} onHide={handleClose} backdrop={false} scroll={true} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Family App</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column mb-3">
            {user?.role === 'parent' && (
              <>
                <Nav.Link as={Link} to="/parent">Parent Home</Nav.Link>
                <Nav.Link as={Link} to="/add-child">Add Child</Nav.Link>
                <Nav.Link as={Link} to="/tasks">Manage Tasks</Nav.Link>
                <Nav.Link as={Link} to="/history">View History</Nav.Link>
              </>
            )}
            {user?.role === 'child' && (
              <>
                <Nav.Link as={Link} to="/child">My Tasks</Nav.Link>
                <Nav.Link as={Link} to="/rewards">Rewards</Nav.Link>
              </>
            )}
            {!user?.uid && (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
              </>
            )}
          </Nav>

          {user?.uid && (
            <>
              <hr />
              <div className="mb-3">
                <small className="text-muted">Logged in as</small><br />
                <strong>{user.email}</strong>
              </div>
              <Button variant="outline-danger" size="sm" onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/'); }}>
                Logout
              </Button>
            </>
          )}

          <hr />
          <h6 className="text-muted">Background Settings</h6>
          <div className="mb-2">
            <label className="form-label">Choose Color:</label>
            <input
              type="color"
              className="form-control form-control-color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Upload Image:</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <div className="d-flex gap-2 mb-3">
            <Button size="sm" onClick={handleSave} disabled={!user?.uid}>Save</Button>
            <Button size="sm" variant="outline-danger" onClick={handleDelete}>Delete</Button>
          </div>
          {!user?.uid && (
            <small className="text-muted">Login to save permanently</small>
          )}

          {user?.role === 'child' && (
            <div className="mt-4">
              <AmountBox label="Total Time" time={totalScreenTime} />
              <AmountBox label="Pending Time" time={pendingScreenTime} />
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Sidebar;
