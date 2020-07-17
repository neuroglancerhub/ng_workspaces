import React, { useEffect, Suspense, lazy } from 'react';
import { Router, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createBrowserHistory } from 'history';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

import Navbar from './Navbar';
import Alerts from './Alerts';
import loadScript from './utils/load-script';
import removeScript from './utils/remove-script';

import './App.css';

const history = createBrowserHistory();

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const WorkSpaces = lazy(() => import('./WorkSpaces'));
const AuthTest = lazy(() => import('./AuthTest'));

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
    MuiTooltip: {
      tooltip: {
        fontSize: 12,
      },
    },
  },
});

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for logged in user and save them to state.
    function onInit(googleAuth) {
      if (googleAuth.isSignedIn.get()) {
        dispatch({
          type: 'LOGIN_GOOGLE_USER',
          user: googleAuth.currentUser.get(),
        });
      }
    }

    const jsSrc = 'https://apis.google.com/js/platform.js';
    loadScript(document, 'script', 'google-login', jsSrc, () => {
      const g = window.gapi;
      g.load('auth2', () => {
        g.auth2
          .init({
            client_id: '833853795110-2eu65hnvthhcibk64ibftemb0i1tlu97.apps.googleusercontent.com',
            fetch_basic_profile: true,
            // need this scope to access google cloud storage buckets
            scope: 'https://www.googleapis.com/auth/devstorage.read_only',
            ux_mode: 'pop-up',
          })
          .then(onInit);
      });
    });

    return () => {
      removeScript(document, 'google-login');
    };
  }, [dispatch]);

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
            <Route path="/auth_test" component={AuthTest} />
          </Suspense>
        </div>
        <Alerts />
      </ThemeProvider>
    </Router>
  );
}

export default App;
