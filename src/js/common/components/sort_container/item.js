import React, { useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { containerContext } from './container'
import { getCenterPoint } from './util'

const Item = ({ children, index, style }) => {
  const itemRef = useRef()
  const { manager } = useContext(containerContext)

  useEffect(() => {
    const centerPoint = getCenterPoint(itemRef.current)
    manager.setPositionMap(index + 1, centerPoint)
  }, [])

  useEffect(() => {
    const register = () => {
      const centerPoint = getCenterPoint(itemRef.current)
      const ref = {
        node: itemRef.current,
        temp: index + 1,
        info: {
          index: index + 1,
          manager,
          point: centerPoint,
        },
      }
      manager.replace(ref, index)
    }
    register()
  }, [manager, index])

  return (
    <div className='b-sort-item' ref={itemRef} style={style}>
      <div className='item-shadow'>{children}</div>
    </div>
  )
}

Item.propTypes = {
  index: PropTypes.number.isRequired,
  style: PropTypes.object,
}

export default Item
