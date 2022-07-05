/**
 * @description 周期定价列表右侧操作按钮
 */
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { TableUtil } from '@gmfe/table'
import { i18next } from 'gm-i18n'
import store from '../store'
import openPrintModal from '../../component/pre_print_modal'
import SVGPen from 'svg/pen.svg'
import SVGPrint from 'svg/print.svg'

const { OperationDelete, OperationCell, OperationIconTip } = TableUtil

function CyclePriceOperation(props) {
  const { original, openCyclePriceModal } = props

  // 编辑规则
  function handleEdit(ruleObj) {
    ruleObj.effective_time = new Date(ruleObj.effective_time)
    store.clearCyclePriceRule()
    store.changeCyclePriceRule(ruleObj)
    openCyclePriceModal()
  }

  // 打印
  function handlePrint(ruleId) {
    openPrintModal({
      salemenu_id: ruleId,
      type: 'cycle_price',
      target_url: '#/system/setting/distribute_templete/salemenus_printer',
    })
  }

  // 删除规则
  function handleDelete(id) {
    store.deleteCyclePriceRule({
      rule_ids: [id],
    })
  }

  return (
    <OperationCell>
      {original.rule_status === 0 ? (
        <OperationIconTip tip={i18next.t('编辑')}>
          <span
            className='gm-cursor gm-margin-lr-5 gm-text-14 gm-text-hover-primary'
            onClick={() => handleEdit(original)}
          >
            <SVGPen />
          </span>
        </OperationIconTip>
      ) : null}
      <OperationIconTip tip={i18next.t('打印')}>
        <span
          className='gm-cursor gm-text-14 gm-text-hover-primary'
          onClick={() => handlePrint(original.rule_id)}
        >
          <SVGPrint />
        </span>
      </OperationIconTip>
      <OperationDelete
        onClick={() => handleDelete(original.rule_id)}
        title={i18next.t('删除定价规则')}
      >
        {i18next.t('是否确定要删除该定价规则？')}
      </OperationDelete>
    </OperationCell>
  )
}

CyclePriceOperation.propTypes = {
  original: PropTypes.object,
  openCyclePriceModal: PropTypes.func,
}

export default observer(CyclePriceOperation)
