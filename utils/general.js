function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (error) {
    return false;
  }
}

function urlExtension(url) {
  url.match(/\.([^\./\?]+)($|\?)/)?.[1]
}

export { isValidURL, urlExtension}