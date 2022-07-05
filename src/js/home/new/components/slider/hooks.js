import { useRef, useEffect, useState, useCallback } from 'react'
import _ from 'lodash'

class Slider {
  constructor(dom, options) {
    this.dom = dom
    this.startPoint = { x: 0, y: 0 }
    this.delta = { x: 0, y: 0 }
    this.offset = 0
    this.itemWidth = 210
    this.index = 0
    this.animating = false
    this.prevEvent = null
    this.onChange = options.onChange || _.noop
    this.disabled = options.disabled || _.noop
    this.removeHandle = this.handleTransitionEnd.bind(this)

    this.calculateSize()
    this.bindEvent()
  }

  calculateSize() {
    this.startPoint = { x: 0, y: 0 }
    this.delta = { x: 0, y: 0 }
    this.offset = 0
    this.itemWidth = 210
    this.animating = false
    this.total = this.dom.children.length
    this.size = this.dom.parentNode.clientWidth / this.itemWidth

    this.sliderTo(0)
  }

  bindEvent() {
    this.dom.addEventListener(
      'mousewheel',
      this.handleMouseWheel.bind(this),
      false,
    )
  }

  handleMouseWheel(e) {
    const deltaX = e.wheelDeltaX != null ? e.wheelDeltaX : e.deltaX
    if (Math.abs(deltaX) > 3) {
      e.preventDefault()
      //  正数向左(prev)，负数向右(next)，
      const direction = deltaX > 0 ? 1 : -1

      const newEvent = {
        time: Date.now(),
        delta: Math.abs(e.deltaX),
        direction,
      }

      if (this.prevEvent) {
        if (
          newEvent.direction !== this.prevEvent.direction ||
          newEvent.delta > this.prevEvent.delta ||
          newEvent.time > this.prevEvent.time + 150
        ) {
          this.sliderTo(null, direction)
        }
      } else {
        this.sliderTo(null, direction)
      }

      this.prevEvent = newEvent
    }
  }

  /**
   *
   * @param {number} index
   * @param {boolean} direction
   */
  sliderTo(index, direction) {
    const max = Math.ceil(Math.abs(this.total - this.size))
    index = index > max ? max : index
    if (index === this.index) return
    if (!_.isNil(index)) {
      this.index = index
      return this.animate(index)
    } else {
      if (this.isValid(index, direction)) {
        if (!index && direction) {
          return this.stepTo(direction)
        }
      }
    }
  }

  // 只走一步
  stepTo(direction) {
    if (this.dom && !this.animating) {
      if (direction < 0) {
        this.index++
      } else {
        this.index--
      }
      this.animate(this.index)
    }
  }

  /**
   *  index 是外部传入
   *  this.index是内部维护的值
   */
  isValid(index, direction) {
    const max = Math.ceil(Math.abs(this.total - this.size))

    if (index) {
      if (index > max || index < 0) {
        return false
      }
    }

    if (direction) {
      if (direction < 0) {
        return this.index < max
      } else {
        return this.index > 0
      }
    }
    return true
  }

  animate(index) {
    this.onChange(index)

    this.animating = true
    this.dom.style.transform = `translate3d(${
      this.index * -1 * 210
    }px, 0px, 0px)`

    // this.dom.addEventListener(
    //   'transitionend',
    //   this.handleTransitionEnd.bind(this),
    //   false,
    // )
    this.dom.addEventListener('webkitTransitionEnd', this.removeHandle, false)
  }

  handleTransitionEnd() {
    this.animating = false
    // this.dom.removeEventListener(
    //   'transitionend',
    //   this.handleTransitionEnd.bind(this),
    // )
    this.dom.removeEventListener(
      'webkitTransitionEnd',
      this.removeHandle,
      false,
    )
  }
}

function useSlider(params) {
  const { total } = params || {}
  // 容器
  const container = useRef(null)
  // 总数量
  const _total = useRef(0)
  // 当前位置
  const [point, setPoint] = useState(0)
  // 一页数量
  const size = useRef(null)

  const slider = useRef(null)

  const resize = useCallback(
    _.debounce(() => {
      const dom = container.current
      slider.current && slider.current.calculateSize()
      if (dom) {
        _total.current = total || slider.current.total
        size.current = slider.current.size
      }
      setPoint(slider.current.index)
    }, 300),
    [],
  )

  useEffect(() => {
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [resize])

  useEffect(() => {
    const dom = container.current
    slider.current = new Slider(dom, {
      onChange: (index) => {
        setPoint(index)
      },
    })

    if (dom) {
      dom.style.transition = 'transform .3s ease'
      _total.current = total || slider.current.total
      size.current = slider.current.size
    }
  }, [])

  const toNext = () => {
    const dom = container.current
    if (dom) {
      slider.current.sliderTo(null, -1)
    }
  }

  const toPre = () => {
    const dom = container.current
    if (dom) {
      slider.current.sliderTo(null, 1)
    }
  }

  const sliderTo = (index) => {
    slider.current.sliderTo(index)
  }

  return {
    container,
    sliderTo,
    point,
    toNext,
    toPre,
    size: Math.floor(size.current),
  }
}

export { useSlider }
