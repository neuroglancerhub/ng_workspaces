import { createBrowserHistory } from 'history';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import React, { Suspense, lazy } from 'react';
import { Router, Route } from 'react-router-dom';

import './App.css';
import Navbar from './Navbar';
import Alerts from './Alerts';

const history = createBrowserHistory();

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const WorkSpaces = lazy(() => import('./WorkSpaces'));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#739574',
    },
  },
  typography: {
    fontSize: 11,
  },
  props: {
    MuiButton: {
      size: 'small',
    },
    MuiFilledInput: {
      margin: 'dense',
    },
    MuiFormControl: {
      margin: 'none',
    },
    MuiFormHelperText: {
      margin: 'dense',
    },
    MuiIconButton: {
      size: 'small',
    },
    MuiInputBase: {
      margin: 'dense',
    },
    MuiInputLabel: {
      margin: 'dense',
    },
    MuiListItem: {
      dense: true,
    },
    MuiOutlinedInput: {
      margin: 'dense',
    },
    MuiFab: {
      size: 'small',
    },
    MuiTable: {
      size: 'small',
    },
    MuiTextField: {
      margin: 'dense',
    },
    MuiToolbar: {
      variant: 'dense',
    },
  },
  overrides: {
    MuiIconButton: {
      sizeSmall: {
        // Adjust spacing to reach minimal touch target hitbox
        marginLeft: 4,
        marginRight: 4,
        padding: 6,
      },
    },
  },
});

function App() {
  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <Navbar history={history} />
        <div className="App">
          <Suspense fallback={<div>Loading Homepage...</div>}>
            <Route path="/" exact component={Home} />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <Route path="/ws/:ws" component={WorkSpaces} />
            <Route path="/about" component={About} />
          </Suspense>
        </div>
        <Alerts />
      </ThemeProvider>
    </Router>
  );
}

export default App;
