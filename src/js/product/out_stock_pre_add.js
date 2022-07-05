import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Tip, Button } from '@gmfe/react'

import './actions'
import './reducer'
import actions from '../actions'
import { isNumOrEnglish } from '../common/util'
import { history } from '../common/service'
import _ from 'lodash'

class OutStockPreAdd extends React.Component {
  constructor(props) {
    super(props)

    this.handleNextStep = ::this.handleNextStep
    this.handleCancel = ::this.handleCancel
    this.handleOutStockObjectChange = ::this.handleOutStockObjectChange
    this.handleOutStockId = ::this.handleOutStockId
  }

  componentWillUnmount() {
    actions.product_out_stock_object('')
    actions.product_out_stock_id('')
  }

  handleNextStep(event) {
    event.preventDefault()
    const { outStockObject, outStockId } = this.props.product

    // 手动新建的入库单号只能为数字和字母，不能以LK或PL开头
    if (!isNumOrEnglish(outStockId)) {
      Tip.warning(i18next.t('出库单号只能输入数字和字母'))
      return false
    } else if (
      _.startsWith(_.toUpper(outStockId), 'LK') ||
      _.startsWith(_.toUpper(outStockId), 'PL')
    ) {
      Tip.warning(i18next.t('手动新建的出库单号不能以LK、lk、PL、pl开头'))
      return false
    }

    actions
      .product_out_stock_add({
        out_stock_target: outStockObject,
        id: outStockId,
      })
      .then((json) => {
        history.push(`/sales_invoicing/stock_out/product/add/${json.data.id}`)
      })
  }

  handleCancel() {
    window.closeWindow()
  }

  handleOutStockObjectChange(event) {
    event.preventDefault()
    actions.product_out_stock_object(event.target.value)
  }

  handleOutStockId(event) {
    event.preventDefault()
    actions.product_out_stock_id(event.target.value)
  }

  render() {
    const { outStockObject, outStockId } = this.props.product
    return (
      <div>
        <Flex row justifyStart className='b-create-panel gm-bg gm-text-12'>
          <Flex
            flex={1}
            justifyCenter
            alignCenter
            className='gm-border-right gm-margin-right-15'
          >
            <div
              className='gm-text-desc b-create-panel-label'
              style={{ width: '66px' }}
            >
              {' '}
              {i18next.t('出库单号')}：
            </div>
            <Flex>
              <input
                type='text'
                className='gm-paddingLR5 form-control'
                placeholder={i18next.t('手动出库请填写出库单号便于记录')}
                value={outStockId}
                onChange={this.handleOutStockId}
              />
            </Flex>
          </Flex>
          <Flex
            flex={1}
            column
            justifyBetween
            alignStart
            className='gm-margin-left-15'
          >
            <Flex justifyStart alignCenter>
              <Flex className='gm-text-desc b-create-panel-label'>
                {i18next.t('出库对象')}：
              </Flex>
              <Flex>
                <input
                  type='text'
                  className='gm-paddingLR5 form-control'
                  placeholder={i18next.t('手动出库需填写出库对象')}
                  value={outStockObject}
                  onChange={this.handleOutStockObjectChange}
                />
              </Flex>
            </Flex>
            <Flex justifyStart alignCenter className='gm-margin-top-10'>
              <div className='gm-text-desc b-create-panel-label'>
                {i18next.t('出库单状态')}：
              </div>
              <div> - </div>
            </Flex>
          </Flex>
          <Flex flex={1} column justifyBetween alignStart>
            <Flex style={{ marginTop: '8px' }} justifyStart alignCenter>
              <div
                className='gm-text-desc b-create-panel-label'
                style={{ width: '66px' }}
              >
                {i18next.t('出库时间')}：
              </div>
              <div> - </div>
            </Flex>
            <Flex justifyStart alignCenter>
              <div
                className='gm-text-desc b-create-panel-label'
                style={{ width: '66px' }}
              >
                {i18next.t('建单人')}：
              </div>
              <div> - </div>
            </Flex>
          </Flex>
        </Flex>
        <Flex justifyEnd className='b-create-panel-btn-container gm-bg'>
          <Button className='gm-margin-right-5' onClick={this.handleCancel}>
            {i18next.t('取消')}
          </Button>
          <Button
            type='primary'
            htmlType='submit'
            onClick={this.handleNextStep}
            disabled={!outStockObject || !outStockId}
          >
            {i18next.t('保存')}
          </Button>
        </Flex>
      </div>
    )
  }
}

export default OutStockPreAdd
