import axios from 'axios';

const PROJECT_ID = 'family-c56e3';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
