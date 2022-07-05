import { i18next } from 'gm-i18n'
import React from 'react'
import { CheckboxGroup, Checkbox, Flex, Tip, Button } from '@gmfe/react'
import qs from 'query-string'
import { observer } from 'mobx-react'
import { openNewTab } from 'common/util'
import PropTypes from 'prop-types'

import store from './store'

@observer
class PopupPrintModal extends React.Component {
  handlePrint = () => {
    const {
      to_print_what,
      selectedList,
      isSelectAllPage,
      getRequestFilter
    } = store
    const { currentCommander } = this.props
    const { to_print_task, to_print_sku } = to_print_what

    // 提示用户选择打印单
    if (!to_print_sku[0] && !to_print_task[0]) {
      Tip.warning(i18next.t('请选择将要打印的单据!'))
      return
    }

    const query = { ...getRequestFilter() }
    if (!isSelectAllPage) {
      query.print_all = false
      currentCommander
        ? (query.print_commanders = JSON.stringify([
            currentCommander.distributor_id
          ]))
        : (query.print_commanders = JSON.stringify(selectedList))
    }

    // 打印团长商品清单
    if (to_print_sku[0]) {
      query.to_print_sku = true
    }
    // 打印团长任务
    if (to_print_task[0]) {
      query.to_print_task = true
    }

    const URL = '#/system/setting/distribute_templete/commander_task_printer'

    openNewTab(`${URL}?${qs.stringify(query)}`)
    this.props.closeModal()
  }

  render() {
    const { to_print_sku, to_print_task } = store.to_print_what

    return (
      <Flex
        column
        style={{ width: '350px' }}
        className='b-distribute-order-popup-right'
      >
        <Flex
          justifyBetween
          alignCenter
          className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
        >
          <h4>{i18next.t('选择单据')}</h4>
          <Button type='primary' onClick={this.handlePrint}>
            {i18next.t('打印')}
          </Button>
        </Flex>

        <div className='gm-margin-top-20 gm-margin-bottom-10'>
          <CheckboxGroup
            name='task_list'
            value={to_print_task.slice()}
            onChange={value => {
              store.mergePrintType({ to_print_task: value })
            }}
          >
            <Checkbox value checked>
              {i18next.t('团长任务核查单')}
            </Checkbox>
          </CheckboxGroup>
          <div className='gm-text-helper b-distribute-order-popup-padding-l-19'>
            {i18next.t('将单个团长所有订单汇总成一张明细单，一团长一单')}
          </div>
        </div>

        <div>
          <CheckboxGroup
            name='sku_list'
            value={to_print_sku.slice()}
            onChange={value => {
              store.mergePrintType({ to_print_sku: value })
            }}
          >
            <Checkbox value>{i18next.t('团长商品清单')}</Checkbox>
          </CheckboxGroup>
          <div className='gm-text-helper b-distribute-order-popup-padding-l-19'>
            {i18next.t('将单个团长所有商品名汇总成一张配送单，一团长一单')}
          </div>
        </div>
      </Flex>
    )
  }
}

PopupPrintModal.propTypes = {
  currentCommander: PropTypes.object,
  closeModal: PropTypes.func
}

export default PopupPrintModal
