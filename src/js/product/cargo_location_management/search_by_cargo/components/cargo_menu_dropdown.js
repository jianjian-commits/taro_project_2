import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { store } from '../../store'
import _ from 'lodash'
import { Tip } from '@gmfe/react'

export default function CargoLocationMenuDropdown(props) {
  const { children, current, menu } = props
  const { shelf_id, parent_id } = current
  const [show, changeShow] = useState(false) // 显示下拉菜单状态
  const showDropdown = () => changeShow(!show)

  // 全局监听点击事件关闭浮层
  if (show) {
    window.addEventListener('click', showDropdown)
  } else {
    window.removeEventListener('click', showDropdown)
  }

  /**
   * 新增同级货位
   */
  const addSameLevel = () => {
    addShelf(parent_id, menu)
  }

  /**
   * 新增子级货位
   */
  const addChildLevel = () => {
    addShelf(shelf_id, current.children)
  }

  /**
   * 新增货位
   * @param parent_id
   * @param menu
   */
  const addShelf = (parent_id, menu) => {
    current.showIcon = false
    if (_.some(menu, (item) => item.edit)) {
      Tip.danger('当前还有未编辑完成的货位，请完成后重试！')
      document.getElementById('stock-menu-container').scrollTop =
        menu[menu.length - 1].ref.offsetTop - 2
      return
    }
    if (parent_id === shelf_id) {
      current.expand = true
    }
    menu.push({
      name: '',
      shelf_id: undefined,
      parent_id,
      edit: true,
    })
    store.setCargoLocationMenu(store.cargoLocationMenu)
  }

  return (
    <div className='stock-menu-list-dropdown' onClick={showDropdown}>
      {children}
      {show && (
        <div className='stock-menu-list-dropdown-menu'>
          <ul>
            <li onClick={addSameLevel}>{t('新建同级货位')}</li>
            {shelf_id > 0 && (
              <li onClick={addChildLevel}>{t('新建子级货位')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

CargoLocationMenuDropdown.propTypes = {
  current: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired, // observableArray
}
