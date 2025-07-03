// src/components/TaskDraggable.jsx
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';

function TaskDraggable({ task, index, isAssigned }) {

  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging ? '#e9ecef' : 'white',
            marginBottom: '8px',
            padding: '8px',
            border: '1px solid #dee2e6',
            borderRadius: '0.25rem',
          }}
        >
          <TaskItem 
          task={task} 
           />
        </div>
      )}
    </Draggable>
  );
}

export default TaskDraggable;

