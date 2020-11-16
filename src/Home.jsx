import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles } from '@material-ui/core/styles';

import examplePage from './example_page.png';

const useStyles = makeStyles({
  homepage: {
    padding: '24px',
  },
  hero: {
    // background: 'linear-gradient(45deg,#9dc66b 5%,#4fa49a 30%,#4361c2)',
    // backgroundImage: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    // backgroundImage: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
    // background: 'rgb(199,201,192)',
    // backgroundImage: 'radial-gradient(circle, rgba(199,201,192,1) 0%, rgba(152,160,170,1) 100%)',
    background: '#bdc3c7',
    backgroundImage: 'linear-gradient(to top, #2c3e50, #bdc3c7)',
    color: '#fff',
    textAlign: 'center',
    paddingTop: '20px',
  },
  heroText: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  heroTextContainer: {
    position: 'relative',
  },
  heroDivider: {
    color: '#ccc',
    width: '150px',
    margin: '1em auto',
  },
  heroBody: {
    fontSize: '1.1em',
  },
  smallScreen: {
    color: '#2c3e50',
  },
});

function Home() {
  const classes = useStyles();
  return (
    <div className={classes.homepage}>
      <Grid container spacing={6} className={classes.hero}>
        <Hidden smDown>
          <Grid item xs={12} md={4} className={classes.heroTextContainer}>
            <div className={classes.heroText}>
              <Typography variant="h2">Clio</Typography>
              <hr className={classes.heroDivider} />
              <Typography variant="body1" className={classes.heroBody}>
                Clio website description.
              </Typography>
            </div>
          </Grid>
        </Hidden>
        <Hidden mdUp>
          <Grid item xs={12} className={classes.smallScreen}>
            <Typography variant="h2">Clio</Typography>
            <hr className={classes.heroDivider} />
            <Typography variant="body1">
              Clio website description.
            </Typography>
          </Grid>
        </Hidden>
        <Grid item xs={12} md={8}>
          <img
            src={examplePage}
            alt="Browser window showing plugin example"
            style={{ maxWidth: '100%' }}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default Home;
