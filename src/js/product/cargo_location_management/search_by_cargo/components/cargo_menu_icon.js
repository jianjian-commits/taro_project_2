import React from 'react'
import PropTypes from 'prop-types'
import { SvgDelete, SvgDriverEdit, SvgPlus } from 'gm-svg'
import { Dialog, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { store } from '../../store'
import CargoMenuDropdown from './cargo_menu_dropdown'
import { searchByCargoLocation } from '../../utils'

export default function CargoLocationMenuIcon(props) {
  const { current, menu } = props
  const { shelf_id } = current
  const { shelf_id: id } = current

  const editItem = () => {
    current.edit = true
    store.setCargoLocationMenu(store.cargoLocationMenu)
  }

  const deleteItem = () => {
    Dialog.confirm({
      title: t('删除货位'),
      children: t(
        '删除后该货位层级及子级中的商品信息将移入“未分配“中，请确认是否删除？'
      ),
      onOK: () =>
        Request('/stock/shelf_location/delete')
          .data({ id })
          .post()
          .then(() => {
            Tip.success(t('删除成功'))
            store.getCargoLocationMenu()
            searchByCargoLocation(store.cargoLocationMenu[0])
            store.clearToMoveListWithDeleteShelf()
          }),
    })
  }

  return (
    <div
      className='stock-menu-list-icon stock-menu-list-icon-right'
      onClick={(event) => event.stopPropagation()}
    >
      <CargoMenuDropdown current={current} menu={menu}>
        <span>
          <SvgPlus />
        </span>
      </CargoMenuDropdown>
      {shelf_id > 0 && (
        <>
          <span onClick={editItem}>
            <SvgDriverEdit />
          </span>
          <span onClick={deleteItem}>
            <SvgDelete />
          </span>
        </>
      )}
    </div>
  )
}
CargoLocationMenuIcon.propTypes = {
  current: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired, // observableArray
}
