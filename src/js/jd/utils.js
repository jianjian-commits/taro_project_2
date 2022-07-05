function siblings(el) {
  return [].filter.call(el.parentNode.children, function (child) {
    return child !== el
  })
}

function closest(el, selector) {
  const matchesSelector =
    el.matches ||
    el.webkitMatchesSelector ||
    el.mozMatchesSelector ||
    el.msMatchesSelector

  while (el) {
    if (matchesSelector.call(el, selector)) {
      return el
    } else {
      el = el.parentElement
    }
  }
  return null
}

const funcUtil = {
  siblings,
  closest,
}

export default funcUtil
