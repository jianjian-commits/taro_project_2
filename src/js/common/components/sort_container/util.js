export const closest = (el, fn) => {
  while (el) {
    if (fn(el)) {
      return el
    }
    el = el.parentNode
  }
  return null
}

export const getPosition = (event) => {
  return {
    x: event.pageX || 0,
    y: event.pageY || 0,
  }
}

export const setTranslate3d = (node, translate) => {
  if (node) {
    node.style.transform = translate
      ? `translate3d(${translate.x}px,${translate.y}px,0)`
      : ''
  }
}

export function setTransitionDuration(node, duration) {
  if (node !== null) {
    node.style.transitionDuration = duration ? `${duration}ms` : ''
  }
}

export const setStyle = (node, styles) => {
  if (styles) {
    Object.keys(styles).forEach((key) => {
      if (node) {
        node.style[key] = styles[key]
      }
    })
  }
}

export const getCenterPoint = (node) => {
  const { width, height, left, top } = node.getBoundingClientRect() // top在弹窗的场景下不准，不明白
  const centerPoint = {
    x: left + width / 2,
    y: node.offsetTop + height / 2,
  }
  return centerPoint
}

export const getDistance = (a1, a2) => {
  const { x: ax, y: ay } = a1
  const { x: tx, y: ty } = a2
  const dx = ax - tx
  const dy = ay - ty
  const distance = Math.floor(Math.sqrt(dx * dx + dy * dy))
  return distance
}

export const getExchangePosition = (ref, manager) => {
  const { x: tx, y: ty } = manager.getPositionMap(ref.temp)
  const { x: ax, y: ay } = manager.getPositionMap(ref.info.index)
  return {
    x: tx - ax,
    y: ty - ay,
  }
}
