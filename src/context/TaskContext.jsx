// src/context/TaskContext.js
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as firebaseTasks from '../api/firebaseTasks';
import { useAuth } from './AuthContext';

export const TaskContext = createContext();

const initialState = {
  assignedTasks: [],
  availableTasks: [],
  allFamilyTasks: [],
  loading: false,
  error: null,
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, ...action.payload, loading: false, error: null };
    case 'LOADING':
      return { ...state, loading: true };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async () => {
    if (!user?.token || !user?.familyId || !user?.uid) return;

    dispatch({ type: 'LOADING' });
    try {
      const [allTasks, myTasks] = await Promise.all([
        firebaseTasks.getTasksForFamily(user.familyId, user.token),
        firebaseTasks.getTasksForChild(user.uid, user.familyId, user.token)
      ]);

      const assignedIds = new Set(myTasks.map((t) => t.id));
      const unassigned = allTasks.filter((t) => !assignedIds.has(t.id));

      dispatch({
        type: 'SET_TASKS',
        payload: {
          assignedTasks: myTasks,
          availableTasks: unassigned,
          allFamilyTasks: allTasks,
        },
      });
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      dispatch({ type: 'ERROR', payload: 'Failed to load tasks' });
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  const reassignTask = async (taskId, newAssignedTo) => {
    try {
      await firebaseTasks.updateTaskAssignment(taskId, newAssignedTo, user.token);
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update assignment:', err);
    }
  };

  const reassignTaskOptimistic = async (taskId, newAssignedTo, moveInfo) => {
    // 1. Optimistically update UI
    dispatch({
      type: 'SET_TASKS',
      payload: {
        assignedTasks: moveInfo.newAssigned,
        availableTasks: moveInfo.newAvailable,
        allFamilyTasks: [...moveInfo.newAssigned, ...moveInfo.newAvailable],
      },
    });

    // 2. Firestore update in background
    try {
      await firebaseTasks.updateTaskAssignment(taskId, newAssignedTo, user.token);
    } catch (err) {
      console.error('Failed to update assignment:', err);
      // Optionally revert or refetch
      fetchTasks();
    }
  };

  const value = {
    ...state,
    refreshTasks: fetchTasks,
    reassignTask,
    reassignTaskOptimistic,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => useContext(TaskContext);
