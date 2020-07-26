const INPUT_TYPES_NOT_USING_KEYPRESS = Object.freeze([
  'radio',
  'checkbox',
]);

// Returns true if the active (focused) element needs keypress events.
// If it does, then such events should not be processed as keyboard shortcuts.
export default () => {
  const focused = document.activeElement;
  if (focused) {
    if (focused.getAttribute('contenteditable') !== null) {
      return true;
    }
    if (/input|textarea/i.test(focused.tagName)) {
      const doesNotUse = INPUT_TYPES_NOT_USING_KEYPRESS.includes(focused.type);
      return (!doesNotUse);
    }
  }
  return false;
};
