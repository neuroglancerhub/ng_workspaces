import React from "react";
import NeuroGlancer from "@janelia-flyem/react-neuroglancer";
import './Neuroglancer.css';

function Neuroglancer() {
  return (
    <div className="ng-container">
      <NeuroGlancer />
    </div>
  );
}

export default Neuroglancer;
