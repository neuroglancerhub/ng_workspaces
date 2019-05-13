import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from './Navbar';
import Home from './Home';
import About from './About';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Route path="/" exact component={Home} />
        <Route path="/about" exact component={About} />
      </div>
    </Router>
  );
}

export default App;
