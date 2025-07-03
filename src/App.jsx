
import ParentHomePage from './pages/homePage/ParentHomePage.jsx';
import PublicHomePage from './pages/homePage/PublicHomePage.jsx';
import Navbar from './templates/Navbar.jsx'
import Login from './components/Login.jsx';
import { Routes, Route } from 'react-router-dom';
import SignupFamily from './pages/forms/SignupFamily.jsx';
import AddTaskForm from './pages/forms/AddTaskForm.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ChildHomePage from './pages/homePage/ChildHomePage.jsx';
import ChildTasksPage from './pages/ChildTasksPage.jsx';
function App() {
  

  return (
    <div>
      <Navbar/>
      <Routes>
      
      <Route path='/' element={<PublicHomePage/>} />
      <Route path='/parent' element={<ParentHomePage/>} />
      <Route path='/child' element={<ChildHomePage/>} />
      <Route path='/child/tasks' element={<ChildTasksPage/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/signup' element={<SignupFamily/>} />
      <Route path='/newtask' element={<AddTaskForm/>} />
      <Route path='/tastsList' element={<TasksPage/>} />
      
      </Routes>
    </div>
  )
}

export default App;
