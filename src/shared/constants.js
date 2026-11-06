const ANU = {
  WINDOW: { WIDTH: 600, HEIGHT: 650 },
};

if (typeof window !== 'undefined') {
  window.ANU = ANU;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ANU;
}
