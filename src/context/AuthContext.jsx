import { createContext, useReducer, useContext, useEffect } from 'react';
import { refreshIdToken } from '../api/firebaseAuth'; // 🆕 import refresh logic

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { user: action.payload, loading: false };

    case 'LOGOUT':
      localStorage.removeItem('user');
      return { user: null, loading: false };

    case 'SET_LOADING':
      return { ...state, loading: true };

    // 🆕 NEW: handle refreshed token
    case 'REFRESH':
      const updatedUser = {
        ...state.user,
        token: action.payload.idToken,
        refreshToken: action.payload.refreshToken,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser)); // keep in sync
      return { user: updatedUser, loading: false };

    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🔁 Refresh token every 55 mins
  useEffect(() => {
    const interval = setInterval(async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.refreshToken) return;

      try {
        const refreshed = await refreshIdToken(storedUser.refreshToken);
        dispatch({
          type: 'REFRESH',
          payload: {
            idToken: refreshed.id_token,
            refreshToken: refreshed.refresh_token,
          },
        });
      } catch (err) {
        console.error('🔁 Failed to refresh token:', err);
      }
    }, 55 * 60 * 1000); // every 55 mins

    return () => clearInterval(interval);
  }, []);

  // 🔐 Load user from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.uid && parsedUser?.email) {
          dispatch({ type: 'LOGIN', payload: parsedUser });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
