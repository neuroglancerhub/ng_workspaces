import C from '../reducers/constants';

export default function setToplevelUrl(url) {
  return {
    type: C.CLIO_SET_TOP_LEVEL_FUNC,
    url,
  };
}
