import React, { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// TODO: probably need to do some defensive loading here to make sure that
// browser can support neuroglancer. If it can't we need to render that message
// instead of the component. -> maybe this should go in the neuroglancer component,
// if possible.
import NeuroGlancer from "@janelia-flyem/react-neuroglancer";

import "./Neuroglancer.css";

const Neuroglancer = lazy(() => import("./Neuroglancer"));
const ImagePicker = lazy(() => import("./ImagePicker"));

class WorkSpaces extends React.Component {
  render() {
    // TODO: check the url to figure out which workspace component to render.
    // Render the selected workspace and pass it the neuroglancer component as
    // a child.
    const { match, location, viewerState, user, actions } = this.props;

    let RenderedComponent = null;

    switch (match.params.ws) {
      case "neuroglancer":
        RenderedComponent = Neuroglancer;
        break;
      case "image_picker":
        RenderedComponent = ImagePicker;
        break;
      default:
        RenderedComponent = ImagePicker;
    }

    // TODO: need to store our application state in redux, so that we can build
    // the state object to pass into the NeuroGlancer component.
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <RenderedComponent user={user} location={location} actions={actions}>
          <NeuroGlancer viewerState={viewerState} />
        </RenderedComponent>
      </Suspense>
    );
  }
}

WorkSpaces.propTypes = {
  location: PropTypes.object.isRequired,
  viewerState: PropTypes.object.isRequired
};

const WorkSpacesState = state => ({
  user: state.user,
  viewerState: state.viewer
});

const WorkSpacesActions = dispatch => ({
  actions: {}
});

export default connect(
  WorkSpacesState,
  WorkSpacesActions
)(WorkSpaces);
