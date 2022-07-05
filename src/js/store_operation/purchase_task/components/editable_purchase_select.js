import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { TableUtil } from '@gmfe/table'
import _ from 'lodash'

import { getSearchOption } from '../util'
import actions from '../../../actions'
import EditableSelect from 'common/components/editable_select'

const Base = ({ list, purchase_task, onSave, task, closePopup }) => {
  const getSupplierBySku = () => {
    const options = getSearchOption(purchase_task)
    const { q_type, begin_time, end_time, time_config_id } = options
    // 获取供应商需要的参数
    const params = {
      q_type,
      begin_time,
      end_time,
      time_config_id,
      spec_id: task.spec_id,
      is_new_ui: 1,
    }
    actions.purchase_task_supplier_can_change_get(params)
  }

  useEffect(() => {
    getSupplierBySku()
  }, [])

  return (
    <EditableSelect
      list={list}
      closePopup={closePopup}
      selected={{
        text: task.purchaser_name,
        value: task.purchaser_id,
      }}
      onSave={onSave}
    />
  )
}

const EditableSupplierSelectNew = (props) => {
  const {
    purchase_task: { taskSupplierMap },
    task,
  } = props
  let supplier
  let purchasers
  if (taskSupplierMap && taskSupplierMap[task.spec_id]) {
    // 整合数据(供应商整合 供应商下面对应的有他的采购员列表)
    // const list = taskSupplierMap[task.spec_id]
    const list = [
      ...taskSupplierMap[task.spec_id].other_supplier,
      ...taskSupplierMap[task.spec_id].target_supplier,
    ]
    // 找到对应的采购员列表
    supplier = _.find(list, (item) => task.settle_supplier_id === item.id) || {}
    // 整合采购员列表然后传给base组件
    purchasers = _.map(supplier.purchasers || [], (item) => ({
      ...item,
      value: item.id,
      text: item.name,
    }))
  }

  return (
    <TableUtil.EditButton
      popupRender={(closePopup) => (
        <Base list={purchasers} closePopup={closePopup} {...props} />
      )}
    />
  )
}

EditableSupplierSelectNew.propTypes = {
  purchase_task: PropTypes.object,
  onSave: PropTypes.func,
  task: PropTypes.object,
}

Base.propTypes = {
  ...EditableSupplierSelectNew.propTypes,
  list: PropTypes.array,
  closePopup: PropTypes.func,
}

export default EditableSupplierSelectNew
