import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateChildTime } from '../api/firebaseUser';

const ScreenTimeContext = createContext();

const initialState = {
  totalScreenTime: 0,
  pendingScreenTime: 0,
  loading: true,
};

function screenTimeReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        totalScreenTime: action.payload.totalScreenTime,
        pendingScreenTime: action.payload.pendingScreenTime,
        loading: false,
      };
    case 'ADD_PENDING':
      return {
        ...state,
        pendingScreenTime: state.pendingScreenTime + action.payload,
      };
    case 'APPROVE_PENDING':
      return {
        ...state,
        totalScreenTime: state.totalScreenTime + state.pendingScreenTime,
        pendingScreenTime: 0,
      };
    default:
      return state;
  }
}

export const ScreenTimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(screenTimeReducer, initialState);

  // ✅ Load screen time once, from login data
  useEffect(() => {
    if (user && !state.loading) return; // Already initialized
    if (user?.totalTime !== undefined && user?.pendingTime !== undefined) {
      dispatch({
        type: 'INIT',
        payload: {
          totalScreenTime: parseFloat(user.totalTime),
          pendingScreenTime: parseFloat(user.pendingTime),
        },
      });
    }
  }, [user]);

  // 🔁 Save to Firestore
  const updateScreenTimeInFirestore = async (newTotal, newPending) => {
    if (!user?.uid || !user?.token) return;

    try {
      await updateChildTime(user.uid, newTotal, newPending, user.token);
    } catch (err) {
      console.error('❌ Failed to update Firestore:', err);
    }
  };

  // Add to pending screen time (child completes a task)
  const addToPendingScreenTime = async (minutes) => {
    const newPending = state.pendingScreenTime + minutes;
    dispatch({ type: 'ADD_PENDING', payload: minutes });
    await updateScreenTimeInFirestore(state.totalScreenTime, newPending);
  };

  // Approve screen time (parent approves tasks)
  const approvePendingScreenTime = async () => {
    const newTotal = state.totalScreenTime + state.pendingScreenTime;
    dispatch({ type: 'APPROVE_PENDING' });
    await updateScreenTimeInFirestore(newTotal, 0);
  };

  return (
    <ScreenTimeContext.Provider
      value={{
        totalScreenTime: state.totalScreenTime,
        pendingScreenTime: state.pendingScreenTime,
        loading: state.loading,
        addToPendingScreenTime,
        approvePendingScreenTime,
      }}
    >
      {children}
    </ScreenTimeContext.Provider>
  );
};

export const useScreenTime = () => useContext(ScreenTimeContext);
