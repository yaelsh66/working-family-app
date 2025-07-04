// src/pages/ChildPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { updateTaskAssignment, getTasksForChild, getTasksForFamily  } from '../api/firebaseTasks';

import TaskDraggable from '../components/TaskDraggable';
import AmountBox from '../components/AmountBox';

function ChildTasksPage() {
  const { user, loading } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [error, setError] = useState('');

  const assignedTotal = assignedTasks.reduce((sum, task) => sum + (task.time || 0), 0);



  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const allTasks = await getTasksForFamily(user.familyId, user.token);
        const myTasks = await getTasksForChild(user.uid, user.familyId, user.token);

        const assignedIds = new Set(myTasks.map(t => t.id));
        const unassigned = allTasks.filter(t => !assignedIds.has(t.id));

        setAssignedTasks(myTasks);
        setAvailableTasks(unassigned);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Could not load tasks.');
      }
    };

    fetchData();
  }, [user]);

 const onDragEnd = async (result) => {
  const { source, destination } = result;
  if (!destination) return;

  // 🛑 Dropped in the same spot
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  // Clone both lists so we don't mutate state directly
  const assignedClone = [...assignedTasks];
  const availableClone = [...availableTasks];

  // Determine which lists we're moving from/to
  const sourceList =
    source.droppableId === 'assigned' ? assignedClone : availableClone;
  const destList =
    destination.droppableId === 'assigned' ? assignedClone : availableClone;

  const [movedTask] = sourceList.splice(source.index, 1);
  destList.splice(destination.index, 0, movedTask);

  // Update state
  if (source.droppableId === 'assigned') {
    setAssignedTasks(sourceList);
  } else {
    setAvailableTasks(sourceList);
  }

  if (destination.droppableId === 'assigned') {
    setAssignedTasks(destList);
  } else {
    setAvailableTasks(destList);
  }

  // Firestore update
  const newAssignedTo =
    destination.droppableId === 'assigned'
      ? [...(movedTask.assignedTo || []), user.uid]
      : (movedTask.assignedTo || []).filter((uid) => uid !== user.uid);

  try {
    await updateTaskAssignment(movedTask.id, newAssignedTo, user.token);
  } catch (err) {
    console.error('Failed to update task:', err);
  }
};

const handleComplete = async (task) => {
  try {
    // 1. Create the completion record payload
    const completionRecord = {
      fields: {
        taskId: { stringValue: task.id },
        title: { stringValue: task.title },
        completedAt: { timestampValue: new Date().toISOString() },
        time: {
          doubleValue:
            typeof task.time === 'number'
              ? task.time
              : parseFloat(task.time) || 0,
        },
        childId: { stringValue: user.uid },
        familyId: { stringValue: user.familyId },
        approved: { booleanValue: false }
      },
    };

    // 2. Save the completion record
    await fetch(
      `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completionRecord),
      }
    );

    // 3. Remove child from assignedTo array in the task document in Firestore
    // This is your existing updateTaskAssignment function (or implement here)
    const newAssignedTo = (task.assignedTo || []).filter(uid => uid !== user.uid);
    await updateTaskAssignment(task.id, newAssignedTo, user.token);

    // 4. Update child's pendingTime in their user document
    // Fetch current pendingTime (you may have it cached, else fetch from Firestore)
    const userDocUrl = `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/users/${user.uid}`;
    
    // Get current user doc
    const userRes = await fetch(userDocUrl, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const userData = await userRes.json();
    const currentPendingTime = userData.fields?.pendingTime?.integerValue
      ? parseInt(userData.fields.pendingTime.integerValue)
      : 0;

    // Update pendingTime
    const updatedPendingTime = currentPendingTime + (typeof task.time === 'number' ? task.time : parseFloat(task.time) || 0);

    const updatePayload = {
      fields: {
        pendingTime: { integerValue: updatedPendingTime.toString() }
      }
    };

    await fetch(userDocUrl + '?updateMask.fieldPaths=pendingTime', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload),
    });

    // 5. Remove task locally from assignedTasks state so UI updates
    setAssignedTasks((prev) => prev.filter((t) => t.id !== task.id));

    // 6. Notify user
    alert(`✅ Task "${task.title}" marked as completed! Waiting for approval.`);
  } catch (error) {
    console.error('Failed to mark task as completed:', error);
    alert('❌ Failed to complete task. Try again later.');
  }
};




  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">🚫 Please log in.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">👦 {user.email}'s Tasks</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <DragDropContext onDragEnd={onDragEnd}>
        <Row>
          <Col md={6}>
            <h4>Assigned Tasks</h4>
            <Droppable droppableId="assigned">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {assignedTasks.map((task, idx) => (
                    <TaskDraggable key={task.id} task={task} index={idx} isAssigned={true} onComplete={handleComplete} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Col>

          <Col md={6}>
            <h4>Available Tasks</h4>
            <Droppable droppableId="available">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {availableTasks.map((task, idx) => (
                    <TaskDraggable key={task.id} task={task} index={idx} isAssigned={false} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Col>
        </Row>
      </DragDropContext>
      

<AmountBox
  label="Future Potential"
  time={assignedTotal}
  variant="info"
  size="large"
  icon="💡"
/>
    </Container>
  );
}

export default ChildTasksPage;
