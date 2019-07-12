import React, { Suspense, lazy } from 'react';
import { Router, Route } from "react-router-dom";

import Navbar from './Navbar';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import './App.css';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const WorkSpaces = lazy(() => import('./WorkSpaces'));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#739574'
    }
  }
});

function App() {
  return (
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <Navbar history={history}/>
        <div className="App">
          <Suspense fallback={<div>Loading Homepage...</div>}>
            <Route path="/" exact component={Home} />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <Route path="/ws/:ws" component={WorkSpaces} />
            <Route path="/about" component={About} />
          </Suspense>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
