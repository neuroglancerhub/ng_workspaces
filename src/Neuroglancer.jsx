import React from "react";

function Neuroglancer(props) {
  return (
    <div className="ng-container">
      {props.children}
    </div>
  );
}

export default Neuroglancer;
