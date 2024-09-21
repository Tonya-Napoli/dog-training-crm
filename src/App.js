import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ClientList from './pages/ClientList';
import AddClient from './pages/AddClient';
import ClientProfile from './components/ClientProfile';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import TrainingProgress from './components/TrainingProgress';
import Billing from './components/Billing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/clients' element={<ClientList />} />
        <Route path='/clients/add' element={<AddClient />} />
        <Route path='/clients/:id' element={<ClientProfile />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/schedule' element={<Schedule />} />
        <Route path='/training-progress' element={<TrainingProgress />} />
        <Route path='/billing' element={<Billing />} />
      </Routes>
    </Router>
  );
}

export default App;
