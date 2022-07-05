import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Grid from 'common/components/grid'
import Manager from './manager.js'
import Item from './item.js'
import {
  closest,
  getPosition,
  setTranslate3d,
  setStyle,
  getDistance,
  getExchangePosition,
  setTransitionDuration,
} from './util.js'

export const containerContext = createContext({
  manager: null,
})

// 配置
const CONFIG = {
  animation: 200, // 动画时间
  distance: 60, // 换位的距离
}

class Container extends Component {
  constructor() {
    super()
    this.containerRef = React.createRef()
    this.mouseDownPosition = { x: null, y: null }
    this.ghostNode = null
    this.ghostNodeTranslate = ''
    this.shadowNode = ''
    this.preTargetIndex = ''
    this.curTargetIndex = ''
    this.manager = new Manager()

    this._handleMouseDown = this.handleMouseDown.bind(this)
    this._handleMouseUp = this.handleMouseUp.bind(this)
    this._handleMouseMove = this.handleMouseMove.bind(this)
  }

  static Item = Item

  componentDidMount() {
    const { split, core } = this.props
    if (split && !core) {
      throw Error('prop core is required')
    }

    const containerDom = this.containerRef.current

    containerDom.addEventListener('mousedown', this._handleMouseDown, {
      passive: true,
    })
    containerDom.addEventListener('mouseup', this._handleMouseUp, {
      passive: true,
    })
  }

  componentWillUnmount() {
    const containerDom = this.containerRef.current
    containerDom.removeEventListener('mousedown', this._handleMouseDown)
    containerDom.removeEventListener('mouseup', this._handleMouseUp)
  }

  handleMouseDown = (event) => {
    const node = closest(
      event.target,
      (el) => !!this.manager.getNodeManagerRef(el),
    )
    if (!node) return
    const curManager = this.manager.getNodeManagerRef(node)
    const position = getPosition(event)
    this.mouseDownPosition = position
    this.manager.activeRef = curManager
    this.handlePress()
  }

  handlePress = () => {
    const { node: activeNode } = this.manager.activeRef
    const style = activeNode.getBoundingClientRect()

    // 被拿起的item是拷贝出来的
    const ghostNode = document.body.appendChild(activeNode.cloneNode(true))
    setStyle(ghostNode, {
      position: 'fixed',
      width: `${style.width}px`,
      height: `${style.height}px`,
      left: `${style.left - 8}px`,
      top: `${style.top - 8}px`,
      zIndex: 10000,
    })
    this.ghostNode = ghostNode
    // 被点中的item
    this.shadowNode = activeNode
    this.shadowNode.classList.add('item-holder')

    window.addEventListener('mousemove', this._handleMouseMove)
    window.addEventListener('mouseup', this._handleMouseUp)
  }

  handleMouseMove = (event) => {
    const offset = getPosition(event)
    const translate = {
      x: offset.x - this.mouseDownPosition.x,
      y: offset.y - this.mouseDownPosition.y,
    }
    this.ghostNodeTranslate = translate
    setTranslate3d(this.ghostNode, translate)
    this.doAnimation()
  }

  handleMouseUp = () => {
    const { ghostNode, shadowNode } = this
    if (ghostNode) {
      ghostNode && ghostNode.parentNode.removeChild(ghostNode)
      this.ghostNode = null
    }
    if (shadowNode) {
      shadowNode.classList.remove('item-holder')
    }
    this.props.onSort(
      _.map(_.sortBy(this.manager.refs, ['temp']), (v) => v.info.index - 1),
    )

    // 清除 transform
    _.forEach(this.manager.refs, (ref) => {
      setTranslate3d(ref.node, null)
      setTransitionDuration(ref.node, 0)
    })
    this.preTargetIndex = ''
    this.curTargetIndex = ''
    window.removeEventListener('mousemove', this._handleMouseMove)
    window.removeEventListener('mouseup', this._handleMouseUp)
  }

  doAnimation() {
    const activeRef = this.manager.activeRef
    let targetRef = null
    const offset = {
      x: activeRef.info.point.x + this.ghostNodeTranslate.x,
      y: activeRef.info.point.y + this.ghostNodeTranslate.y,
    }
    _.forEach(this.manager.positionMap, (val, key) => {
      const distance = getDistance(offset, val)
      if (distance < CONFIG.distance) {
        const ref = _.find(this.manager.refs, ['temp', Number(key)])
        this.curTargetIndex = ref.temp
        targetRef = ref
      }
    })
    if (this.curTargetIndex) {
      // 没有变换位置就不做下面的操作
      if (this.preTargetIndex !== this.curTargetIndex) {
        if (this.preTargetIndex) {
          activeRef.temp = this.curTargetIndex
          targetRef.temp = this.preTargetIndex

          const relative_active = getExchangePosition(activeRef, this.manager)
          const relative_target = getExchangePosition(targetRef, this.manager)

          setTranslate3d(activeRef.node, relative_active)
          setTranslate3d(targetRef.node, relative_target)
          setTransitionDuration(targetRef.node, CONFIG.animation)
        }

        this.preTargetIndex = this.curTargetIndex
      }
    }
  }

  render() {
    const contextValue = {
      manager: this.manager,
    }
    const { children, style, core, split, column = 4 } = this.props
    let coreItem = null
    if (core) {
      coreItem = children.splice(0, core)
    }

    return (
      <containerContext.Provider value={contextValue}>
        <div
          className='b-sort-container gm-padding-10'
          ref={this.containerRef}
          style={style}
        >
          <Grid className='gm-bg gm-padding-0' column={column}>
            {coreItem}
          </Grid>

          {coreItem && coreItem.length && split}
          <Grid
            className='gm-bg gm-padding-0'
            column={column}
            style={{
              opacity: 0.5,
            }}
          >
            {children}
          </Grid>
        </div>
      </containerContext.Provider>
    )
  }
}

Container.propTypes = {
  onSort: PropTypes.func, // 返回变换后的index
  style: PropTypes.object,
  core: PropTypes.number, // 分割线前面的Item数量
  split: PropTypes.element,
  column: PropTypes.number,
}

export default Container
