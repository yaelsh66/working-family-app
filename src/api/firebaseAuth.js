import axios from 'axios';

const API_KEY = ''; // 👈 replace with your real API key

const BASE_URL = `https://identitytoolkit.googleapis.com/v1`;

const PROJECT_ID = 'family-c56e3';

const FIREBASE_DB_URL = "https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents";

export const updateChildTime = async (childId, totalTime, pendingTime, idToken) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${childId}?updateMask.fieldPaths=totalAmount&updateMask.fieldPaths=pendingAmount`;

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
    console.error('❌ Failed to update child amounts:', err.response?.data || err.message);
    throw err;
  }
};

export const getTasksForChild = async (childId, familyId, idToken) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'tasks' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'assignedTo' },
                op: 'ARRAY_CONTAINS',
                value: { stringValue: childId },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'familyId' },
                op: 'EQUAL',
                value: { stringValue: familyId },
              },
            },
          ],
        },
      },
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data
      .filter((res) => res.document)
      .map((res) => {
        const fields = res.document.fields;
        return {
          id: res.document.name.split('/').pop(), // <-- id extracted here
          title: fields.title?.stringValue || '',
          description: fields.description?.stringValue || '',
          amount:
            fields.amount?.doubleValue !== undefined
              ? parseFloat(fields.amount.doubleValue)
              : parseFloat(fields.amount?.integerValue || '0'),
          familyId: fields.familyId?.stringValue,
          createdBy: fields.createdBy?.stringValue,
          assignedTo: fields.assignedTo?.arrayValue?.values?.map(v => v.stringValue) || [],
          createdAt: fields.createdAt?.timestampValue || '',
        };
      });
  } catch (error) {
    console.error('Failed to fetch tasks for child:', error.response?.data || error.message);
    throw error;
  }
};


export const getTasksForFamily = async (familyId, idToken) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'tasks' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'familyId' },
          op: 'EQUAL',
          value: { stringValue: familyId },
        },
      },
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data
      .filter((res) => res.document)
      .map((res) => {
        const fields = res.document.fields;
        return {
          id: res.document.name.split('/').pop(), // <-- add id extraction here
          title: fields.title?.stringValue || '',
          description: fields.description?.stringValue || '',
          amount:
            fields.amount?.doubleValue !== undefined
              ? parseFloat(fields.amount.doubleValue)
              : parseFloat(fields.amount?.integerValue || '0'),
          familyId: fields.familyId?.stringValue,
          createdBy: fields.createdBy?.stringValue,
          createdAt: fields.createdAt?.timestampValue || '',
        };
      });
  } catch (err) {
    console.error('Failed to fetch tasks:', err.response?.data || err.message);
    throw err;
  }
};



export const addTaskToFirestore = async (task, idToken) => {
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents/tasks`;

  const payload = {
    fields: {
      title:       { stringValue: task.title },
      description: { stringValue: task.description },
      amount:
        Number.isInteger(task.amount)
          ? { integerValue: task.amount }
          : { doubleValue:  task.amount },
      familyId:    { stringValue: task.familyId },
      createdBy:   { stringValue: task.createdBy },
      assignedTo: {
        arrayValue: {
          values: (task.assignedTo || []).map(uid => ({ stringValue: uid }))
        }
      },
      createdAt:   { timestampValue: new Date().toISOString() }   // type once
    }
  };

  const res = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  return res.data;
};


export async function getUserData(uid, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
    // Firestore returns fields in a nested format
    // Example: response.data.fields.role.stringValue
    return response.data.fields;
  } catch (error) {
    console.error('Failed to fetch user data:', error.response?.data || error.message);
    throw error;
  }
}

export const signInWithEmailAndPassword = async (email, password) => {
  const url = `${BASE_URL}/accounts:signInWithPassword?key=${API_KEY}`;
  const payload = {
    email,
    password,
    returnSecureToken: true,
  };

  const response = await axios.post(url, payload);
  return response.data; // contains idToken, localId, etc.
};

export const signUpWithEmailAndPassword = async (email, password) => {
  const url = `${BASE_URL}/accounts:signUp?key=${API_KEY}`;
  const payload = {
    email,
    password,
    returnSecureToken: true,
  };

  const response = await axios.post(url, payload);
  return response.data; // contains localId, idToken, etc.
};

export const createUserDoc = async (uid, idToken, role, familyId) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`;

  const payload = {
    fields: {
      role: { stringValue: role },
      familyId: { stringValue: familyId },
      totalTime: { doubleValue: 0 },        // ✅ initialize with 0
      pendingTime: { doubleValue: 0 }
    },
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
};
