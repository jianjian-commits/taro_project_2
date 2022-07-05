import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import CargoMenuCommon from './cargo_menu_common'

export default function CargoLocationMenuChildren(props) {
  const { menu } = props

  return (
    <div className='stock-menu-children'>
      <ul className='stock-menu-list'>
        {_.map(menu, (item, index) => (
          <li
            className='stock-menu-list-block-item'
            key={index}
            ref={(ref) => (item.ref = ref)}
          >
            <CargoMenuCommon item={item} menu={menu} />
          </li>
        ))}
      </ul>
    </div>
  )
}

CargoLocationMenuChildren.propTypes = {
  menu: PropTypes.object, // Observable 数组
}
