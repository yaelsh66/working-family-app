// src/api/firebaseTasks.js
import axios from 'axios';

const PROJECT_ID = 'family-c56e3';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const QUERY_URL = `${BASE_URL}:runQuery`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });


// src/api/firebaseTasks.js
export const getParentsByFamily = async (familyId, token) => {
  const BASE_URL = 'https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents:runQuery';

  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'familyId' },
                op: 'EQUAL',
                value: { stringValue: familyId },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'role' },
                op: 'EQUAL',
                value: { stringValue: 'parent' },
              },
            },
          ],
        },
      },
    },
  };

  try {
    const response = await axiosInstance.post(BASE_URL, payload, {
      headers: authHeader(token),
    });

    return response.data
      .filter(res => res.document)
      .map(res => {
        const f = res.document.fields;
        return {
          uid: res.document.name.split('/').pop(),
          whatsAppNumber: f.whatsAppNumber?.stringValue || '',
          nickname: f.nickname?.stringValue || '',
          email: f.email?.stringValue || '',
        };
      });
  } catch (error) {
    console.error('Failed to fetch parents:', error);
    throw error;
  }
};

export const getUsersByFamily = async (familyId, token) => {
  const url = `${BASE_URL}:runQuery`;

  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'familyId' },
                op: 'EQUAL',
                value: { stringValue: familyId },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'role' },
                op: 'EQUAL',
                value: { stringValue: 'child' },
              },
            },
          ],
        },
      },
    },
  };

  try {
    const response = await axiosInstance.post(url, payload, {
      headers: authHeader(token),
    });

    return response.data
      .filter((res) => res.document)
      .map((res) => {
        const f = res.document.fields;
        return {
          uid: res.document.name.split('/').pop(),
          email: f.email?.stringValue || '',
          nickname: f.nickname?.stringValue || '',
          role: f.role?.stringValue || '',
          familyId: f.familyId?.stringValue || '',
          totalTime: parseFloat(f.totalTime?.doubleValue || f.totalTime?.integerValue || '0'),
          pendingTime: parseFloat(f.pendingTime?.doubleValue || f.pendingTime?.integerValue || '0'),
          whatsAppNumber: f.whatsAppNumber?.stringValue || '',
        };
      });
  } catch (error) {
    console.error('Failed to fetch children:', error);
    throw error;
  }
};

;

// src/api/firebaseCompletions.js

export const submitCompletion = async (task, user) => {
  const url = `${BASE_URL}/completions`;

  const payload = {
    fields: {
      taskId: { stringValue: task.id },
      title: { stringValue: task.title },
      completedAt: { timestampValue: new Date().toISOString() },
      time: {
        doubleValue: typeof task.time === 'number' ? task.time : parseFloat(task.time) || 0,
      },
      childId: { stringValue: user.uid },
      familyId: { stringValue: user.familyId },
      approved: { booleanValue: false },
    },
  };

  try {
    const response = await axiosInstance.post(url, payload, {
      headers: authHeader(user.token),
    });

    return response.data;
  } catch (error) {
    console.error('Failed to submit completion:', error.response?.data || error.message);
    throw error;
  }
};



export const withdrawTime = async (childId, minutes, token) => {
  try {
    // 1. Fetch current user document
    const userRes = await axiosInstance.get(`/users/${childId}`, {
      headers: authHeader(token),
    });

    const fields = userRes.data.fields || {};
    const currentTotal = parseFloat(fields.totalTime?.doubleValue || fields.totalTime?.integerValue || '0');

    // 2. Calculate new total time (no negative)
    const newTotal = Math.max(0, currentTotal - minutes);

    // 3. PATCH update only the totalTime field
    const patchPayload = {
      fields: {
        totalTime: { doubleValue: newTotal },
      },
    };

    const updateRes = await axiosInstance.patch(`/users/${childId}?updateMask.fieldPaths=totalTime`, patchPayload, {
      headers: authHeader(token),
    });

    return updateRes.data;
  } catch (error) {
    console.error('Failed to withdraw time:', error);
    throw error;
  }
};


// 🔄 Get all tasks for a family
export const getTasksForFamily = async (familyId, token) => {
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

  const res = await axios.post(QUERY_URL, payload, {
    headers: authHeader(token),
  });

  return res.data
    .filter((d) => d.document)
    .map((d) => {
      const f = d.document.fields;
      return {
        id: d.document.name.split('/').pop(),
        title: f.title?.stringValue,
        description: f.description?.stringValue,
        time: parseFloat(f.time?.doubleValue || f.time?.integerValue || '0'),
        createdBy: f.createdBy?.stringValue,
        familyId: f.familyId?.stringValue,
        assignedTo: f.assignedTo?.arrayValue?.values?.map((v) => v.stringValue) || [],
        createdAt: f.createdAt?.timestampValue,
      };
    });
};

// 📥 Get tasks for a child
export const getTasksForChild = async (uid, familyId, token) => {
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
                value: { stringValue: uid },
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

  const res = await axios.post(QUERY_URL, payload, {
    headers: authHeader(token),
  });

  return res.data
    .filter((d) => d.document)
    .map((d) => {
      const f = d.document.fields;
      return {
        id: d.document.name.split('/').pop(),
        title: f.title?.stringValue,
        description: f.description?.stringValue,
        time: parseFloat(f.time?.doubleValue || f.time?.integerValue || '0'),
        createdBy: f.createdBy?.stringValue,
        familyId: f.familyId?.stringValue,
        assignedTo: f.assignedTo?.arrayValue?.values?.map((v) => v.stringValue) || [],
        createdAt: f.createdAt?.timestampValue,
      };
    });
};

// ➕ Add new task task.title, description, time (minutes), assignedTo[]
export const addTaskToFirestore = async (task, token) => {
  const payload = {
    fields: {
      title: { stringValue: task.title },
      description: { stringValue: task.description },
      time: Number.isInteger(task.time)
        ? { integerValue: task.time }
        : { doubleValue: task.time },
      createdBy: { stringValue: task.createdBy },
      familyId: { stringValue: task.familyId },
      assignedTo: {
        arrayValue: {
          values: (task.assignedTo || []).map((uid) => ({ stringValue: uid })),
        },
      },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  const res = await axiosInstance.post(`/tasks`, payload, {
    headers: authHeader(token),
  });
  return res.data;
};


// 🔁 Update task assignments
export const updateTaskAssignment = async (taskId, newAssignedTo, token) => {
  const payload = {
    fields: {
      assignedTo: {
        arrayValue: {
          values: newAssignedTo.map((uid) => ({ stringValue: uid })),
        },
      },
    },
  };

  const res = await axiosInstance.patch(`/tasks/${taskId}?updateMask.fieldPaths=assignedTo`, payload, {
    headers: authHeader(token),
  });

  return res.data;
};

// ✅ Send approval request and increment pendingTime
export const sendApprovalRequest = async (parentId, task, childId, token) => {
  const approvalDocId = `${childId}_${task.id}`;
  const approvalPayload = {
    fields: {
      taskId: { stringValue: task.id },
      title: { stringValue: task.title },
      completedAt: { timestampValue: new Date().toISOString() },
      time: { doubleValue: task.time },
      childId: { stringValue: childId },
      familyId: { stringValue: task.familyId || '' },
      approved: { booleanValue: false },
    },
  };

  // ✅ Write to completions collection
  const approvalRes = await axiosInstance.post(
    `/completions?documentId=${approvalDocId}`,
    approvalPayload,
    {
      headers: authHeader(token),
    }
  );

  // ⏱️ Update child's pendingTime (keep as-is)
  const userRes = await axiosInstance.get(`/users/${childId}`, {
    headers: authHeader(token),
  });

  const currentPending = parseFloat(
    userRes.data.fields?.pendingTime?.doubleValue || 0
  );

  await axiosInstance.patch(
    `/users/${childId}?updateMask.fieldPaths=pendingTime`,
    {
      fields: {
        pendingTime: { doubleValue: currentPending + task.time },
      },
    },
    {
      headers: authHeader(token),
    }
  );

  return approvalRes.data;
};

export const getPendingCompletionsForFamily = async (familyId, token) => {
  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'completions' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'familyId' },
                op: 'EQUAL',
                value: { stringValue: familyId },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'approved' },
                op: 'EQUAL',
                value: { booleanValue: false },
              },
            },
          ],
        },
      },
    },
  };

  const res = await axios.post(QUERY_URL, payload, {
    headers: authHeader(token),
  });

  return res.data
    .filter((d) => d.document)
    .map((d) => {
      const f = d.document.fields;
      return {
        id: d.document.name.split('/').pop(),
        taskId: f.taskId?.stringValue || '',
        title: f.title?.stringValue || '',
        time: parseFloat(f.time?.doubleValue || 0),
        completedAt: f.completedAt?.timestampValue || '',
        childId: f.childId?.stringValue || '',
        familyId: f.familyId?.stringValue || '',
        approved: f.approved?.booleanValue || false,
      };
    });
};

export const getPendingCompletionsForChild = async (childId, token) => {
  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'completions' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'childId' },
                op: 'EQUAL',
                value: { stringValue: childId },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'approved' },
                op: 'EQUAL',
                value: { booleanValue: false },
              },
            },
          ],
        },
      },
    },
  };

  const res = await axios.post(QUERY_URL, payload, {
    headers: authHeader(token),
  });

  return res.data
    .filter((d) => d.document)
    .map((d) => {
      const f = d.document.fields;
      return {
        id: d.document.name.split('/').pop(),
        taskId: f.taskId?.stringValue || '',
        title: f.title?.stringValue || '',
        time: parseFloat(f.time?.doubleValue || 0),
        completedAt: f.completedAt?.timestampValue || '',
        childId: f.childId?.stringValue || '',
        familyId: f.familyId?.stringValue || '',
        approved: f.approved?.booleanValue || false,
      };
    });
};

export const approveCompletion = async (completionId, childId, time, token) => {
  // Step 1: Mark completion as approved
  await axiosInstance.patch(
    `/completions/${completionId}?updateMask.fieldPaths=approved`,
    {
      fields: {
        approved: { booleanValue: true },
      },
    },
    { headers: authHeader(token) }
  );

  // Step 2: Get current totalTime
  const userRes = await axiosInstance.get(`/users/${childId}`, {
    headers: authHeader(token),
  });

  const fields = userRes.data.fields || {};
  const currentTotal = parseFloat(fields.totalTime?.doubleValue || 0);

  // Step 3: Recalculate pendingTime from all other unapproved completions
  const pendingCompletions = await getPendingCompletionsForChild(childId, token);
  const recalculatedPending = pendingCompletions.reduce((sum, c) => sum + c.time, 0);

  // Step 4: Update user's total and pending time
  await axiosInstance.patch(
  `/users/${childId}?updateMask.fieldPaths=totalTime&updateMask.fieldPaths=pendingTime`,
  {
    fields: {
      totalTime: { doubleValue: currentTotal + time },
      pendingTime: { doubleValue: recalculatedPending },
    },
  },
  {
    headers: authHeader(token),
  }
);

};

export const rejectCompletion = async (completionId, childId, time, token) => {
  // Step 1: Delete the completion
  await axiosInstance.delete(`/completions/${completionId}`, {
    headers: authHeader(token),
  });

  // Step 2: Get current pending time
  const userRes = await axiosInstance.get(`/users/${childId}`, {
    headers: authHeader(token),
  });

  const currentPending = parseFloat(
    userRes.data.fields?.pendingTime?.doubleValue || 0
  );
  const newPending = Math.max(0, currentPending - time);

  // Step 3: Update only pendingTime
  await axiosInstance.patch(
    `/users/${childId}?updateMask.fieldPaths=pendingTime`,
    {
      fields: {
        pendingTime: { doubleValue: newPending },
      },
    },
    {
      headers: authHeader(token),
    }
  );
};

// firebaseTasks.js

export const updateTask = async (taskId, updatedFields, token) => {
  const payload = {
    fields: {},
  };

  const fieldPaths = [];

  for (const [key, value] of Object.entries(updatedFields)) {
    if (value !== undefined) {
      if (typeof value === 'number') {
        payload.fields[key] = {
          [Number.isInteger(value) ? 'integerValue' : 'doubleValue']: value,
        };
      } else {
        payload.fields[key] = { stringValue: value };
      }
      fieldPaths.push(`updateMask.fieldPaths=${key}`);
    }
  }

  const queryParams = fieldPaths.join('&');

  const res = await axiosInstance.patch(
    `/tasks/${taskId}?${queryParams}`,
    payload,
    {
      headers: authHeader(token),
    }
  );

  return res.data;
};

export const deleteTaskFromFirestore = async (taskId, token) => {
  try {
    const res = await axiosInstance.delete(`/tasks/${taskId}`, {
      headers: authHeader(token),
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to delete task ${taskId}:`, error.response?.data || error.message);
    throw error;
  }
};