// check the browser is IE
// https://stackoverflow.com/questions/49986720/how-to-detect-internet-explorer-11-and-below-versions/49986758#answer-49986758
if (/MSIE |Trident\//.test(window.navigator.userAgent)) {
  window.location.replace('/dashboard/assets/unsupported-browser.html');
}
