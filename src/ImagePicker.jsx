import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const styles = {
  window: {
    width: "90%",
    margin: "auto",
    height: "500px"
  },
  textField: {
    width:'50%'
  },
  inputForm: {
    margin: '1em'
  }
};

class ImagePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverUrl: null,
      submitted: false
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.initViewer({
      layers: {
        grayscale: {
          type: "image",
          source:
            "dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg"
        },
        segmentation: {
          type: "segmentation",
          source:
            "dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation",
          segments: ["208299761"]
        }
      },
      perspectiveZoom: 20,
      navigation: {
        zoomFactor: 8,
        pose: {
          position: {
            voxelSize: [8, 8, 8],
            voxelCoordinates: [7338.26953125, 7072, 4246.69140625]
          }
        }
      },
      layout: "xz"
    });
  }

  handleChange = url => {
    this.setState({ serverUrl: url });
  };

  handleSubmit = e => {
    e.preventDefault();
    // TODO: probably want to validate the url here first.
    this.setState({ submitted: true });
  };

  render() {
    const { user, children, location, classes } = this.props;
    const { serverUrl, submitted } = this.state;

    if (!submitted) {
      return (
        <div className={classes.inputForm}>
          <form onSubmit={this.handleSubmit}>
            <TextField
              id="standard-name"
              label="ServerUrl"
              className={classes.textField}
              onChange={event => this.setState({ serverUrl: event.target.value })}
              margin="normal"
            />
            <br />
            <Button
              color="primary"
              variant="contained"
              onClick={this.handleSubmit}
            >
              Submit
            </Button>
          </form>
        </div>
      );
    }

    return (
      <div>
        <Typography variant="h5">ImagePicker</Typography>
        {user.get("loggedIn") && (
          <p>logged in as: {user.get("userInfo").username}</p>
        )}
        {!user.get("loggedIn") && <p>Not logged in.</p>}
        <p>ServerUrl: {serverUrl}</p>
        <div className={classes.window}>{children}</div>
        <p>Looking at location: {location.pathname}</p>
        <p>
          Other page content can go here - or use a Grid Layout to add a
          sidebar, etc.
        </p>
      </div>
    );
  }
}

ImagePicker.propTypes = {
  user: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default withStyles(styles)(ImagePicker);
