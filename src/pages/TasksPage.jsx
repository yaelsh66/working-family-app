import ListGroup from 'react-bootstrap/ListGroup';
import { Card } from 'react-bootstrap';
import TaskList from '../components/TasksList';
import ChildTasksList from '../components/ChildTasksList';

function TasksPage(){

    const alertClicked = () => {
    alert('You clicked the third ListGroupItem');
  };

  return (
    <div>
        <TaskList />
        
    </div>
  );
}

export default TasksPage;

