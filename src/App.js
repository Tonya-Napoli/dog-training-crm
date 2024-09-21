import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import ClientList from './pages/ClientList';
import AddClient from './pages/AddClient';
import ClientProfile from './components/ClientProfile';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import TrainingProgress from './components/TrainingProgress';
import Billing from './components/Billing';

function App () {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/clients' component={ClientList} />
        <Route exact path='/clients/add' component={AddClient} />
        <Route exact path='/clients/:id' component={ClientProfile} />
        <Route exact path='/dashboard' component={Dashboard} />
        <Route exact path='/schedule' component={Schedule} />
        <Route exact path='/training-progress' component={TrainingProgress} />
        <Route exact path='/billing' component={Billing} />
      </Switch>
    </Router>
  )
}

export default App