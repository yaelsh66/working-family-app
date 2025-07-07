// src/pages/ChildHomePage.jsx
import  '../../App.css';
import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AmountBox from '../../components/AmountBox';

import { withdrawTime } from '../../api/firebaseTasks';
import { useScreenTime } from '../../context/ScreenTimeContext';

function ChildHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { totalScreenTime, pendingScreenTime} = useScreenTime();

  const handleGoToTasks = () => {
    navigate('/child/tasks');
  };

  const handleWithdraw = async () => {
  const input = prompt('How many minutes would you like to withdraw?');

  const minutes = parseFloat(input);
  if (isNaN(minutes) || minutes <= 0) {
    alert('Please enter a valid number greater than 0');
    return;
  }

  if (minutes > totalScreenTime) {
    alert('You cannot withdraw more than your total time.');
    return;
  }

  try {
    await withdrawTime(user.uid, minutes, user.token);
    alert(`✅ You successfully withdrew ${minutes} minutes.`);
    window.location.reload(); 
  } catch (err) {
    console.error(err);
    alert('❌ Withdrawal failed.');
  }
};


  return (
    <div style={{ backgroundColor: '#f57c00', minHeight: '100vh', paddingTop: '50px' }}>
      <Container className="text-center">
        <h2 className="mb-4">Hi 👦 {user?.email}</h2>

        <Button className="btn-orange" size="lg" onClick={handleGoToTasks}>
          Go to My Tasks
        </Button>


        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <AmountBox label="💰 Total Time" time={totalScreenTime} />
            <Button
              className="btn btn-danger mt-2"
              onClick={() => handleWithdraw()}
              disabled={totalScreenTime <= 0}
            >
              Withdraw Time
            </Button>
          </Col>
          <Col md={2}>
            <AmountBox label="💰 Pending Time" time={pendingScreenTime} />
          </Col>
        </Row>
        
      </Container>
    </div>
  );
}

export default ChildHomePage;
