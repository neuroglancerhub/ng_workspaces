import C from '../reducers/constants';

export function addAlert({ message, duration, severity }) {
  return {
    type: C.ALERT_ADD,
    message,
    duration,
    severity,
  };
}

export function deleteAlert(message) {
  return {
    type: C.ALERT_DELETE,
    message,
  };
}
