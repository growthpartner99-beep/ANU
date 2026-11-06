const ANU = {
  WINDOW: { WIDTH: 300, HEIGHT: 320 },
};

if (typeof window !== 'undefined') {
  window.ANU = ANU;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ANU;
}
