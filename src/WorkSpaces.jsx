import React, { Suspense, lazy } from 'react';

import NeuroGlancer from "@janelia-flyem/react-neuroglancer";

import './Neuroglancer.css';

const Neuroglancer = lazy(() => import('./Neuroglancer'));
const ImagePicker = lazy(() => import('./ImagePicker'));

class WorkSpaces extends React.Component {
  render() {
    // TODO: check the url to figure out which workspace component to render.
    // Render the selected workspace and pass it the neuroglancer component as
    // a child.
    const { match } = this.props;

    let RenderedComponent = null;

    switch(match.params.ws) {
      case 'neuroglancer':
        RenderedComponent = Neuroglancer
        break;
      case 'image_picker':
        RenderedComponent = ImagePicker
        break;
      default:
        RenderedComponent = ImagePicker
    }

    const user = {
      name: 'test'
    };

    // TODO: need to store our application state in redux, so that we can build
    // the state object to pass into the NeuroGlancer component.

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <RenderedComponent user={user} >
          <NeuroGlancer />
        </RenderedComponent>
      </Suspense>
    );
  }
}

export default WorkSpaces;
