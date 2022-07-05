import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Tip, Dialog, InputNumber, Price, BoxPanel } from '@gmfe/react'
import {
  fixedColumnsTableXHOC,
  TableX,
  TableXUtil,
  editTableXHOC,
} from '@gmfe/table-x'
import _ from 'lodash'
const { TABLE_X, OperationHeader, EditOperation } = TableXUtil
const FixedColumnsEditTableX = fixedColumnsTableXHOC(editTableXHOC(TableX))

class DiscountPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dialogShow: false,
      action: '0', // 分摊类型
      money: '', // 分摊金额
      remark: '', // 分摊备注
      reason: '0', // 分摊原因
    }
  }

  handleDiscountDel(index) {
    this.props.onDel(index)
  }

  handleChangeMoney = (money) => {
    this.setState({ money })
  }

  handleDialogOK = () => {
    if (this.state.action === '0') {
      Tip.warning(i18next.t('请选择折让类型'))
      return false
    }
    if (this.state.reason === '0') {
      Tip.warning(i18next.t('请选择折让原因'))
      return false
    }
    if (this.state.money === '') {
      Tip.warning(i18next.t('请填写折让金额'))
      return false
    }

    const discount = {
      action: this.state.action,
      remark: this.state.remark,
      reason: this.state.reason,
      money: this.state.money,
    }

    this.props.onAdd(discount)

    this.setState({
      dialogShow: false,
      action: '0', // 分摊类型
      money: '', // 分摊金额
      remark: '', // 分摊备注
      reason: '0', // 分摊原因
    })
  }

  handleDialogCancel = () => {
    this.setState({ dialogShow: false })
  }

  handleDiscountAdd = () => {
    this.setState({ dialogShow: true })
  }

  render() {
    const { reasonMap, actionMap, editable, list } = this.props

    return (
      <BoxPanel
        title={i18next.t('金额折让')}
        summary={[{ text: i18next.t('合计'), value: list.length }]}
        collapse
      >
        <FixedColumnsEditTableX
          data={list.length === 0 ? [{}] : list}
          columns={[
            {
              Header: OperationHeader,
              accessor: 'action',
              fixed: 'left',
              show: editable,
              width: TABLE_X.WIDTH_OPERATION,
              Cell: ({ row }) => {
                const { index } = row
                return (
                  <EditOperation
                    onAddRow={this.handleDiscountAdd.bind(this, index)}
                    onDeleteRow={this.handleDiscountDel.bind(this, index)}
                  />
                )
              },
            },
            {
              Header: i18next.t('操作时间'),
              accessor: 'create_time',
            },
            {
              Header: i18next.t('折让原因'),
              id: 'reason',
              accessor: (d) => reasonMap[d.reason] || '-',
            },
            {
              Header: i18next.t('折让类型'),
              id: 'action',
              accessor: (d) => actionMap[d.action] || '-',
            },
            {
              Header: i18next.t('折让金额'),
              id: 'money',
              accessor: (d) => (d.money ? d.money + Price.getUnit() : '-'),
            },
            {
              Header: i18next.t('备注'),
              accessor: 'remark',
            },
            {
              Header: i18next.t('操作人'),
              accessor: 'operator',
            },
          ]}
        />
        <Dialog
          title={i18next.t('金额折让')}
          show={this.state.dialogShow}
          bsSize='md'
          onCancel={this.handleDialogCancel}
          onOK={this.handleDialogOK}
        >
          <div className='form-horizontal gm-padding-15'>
            <div className='form-group'>
              <label
                htmlFor='discount-reason'
                className='col-sm-3 control-label'
              >
                {i18next.t('折让原因')}：
              </label>
              <div className='col-sm-9'>
                <select
                  onChange={(e) => this.setState({ reason: e.target.value })}
                  id='discount-reason'
                  className='form-control input-sm'
                >
                  <option value='0'>{i18next.t('请选择')}</option>
                  {_.map(reasonMap, (value, key) => {
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
              <label
                htmlFor='discount-action'
                className='col-sm-3 control-label'
              >
                {i18next.t('折让类型')}：
              </label>
              <div className='col-sm-9'>
                <select
                  onChange={(e) => this.setState({ action: e.target.value })}
                  id='discount-action'
                  className='form-control input-sm'
                >
                  <option value='0'>{i18next.t('请选择')}</option>
                  {_.map(actionMap, (value, key) => {
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
              <label
                htmlFor='discount-money'
                className='col-sm-3 control-label'
              >
                {i18next.t('金额')}：
              </label>
              <div className='col-sm-9'>
                <InputNumber
                  min={0}
                  precision={2}
                  value={this.state.money}
                  onChange={this.handleChangeMoney}
                  className='form-control'
                  placeholder={i18next.t('金额')}
                />
              </div>
            </div>
            <div className='form-group'>
              <label
                htmlFor='discount-remark'
                className='col-sm-3 control-label'
              >
                {i18next.t('备注')}：
              </label>
              <div className='col-sm-9'>
                <textarea
                  onChange={(e) => this.setState({ remark: e.target.value })}
                  className='form-control'
                  id='discount-remark'
                />
              </div>
            </div>
          </div>
        </Dialog>
      </BoxPanel>
    )
  }
}

DiscountPanel.propTypes = {
  list: PropTypes.array.isRequired,
  reasonMap: PropTypes.object.isRequired,
  actionMap: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  onAdd: PropTypes.func,
  onDel: PropTypes.func,
}

export default DiscountPanel
