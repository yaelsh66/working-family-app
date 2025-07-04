
import TasksList from '../components/TasksList';


function TasksPage(){

    const alertClicked = () => {
    alert('You clicked the third ListGroupItem');
  };

  return (
    <div>
        <TasksList />
        
    </div>
  );
}

export default TasksPage;

