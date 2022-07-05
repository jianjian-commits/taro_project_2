import { i18next, t } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Switch,
  CheckboxGroup,
  Checkbox,
  Tip,
} from '@gmfe/react'
import _ from 'lodash'
import globalStore from '../../../stores/global'
import { Request } from '@gm-common/request'

const food_security_display_config_get = () => {
  return Request('/station/food_security/display_config/get')
    .get()
    .then((json) => json.data)
}

const food_security_display_config_update = (
  active,
  fields_config,
  source_permission
) => {
  return Request('/station/food_security/display_config/set')
    .data({
      active: active ? 1 : 0,
      fields_config: JSON.stringify(fields_config),
      source_permission: JSON.stringify(source_permission),
    })
    .post()
}

let skuInfoList = [
  {
    value: 'sku_category',
    name: i18next.t('分类信息'),
  },
  {
    value: 'sku_specification',
    name: i18next.t('规格'),
  },
  {
    value: 'sku_description',
    name: i18next.t('描述'),
  },
  {
    value: 'sku_production_area',
    name: i18next.t('生产地'),
  },
]

let productionInfoList = [
  {
    value: 'purchase_date',
    name: i18next.t('采购日期'),
  },
  {
    value: 'package_date',
    name: i18next.t('包装日期'),
  },
  {
    value: 'shelf_life',
    name: i18next.t('保质期'),
  },
  {
    value: 'supplier_name',
    name: i18next.t('供应商'),
  },
  {
    value: 'supplier_qualification_images',
    name: i18next.t('供应商资质'),
  },
  {
    value: 'location',
    name: i18next.t('供应商地理位置'),
  },
]

const processInfoList = [
  { value: 'order_time', name: t('下单时间') },
  { value: 'purchase_time', name: t('采购时间') },
  { value: 'purchaser_name', name: t('采购员名称') },
  { value: 'sort_time', name: t('分拣时间') },
  { value: 'sort_operator', name: t('分拣员名称') },
  { value: 'distribute_time', name: t('配送时间') },
  { value: 'driver_name', name: t('司机名称') },
  { value: 'plate_number', name: t('车牌号') },
]

const corporateInfo = [
  { value: 'corporate_profile', name: t('企业介绍') },
  { value: 'corporate_style', name: t('企业图片') },
  { value: 'work_description', name: t('作业说明') },
  { value: 'worksite', name: t('作业图片') },
  { value: 'qualification_description', name: t('资质说明') },
]

class FoodConfig extends React.Component {
  constructor(props) {
    super(props)

    this.formRef = React.createRef()

    if (globalStore.user.stock_method === 1) {
      skuInfoList = _.reject(
        skuInfoList,
        (item) => item.value === 'sku_production_area'
      )
      productionInfoList = _.reject(
        productionInfoList,
        (item) => item.value === 'purchase_date' || item.value === 'shelf_life'
      )
    }

    this.state = {
      active: false,
      skuInfo: [],
      productionInfo: [],
      qualityInfo: [],
      source_permission: {
        shop_source: 0,
      },

      skuInfoList,
      productionInfoList,
      processInfo: [],
      corporateInfo: [],
    }

    this.handleActiveToogle = ::this.handleActiveToogle
    this.handleSubmit = ::this.handleSubmit
  }

  componentDidMount() {
    food_security_display_config_get().then(
      ({ active, fields_config, source_permission }) => {
        this.setState({ active, ...fields_config, source_permission })
      }
    )
  }

  handleActiveToogle() {
    this.setState({
      active: !this.state.active,
    })
  }

  handlePermissionToggle(field) {
    this.setState(({ source_permission }) => {
      const oldVal = source_permission[field]
      return {
        source_permission: {
          [field]: oldVal === 0 ? 1 : 0,
        },
      }
    })
  }

  handleSubmit() {
    const {
      active,
      skuInfo,
      qualityInfo,
      productionInfo,
      source_permission,
      processInfo,
      corporateInfo,
    } = this.state

    food_security_display_config_update(
      active,
      {
        skuInfo,
        qualityInfo,
        productionInfo,
        processInfo,
        corporateInfo,
      },
      source_permission
    ).then(() => {
      Tip.success('保存成功！')
    })
  }

  render() {
    const {
      skuInfoList,
      productionInfoList,
      source_permission: { shop_source },
    } = this.state

    return (
      <FormGroup formRefs={[this.formRef]} onSubmit={this.handleSubmit}>
        <FormPanel title={i18next.t('溯源设置')}>
          <Form
            ref={this.formRef}
            labelWidth='166px'
            hasButtonInGroup
            disabledCol
          >
            <FormItem label={i18next.t('溯源入口')}>
              <Switch
                type='primary'
                checked={!!shop_source}
                on={i18next.t('开放')}
                off={i18next.t('不开放')}
                onChange={this.handlePermissionToggle.bind(this, 'shop_source')}
              />
              <div className='gm-text-desc gm-margin-top-10'>
                {i18next.t(
                  '在商城开放溯源入口，商户可选择指定订单商品快速进入溯源系统进行信息追溯'
                )}
              </div>
            </FormItem>
            <FormItem label={i18next.t('溯源条码')}>
              <Switch
                type='primary'
                checked={this.state.active}
                on={i18next.t('开放')}
                off={i18next.t('不开放')}
                onChange={this.handleActiveToogle}
              />
              <div className='gm-text-desc gm-margin-top-10'>
                {i18next.t(
                  '开放溯源条码在标签上展现，允许客户扫码查看信息。追溯信息默认展现商品名和商品图片。'
                )}
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('可见商品信息')}
              className='gm-flex-align-end'
            >
              <CheckboxGroup
                name='skuInfo'
                inline
                value={this.state.skuInfo}
                onChange={(v) => this.setState({ skuInfo: v })}
              >
                {_.map(skuInfoList, (s) => (
                  <Checkbox key={s.value} value={s.value}>
                    {s.name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </FormItem>
            <FormItem
              label={i18next.t('可见生产信息')}
              className='gm-flex-align-end'
            >
              <CheckboxGroup
                name='productionInfo'
                inline
                value={this.state.productionInfo}
                onChange={(v) => this.setState({ productionInfo: v })}
              >
                {_.map(productionInfoList, (s) => (
                  <Checkbox key={s.value} value={s.value}>
                    {s.name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </FormItem>
            <FormItem
              label={i18next.t('可见质检信息')}
              className='gm-flex-align-end'
            >
              <CheckboxGroup
                name='qualityInfo'
                inline
                value={this.state.qualityInfo}
                onChange={(v) => this.setState({ qualityInfo: v })}
              >
                <Checkbox value='detect_sender'>
                  {i18next.t('送检机构')}
                </Checkbox>
                <Checkbox value='detect_institution'>
                  {i18next.t('检测机构')}
                </Checkbox>
                <Checkbox value='detect_date'>{i18next.t('检测日期')}</Checkbox>
                <Checkbox value='detect_images'>
                  {i18next.t('检测报告图片')}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
            <FormItem label={i18next.t('可见流程信息')}>
              <CheckboxGroup
                name='processInfo'
                inline
                value={this.state.processInfo}
                onChange={(v) => this.setState({ processInfo: v })}
              >
                {processInfoList.map((item, index) => (
                  <Checkbox value={item.value} key={index}>
                    {item.name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </FormItem>
            <FormItem label={i18next.t('可见企业形象')}>
              <CheckboxGroup
                name='corporateInfo'
                inline
                value={this.state.corporateInfo}
                onChange={(v) => this.setState({ corporateInfo: v })}
              >
                {corporateInfo.map((item, index) => (
                  <Checkbox value={item.value} key={index}>
                    {item.name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </FormItem>
            <FormItem label=''>
              <div className='gm-text-desc'>
                {i18next.t(
                  '为保证追溯查询结果的有效性，追溯的商品某条信息为空时，在扫码的追溯页面上不予展现'
                )}
              </div>
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default FoodConfig
