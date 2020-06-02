export default class ClientInfo {
  info = undefined;

  constructor() {
    try {
      const { userAgent } = navigator;

      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const glVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const glRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      this.info = { userAgent, glVendor, glRenderer };
    } catch (e) {
      this.info = {};
    }
  }
}
