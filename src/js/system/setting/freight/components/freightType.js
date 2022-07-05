import React, { Component } from 'react'
import { i18next, t } from 'gm-i18n'
import {
  FormItem,
  Flex,
  InputNumberV2,
  RadioGroup,
  Radio,
  Price,
  ToolTip,
  Button,
  Storage,
} from '@gmfe/react'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'

import AutoSetting from './autoSetting'
import FreightRule from '../freight_rule'
import { clone } from 'common/util'
import { history } from 'common/service'

const CalculationBasis = [
  {
    text: t('按金额计算'),
    value: 'Money',
  },
  {
    text: t('按距离计算'),
    value: 'Distance',
  },
]

const CalculationDimension = [
  {
    text: t('按下单金额区间设置'),
    value: 'Interval',
  },
  {
    text: t('按下单金额比例设置'),
    value: 'Proportion',
  },
]
const CalculationWay = [
  {
    text: t('人工设置价格区间与运费'),
    value: 'Artificial',
    tip: t('可按不同下单金额价格区间，对应设置不同运费'),
  },
  {
    text: t('自动设置价格区间与运费'),
    value: 'Auto',
    tip: t('可随订单下单金额增加而自动增加运费'),
  },
]

@inject('store')
@observer
class FreightType extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
  }

  handleChangeFreightDimension = (value, type, key) => {
    this.props.store.changeFreightDimension(value, type, key)
  }

  freightType = (price, type) => {
    this.props.store.addFreightSection(price, type)
  }

  handleDeleteSection = (index, type) => {
    this.props.store.delFreightSection(index, type)
  }

  handleStartPriceChange = (e, type) => {
    this.props.store.changeStartPrice(e.target.value, type)
  }

  handleAddSection = (price, type) => {
    this.props.store.addFreightSection(price, type)
  }

  handleFreightAmountChange = (index, value, type) => {
    this.props.store.changeFreightAmount(index, value, type)
  }

  handleMaxPriceChange = (index, value, type) => {
    this.props.store.changeMaxPrice(index, value, type)
  }

  render() {
    const {
      freightOfDelivery,
      freightOfPickUp,
      viewDeliveryNumber,
      viewPickUpNumber,
      templateData,
      isFreightOfDelivery,
      isFreightOfPickUp,
      changeDimensionAndWay,
    } = this.props.store
    const { type } = this.props
    const { foundation, dimension, way } =
      type === 'delivery_freight' ? freightOfDelivery : freightOfPickUp

    const viewNumber =
      type === 'delivery_freight' ? viewDeliveryNumber : viewPickUpNumber
    const freightTypeObj =
      type === 'delivery_freight' ? 'freightOfDelivery' : 'freightOfPickUp'
    // 运费模板信息
    const { delivery_freight, pick_up_freight } = templateData
    const _delivery_freight = {
      isFreight: isFreightOfDelivery,
      section: clone(delivery_freight.section.slice()),
    }

    const _pick_up_freight = {
      isFreight: isFreightOfPickUp,
      section: clone(pick_up_freight.section.slice()),
    }
    const {
      scale_set: { percentage, free_fee },
    } = templateData[type]
    const freightType =
      type === 'delivery_freight' ? _delivery_freight : _pick_up_freight
    return (
      <>
        <FormItem label={i18next.t('计量依据')}>
          <RadioGroup
            name={`${type}Foundation`}
            value={foundation}
            onChange={(value) =>
              this.handleChangeFreightDimension(
                value,
                freightTypeObj,
                'foundation',
              )
            }
            className='gm-flex gm-padding-bottom-15 gm-padding-left-10'
          >
            {CalculationBasis.map((item) => (
              <Radio
                value={item.value}
                key={item.value}
                className='gm-margin-right-20'
              >
                {item.text}
              </Radio>
            ))}
          </RadioGroup>
        </FormItem>
        {viewNumber !== 5 && (
          <FormItem label={i18next.t('计算维度')}>
            <RadioGroup
              name={`${type}Dimension`}
              value={dimension}
              onChange={(value) =>
                this.handleChangeFreightDimension(
                  value,
                  freightTypeObj,
                  'dimension',
                )
              }
              className='gm-flex gm-padding-bottom-15 gm-padding-left-10'
            >
              {CalculationDimension.map((item) => (
                <Radio
                  value={item.value}
                  key={item.value}
                  className='gm-margin-right-20'
                >
                  {item.text}
                </Radio>
              ))}
            </RadioGroup>
          </FormItem>
        )}
        {(viewNumber === 2 || viewNumber === 3) && (
          <FormItem label={i18next.t('计算方式')}>
            <RadioGroup
              name={`${type}Way`}
              value={way}
              onChange={(value) =>
                this.handleChangeFreightDimension(value, freightTypeObj, 'way')
              }
              className='gm-flex gm-padding-bottom-15 gm-padding-left-10'
            >
              {CalculationWay.map((item, index) => (
                <Radio
                  value={item.value}
                  key={item.value}
                  className='gm-margin-right-20'
                >
                  {item.text}
                  &nbsp;
                  <ToolTip
                    popup={<div className='gm-padding-10'>{item.tip}</div>}
                  />
                </Radio>
              ))}
            </RadioGroup>
          </FormItem>
        )}
        {viewNumber === 2 && (
          <FormItem label=''>
            <FreightRule
              type={type}
              viewNumber={viewNumber}
              templateData={freightType}
              onFreightAmountChange={this.handleFreightAmountChange}
              onStartPriceChange={this.handleStartPriceChange}
              onAddSection={this.handleAddSection}
              onDeleteSection={this.handleDeleteSection}
              onMaxPriceChange={this.handleMaxPriceChange}
            />
          </FormItem>
        )}
        {viewNumber === 5 && (
          <FormItem label=''>
            <FreightRule
              type={type}
              viewNumber={viewNumber}
              templateData={freightType}
              onFreightAmountChange={this.handleFreightAmountChange}
              onStartPriceChange={this.handleStartPriceChange}
              onAddSection={this.handleAddSection}
              onDeleteSection={this.handleDeleteSection}
              onMaxPriceChange={this.handleMaxPriceChange}
              textType={i18next.t('距离')}
              unitType='米'
            />
            <Button
              type='link'
              onClick={() => {
                // 为了跳到系统设置页的配送设置tab，如果对这个Storage.set有疑问可以直接搜索一下这个key
                Storage.set('system-setting-tab-type', 4)
                history.push('/system/setting/system_setting')
              }}
            >
              设置站点地理位置&nbsp;&gt;
            </Button>
          </FormItem>
        )}
        {viewNumber === 4 && (
          <>
            <FormItem label={t('金额百分比')} required>
              <Flex alignCenter>
                <InputNumberV2
                  className='form-control'
                  value={percentage}
                  min={0}
                  max={999999999}
                  precision={0}
                  onChange={(value) =>
                    changeDimensionAndWay(type, 'scale_set', {
                      percentage: value,
                    })
                  }
                  style={{ width: '50px', height: '30px' }}
                />
                <span>&nbsp;%</span>
              </Flex>
              <div className='gm-text-desc gm-margin-top-15'>
                运费=订单下单金额*金额百分比。如：下单金额100元，百分比设置为5%，则运费为100元
                X 5%=5元
              </div>
            </FormItem>
            <FormItem label={t('满额免运费')}>
              <Flex alignCenter>
                <span>{t('下单金额超过（包含）')}</span>
                <InputNumberV2
                  className='form-control'
                  value={free_fee}
                  min={0}
                  max={999999999}
                  precision={2}
                  placeholder={t('选填')}
                  onChange={(value) =>
                    changeDimensionAndWay(type, 'scale_set', {
                      free_fee: value,
                    })
                  }
                  style={{ width: '50px', height: '30px' }}
                />
                <span>
                  &nbsp;{Price.getUnit()}&nbsp;
                  {t('免收运费（无需满额免运费，则无需填写）')}
                </span>
              </Flex>
            </FormItem>
          </>
        )}
        {viewNumber === 3 && <AutoSetting type={type} />}
      </>
    )
  }
}

export default FreightType
