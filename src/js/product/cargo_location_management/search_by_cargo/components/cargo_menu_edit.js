import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, FormItem, FormButton, Input, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import { SvgOk, SvgRemove } from 'gm-svg'
import { store } from '../../store'
import { Request } from '@gm-common/request'
import { findCargoLocationById } from '../../utils'
import _ from 'lodash'

function CargoMenuEdit(props) {
  const inputRef = useRef()
  const { current, menu } = props
  const { name, shelf_id: id, parent_id } = current
  const [new_name, changeNewName] = useState(name)

  useEffect(() => inputRef.current.focus(), [])

  const handleCancel = () => {
    current.edit = false
    if (!id) {
      // 如果是添加则删除当前项
      menu.pop()
    }
    store.setCargoLocationMenu(store.cargoLocationMenu)
  }

  const handleOk = () => {
    if (!_.trim(new_name).length) {
      Tip.warning(t('请填写货位名'))
      return
    }
    if (_.trim(new_name).length > 12) {
      Tip.warning(t('货位名不可超过12个字符'))
      return
    }
    const url = id ? '/stock/shelf_location/edit' : '/stock/shelf_location/add'
    const option = id // 有id是编辑，没有是添加
      ? { id, new_name: _.trim(new_name) }
      : { parent_id, name: _.trim(new_name) }
    Request(url)
      .data(option)
      .post()
      .then(({ data }) => {
        Tip.success(id ? t('编辑成功') : t('添加成功'))
        store.getCargoLocationMenu().then((list) => {
          findCargoLocationById(id || data.id, list)
          store.setCargoLocationMenu(list)
        })
      })
  }

  return (
    <Form inline onClick={(event) => event.stopPropagation()}>
      <FormItem>
        <Input
          placeholder={t('请输入货位名')}
          className='form-control stock-menu-edit-input'
          value={new_name}
          onChange={(event) => changeNewName(event.target.value)}
          ref={inputRef}
        />
      </FormItem>
      <FormButton>
        <span
          className='stock-menu-edit-icon'
          title={t('保存')}
          onClick={handleOk}
        >
          <SvgOk />
        </span>
        <div className='gm-gap-5' />
        <span
          className='stock-menu-edit-icon'
          title={t('取消')}
          onClick={handleCancel}
        >
          <SvgRemove />
        </span>
      </FormButton>
    </Form>
  )
}

CargoMenuEdit.propTypes = {
  current: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired, // observableArray
}

export default CargoMenuEdit
