import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import {
  getUsersByFamily,
  getPendingCompletionsForChild,
  approveCompletion,
  rejectCompletion,
} from '../api/firebaseTasks';
import TaskItem from '../components/TaskItem';

function ParentApprovalPage() {
  const { user, loading } = useAuth();
  const [children, setChildren] = useState([]);  // stores children user info including time fields
  const [pendingTasksByChild, setPendingTasksByChild] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    setError('');
    try {
      // Fetch children with fresh totalTime and pendingTime
      const familyChildren = await getUsersByFamily(user.familyId, user.token);
      setChildren(familyChildren);

      // Fetch pending tasks separately, mapped by child uid
      const tasksMap = {};
      await Promise.all(
        familyChildren.map(async (child) => {
          const pending = await getPendingCompletionsForChild(child.uid, user.token);
          tasksMap[child.uid] = pending;  // Just store array of pending tasks
        })
      );
      setPendingTasksByChild(tasksMap);
    } catch (e) {
      setError('Failed to load pending tasks');
      console.error(e);
    }
    setLoadingData(false);
  };

  const handleApproval = async (childId, completionId, time, isApproved) => {
    try {
      if (isApproved) {
        await approveCompletion(completionId, childId, time, user.token);
      } else {
        await rejectCompletion(completionId, childId, time, user.token);
      }
      await fetchData(); // refresh state including fresh user times and tasks
    } catch (err) {
      console.error('Approval error:', err);
      alert('❌ Failed to process task.');
    }
  };

  if (loading || loadingData) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user || user.role !== 'parent') {
    return (
      <Container className="mt-5">
        <Alert variant="warning">🚫 Please log in as a parent to see this page.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>📝 Pending Tasks for Approval</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        {children.map((child) => (
          <Col key={child.uid} md={4} className="mb-4">
            <Card>
              <Card.Header>{child.email || child.uid}</Card.Header>
              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {pendingTasksByChild[child.uid]?.length ? (
                  pendingTasksByChild[child.uid].map((task) => (
                    <div key={task.id} className="mb-3">
                      <TaskItem task={task} />
                      <div className="d-flex justify-content-between mt-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            handleApproval(child.uid, task.id, task.time, true)
                          }
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleApproval(child.uid, task.id, task.time, false)
                          }
                        >
                          ❌ Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No tasks waiting for approval.</p>
                )}
              </Card.Body>
              <Card.Footer>
                {/* Use children state values directly for times */}
                <div>
                  <strong>Total Time:</strong> {child.totalTime || 0} mins
                </div>
                <div>
                  <strong>Pending Time:</strong> {child.pendingTime || 0} mins
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ParentApprovalPage;
