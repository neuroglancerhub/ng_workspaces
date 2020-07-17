import C from '../reducers/constants';

// If `group` is specified, then any other alerts with that group will be replaced by this one.
export function addAlert({
  message, duration, severity, group,
}) {
  return {
    type: C.ALERT_ADD,
    message,
    duration,
    severity,
    group,
  };
}

export function deleteAlert(message) {
  return {
    type: C.ALERT_DELETE,
    message,
  };
}
