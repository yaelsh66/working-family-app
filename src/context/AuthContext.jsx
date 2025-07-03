import { createContext, useReducer, useContext, useEffect } from 'react';

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

    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

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
