// taken from https://github.com/anthonyjgrove/react-google-login
export default (d, id) => {
  const element = d.getElementById(id);

  if (element) {
    element.parentNode.removeChild(element);
  }
};
