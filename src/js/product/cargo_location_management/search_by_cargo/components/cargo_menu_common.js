import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import {
  handleToggleIcon,
  openChildren,
  searchByCargoLocation,
} from '../../utils'
import CargoMenuIcon from './cargo_menu_icon'
import _ from 'lodash'
import { SvgDownTriangle, SvgRightTriangle } from 'gm-svg'
import CargoMenuChildren from './cargo_menu_children'
import CargoMenuEdit from './cargo_menu_edit'

export default function CargoLocationMenuCommon(props) {
  const { item, menu } = props

  return (
    <>
      <div
        className={classNames(
          'stock-menu-list-item',
          item.selected && 'stock-menu-list-item-selected'
        )}
        onClick={() => searchByCargoLocation(item)}
        onMouseEnter={() => handleToggleIcon(item, true)}
        onMouseLeave={() => handleToggleIcon(item, false)}
      >
        {item.edit ? (
          <CargoMenuEdit current={item} menu={menu} />
        ) : (
          <>
            {item.name}
            {item.showIcon && <CargoMenuIcon current={item} menu={menu} />}
            {_.isArrayLike(item.children) && item.children.length > 0 && (
              <span
                className='stock-menu-list-icon'
                onClick={(event) => openChildren(item, event)}
              >
                {item.expand ? <SvgDownTriangle /> : <SvgRightTriangle />}
              </span>
            )}
          </>
        )}
      </div>
      {item.expand && item.children.length > 0 && (
        <CargoMenuChildren menu={item.children} />
      )}
    </>
  )
}

CargoLocationMenuCommon.propTypes = {
  item: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired, // observableArray
}
