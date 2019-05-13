import React from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  search: {
    fontFamily: theme.typography.fontFamily,
    width: "15em",
    marginLeft: "2em"
  },
  title: {
    color: "#fff",
    textDecoration: "none"
  }
}));

const selectStyles = {
  placeholder: () => ({
    color: "#fff"
  }),
  singleValue: provided => ({
    ...provided,
    color: "#fff"
  }),
  menu: provided => ({
    ...provided,
    color: "#333"
  }),
  control: provided => ({
    ...provided,
    background: "#3f51b5",
    border: "1px solid #fff"
  })
};

function Navbar(props) {
  const { history } = props;
  const classes = useStyles();

  const workspaceOptions = ["neuroglancer", "image picker"].map(dataset => ({
    value: dataset.replace(/ /, "_"),
    label: dataset
  }));

  function handleChange(selected) {
    // redirect to the workspace that was chosen.
    history.push(`/${selected.value}`);
  }
  return (
    <AppBar position="static">
      <Toolbar>
        <Link to="/" className={classes.title}>
          <Typography variant="h6" color="inherit">
            neurohub
          </Typography>
        </Link>
        <Select
          className={classes.search}
          styles={selectStyles}
          onChange={handleChange}
          placeholder="Select a workspace"
          options={workspaceOptions}
        />
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
