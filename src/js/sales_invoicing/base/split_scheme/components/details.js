import React, { Component } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import {
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  Input,
  MoreSelect,
  Validator,
} from '@gmfe/react'
import detailsStore from '../store/details.store'
import { observer } from 'mobx-react'
import GainSpus from './gain_spus'
import _ from 'lodash'
import Big from 'big.js'

@observer
class Details extends Component {
  static propTypes = {
    onOK: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  }

  handleChange = (key, value) => {
    const { setParams } = detailsStore
    setParams(key, value)
  }

  handleSearch = (text) => {
    const { fetchSpu } = detailsStore
    return fetchSpu(text)
  }

  handleValidateSourceSpu = (spu) => {
    if (!spu) {
      return t('请选择待分割品')
    }
    if (spu.is_deleted) {
      return t('当前商品不可用，请更换其他商品')
    }
    return ''
  }

  handleValidateGainSpus = (spus) => {
    if (spus.some((item) => _.isNil(item.spu))) {
      return t('请选择获得品')
    }
    if (spus.some((item) => item.spu.is_deleted)) {
      return t('当前获得品存在不可用商品，请更换')
    }
    if (spus.some((item) => _.isNil(item.split_ratio))) {
      return t('请输入分割系数')
    }
    let total = 0
    spus.forEach((item) => {
      total = Big(item.split_ratio).plus(total)
    })
    if (total.gt(1)) {
      return t('分割系数之和不能大于1')
    }
    return ''
  }

  handleCancel = () => {
    window.closeWindow()
  }

  render() {
    const { title, onOK } = this.props
    const {
      params: { name, remark, source_spu, gain_spus },
      spus,
      formRef,
    } = detailsStore
    return (
      <FormGroup
        formRefs={[formRef]}
        onSubmitValidated={onOK}
        onCancel={this.handleCancel}
      >
        <FormPanel title={title}>
          <Form ref={formRef} colWidth='460px' labelWidth='90px'>
            <FormItem
              label={t('方案名称')}
              required
              validate={Validator.create([], name)}
            >
              <Input
                className='form-control'
                value={name}
                onChange={(event) =>
                  this.handleChange('name', event.target.value)
                }
              />
            </FormItem>
            <FormItem label={t('备注')}>
              <textarea
                rows='4'
                value={remark}
                onChange={(event) =>
                  this.handleChange('remark', event.target.value)
                }
              />
            </FormItem>
            <FormItem
              label={t('待分割品')}
              required
              validate={Validator.create(
                [],
                source_spu,
                this.handleValidateSourceSpu
              )}
            >
              <MoreSelect
                selected={source_spu}
                data={spus.slice()}
                onSearch={this.handleSearch}
                onSelect={(value) => this.handleChange('source_spu', value)}
              />
            </FormItem>
            <FormItem
              label={t('获得品')}
              colWidth='960px'
              validate={Validator.create(
                [],
                gain_spus.slice(),
                this.handleValidateGainSpus
              )}
            >
              <GainSpus />
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default Details
