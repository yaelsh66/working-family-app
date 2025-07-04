import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getUserData, updateChildTime } from '../api/firebaseUser';

const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
  const { user } = useAuth();

  const [totalTime, setTotalTime] = useState(0);     // Time the child has earned
  const [pendingTime, setPendingTime] = useState(0); // Time waiting for approval
  const [loading, setLoading] = useState(true);

  // Load times from Firestore when user logs in
  useEffect(() => {
    const fetchTime = async () => {
      if (user?.uid && user?.token) {
        try {
          const data = await getUserData(user.uid, user.token);

          const total = parseFloat(data.totalTime?.doubleValue || data.totalTime?.integerValue || 0);
          const pending = parseFloat(data.pendingTime?.doubleValue || data.pendingTime?.integerValue || 0);

          setTotalTime(total);
          setPendingTime(pending);
        } catch (err) {
          console.error('❌ Failed to load time values:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTime();
  }, [user]);

  // 🧠 Save both times to Firestore
  const updateTimeInFirestore = async (newTotal, newPending) => {
    if (!user?.uid || !user?.token) return;

    try {
      await updateChildTime(user.uid, newTotal, newPending, user.token);
    } catch (err) {
      console.error('❌ Failed to update Firestore:', err);
    }
  };

  // ✅ Add minutes to pending time (e.g. child completes a task)
  const addToPendingTime = async (minutes) => {
    const newPending = pendingTime + minutes;
    setPendingTime(newPending);
    await updateTimeInFirestore(totalTime, newPending);
  };

  // ✅ Approve all pending time and add to total (e.g. parent approves)
  const approvePendingTime = async () => {
    const newTotal = totalTime + pendingTime;
    setTotalTime(newTotal);
    setPendingTime(0);
    await updateTimeInFirestore(newTotal, 0);
  };

  return (
    <TimeContext.Provider
      value={{
        totalTime,
        pendingTime,
        loading,
        addToPendingTime,
        approvePendingTime,
      }}
    >
      {children}
    </TimeContext.Provider>
  );
};

// 👇 Hook to use the time context
export const useTime = () => useContext(TimeContext);
