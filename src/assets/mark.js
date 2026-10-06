// The Eternity infinity mark as an SVG path (viewBox 0 0 76.1 39.45).
// Used by the ticker dividers (<use href="#ee-mark">). CSS mask copies live in the stylesheets.

export const MARK_VIEWBOX = '0 0 76.1 39.45';

export const MARK_PATH =
  'M71.135 6.377C63.890-1.696 52.126-2.178 43.725 5.354 41.330 7.485 31.995 20.881 26.130 26.818 22.064 30.931 17.018 31.635 13.284 29.717L36.078 9.258C35.557 8.457 34.972 7.699 34.331 6.990 26.885-1.304 15.181-1.730 6.831 5.763-1.519 13.256-2.299 24.977 4.960 33.075 12.218 41.174 23.978 41.600 32.370 34.077 34.766 31.946 46.772 15.489 49.956 12.625 54.265 8.759 59.069 7.804 62.811 9.722L40.017 30.181C40.540 30.980 41.124 31.737 41.764 32.445 49.210 40.747 60.915 41.174 69.264 33.689 77.614 26.205 78.394 14.458 71.135 6.377ZM13.224 12.868C17.265 9.241 22.175 8.090 25.870 10.059L9.184 25.045C7.717 21.171 9.243 16.453 13.224 12.868ZM62.862 26.571C58.830 30.198 53.912 31.349 50.225 29.384L66.912 14.394C68.378 18.268 66.852 22.991 62.862 26.571Z';

/** Adds the hidden <symbol id="ee-mark"> once, so <use href="#ee-mark"> works anywhere on the page. */
export function ensureMarkSymbol() {
  if (document.getElementById('ee-mark')) return;
  const holder = document.createElement('div');
  holder.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="ee-mark" viewBox="${MARK_VIEWBOX}"><path d="${MARK_PATH}"/></symbol></svg>`;
  document.body.prepend(holder.firstChild);
}
