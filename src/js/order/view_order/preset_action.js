import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Modal,
  Tip,
  Select,
  Option,
  RadioGroup,
  Radio,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'

import { editStatusArr } from '../../common/enum'

@observer
class PresetActionModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      orderStatus: 5,
      count: 'all',
      orderCount: '',
      buttonDisabled: false,
    }
  }

  handleChangeOrderStatus = (value) => {
    this.setState({
      orderStatus: parseInt(value, 10),
    })
  }

  handleChangeCount = (value) => {
    if (value === 'all') {
      this.setState({
        count: 'all',
      })
    } else {
      const count = this.state.orderCount
      this.setState({
        count,
      })
    }
  }

  handleChangeInput = (e) => {
    const inputV = e.target.value
    if (this.state.count !== 'all') {
      this.setState({
        orderCount: inputV,
        count: inputV,
      })
    }
  }

  handleHide = () => {
    Modal.hide()
  }

  handleSubmit = async () => {
    this.setState({ buttonDisabled: true })
    if (this.state.count === '') {
      Tip.danger(i18next.t('指定修改订单数不能为空'))
      return
    }

    const { filter, onChangeSelectedOrders } = this.props
    const status =
      filter.from_status + '' === '0' ? undefined : filter.from_status
    const remark =
      this.state.orderStatus === 5 &&
      this.presetRemark &&
      this.presetRemark.value !== ''
        ? this.presetRemark.value
        : undefined

    onChangeSelectedOrders(
      filter,
      this.state.count,
      status,
      this.state.orderStatus,
      remark,
    ).finally(() => {
      this.setState({ buttonDisabled: false })
    })
  }

  render() {
    return (
      <form onSubmit={(event) => event.preventDefault()}>
        <div>
          <RadioGroup
            name='price'
            className='gm-inline-block'
            inline
            value={this.state.count === 'all' ? 'all' : 'notAll'}
            onChange={this.handleChangeCount}
          >
            <Radio value='all'>{i18next.t('修改全部订单')}</Radio>
            <Radio value='notAll'>
              {i18next.t('指定修改订单数')}
              <div className='gm-gap-5' />
              <input
                value={this.state.orderCount}
                placeholder='90'
                className='form-control input-sm'
                onChange={this.handleChangeInput}
                style={{ width: '50px', display: 'inline-block' }}
              />
            </Radio>
          </RadioGroup>
        </div>
        <div className='form-group gm-margin-top-10'>
          {i18next.t('将订单修改为')}
          <div className='gm-gap-10' />
          <Select
            value={this.state.orderStatus}
            className='gm-margin-right-10'
            style={{ width: '100px', display: 'inline-block' }}
            onChange={this.handleChangeOrderStatus}
          >
            {_.map(editStatusArr, (status) => {
              return (
                <Option value={status.id} key={status.id}>
                  {status.text}
                </Option>
              )
            })}
          </Select>
          {this.state.orderStatus === 5 ? (
            <input
              placeholder={i18next.t('分拣备注')}
              className='form-control input-sm'
              ref={(ref) => {
                this.presetRemark = ref
              }}
              style={{ width: '150px', display: 'inline-block' }}
            />
          ) : null}
        </div>
        <div className='form-group gm-text-desc'>
          <p>
            {i18next.t(
              '根据列表筛选结果，按照下单先后顺序修改指定数量或全部的订单状态',
            )}
          </p>
          <p>
            {i18next.t(
              '当修改的订单数超过500单，建议使用【指定修改订单数】的方式分批次修改，避免数据处理超时！',
            )}
          </p>
        </div>
        <div className='form-group text-right'>
          <Button onClick={this.handleHide}>{i18next.t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button
            type='primary'
            onClick={this.handleSubmit}
            loading={this.state.buttonDisabled}
          >
            {i18next.t('确定')}
          </Button>
        </div>
      </form>
    )
  }
}

PresetActionModal.propTypes = {
  filter: PropTypes.object.isRequired,
  onChangeSelectedOrders: PropTypes.func,
}

// filter
// {
//     start_date,  开始时间
//     end_date,    结束时间
//     from_status, 原状态
//     search_text  搜索文本
// }

export default PresetActionModal
