import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Modal, Select, Option, Button } from '@gmfe/react'
import PropTypes from 'prop-types'

import { editStatusArr } from '../../common/enum'
// import store from './store'

@observer
class BatchActionModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      orderStatus: 5,
      buttonDisable: false,
    }
  }

  handleChangeOrderStatus = (value) => {
    this.setState({
      orderStatus: parseInt(value, 10),
    })
  }

  handleHide = () => {
    Modal.hide()
  }

  // handleSubmit = () => {
  //   const {
  //     selectedOrders: { selected }
  //   } = store
  //   const ids = selected.slice()
  //   const remark =
  //     this.remarkText && this.remarkText.value !== ''
  //       ? this.remarkText.value
  //       : undefined
  //   store.orderStatusUpdate(this.state.orderStatus, ids, remark).then(() => {
  //     this.handleHide()
  //   })
  // }

  handleSubmit = () => {
    this.setState({ buttonDisable: true })
    const remark =
      this.remarkText && this.remarkText.value !== ''
        ? this.remarkText.value
        : undefined
    const { onOrdersStatuChange } = this.props
    onOrdersStatuChange(this.state.orderStatus, remark)
      .then(() => {
        this.handleHide()
      })
      .finally(() => {
        this.setState({ buttonDisable: false })
      })
    // store.orderStatusUpdate(this.state.orderStatus, ids, remark).then(() => {
    //   this.handleHide()
    // })
  }

  render() {
    // const {
    //   selectedOrders: { selected }
    // } = store
    const {
      selectedOrders: { selected },
    } = this.props
    const ids = selected.slice()

    return (
      <form onSubmit={(event) => event.preventDefault()}>
        <div className='form-group'>
          {
            i18next.t('KEY97', {
              VAR1: ids.length,
            }) /* 将选中${VAR1}个订单状态修改为 */
          }
          :<div className='gm-gap-10' />
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
              ref={(ref) => {
                this.remarkText = ref
              }}
              placeholder={i18next.t('分拣备注')}
              className='form-control input-sm'
              style={{ width: '150px', display: 'inline-block' }}
            />
          ) : null}
        </div>
        <div className='gm-margin-top-15 gm-text-desc'>
          {i18next.t(
            '订单状态依次为：等待分拣-->分拣中-->配送中，三种状态之间不可逆向修改',
          )}
        </div>
        <div className='form-group text-right'>
          <Button onClick={this.handleHide}>{i18next.t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button
            type='primary'
            onClick={this.handleSubmit}
            loading={this.state.buttonDisable}
          >
            {i18next.t('确定')}
          </Button>
        </div>
      </form>
    )
  }
}

BatchActionModal.propTypes = {
  onOrdersStatuChange: PropTypes.func,
  selectedOrders: PropTypes.array,
}

export default BatchActionModal
