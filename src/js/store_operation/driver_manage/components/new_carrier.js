import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Tip, Modal, Button } from '@gmfe/react'

class NewCarrier extends React.Component {
  constructor(props) {
    super(props)
    this.handleAddCarrier = ::this.handleAddCarrier
    this.handleChangeCarrierName = ::this.handleChangeCarrierName
    this.state = {
      carrierName: '',
    }
  }

  handleChangeCarrierName(e) {
    if (e.target.value.length === 0) {
      this.setState({
        carrierName: e.target.value,
      })
    } else {
      this.setState({
        carrierName: e.target.value,
      })
    }
  }

  handleAddCarrier() {
    if (this.state.carrierName.length === 0) {
      Tip.warning(i18next.t('承运商名称不能为空'))
      return
    }

    this.props.onAddCarrier(this.state.carrierName).then(() => {
      Tip.success(
        i18next.t('KEY207', {
          VAR1: this.state.carrierName,
        }) /* src:'新建承运商: ' + this.state.carrierName + ' 添加成功' => tpl:新建承运商: ${VAR1} 添加成功 */
      )
      this.setState({
        carrierName: '',
      })
    })
  }

  handleSubmit(e) {
    e.preventDefault()
  }

  render() {
    return (
      <Flex className='car-manage-new-carrier'>
        <Button type='primary' onClick={this.props.onNewCarrier}>
          {i18next.t('新建承运商')}
        </Button>
        <Modal
          size='sm'
          title={i18next.t('新建承运商')}
          show={this.props.show}
          onHide={this.props.onHideNewCarrierModal}
        >
          <form className='form-horizontal' onSubmit={this.handleSubmit}>
            <Flex alignCenter>
              <label htmlFor='carrier-name-input' className='gm-margin-left-10'>
                {i18next.t('承运商名称')}
              </label>
              <div className='gm-margin-left-10'>
                <input
                  type='text'
                  maxLength={12}
                  className='form-control'
                  id='carrier-name-input'
                  placeholder={i18next.t('承运商名称')}
                  value={this.state.carrierName}
                  onChange={this.handleChangeCarrierName}
                />
              </div>
            </Flex>
          </form>
          <div className='text-right gm-margin-top-10'>
            <Button onClick={this.props.onHideNewCarrierModal}>
              {i18next.t('取消')}
            </Button>
            <div className='gm-gap-10' />
            <Button type='primary' onClick={this.handleAddCarrier}>
              {i18next.t('确定')}
            </Button>
          </div>
        </Modal>
      </Flex>
    )
  }
}

NewCarrier.propTypes = {
  show: PropTypes.bool.isRequired,
  onNewCarrier: PropTypes.func.isRequired,
  onHideNewCarrierModal: PropTypes.func.isRequired,
  onAddCarrier: PropTypes.func,
}

NewCarrier.defaultProps = {
  onAddCarrier: () => {},
}

export default NewCarrier
