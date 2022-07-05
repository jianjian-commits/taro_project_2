import React, { Component } from 'react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Switch,
  RadioGroup,
  Radio,
  Button,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { inject, observer } from 'mobx-react'
import Description from './components/description'
import PropTypes from 'prop-types'

import globalStore from '../../../stores/global'

@inject('store')
@observer
class StepOne extends Component {
  state = {
    sync_quantity_from: 0,
    sync_del_order: true,
    sync_add_sku: true,
    sync_del_sku: true,
    sync_customized_field: false,
    buttonDisabled: false,
  }

  handleSave = () => {
    const { order_id, createDelivery } = this.props.store
    const edit_fake_quantity = globalStore.hasPermission('edit_fake_quantity')
    const {
      sync_quantity_from,
      sync_del_order,
      sync_add_sku,
      sync_del_sku,
      sync_customized_field,
    } = this.state
    const req = {
      order_id,
      sync_quantity_from: sync_quantity_from,
      sync_add_sku: Number(sync_add_sku),
      sync_del_order: Number(sync_del_order),
      sync_del_sku: Number(sync_del_sku),
      sync_customized_field: Number(sync_customized_field),
    }
    if (!edit_fake_quantity) {
      delete req.sync_quantity_from
    }
    this.setState({ buttonDisabled: true })
    createDelivery(req).catch(() => this.setState({ buttonDisabled: false }))
  }

  handleChangeSwitch(key, value) {
    this.setState({ [key]: value })
  }

  render() {
    const {
      sync_quantity_from,
      sync_del_order,
      sync_add_sku,
      sync_del_sku,
      sync_customized_field,
    } = this.state

    return (
      <Box title={i18next.t('同步设置')} style={{ margin: '20px 0 0 80px' }}>
        <Form
          onSubmit={this.handleSave}
          horizontal
          disabledCol
          labelWidth='120px'
        >
          {globalStore.hasPermission('edit_fake_quantity') && (
            <FormItem label={i18next.t('原订单数据')}>
              <RadioGroup
                value={sync_quantity_from}
                inline
                onChange={this.handleChangeSwitch.bind(
                  this,
                  'sync_quantity_from',
                )}
              >
                <Radio value={0}>{i18next.t('下单数')}</Radio>
                <Radio value={1}>{i18next.t('预下单数')}</Radio>
              </RadioGroup>
              <div className='gm-text-desc gm-text-12'>
                {i18next.t('原订单中的对应字段将同步至编辑配送单中的“下单数”')}
              </div>
            </FormItem>
          )}
          <FormItem label={i18next.t('原订单删除')}>
            <Switch
              type='primary'
              checked={sync_del_order}
              on={i18next.t('同步')}
              off={i18next.t('不同步')}
              onChange={this.handleChangeSwitch.bind(this, 'sync_del_order')}
            />
            <div className='gm-text-desc gm-text-12'>
              {i18next.t('开启同步，原订单删除则编辑后的配送单同步删除')}
            </div>
          </FormItem>
          <FormItem label={i18next.t('原订单新增商品')}>
            <Switch
              type='primary'
              checked={sync_add_sku}
              on={i18next.t('同步')}
              off={i18next.t('不同步')}
              onChange={this.handleChangeSwitch.bind(this, 'sync_add_sku')}
            />
            <div className='gm-text-desc gm-text-12'>
              {i18next.t(
                '开启同步，原订单新增商品时编辑后的配送单同步新增此商品',
              )}
            </div>
          </FormItem>
          <FormItem label={i18next.t('原订单删除商品')}>
            <Switch
              type='primary'
              checked={sync_del_sku}
              on={i18next.t('同步')}
              off={i18next.t('不同步')}
              onChange={this.handleChangeSwitch.bind(this, 'sync_del_sku')}
            />
            <div className='gm-text-desc gm-text-12'>
              {i18next.t(
                '开启同步，原订单删除商品时编辑后的配送单同步删除此商品',
              )}
            </div>
          </FormItem>
          <FormItem label={i18next.t('原订单自定义字段信息')}>
            <Switch
              type='primary'
              checked={sync_customized_field}
              on={i18next.t('同步')}
              off={i18next.t('不同步')}
              onChange={this.handleChangeSwitch.bind(
                this,
                'sync_customized_field',
              )}
            />
            <div className='gm-text-desc gm-text-12'>
              {i18next.t(
                '开启同步,原订单新增自定义字段时编辑后的配送单同步新增此字段信息',
              )}
            </div>
          </FormItem>

          <Description />
          <div className='gm-gap-10' />
          <FormButton>
            <Button
              disabled={this.state.buttonDisabled}
              type='primary'
              htmlType='submit'
            >
              {i18next.t('开始同步')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

StepOne.propTypes = {
  store: PropTypes.object,
}

export default StepOne
