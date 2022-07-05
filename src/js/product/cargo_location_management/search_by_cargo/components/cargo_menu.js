import React from 'react'
import _ from 'lodash'
import { store } from '../../store'
import { observer } from 'mobx-react'
import CargoMenuCommon from './cargo_menu_common'

const CargoLocationMenu = observer(() => {
  const { cargoLocationMenu } = store
  return (
    <>
      <ul
        className='stock-menu-list stock-menu-container'
        id='stock-menu-container'
      >
        {_.map(cargoLocationMenu, (item, index) => (
          <li
            key={index}
            className='stock-menu-list-block'
            ref={(ref) => (item.ref = ref)}
          >
            <CargoMenuCommon item={item} menu={cargoLocationMenu} />
          </li>
        ))}
      </ul>
    </>
  )
})

export default CargoLocationMenu
