import axios from 'axios';

const PROJECT_ID = 'family-c56e3';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Get all users of a family (children)
export const getUsersByFamily = async (familyId, idToken) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

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
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    return response.data
      .filter((res) => res.document)
      .map((res) => {
        const fields = res.document.fields;
        return {
          uid: res.document.name.split('/').pop(),
          email: fields.email?.stringValue || '',
          role: fields.role?.stringValue || '',
          familyId: fields.familyId?.stringValue || '',
          totalTime: fields.totalTime?.doubleValue || 0,
          pendingTime:
          fields.pendingTime?.doubleValue !== undefined
            ? fields.pendingTime.doubleValue
            : fields.pendingTime?.integerValue !== undefined
            ? parseInt(fields.pendingTime.integerValue, 10)
            : 0,
        };
      });
  } catch (error) {
    console.error('Failed to fetch children:', error);
    throw error;
  }
};

// Get pending completions for a child (approved == false)
export const getPendingCompletionsForChild = async (childId, idToken) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

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

  try {
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    return response.data
      .filter((res) => res.document)
      .map((res) => {
        const f = res.document.fields;
        return {
          id: res.document.name.split('/').pop(),
          taskId: f.taskId?.stringValue || '',
          title: f.title?.stringValue || '',
          time: f.time?.doubleValue || 0,
          completedAt: f.completedAt?.timestampValue || '',
          childId: f.childId?.stringValue || '',
          familyId: f.familyId?.stringValue || '',
          approved: f.approved?.booleanValue || false,
        };
      });
  } catch (error) {
    console.error('Failed to fetch pending completions:', error);
    throw error;
  }
};

export const withdrawTime = async (childId, minutes, token) => {
  const userRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/users/${childId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!userRes.ok) throw new Error('Failed to fetch user');

  const userDoc = await userRes.json();
  const currentTotal = userDoc.fields?.totalTime?.doubleValue || 0;

  const newTotal = Math.max(0, currentTotal - minutes);

  const updateRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/users/${childId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          ...userDoc.fields,
          totalTime: { doubleValue: newTotal },
        },
      }),
    }
  );

  if (!updateRes.ok) throw new Error('Failed to update user');
};


export async function approveCompletion(completionId, childId, time, token) {
  try {
    // 1. Mark the completion as approved
    const approveResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/completions/${completionId}?updateMask.fieldPaths=approved`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: { approved: { booleanValue: true } } }),
      }
    );

    if (!approveResponse.ok) {
      throw new Error(`Failed to approve completion: ${approveResponse.statusText}`);
    }

    // 2. Fetch full current user document
    const userRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/users/${childId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!userRes.ok) throw new Error('Failed to fetch child document');

    const userDoc = await userRes.json();
    const fields = userDoc.fields || {};

    const currentTotal = fields.totalTime?.doubleValue || 0;

    // 3. Recalculate pendingTime by summing still pending completions
    const pendingCompletions = await getPendingCompletionsForChild(childId, token);
    const recalculatedPending = pendingCompletions.reduce((sum, c) => sum + c.time, 0);

    // 4. Update user document with new totalTime and recalculated pendingTime
    const updatedFields = {
      ...fields,
      totalTime: { doubleValue: currentTotal + time },
      pendingTime: { doubleValue: recalculatedPending },
    };

    const updateRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents/users/${childId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: updatedFields }),
      }
    );

    if (!updateRes.ok) {
      throw new Error(`Failed to update user: ${updateRes.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('approveCompletion error:', error);
    throw error;
  }
}



export async function rejectCompletion(completionId, childId, time, token) {
  const baseURL = 'https://firestore.googleapis.com/v1/projects/family-c56e3/databases/(default)/documents';

  try {
    // 1. Delete the completion document
    await axios.delete(`${baseURL}/completions/${completionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 2. Fetch current pendingTime
    const userRes = await axios.get(`${baseURL}/users/${childId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const fields = userRes.data.fields || {};
    const currentPending = fields.pendingTime?.doubleValue || 0;

    const newPending = Math.max(0, currentPending - time);

    // 3. Update only the pendingTime field
    await axios.patch(
      `${baseURL}/users/${childId}?updateMask.fieldPaths=pendingTime`,
      {
        fields: {
          pendingTime: { doubleValue: newPending },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ rejectCompletion error:', error.response?.data || error.message);
    throw error;
  }
}



export const sendApprovalRequest = async (parentId, task, childId, token) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${parentId}/approvals?documentId=${childId}_${task.id}`;

  const payload = {
    fields: {
      taskId: { stringValue: task.id },
      childId: { stringValue: childId },
      time: {
        doubleValue: task.time || 0,
      },
      title: { stringValue: task.title || '' },
      completedAt: { timestampValue: new Date().toISOString() },
    },
  };

  const res = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // ✅ Also increment the child's pendingTime
  const userUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${childId}`;
  const userRes = await axios.get(userUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const currentPending = userRes.data.fields?.pendingTime?.doubleValue || 0;
  const newPending = parseFloat(currentPending) + (task.time || 0);

  await axios.patch(userUrl, {
    fields: {
      pendingTime: { doubleValue: newPending },
    },
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};



// ➕ Add a new task (template)
export const addTaskToFirestore = async (task, idToken) => {
  const url = `${BASE_URL}/tasks`;

  const payload = {
    fields: {
      title:       { stringValue: task.title },
      description: { stringValue: task.description },
      time:        Number.isInteger(task.time)
                      ? { integerValue: task.time }
                      : { doubleValue:  task.time },  // <-- time replaces amount
      familyId:    { stringValue: task.familyId },
      createdBy:   { stringValue: task.createdBy },
      assignedTo: {
        arrayValue: {
          values: (task.assignedTo || []).map(uid => ({ stringValue: uid }))
        }
      },
      createdAt:   { timestampValue: new Date().toISOString() }
    }
  };

  const res = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  return res.data;
};

// 🔄 Update task assignment list (assignedTo array)
export const updateTaskAssignment = async (taskId, newAssignedTo, idToken) => {
  const url = `${BASE_URL}/tasks/${taskId}?updateMask.fieldPaths=assignedTo`;

  const payload = {
    fields: {
      assignedTo: {
        arrayValue: {
          values: newAssignedTo.map(uid => ({ stringValue: uid }))
        }
      }
    }
  };

  const response = await axios.patch(url, payload, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  return response.data;
};

// 📥 Get all tasks assigned to a specific child (not completed)
export const getTasksForChild = async (childId, familyId, idToken) => {
  const url = `${BASE_URL}:runQuery`;

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
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'familyId' },
                op: 'EQUAL',
                value: { stringValue: familyId },
              }
            }
          ]
        }
      }
    }
  };

  const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  // Map Firestore response to simple task objects
  return response.data
    .filter(res => res.document)
    .map(res => {
      const fields = res.document.fields;
      return {
        id: res.document.name.split('/').pop(),
        title: fields.title?.stringValue || '',
        description: fields.description?.stringValue || '',
        time: fields.time?.doubleValue !== undefined
          ? parseFloat(fields.time.doubleValue)
          : parseFloat(fields.time?.integerValue || '0'),
        familyId: fields.familyId?.stringValue,
        createdBy: fields.createdBy?.stringValue,
        assignedTo: fields.assignedTo?.arrayValue?.values?.map(v => v.stringValue) || [],
        createdAt: fields.createdAt?.timestampValue || '',
      };
    });
};

// 📥 Get all tasks for a family (parent/admin view)
export const getTasksForFamily = async (familyId, idToken) => {
  const url = `${BASE_URL}:runQuery`;

  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'tasks' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'familyId' },
          op: 'EQUAL',
          value: { stringValue: familyId },
        }
      }
    }
  };

  const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  return response.data
    .filter(res => res.document)
    .map(res => {
      const fields = res.document.fields;
      return {
        id: res.document.name.split('/').pop(),
        title: fields.title?.stringValue || '',
        description: fields.description?.stringValue || '',
        time: fields.time?.doubleValue !== undefined
          ? parseFloat(fields.time.doubleValue)
          : parseFloat(fields.time?.integerValue || '0'),
        familyId: fields.familyId?.stringValue,
        createdBy: fields.createdBy?.stringValue,
        createdAt: fields.createdAt?.timestampValue || '',
      };
    });
};
