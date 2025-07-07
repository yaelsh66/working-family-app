import axios from 'axios';

const API_KEY = ''; 
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

  const response = await axios.post(url, payload);
  return response.data; // → { idToken, localId, email, ... }
};

// 🆕 Sign up new user
export const signUpWithEmailAndPassword = async (email, password) => {
  const url = `${BASE_URL}/accounts:signUp?key=${API_KEY}`;
  const payload = {
    email,
    password,
    returnSecureToken: true,
  };

  const response = await axios.post(url, payload);
  return response.data;
};

export const refreshIdToken = async (refreshToken) => {
  const url = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;
  const payload = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };

  const response = await axios.post(url, payload);
  return response.data; // includes id_token, refresh_token, etc.
};

// 🏠 Create Firestore document for the new user
export const createUserDoc = async (uid, idToken, role, familyId) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`;

  const payload = {
    fields: {
      role: { stringValue: role },                // 'parent' or 'child'
      familyId: { stringValue: familyId },        // shared family ID
      totalTime: { doubleValue: 0 },              // ⏱ approved time
      pendingTime: { doubleValue: 0 }             // ⏱ submitted, not yet approved
    },
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
};
