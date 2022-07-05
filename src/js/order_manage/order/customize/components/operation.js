import React, { useRef, useState } from 'react'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gmfe/table-x'
import { Tip, Checkbox, PopupContentConfirm, Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import store from '../store'
import { Request } from '@gm-common/request'
import { SvgDelete } from 'gm-svg'
import globalStore from 'stores/global'

const Delete = (props) => {
  const { children, ...rest } = props
  const refPopover = useRef()

  const handleDelete = () =>
    Promise.resolve(rest.onClick()).then(() => {
      handleCancel()
    })

  const handleCancel = () => refPopover.current.apiDoSetActive(false)

  return (
    <Popover
      ref={refPopover}
      right
      popup={
        <PopupContentConfirm
          type='delete'
          title={t('警告')}
          onDelete={handleDelete}
          onCancel={handleCancel}
        >
          {children}
        </PopupContentConfirm>
      }
      showArrow
    >
      <div className='gm-inline-block gm-cursor gm-padding-5 gm-text-14 gm-text-hover-primary'>
        <TableXUtil.OperationIconTip tip={t('删除')}>
          <span>
            <SvgDelete />
          </span>
        </TableXUtil.OperationIconTip>
      </div>
    </Popover>
  )
}

const OperationCell = ({ original }) => {
  const [checked, setChecked] = useState(false)
  const [warning, setWarning] = useState(false)
  const canDeleteOrderCustomizedField = globalStore.hasPermission(
    'delete_order_customized_field',
  )
  function handleDelete(id) {
    if (!checked) {
      setWarning(true)
      return Promise.reject(new Error('not checked'))
    }
    return Request('/station/customized_field/delete')
      .data({ id })
      .post()
      .then((json) => {
        Tip.success(t('删除成功'))
        store.fetchList()
      })
  }

  function handleChecked() {
    const bool = !checked
    setChecked(bool)
    if (bool && warning) {
      setWarning(false)
    }
  }
  return (
    <TableXUtil.OperationCell>
      <TableXUtil.OperationDetail
        href={`#/order_manage/order/customize/detail?id=${original.id}`}
      />
      {canDeleteOrderCustomizedField && (
        <Delete onClick={handleDelete.bind(null, original.id)}>
          <div>
            <div className='gm-margin-bottom-5'>
              {t('确定要删除自定义字段：') + original.field_name + '?'}
            </div>
            <div className='gm-text-red gm-margin-bottom-5'>
              {t(
                '1. 删除自定义字段后，已有订单中的该字段将不在所有模块（订单、拣货、分拣、配送、财务结算、售后、运营报表）中展示，也无法更改字段内容；',
              )}
              <br />
              {t('2. 删除后新创建订单，将不再展示该自定义字段；')}
              <br />
              {t('3. 删除字段后，相关数据将无法恢复。请谨慎操作')} <br />
            </div>
            <Checkbox checked={checked} onChange={handleChecked}>
              {t('我已阅读以上提示，确认要删除自定义字段')}
            </Checkbox>
            {!checked && warning && (
              <div className='gm-text-red gm-padding-top-5'>{t('请勾选')}</div>
            )}
          </div>
        </Delete>
      )}
    </TableXUtil.OperationCell>
  )
}

OperationCell.propTypes = {
  original: PropTypes.object,
}

export default OperationCell
