import axios from 'axios';


const PROJECT_ID = 'family-c56e3';


export const updateTaskAssignment = async (taskId, newAssignedTo, token) => {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks/${taskId}?updateMask.fieldPaths=assignedTo`;

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
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
};
