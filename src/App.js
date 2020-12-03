// eslint-disable-next-line object-curly-newline
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Router, Route } from 'react-router-dom';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { createBrowserHistory } from 'history';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

import Navbar from './Navbar';
import Alerts from './Alerts';
import UnauthenticatedApp from './UnauthenticatedApp';
import loadScript from './utils/load-script';
import removeScript from './utils/remove-script';
import { useLocalStorage } from './utils/hooks';
import { loginGoogleUser } from './actions/user';
import setTopLevelFunction from './actions/clio';
import config from './config';

import './App.css';

const history = createBrowserHistory();

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const UserAdmin = lazy(() => import('./UserAdmin'));
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
    MuiPagination: {
      root: {
        display: 'inline-block',
      },
    },
  },
});

function ErrorFallback(props) {
  const { error } = props;
  return (
    <div role="alert">
      <p>
        Neurohub has produced an internal error. Please send the following error information to the
        FlyEM software team.
      </p>
      <pre>{error.stack}</pre>
    </div>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
};

const { project } = config;

function App() {
  const dispatch = useDispatch();

  const [selectedDatasetName, setSelectedDataset] = useLocalStorage('dataset', null);

  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const [datasets, setDatasets] = useState([]);
  const formattedProject = project.toLowerCase().replace(/ /g, '-');

  // Set the top level function when first mounting the application.
  // This is done here as it needs to be done before a lot of other functions
  // that use it are executed.
  const clioUrl = `https://us-east4-${formattedProject}.cloudfunctions.net/${
    config.top_level_function
  }`;
  dispatch(setTopLevelFunction(clioUrl));

  useEffect(() => {
    if (user) {
      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      const datasetUrl = `${clioUrl}/datasets`;
      fetch(datasetUrl, options)
        .then((result) => result.json())
        .then((res) => {
          const datasetsArray = Object.entries(res).map(([name, meta]) => {
            const updated = meta;
            updated.name = name;
            return updated;
          });
          setDatasets(datasetsArray);
        })
        .catch((err) => console.log(err));
    }
  }, [user, dispatch, clioUrl]);

  useEffect(() => {
    // Check for logged in user and save them to state.
    function onInit(googleAuth) {
      if (googleAuth.isSignedIn.get()) {
        // Save the current user in the global space so that it can be used by
        // neuroglancer.
        window.neurohub = {};
        window.neurohub.clio = {};
        window.neurohub.clio.auth = googleAuth.currentUser.get();
        dispatch(loginGoogleUser(googleAuth.currentUser.get()));
      }
    }

    const jsSrc = 'https://apis.google.com/js/platform.js';
    loadScript(document, 'script', 'google-login', jsSrc, () => {
      const g = window.gapi;
      g.load('auth2', () => {
        g.auth2.init(config.google_auth).then(onInit);
      });
    });

    return () => {
      removeScript(document, 'google-login');
    };
  }, [dispatch]);

  // if not logged in then show the login page for all routes.
  if (!user) {
    return <UnauthenticatedApp history={history} theme={theme} />;
  }
  // The inner ErrorBoundary should catch most errors, and will keep the Navbar with the
  // Neurohub branding.  The outer ErrorBoundary is a last resort, in case there is an
  // error in the Navbar itself.
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <Navbar
            history={history}
            datasets={datasets}
            selectedDatasetName={selectedDatasetName}
            setSelectedDataset={setSelectedDataset}
          />
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="App">
              <Suspense fallback={<div>Loading Homepage...</div>}>
                <Route path="/" exact component={Home} />
              </Suspense>
              <Suspense fallback={<div>Loading...</div>}>
                <Route path="/ws/:ws">
                  <WorkSpaces datasets={datasets} selectedDatasetName={selectedDatasetName} />
                </Route>
                <Route path="/about" component={About} />
                <Route path="/users" component={UserAdmin} />
                <Route path="/auth_test" component={AuthTest} />
              </Suspense>
            </div>
            <Alerts />
          </ErrorBoundary>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
