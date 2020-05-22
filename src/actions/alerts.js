import C from '../reducers/constants';

export function addMessage({ message, duration, severity }) {
  return {
    type: C.ALERT_ADD,
    message,
    duration,
    severity,
  };
}

export function deleteMessage(message) {
  return {
    type: C.ALERT_DELETE,
    message,
  };
}
