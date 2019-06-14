import React, { Suspense, lazy } from 'react';
import { Router, Route } from "react-router-dom";
import Navbar from './Navbar';
import './App.css';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Neuroglancer = lazy(() => import('./Neuroglancer'));
const ImagePicker = lazy(() => import('./ImagePicker'));

function App() {
  return (
    <Router history={history}>
      <Navbar history={history}/>
      <div className="App">
        <Suspense fallback={<div>Loading Homepage...</div>}>
          <Route path="/" exact component={Home} />
        </Suspense>
          {/* TODO: workout how the routes will be used to view alternative workspaces */}
        <Suspense fallback={<div>Loading...</div>}>
          <Route path="/neuroglancer" component={Neuroglancer} />
          <Route path="/image_picker" component={ImagePicker} />
          <Route path="/about" component={About} />

        </Suspense>
      </div>
    </Router>
  );
}

export default App;
