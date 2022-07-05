import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Sheet,
  SheetColumn,
  SheetAction,
  Tip,
  Dialog,
  InputNumber,
  Price,
} from '@gmfe/react'
import { TreeSelect, QuickPanel } from '@gmfe/react-deprecated'
import _ from 'lodash'
import moment from 'moment'
import styles from '../../product.module.less'
import actions from '../../../actions'
import { fillBatchNum } from '../../util'
import {
  PRODUCT_REASON_TYPE,
  PRODUCT_ACTION_TYPE,
  PRODUCT_METHOD_TYPE,
} from '../../../common/enum'

class SharePanel extends React.Component {
  constructor() {
    super()

    this.state = {
      dialogShow: false,
      method: '1', // 分摊方式
      action: '0', // 分摊类型
      money: '', // 分摊金额
      remark: '', // 分摊备注
      reason: '0', // 分摊原因
      selected: [],
    }

    this.handleShareAdd = ::this.handleShareAdd
    this.handleShareMethodChange = ::this.handleShareMethodChange
    this.handleDialogOK = ::this.handleDialogOK
    this.handleDialogCancel = ::this.handleDialogCancel
    this.handleShareProductSelect = ::this.handleShareProductSelect
    this.handleChangeMoney = ::this.handleChangeMoney
  }

  handleShareDel(index) {
    this.props.onDel && this.props.onDel(index)
  }

  handleShareMethodChange(e) {
    this.setState({ method: e.target.value })
  }

  handleChangeMoney(money) {
    this.setState({ money })
  }

  handleDialogOK() {
    const { selected, action, method, remark, reason, money } = this.state

    if (this.state.action === '0') {
      Tip.warning(i18next.t('请选择分摊类型'))
      return false
    }
    if (this.state.reason === '0') {
      Tip.warning(i18next.t('请选择分摊原因'))
      return false
    }
    if (this.state.money === '') {
      Tip.warning(i18next.t('请填写分摊金额'))
      return false
    }
    if (selected.length === 0) {
      Tip.warning(i18next.t('请选择分摊商品'))
      return false
    }

    const share = {
      action: action,
      method: method,
      remark: remark,
      reason: reason,
      money: money,
      in_sku_logs: selected,
    }

    this.props.onAdd && this.props.onAdd(share)

    this.setState({
      dialogShow: false,
      method: '1', // 分摊方式
      action: '0', // 分摊类型
      money: '', // 分摊金额
      remark: '', // 分摊备注
      reason: '0', // 分摊原因
      selected: [],
    })
  }

  handleDialogCancel() {
    this.setState({ dialogShow: false })
  }

  handleShareProductSelect(selected) {
    this.setState({ selected })
  }

  handleShareAdd() {
    const { inStockDetail } = this.props.product
    const { details } = inStockDetail

    if (details.length === 0) {
      Tip.warning(i18next.t('请先添加商品明细！'))
      return
    }

    // add 批次号
    _.forEach(details, (val, index) => {
      details[index].batch_number =
        inStockDetail.id + '-' + fillBatchNum(++index)
    })

    const invalid = _.find(details, (value) => {
      return !(value.name && value.quantity && value.money && value.unit_price)
    })

    if (!_.isEmpty(invalid)) {
      Tip.warning(i18next.t('商品明细填写不完善'))
      return
    }

    if (inStockDetail.submit_time === '-') {
      inStockDetail.submit_time = moment(new Date()).format('YYYY-MM-DD')
    }

    actions
      .product_in_stock_submit(
        Object.assign(
          {},
          inStockDetail,
          { details: JSON.stringify(inStockDetail.details) },
          { share: JSON.stringify(inStockDetail.share) },
          { discount: JSON.stringify(inStockDetail.discount) },
          { is_submit: 1 }
        )
      )
      .then(() => {
        actions.product_share_product(this.props.params.id).then(() => {
          this.setState({ dialogShow: true })
        })
      })
  }

  render() {
    const { editable } = this.props
    const { inStockDetail, shareProduct } = this.props.product
    const { share } = inStockDetail

    return (
      <QuickPanel
        icon='bill'
        title={i18next.t('费用分摊')}
        collapse
        className={styles.tableBottom}
      >
        <Sheet list={share.length === 0 ? [{}] : share}>
          <SheetColumn field='create_time' name={i18next.t('操作时间')}>
            {(value) => {
              return value || '-'
            }}
          </SheetColumn>
          <SheetColumn field='reason' name={i18next.t('分摊原因')}>
            {(reason) => {
              return PRODUCT_REASON_TYPE[reason] || '-'
            }}
          </SheetColumn>
          <SheetColumn field='action' name={i18next.t('分摊类型')}>
            {(action) => {
              return PRODUCT_ACTION_TYPE[action] || '-'
            }}
          </SheetColumn>
          <SheetColumn field='money' name={i18next.t('分摊金额')}>
            {(money) => {
              return money ? money + Price.getUnit() : '-'
            }}
          </SheetColumn>
          <SheetColumn field='method' name={i18next.t('分摊方式')}>
            {(method) => {
              return PRODUCT_METHOD_TYPE[method] || '-'
            }}
          </SheetColumn>
          <SheetColumn field='remark' name={i18next.t('备注')}>
            {(remark) => {
              return remark || '-'
            }}
          </SheetColumn>
          <SheetColumn field='operator' name={i18next.t('操作人')}>
            {(operator) => {
              return operator || '-'
            }}
          </SheetColumn>
          {editable ? (
            <SheetAction>
              {(row, index) => {
                return (
                  <div>
                    {share.length > 0 ? undefined : (
                      <span
                        className={'glyphicon glyphicon-plus ' + styles.icon}
                        onClick={this.handleShareAdd}
                      />
                    )}
                    &nbsp;
                    <span
                      className={'glyphicon glyphicon-trash ' + styles.icon}
                      onClick={this.handleShareDel.bind(this, index)}
                    />
                  </div>
                )
              }}
            </SheetAction>
          ) : undefined}
        </Sheet>
        <Dialog
          title={i18next.t('费用分摊')}
          show={this.state.dialogShow}
          bsSize='md'
          onCancel={this.handleDialogCancel}
          onOK={this.handleDialogOK}
        >
          <div className='form-horizontal gm-padding-15'>
            <div className='form-group'>
              <label htmlFor='share-reason' className='col-sm-3 control-label'>
                {i18next.t('分摊原因')}：
              </label>
              <div className='col-sm-9'>
                <select
                  onChange={(e) => this.setState({ reason: e.target.value })}
                  id='share-reason'
                  className='form-control input-sm'
                >
                  <option value='0'>{i18next.t('请选择')}</option>
                  {_.map(PRODUCT_REASON_TYPE, (value, key) => {
                    return (
                      <option value={key} key={key}>
                        {value}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='share-action' className='col-sm-3 control-label'>
                {i18next.t('分摊类型')}：
              </label>
              <div className='col-sm-9'>
                <select
                  onChange={(e) => this.setState({ action: e.target.value })}
                  id='share-action'
                  className='form-control input-sm'
                >
                  <option value='0'>{i18next.t('请选择')}</option>
                  {_.map(PRODUCT_ACTION_TYPE, (value, key) => {
                    return (
                      <option value={key} key={key}>
                        {value}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='share-money' className='col-sm-3 control-label'>
                {i18next.t('分摊金额')}：
              </label>
              <div className='col-sm-9'>
                <InputNumber
                  min={0}
                  onChange={this.handleChangeMoney}
                  value={this.state.money}
                  className='form-control'
                  placeholder={i18next.t('金额')}
                  precision={2}
                />
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='share-method' className='col-sm-3 control-label'>
                {i18next.t('分摊方式')}：
              </label>
              <div className='col-sm-9'>
                {_.map(PRODUCT_METHOD_TYPE, (value, key) => {
                  return (
                    <label key={key} className='radio-inline'>
                      <input
                        type='radio'
                        value={key}
                        defaultChecked={key === '1'}
                        onChange={this.handleShareMethodChange}
                        name='share-method'
                      />
                      {value}
                    </label>
                  )
                })}
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='share-method' className='col-sm-3 control-label'>
                {i18next.t('分摊商品')}：
              </label>
              <div className='col-sm-9'>
                <TreeSelect
                  list={shareProduct}
                  label={i18next.t('选择全部商品')}
                  disabledSelected={false}
                  selected={this.state.selected}
                  onSelect={this.handleShareProductSelect}
                />
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='share-remark' className='col-sm-3 control-label'>
                {i18next.t('备注')}：
              </label>
              <div className='col-sm-9'>
                <textarea
                  onChange={(e) => this.setState({ remark: e.target.value })}
                  className='form-control'
                  id='share-remark'
                />
              </div>
            </div>
          </div>
        </Dialog>
      </QuickPanel>
    )
  }
}

export default SharePanel
