import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export default function FocusedProofreadingHelp(props) {
  const { keyBindings, open, onClose } = props;

  return (
    <Dialog onClose={onClose} open={open} disableEnforceFocus>
      <DialogTitle>Focused Proofreading Help</DialogTitle>
      <DialogContent>
        <Typography color="inherit">{`Version ${process.env.REACT_APP_VERSION}`}</Typography>
        <Typography color="inherit">Key bindings:</Typography>
        <Table>
          <TableBody>
            {Object.entries(keyBindings).map((e) => (
              <TableRow key={e[1].key}>
                <TableCell align="right">{e[1].key}</TableCell>
                <TableCell align="left">{e[1].help}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FocusedProofreadingHelp.propTypes = {
  keyBindings: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
