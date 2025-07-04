// src/pages/ChildHomePage.jsx
import  '../../App.css';
import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AmountBox from '../../components/AmountBox';

function ChildHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoToTasks = () => {
    navigate('/child/tasks');
  };

  const mockTotalAmount = 42; // 🔁 Replace with real value when ready

  return (
    <div style={{ backgroundColor: '#f57c00', minHeight: '100vh', paddingTop: '50px' }}>
      <Container className="text-center">
        <h2 className="mb-4">Hi 👦 {user?.email}</h2>

        <Button className="btn-orange" size="lg" onClick={handleGoToTasks}>
          Go to My Tasks
        </Button>


        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <AmountBox label="💰 Total Earned" amount={mockTotalAmount} />
          </Col>
        </Row>
        
      </Container>
    </div>
  );
}

export default ChildHomePage;
