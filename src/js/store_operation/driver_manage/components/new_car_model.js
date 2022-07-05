import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Tip, Modal, Form, FormItem, Button } from '@gmfe/react'
import { getStrByte } from '../../../common/util'
import _ from 'lodash'

class NewCarModel extends React.Component {
  constructor(props) {
    super(props)
    this.handleAddCarModel = ::this.handleAddCarModel
    this.handleChangeCabName = ::this.handleChangeCabName
    this.handleChangeMaxLoad = ::this.handleChangeMaxLoad
    this.state = {
      cabName: '',
      maxLoad: 0,
    }
  }

  handleAddCarModel() {
    const cabModelMessage = {
      cabName: this.state.cabName,
      maxLoad: this.state.maxLoad,
    }
    const { cabName } = this.state
    const maxLoad = +this.state.maxLoad
    if (!cabName) {
      Tip.warning(i18next.t('车型名称不能为空'))
      return
    } else if (getStrByte(cabName) > 20) {
      Tip.warning(i18next.t('车型格式为10个汉字或20个英文'))
      return
    }

    if (_.isNaN(maxLoad) || maxLoad >= 100 || maxLoad <= 0) {
      Tip.warning(i18next.t('满载框数格式为1-99数字'))
      return
    }

    this.props.onAddCarModel(cabModelMessage).then(() => {
      Tip.success(
        i18next.t('KEY206', {
          VAR1: this.state.cabName,
        }) /* src:'新建车型: ' + this.state.cabName + ' 添加成功' => tpl:新建车型: ${VAR1} 添加成功 */
      )
      this.setState({
        cabName: '',
        maxLoad: 0,
      })
    })
  }

  handleChangeCabName(e) {
    if (e.target.value.length <= 0) {
      this.setState({
        cabName: e.target.value,
      })
    } else {
      this.setState({
        cabName: e.target.value,
      })
    }
  }

  handleChangeMaxLoad(e) {
    this.setState({
      maxLoad: e.target.value,
    })
  }

  render() {
    return (
      <Flex className='car-manage-new-car-model'>
        <Button type='primary' onClick={this.props.onNewCar}>
          {i18next.t('新建车型')}
        </Button>
        <Modal
          size='sm'
          show={this.props.show}
          title={i18next.t('新建车型')}
          onHide={this.props.onHideNewCarModelModal}
        >
          <Form
            onSubmit={this.handleAddCarModel}
            labelWidth='65px'
            colWidth='280px'
          >
            <FormItem label={i18next.t('车型')}>
              <input
                type='text'
                size={60}
                className='form-control'
                id='car-model-input'
                placeholder={i18next.t('车型名称')}
                value={this.state.cabName}
                onChange={this.handleChangeCabName}
              />
            </FormItem>
            <FormItem label={i18next.t('满载框数')}>
              <input
                type='number'
                min={0}
                max={200}
                className='form-control'
                id='max-load-input'
                placeholder={i18next.t('满载框数')}
                value={this.state.maxLoad}
                onChange={this.handleChangeMaxLoad}
              />
            </FormItem>
            <div className='text-right'>
              <Button onClick={this.props.onHideNewCarModelModal}>
                {i18next.t('取消')}
              </Button>
              <div className='gm-gap-10' />
              <Button type='primary' htmlType='submit'>
                {i18next.t('确定')}
              </Button>
            </div>
          </Form>
        </Modal>
      </Flex>
    )
  }
}

NewCarModel.propTypes = {
  show: PropTypes.bool.isRequired,
  onNewCar: PropTypes.func.isRequired,
  onHideNewCarModelModal: PropTypes.func.isRequired,
  onAddCarModel: PropTypes.func,
}

NewCarModel.defaultProps = {
  onAddCarModel: () => {},
}

export default NewCarModel
