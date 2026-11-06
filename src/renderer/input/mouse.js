let point = null;
if (window.anu) window.anu.onCursor((p) => (point = p));

export const anuMouse = { getPoint: () => point };
