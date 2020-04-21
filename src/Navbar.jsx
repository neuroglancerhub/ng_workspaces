import React from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import InfoIcon from "@material-ui/icons/Info";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  search: {
    fontFamily: theme.typography.fontFamily,
    width: "15em",
    marginLeft: "2em"
  },
  searchContainer: {
    flexGrow: 1
  },
  title: {
    color: "#fff",
    textDecoration: "none"
  }
}));

function Navbar(props) {
  const { history } = props;
  const classes = useStyles();
  const theme = useTheme();

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
      background: theme.palette.primary.main,
      border: "1px solid #fff"
    })
  };


    const workspaceOptions = ["neuroglancer", "image picker", "focused proofreading"].map(dataset => ({
    value: `ws/${dataset.replace(/ /, "_")}`,
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
        <div className={classes.searchContainer}>
          <Select
            className={classes.search}
            styles={selectStyles}
            onChange={handleChange}
            placeholder="Select a workspace"
            options={workspaceOptions}
          />
        </div>
        <Link to="/about" className={classes.title}>
          <InfoIcon />
        </Link>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
