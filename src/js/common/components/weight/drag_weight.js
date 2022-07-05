import React from 'react'
import { observer } from 'mobx-react'
import Weight from './index'
import { Storage } from '@gmfe/react'

const KEY = 'DRAGWEIGHT'

@observer
class DragWeight extends React.Component {
  constructor(props) {
    super(props)

    let pos = Storage.get(KEY) || {
      top: 40,
      left: window.innerWidth - 270,
    }

    this.state = this.processPos(pos)

    this.startPos = null
  }

  componentDidMount() {
    // 移动端适配
    const drag = document.getElementById('mes_draggable')
    drag.addEventListener('touchstart', this.touchHandler, true)
    drag.addEventListener('touchmove', this.touchHandler, true)
    drag.addEventListener('touchend', this.touchHandler, false)
    drag.addEventListener('touchcancel', this.touchHandler, true)
  }

  // 移动端适配
  touchHandler = (event) => {
    const touches = event.changedTouches
    const first = touches[0]
    if (event.type === 'touchstart') {
      this.startPos = {
        clientX: first.clientX,
        clientY: first.clientY,
      }
    } else if (event.type === 'touchend' || event.type === 'touchmove') {
      this.handleDragEnd({
        clientX: first.clientX,
        clientY: first.clientY,
      })
      this.startPos = {
        clientX: first.clientX,
        clientY: first.clientY,
      }
    }
    event.preventDefault()
  }

  processPos = (pos) => {
    return {
      top: Math.max(Math.min(pos.top, window.innerHeight - 60), 0),
      left: Math.max(Math.min(pos.left, window.innerWidth - 270), 0),
    }
  }

  handleDragStart = ({ clientX, clientY }) => {
    this.startPos = { clientX, clientY }
  }

  handleDragEnd = ({ clientX, clientY }) => {
    const diffX = clientX - this.startPos.clientX
    const diffY = clientY - this.startPos.clientY

    const pos = this.processPos({
      top: this.state.top + diffY,
      left: this.state.left + diffX,
    })

    this.setState({ ...pos })

    Storage.set(KEY, pos)
  }

  render() {
    const { top, left } = this.state

    return (
      <div
        id='mes_draggable'
        className='text-center'
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'move',
          background: '#595A5E',
          height: '60px',
          width: '240px',
          lineHeight: '50px',
          position: 'fixed',
          top: top + 'px',
          left: left + 'px',
        }}
        draggable
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
      >
        <Weight style={{ fontSize: '30px', color: 'white' }} />
      </div>
    )
  }
}

export default DragWeight
