import axios from 'axios';

const PROJECT_ID = 'family-c56e3';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;


// 📥 Get Firestore user document
export const getUserData = async (uid, idToken) => {
  const url = `${BASE_URL}/users/${uid}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data.fields; // returns { role, familyId, totalTime, pendingTime }
  } catch (error) {
    console.error('❌ Failed to fetch user data:', error.response?.data || error.message);
    throw error;
  }
};

// 🔄 Update child's total and pending time
export const updateChildTime = async (childId, totalTime, pendingTime, idToken) => {
  const url = `${BASE_URL}/users/${childId}?updateMask.fieldPaths=totalTime&updateMask.fieldPaths=pendingTime`;

  const payload = {
    fields: {
      totalTime: { doubleValue: totalTime },
      pendingTime: { doubleValue: pendingTime },
    },
  };

  try {
    await axios.patch(url, payload, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch (err) {
    console.error('❌ Failed to update child time:', err.response?.data || err.message);
    throw err;
  }
};

export const updateUserData = async (uid, updates, idToken) => {
  const url = `${BASE_URL}/users/${uid}?${Object.keys(updates)
    .map(key => `updateMask.fieldPaths=${key}`)
    .join('&')}`;

  const fields = {};
  if (updates.backgroundColor !== undefined)
    fields.backgroundColor = { stringValue: updates.backgroundColor };
  if (updates.backgroundImage !== undefined)
    fields.backgroundImage = { stringValue: updates.backgroundImage };
  if (updates.nickname !== undefined)
    fields.nickname = { stringValue: updates.nickname };
  if (updates.avatarUrl !== undefined)
    fields.avatarUrl = { stringValue: updates.avatarUrl };

  const payload = { fields };

  await axios.patch(url, payload, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
};

