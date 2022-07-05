import React, { Component } from 'react'
import { i18next } from 'gm-i18n'
import { Flex, Dialog, Tip, Price, Button, FunctionSet } from '@gmfe/react'
import Big from 'big.js'
import Description from './components/description'
import SkuEditor from './step_two_sku'
import { inject, observer, Observer } from 'mobx-react'
import { SvgPassword } from 'gm-svg'
import {
  CommonPrePrintBtn,
  printerOptionsStore,
  OrderPrinterModal,
} from 'common/components/common_printer_options'
import { Customize } from 'common/components/customize'
import HeaderDetail from './components/head_detail'
import FieldLock from './components/field_lock'
import globalStore from 'stores/global'
import PropTypes from 'prop-types'
import { isLK } from '../../../order/util.js'

const syncType = {
  1: i18next.t('同步'),
  0: i18next.t('不同步'),
}

const syncQuantityType = {
  0: i18next.t('下单数'),
  1: i18next.t('预下单数'),
}

@inject('store')
@observer
class PanelRight extends Component {
  renderDialogChildren = () => {
    const style = {
      width: '88px',
      display: 'inline-block',
      textAlign: 'right',
      marginRight: '10px',
    }
    const {
      sync_quantity_from,
      sync_del_order,
      sync_add_sku,
      sync_del_sku,
      sync_customized_field,
    } = this.props.store.orderData

    return (
      <div>
        {globalStore.hasPermission('edit_fake_quantity') && (
          <div className='gm-padding-5'>
            <span style={style}>{i18next.t('原订单数据')}:</span>
            <span>{syncQuantityType[sync_quantity_from]}</span>
          </div>
        )}
        <div className='gm-padding-5'>
          <span style={style}>{i18next.t('原订单删除')}:</span>
          <span>{syncType[sync_del_order]}</span>
        </div>
        <div className='gm-padding-5'>
          <span style={style}>{i18next.t('原订单新增商品')}:</span>
          <span>{syncType[sync_add_sku]}</span>
        </div>
        <div className='gm-padding-5'>
          <span style={style}>{i18next.t('原订单删除商品')}:</span>
          <span>{syncType[sync_del_sku]}</span>
        </div>
        <div className='gm-padding-5'>
          <span style={{ ...style, width: '125px' }}>
            {i18next.t('原订单自定义字段信息')}:
          </span>
          <span>{syncType[sync_customized_field]}</span>
        </div>
        <Description />
      </div>
    )
  }

  handleDialog = () => {
    Dialog.alert({
      children: this.renderDialogChildren(),
      title: i18next.t('同步设置'),
      size: 'md',
    })
  }

  handleSave = async () => {
    const { saveDelivery } = this.props.store
    const isSuccess = await saveDelivery()

    isSuccess && Tip.success(i18next.t('草稿保存成功'))
  }

  handlePrint = async () => {
    const { saveDelivery, order_id, orderData } = this.props.store

    const isSuccess = await saveDelivery() // 先保存草稿,再打印
    if (isSuccess) {
      printerOptionsStore.goToPrintPage({
        orderIdList: [order_id],
        curAddressId: orderData.address_id,
        deliveryType: 2,
        isCompile: true,
      })
    }
  }

  render() {
    const { orderData, order_id } = this.props.store

    return (
      <Flex>
        <CommonPrePrintBtn
          mustConfirm={false}
          goToPrint={this.handlePrint}
          PrinterOptionsModal={
            <OrderPrinterModal
              goToPrint={this.handlePrint}
              curAddressId={orderData.address_id}
              orderIdList={[order_id]}
            />
          }
        >
          <Button type='primary' className='gm-margin-right-10'>
            {i18next.t('打印单据')}
          </Button>
        </CommonPrePrintBtn>

        <FunctionSet
          data={[
            {
              text: i18next.t('保存草稿'),
              onClick: this.handleSave,
            },
            {
              text: i18next.t('查看同步设置'),
              onClick: this.handleDialog,
            },
          ]}
        />
      </Flex>
    )
  }
}

PanelRight.propTypes = {
  store: PropTypes.object,
}

@inject('store')
@observer
class StepTwo extends Component {
  componentDidMount() {
    // 获取自定义字段
    globalStore.fetchCustomizedConfigs()
  }

  handleOrderDataChange = (modify) => {
    const { setOrderData } = this.props.store
    setOrderData(modify)
  }

  /**
   * 自定义字段需要具有加锁功能
   */
  getCustomizedFieldsHead = () => {
    const {
      order_id,
      orderData: {
        customized_field,
        sync_customized_field,
        customized_field_lock,
      },
      setOrderData,
    } = this.props.store
    const headConfigs =
      !sync_customized_field || isLK(order_id)
        ? []
        : globalStore.customizedInfoConfigs.filter(
            (v) => v.permission.write_station,
          )
    return headConfigs.map((v) => {
      return {
        label: v.field_name,
        item: (
          <Observer>
            {() => {
              const hasLock = customized_field_lock?.[v.id]
              const handleChange = (value) => {
                // 这里处理变更后数据
                const customizedField = { ...customized_field, [v.id]: value }
                setOrderData({
                  customized_field: customizedField,
                })
                // 修改时，默认上锁
                handleLockToggle(null, true)
              }
              const handleLockToggle = (_, lock4Change) => {
                setOrderData({
                  customized_field_lock: {
                    ...customized_field_lock,
                    [v.id]: lock4Change ? 1 : Number(!hasLock),
                  },
                })
              }
              const radioList = (v.radio_list || []).map((v) => ({
                value: v.id,
                text: v.name,
              }))
              radioList.unshift({
                value: undefined,
                text: i18next.t('无'),
              })
              return (
                <Flex alignCenter>
                  <Customize
                    type={v.field_type}
                    value={customized_field[v.id]}
                    onChange={handleChange}
                    data={radioList}
                  />
                  <span
                    className='gm-cursor'
                    title={i18next.t('锁定后，此字段不再同步订单数据')}
                  >
                    <SvgPassword
                      onClick={handleLockToggle}
                      fontSize='1.3em'
                      style={{
                        color: hasLock ? '#56A3F2' : '#bfbfbf',
                        verticalAlign: '-0.3em',
                      }}
                    />
                  </span>
                </Flex>
              )
            }}
          </Observer>
        ),
      }
    })
  }

  render() {
    const { orderData } = this.props.store
    // 华康定制需要加上自采金额
    const sale_price = globalStore.isHuaKang()
      ? Big(orderData.total_pay).plus(orderData.self_price).toFixed(2)
      : Big(orderData.total_pay).toFixed(2)
    const totalList = [
      {
        text: i18next.t('套账下单金额'),
        value: (
          <span>
            {Big(orderData?.account_total_amount).toFixed(2) +
              Price.getUnit(orderData.fee_type)}
          </span>
        ),
      },
      {
        text: i18next.t('套账出库金额'),
        value: (
          <span>
            {Big(orderData?.account_outstock_amount).toFixed(2) +
              Price.getUnit(orderData.fee_type)}
          </span>
        ),
      },
      {
        text: i18next.t('加单金额'),
        value: (
          <span>
            {Big(orderData.account_add_quantity_amount).toFixed(2) +
              Price.getUnit(orderData.fee_type)}
          </span>
        ),
        bottom: true,
      },
      {
        text: i18next.t('实际订单金额'),
        value: (
          <span>
            {orderData.order_total_amount + Price.getUnit(orderData.fee_type)}
          </span>
        ),
        bottom: true,
      },
      {
        text: i18next.t('销售额(不含运费)'),
        value: <span>{sale_price + Price.getUnit(orderData.fee_type)}</span>,
      },
    ]
    // 判断是否为华康绿源定制需求
    if (globalStore.isHuaKang()) {
      totalList.push(
        {
          text: i18next.t('自采金额'),
          value: (
            <span>
              {orderData.self_price + Price.getUnit(orderData.fee_type)}
            </span>
          ),
          bottom: true,
        },
        {
          text: i18next.t('汇总金额'),
          value: (
            <span>
              {orderData.summary_price + Price.getUnit(orderData.fee_type)}
            </span>
          ),
          bottom: true,
        },
      )
    }
    return (
      <>
        <HeaderDetail
          className='b-order-delivery-header'
          contentLabelWidth={100}
          contentCol={4}
          customeContentColWidth={[350, 350, 350, 350]}
          totalData={totalList}
          HeaderInfo={[
            {
              label: i18next.t('订单号'),
              item: <span style={{ fontWeight: 400 }}>{orderData.id}</span>,
            },
            { label: i18next.t('商户'), item: orderData.resname },
          ]}
          HeaderAction={<PanelRight />}
          ContentInfo={[
            { label: i18next.t('下单时间'), item: orderData.order_time },
            { label: i18next.t('订单备注'), item: orderData.remark },
            { label: i18next.t('配送时间'), item: orderData.receive_time },
            { label: i18next.t('分拣序号'), item: orderData.sort_num },
            { label: i18next.t('收货人'), item: orderData.receiver_name },
            { label: i18next.t('收货地址'), item: orderData.address },
            {
              label: i18next.t('运费'),
              item: (
                <FieldLock
                  data={orderData}
                  field='freight'
                  onLockToggle={this.handleOrderDataChange.bind(this)}
                  onInputChange={this.handleOrderDataChange.bind(this)}
                />
              ),
            },
          ].concat(this.getCustomizedFieldsHead())}
        />
        <SkuEditor />
      </>
    )
  }
}

StepTwo.propTypes = {
  store: PropTypes.object,
}

export default StepTwo
