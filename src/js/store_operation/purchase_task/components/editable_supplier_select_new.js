import React, { useEffect, useRef } from 'react'
import Big from 'big.js'
import { i18next } from 'gm-i18n'
import { Price, Popover } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { TableUtil } from '@gmfe/table'
import OperationIconTip from '@gmfe/table/src/operation_icon_tip'
import { t } from 'gm-i18n'
import SVGEditPen from '../../../../svg/edit-pen.svg'
import { getSearchOption } from '../util'
import actions from '../../../actions'
import { saleReferencePrice } from 'common/enum'
import EditableSelect from 'common/components/editable_select'

const Base = ({
  list,
  purchase_task,
  onSave,
  task,
  closePopup,
  isGroupList,
}) => {
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
      is_new_ui: 1, // 为了兼容旧UI接口 区分新旧UI 1-新UI
    }
    actions.purchase_task_supplier_can_change_get(params)
  }

  useEffect(() => {
    getSupplierBySku()
  }, [])
  return (
    <EditableSelect
      isGroupList
      list={list}
      closePopup={closePopup}
      selected={{
        text: task.settle_supplier_name,
        value: task.settle_supplier_id,
      }}
      renderListItem={(supplier) => {
        const { reference_price_type } = purchase_task
        const { std_unit_name } = task
        let supplyRemain = supplier.supply_remain
        if (_.isNil(supplyRemain) || supplyRemain === '') {
          supplyRemain = '-'
        } else {
          supplyRemain = `${Big(supplyRemain).toFixed(2)}${std_unit_name}`
          if (supplier.supply_remain <= 0) {
            supplyRemain = <span className='gm-text-red'>{supplyRemain}</span>
          }
        }
        supplyRemain = (
          <span>
            {' '}
            {i18next.t('剩余可供')}:{supplyRemain}{' '}
          </span>
        )
        let suffixText = ''
        // 参考成本对应字段
        const referencePrice = _.find(saleReferencePrice, (item) => {
          if (item.type === reference_price_type) {
            return true
          }
        })
        const val = supplier[referencePrice.flag]
        suffixText += `，${referencePrice.name}:${
          _.isNil(val) || val === ''
            ? '-'
            : Big(val).div(100).toFixed(2) +
              Price.getUnit() +
              '/' +
              std_unit_name
        }`
        return (
          <div style={{ width: '180px' }}>
            {supplier.name}{' '}
            <span style={{ color: '#888' }}>
              {' '}
              ( {supplyRemain} {suffixText} ){' '}
            </span>
          </div>
        )
      }}
      onSave={onSave}
    />
  )
}

const EditButton = ({ popupRender, right }) => {
  const refPopover = useRef(null)
  const closePopup = () => refPopover.current.apiDoSetActive(false)

  return (
    <Popover
      ref={refPopover}
      popup={popupRender(closePopup)}
      right={right}
      offset={right ? 24 : -24}
      showArrow
      arrowLeft={right ? 'calc(100% - 42px)' : 26}
      animName={false}
    >
      <span style={{ display: 'inline-block', width: '20px' }}>
        <OperationIconTip tip={t('编辑')}>
          <span>
            <SVGEditPen className='gm-cursor gm-text-14 gm-text-hover-primary gm-text-primary' />
          </span>
        </OperationIconTip>
      </span>
    </Popover>
  )
}

EditButton.propTypes = {
  popupRender: PropTypes.func.isRequired,
  right: PropTypes.bool,
}

const EditableSupplierSelectNew = (props) => {
  const {
    purchase_task: { taskSupplierMap },
    task: { spec_id },
  } = props
  let list = []
  const supMap = taskSupplierMap[spec_id]
  if (supMap) {
    const { other_supplier, target_supplier } = supMap
    const targetSupplier = {
      label: i18next.t('推荐'),
      children: _.map(target_supplier, (ts) => ({
        ...ts,
        value: ts.id,
        text: ts.name,
      })),
    }
    const otherSupplier = {
      label: i18next.t('其他'),
      children: _.map(other_supplier, (os) => ({
        ...os,
        value: os.id,
        text: os.name,
      })),
    }
    list = [targetSupplier, otherSupplier]
  }

  return (
    <>
      <EditButton
        popupRender={(closePopup) => (
          <Base list={list} closePopup={closePopup} {...props} isGroupList />
        )}
      />
    </>
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
