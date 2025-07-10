// src/pages/ChildTasksPage.jsx
import React, { useContext, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import TaskDraggable from '../components/TaskDraggable';
import AmountBox from '../components/AmountBox';
import { useScreenTime } from '../context/ScreenTimeContext';
import { useTaskContext } from '../context/TaskContext';


function ChildTasksPage() {
  const { user, loading } = useAuth();
  const {
    assignedTasks,
    availableTasks,
    reassignTask,
    reassignTaskOptimistic,
  } = useTaskContext();
  const { addToPendingScreenTime } = useScreenTime();
  const [error, setError] = useState('');

  const assignedTotal = assignedTasks.reduce((sum, task) => sum + (task.time || 0), 0);

  const onDragEnd = async (result) => {
  const { source, destination } = result;
  if (!destination) return;

  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  const assignedClone = [...assignedTasks];
  const availableClone = [...availableTasks];

  const sourceList =
    source.droppableId === 'assigned' ? assignedClone : availableClone;
  const destList =
    destination.droppableId === 'assigned' ? assignedClone : availableClone;

  const [movedTask] = sourceList.splice(source.index, 1);
  destList.splice(destination.index, 0, movedTask);

  const newAssignedTo =
    destination.droppableId === 'assigned'
      ? [...(movedTask.assignedTo || []), user.uid]
      : (movedTask.assignedTo || []).filter((uid) => uid !== user.uid);

  try {
    await reassignTaskOptimistic(movedTask.id, newAssignedTo, {
      newAssigned: assignedClone,
      newAvailable: availableClone,
    });
  } catch (err) {
    console.error('Failed to update assignment:', err);
    setError('Failed to update task assignment.');
  }
};

  const handleComplete = async (task) => {
    try {
      const completionRecord = {
        fields: {
          taskId: { stringValue: task.id },
          title: { stringValue: task.title },
          completedAt: { timestampValue: new Date().toISOString() },
          time: {
            doubleValue: typeof task.time === 'number' ? task.time : parseFloat(task.time) || 0,
          },
          childId: { stringValue: user.uid },
          familyId: { stringValue: user.familyId },
          approved: { booleanValue: false },
        },
      };

      await fetch(
        `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completionRecord),
        }
      );

      const newAssignedTo = (task.assignedTo || []).filter((uid) => uid !== user.uid);
      await reassignTask(task.id, newAssignedTo);
      await addToPendingScreenTime(task.time);

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
                    <TaskDraggable
                      key={task.id}
                      task={task}
                      index={idx}
                      isAssigned={true}
                      onComplete={handleComplete}
                    />
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
                    <TaskDraggable
                      key={task.id}
                      task={task}
                      index={idx}
                      isAssigned={false}
                    />
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
