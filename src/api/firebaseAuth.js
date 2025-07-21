import axios from 'axios';


const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const BASE_URL = `https://identitytoolkit.googleapis.com/v1`;
const PROJECT_ID = 'family-c56e3';

// 🌐 Sign in existing user
export const signInWithEmailAndPassword = async (email, password) => {
  const url = `${BASE_URL}/accounts:signInWithPassword?key=${API_KEY}`;
  const payload = {
    email,
    password,
    returnSecureToken: true,
  };

  try {
    const response = await axios.post(url, payload, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error("❌ Sign-in failed:", error.response?.data || error.message);
    throw error;
  }
};

// 🆕 Sign up new user
export const signUpWithEmailAndPassword = async (email, password) => {
  const url = `${BASE_URL}/accounts:signUp?key=${API_KEY}`;
  const payload = {
    email,
    password,
    returnSecureToken: true,
  };

  try {
    const response = await axios.post(url, payload, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error("❌ Sign-up failed:", error.response?.data || error.message);
    throw error;
  }
};

// 🔁 Refresh ID token
export const refreshIdToken = async (refreshToken) => {
  const url = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;
  const payload = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };

  try {
    const response = await axios.post(url, payload, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.data || error.message);
    throw error;
  }
};

// 🏠 Create Firestore document for the new user
export const createUserDoc = async (uid, idToken, role, familyId, email) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`;

  const payload = {
    fields: {
      role: { stringValue: role },
      familyId: { stringValue: familyId },
      email: { stringValue: email },
      whatsAppNumber: { stringValue: '' },
      backgroundImage: { stringValue: '' },
      backgroundColor: { stringValue: '' },
      totalTime: { doubleValue: 0 },
      pendingTime: { doubleValue: 0 },
      nickname: { stringValue: '' },
      avatarUrl: { stringValue: '' },
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Creating user doc failed:", error.response?.data || error.message);
    throw error;
  }
};
