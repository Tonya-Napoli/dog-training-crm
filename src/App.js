import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import ClientList from './pages/ClientList';
import AddClient from './pages/AddClient';

function App () {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/clients' component={ClientList} />
        <Route exact path='/clients/add' component={AddClient} />
      </Switch>
    </Router>
  )
}

export default App