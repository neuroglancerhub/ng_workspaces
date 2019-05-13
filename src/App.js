import React from 'react';
import { Router, Route } from "react-router-dom";
import Navbar from './Navbar';
import Home from './Home';
import About from './About';

import './App.css';

import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

function App() {
  return (
    <Router history={history}>
      <div className="App">
        <Navbar history={history}/>
        <Route path="/" exact component={Home} />
        {/* TODO: workout how the routes will be used to view alternative workspaces */}
        <Route path="/neuroglancer" component={About} />
        <Route path="/image_picker" component={About} />
        <Route path="/about" component={About} />
      </div>
    </Router>
  );
}

export default App;
