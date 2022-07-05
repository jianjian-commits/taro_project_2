import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import {
  Form,
  FormPanel,
  FormItem,
  FormBlock,
  Flex,
  Validator,
  MoreSelect,
  Price,
  InputNumber,
  RadioGroup,
  Radio,
  Switch,
  ImgUploader,
  Select,
  Option,
  Popover,
  Button,
  Input,
  ToolTip,
} from '@gmfe/react'
import skuStore from '../sku_store'
import spuStore from '../spu_store'
import merchandiseStore from '../../store'
import globalStore from '../../../../stores/global'
import { isCStationAndC, System } from '../../../../common/service'
import { isNotBeginWithNumber } from '../../../../common/util'
import _ from 'lodash'
import Big from 'big.js'
import CalculationSvg from 'svg/calculation.svg'
import SvgRemove from 'gm-svg/src/Remove'
import Copy from 'common/components/copy'
import SpreadImg from '../../component/spread_img'
import TieredPriceTable from './tiered_price_table'

export class CalculationPopover extends React.Component {
  popoverRef = React.createRef()
  render() {
    return (
      <Popover
        popup={
          <p style={{ margin: 8 }}>
            {i18next.t('可通过不含税价格快速计算含税价')}
          </p>
        }
        type='hover'
        center
        showArrow
      >
        <span className='b-icon-hover-calculation'>
          <Popover
            showArrow
            animName
            ref={this.popoverRef}
            popup={
              <CalculationTaxRate
                closePopover={() =>
                  this.popoverRef.current.apiDoSetActive(false)
                }
                {...this.props}
              />
            }
            type='click'
            center
          >
            <span className='inner-popover'>
              <CalculationSvg
                style={{
                  fontSize: 22,
                  display: 'table-cell',
                }}
              />
            </span>
          </Popover>
        </span>
      </Popover>
    )
  }
}

class CalculationTaxRate extends React.Component {
  state = {
    taxPrice: 0,
    noTaxPrice: 0,
  }

  taxRate = (spuStore.spuDetail.tax_rate_for_bill || 0) / 100

  handleChangePrice = (noTaxPrice) => {
    let taxPrice = 0
    if (noTaxPrice) {
      taxPrice = Big(noTaxPrice)
        .plus(Big(noTaxPrice).times(this.taxRate))
        .toFixed(2)
    }

    this.setState({ noTaxPrice, taxPrice })
  }

  handleCancel = () => {
    this.props.closePopover()
  }

  onOk = () => {
    this.props.onOk(this.state.taxPrice)
    this.props.closePopover()
  }

  render() {
    const { taxPrice, noTaxPrice } = this.state
    return (
      <div
        style={{
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2)',
        }}
        className='gm-popup-content-confirm'
      >
        <div className='gm-popup-content-confirm-title-wrap'>
          <div className='gm-popup-content-confirm-title'>
            {i18next.t('快速计算')}
          </div>
          <div
            className='gm-popup-content-confirm-close'
            onClick={this.handleCancel}
          >
            <SvgRemove />
          </div>
        </div>
        <div className='gm-popup-content-confirm-content'>
          <p>{i18next.t('含税单价=不含税单价×（1+税率）')}</p>
          <div>
            <span style={{ display: 'inline-block' }}>{taxPrice}</span>
            &nbsp;=&nbsp;
            <InputNumber
              value={noTaxPrice}
              style={{ width: 80 }}
              onChange={this.handleChangePrice}
            />
            <span />
            &nbsp;×（1 + {spuStore.spuDetail.tax_rate_for_bill}%）
          </div>
          <p className='gm-margin-top-10'>
            {i18next.t('注：录入基本单位的不含税价格，系统自动计算含税价格')}
          </p>
          <div className='gm-popup-content-confirm-button gm-margin-top-20'>
            <Button className='gm-margin-right-10' onClick={this.handleCancel}>
              {i18next.t('取消')}
            </Button>
            <Button type='primary' onClick={this.onOk}>
              {i18next.t('确定')}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
CalculationTaxRate.propTypes = {
  closePopover: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  taxPrice: PropTypes.number.isRequired,
}

@observer
class SaleForm extends React.Component {
  validateNumLeast = (sale_num_least) => {
    if (+sale_num_least === 0) {
      return i18next.t('最下下单数不能为0')
    }
    return ''
  }

  validateSaleSpec = (saleSpec, sale_ratio, sale_unit_name) => {
    if (+saleSpec === 2) {
      if (sale_ratio === '' || _.trim(sale_unit_name) === '') {
        return i18next.t('请填写')
      }
      if (+sale_ratio === 0) {
        return i18next.t('销售规格不能为0')
      }
      if (!isNotBeginWithNumber(_.trim(sale_unit_name))) {
        return i18next.t('请填写正确计量单位')
      }
    }
    return ''
  }

  validateOuterId = (outer_id) => {
    if (
      outer_id &&
      outer_id.length !== 0 &&
      (outer_id.length > 20 || outer_id.length < 1)
    ) {
      return i18next.t('自定义编码长度为1-20位!')
    }
    return ''
  }

  handleChangeInputValue = (e) => {
    const { name, value } = e.target
    skuStore.changeSkuDetail({ [name]: value })

    if (name === 'sku_name' || name === 'sale_unit_name') {
      skuStore.changeSkuListCard()
    }
  }

  handleChangeStdSalePrice = (value) => {
    // 联动修改sale_price
    let sale_price = 0
    const { sale_ratio } = skuStore.skuDetail
    if (value === '' || !sale_ratio) {
      sale_price = 0
    } else {
      sale_price = Big(value || 0)
        .times(sale_ratio)
        .toFixed(2)
    }
    skuStore.changeSkuDetail({
      sale_price,
      std_sale_price_forsale: value,
    })
  }

  handleChangeSalePrice = (value) => {
    // 联动修改std_sale_price
    let std_sale_price_forsale = 0
    const { sale_ratio } = skuStore.skuDetail
    if (value === '' || !sale_ratio) {
      std_sale_price_forsale = 0
    } else {
      std_sale_price_forsale = Big(value || 0)
        .div(sale_ratio)
        .toFixed(2)
    }

    skuStore.changeSkuDetail({
      std_sale_price_forsale,
      sale_price: value,
    })
  }

  handleChangeSalemenu = (selected) => {
    const { id: spu_id } = spuStore.spuDetail
    const { supplier_id } = skuStore.skuDetail
    skuStore.changeSkuDetail({
      salemenu_name: selected[0] ? selected[0].text : '',
    })
    skuStore.changeSkuDetail({ salemenu_ids: selected })
    if (selected[0]) {
      skuStore.changeSkuDetail({ salemenu_id: selected[0].value })
    }

    skuStore.changeSkuListCard() // 更改sku的card显示数据
    // 由于报价单不同feeType不同对应采购规格参考成本不同，因此需要重新获取采购规格的参考成本,根据spuid,supplierid,feetype获取
    skuStore.getPurchaseSpecList(spu_id, supplier_id, this.props.feeType)
  }

  handleChangeInputNumberValue = (name, value) => {
    skuStore.changeSkuDetail({
      [name]: value,
    })
    skuStore.changeSkuDetailTieredTable(0, 'min', value)
  }

  handleChangeSaleSpec = (value) => {
    const { std_unit_name_forsale, std_sale_price_forsale } = skuStore.skuDetail
    // std_sale_price不动，联动修改sale_price
    let sale_price = 0
    if (std_sale_price_forsale === '' || std_sale_price_forsale === 0)
      sale_price = 0
    else sale_price = std_sale_price_forsale

    skuStore.changeSkuDetail({
      saleSpec: value,
      sale_ratio: 1,
      sale_unit_name: std_unit_name_forsale,
      sale_price,
    })
    skuStore.changeSkuListCard()
  }

  handleChangeSaleRatio = (value) => {
    const { std_sale_price_forsale } = skuStore.skuDetail
    skuStore.changeSkuDetail({
      sale_ratio: value,
      sale_price: value
        ? Big(value)
            .times(std_sale_price_forsale || 0)
            .toFixed(2)
        : '',
    })
    skuStore.changeSkuListCard()
  }

  handleChangeSwitch = (name) => {
    const { skuDetail } = skuStore
    if (name === 'state') {
      skuStore.changeSkuDetail({ state: !skuDetail.state ? 1 : 0 })
    } else {
      skuStore.changeSkuDetail({ [name]: !skuDetail[name] })
    }
  }

  handleChangeTimingPrice = () => {
    const { skuDetail } = skuStore
    skuStore.changeSkuDetail({
      is_price_timing: !skuDetail.is_price_timing,
    })
  }

  handleChangePricingRules = (value) => {
    skuStore.changeSkuDetail({ is_step_price: value })
    const {
      skuDetail: { sale_num_least },
    } = skuStore
    const step_price_table = value
      ? [
          {
            index: 0,
            min: sale_num_least || 1,
            max: '',
            step_sale_price: '',
            step_std_price: '',
          }, // 阶梯定价表格
        ]
      : []
    skuStore.changeSkuDetail({ step_price_table })
  }

  handleUploadImg = (files) => {
    const res = _.map(files, (item) => merchandiseStore.uploadImg(item))
    return Promise.all(res).then((json) => _.map(json, (i) => i.data))
  }

  handleChangeImg = (data) => {
    skuStore.changeSkuDetail({
      image_list: data,
    })
  }

  handleChangeSelect = (selected) => {
    skuStore.changeSkuDetail({
      std_unit_name_forsale: selected,
    })

    // 联动修改销售规格
    this.handleChangeSaleSpec(1)
  }

  handlePricingSelect = (selected) => {
    skuStore.changeSkuDetail({
      price_cal_type: selected,
    })
  }

  render() {
    const { salemenuSelected, measurementUnitList, feeType } = this.props
    const {
      skuDetail: {
        sku_name,
        salemenu_id,
        sku_id,
        std_sale_price_forsale,
        std_unit_name_forsale,
        sale_price,
        sale_unit_name,
        sale_num_least,
        sale_ratio,
        saleSpec,
        outer_id,
        suggest_price_max,
        suggest_price_min,
        is_price_timing,
        is_weigh,
        state,
        clean_food,
        image_list,
        desc,
        pospal_data,
        brand,
        origin_area,
        origin_place,
        specification_desc,
        feature_desc,
        after_sale_desc,
        is_step_price,
        step_price_table,
        price_cal_type,
      },
    } = skuStore

    const pricingMethodList = [
      {
        value: 1,
        text: '按销售单位',
      },
      {
        value: 0,
        text: '按基本单位',
      },
    ]

    const { activeSelfSalemenuList } = merchandiseStore
    let salemenuSameList = activeSelfSalemenuList

    if (salemenuSelected.length === 1) {
      salemenuSameList = _.filter(activeSelfSalemenuList, {
        fee_type: salemenuSelected[0]?.fee_type || '',
      })
    }
    // 筛选不同货币
    const addValidateProps = (value) => {
      if (is_price_timing) {
        return null
      }
      return {
        required: true,
        validate: Validator.create([], _.trim(value)),
      }
    }

    const validateStepPrice = () => {
      if (!is_price_timing && is_step_price) {
        return {
          required: true,
          validate: Validator.create([], step_price_table, () => {
            for (let i = 0; i < step_price_table.length; i++) {
              const e = step_price_table[i]
              if (!e.step_sale_price || !e.step_std_price) {
                return i18next.t('请填写单价')
              }
              if (i < step_price_table.length - 1 && !e.max) {
                return i18next.t('请填写最大下单数')
              }
              if (e.max && e.max <= e.min) {
                return i18next.t('最大下单数须大于最小下单数')
              }
            }
            return ''
          }),
        }
      }
    }

    const p_editSku = globalStore.hasPermission('edit_sku')

    const xcxUrl = isCStationAndC()
      ? `pages/main/product_detail/index?spuId=${spuStore.spuDetail.id}`
      : 'pages/webview/webview.html?page_type=1&page=' +
        encodeURIComponent(
          `product?from=share&skuid=${sku_id}&spuid=${spuStore.spuDetail.id}`,
        )

    return (
      <Form
        hasButtonInGroup
        ref={this.props.forwardRef}
        labelWidth='179px'
        colWidth='500px'
      >
        <FormBlock col={2}>
          <FormItem
            label={i18next.t('规格名称')}
            required
            validate={Validator.create([], _.trim(sku_name))}
          >
            <input
              type='text'
              name='sku_name'
              value={sku_name}
              placeholder={i18next.t('规格名称')}
              disabled={!p_editSku}
              onChange={this.handleChangeInputValue}
            />
          </FormItem>
          {System.isB() && (
            <FormItem
              label={i18next.t('所在报价单')}
              required
              validate={Validator.create([], salemenu_id)}
            >
              {/* 报价单进入的新建商品不可修改所在报价单 */}
              {/* 代售报价单商品不可修改所在报价单 */}
              <MoreSelect
                multiple
                data={salemenuSameList.slice()}
                // selected={[]}
                selected={salemenuSelected}
                disabled={!(p_editSku || !sku_id) || !!sku_id}
                onSelect={this.handleChangeSalemenu}
                renderListFilterType='pinyin'
              />
            </FormItem>
          )}
          {globalStore.hasPermission('edit_measurement') && (
            <FormItem label={i18next.t('销售计量单位')}>
              {measurementUnitList.length ? (
                <Select
                  value={std_unit_name_forsale}
                  onChange={this.handleChangeSelect}
                >
                  {_.map(measurementUnitList, (s) => (
                    <Option key={s.value} value={s.value}>
                      {s.text}
                    </Option>
                  ))}
                </Select>
              ) : (
                <div className='gm-padding-top-5'>{std_unit_name_forsale}</div>
              )}
            </FormItem>
          )}
          <FormItem
            label={i18next.t('最小下单数')}
            required
            validate={Validator.create(
              [],
              sale_num_least,
              this.validateNumLeast.bind(this, sale_num_least),
            )}
          >
            <div className='input-group'>
              <InputNumber
                className='form-control'
                value={sale_num_least}
                min={0}
                precision={2}
                onChange={this.handleChangeInputNumberValue.bind(
                  this,
                  'sale_num_least',
                )}
                disabled={!p_editSku}
              />
              <div className='input-group-addon'>
                {sale_unit_name || std_unit_name_forsale}
              </div>
            </div>
          </FormItem>
          <FormItem
            label={i18next.t('销售规格')}
            required
            validate={Validator.create(
              [],
              sale_ratio,
              this.validateSaleSpec.bind(
                this,
                saleSpec,
                sale_ratio,
                sale_unit_name,
              ),
            )}
          >
            <RadioGroup
              style={{ marginTop: '-4px' }}
              name='saleSpec'
              inline
              value={saleSpec}
              onChange={this.handleChangeSaleSpec}
            >
              <Radio value={1} disabled={!p_editSku}>
                {i18next.t('按')}
                {std_unit_name_forsale}
              </Radio>
              <Radio value={2} disabled={!p_editSku}>
                <div className='sku-detail-radio gm-inline-block'>
                  <InputNumber
                    value={sale_ratio}
                    className='sku-detail-radio-input'
                    onChange={this.handleChangeSaleRatio}
                    min={0}
                    precision={2}
                    disabled={!p_editSku || saleSpec === 1}
                  />
                  <div className='sku-detail-radio-input-addon'>
                    {std_unit_name_forsale} /
                  </div>
                  <input
                    className='sku-detail-radio-input'
                    type='text'
                    name='sale_unit_name'
                    value={sale_unit_name}
                    onChange={this.handleChangeInputValue}
                    disabled={!p_editSku || saleSpec === 1}
                  />
                </div>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={i18next.t('定价方式')}>
            <Select value={price_cal_type} onChange={this.handlePricingSelect}>
              {_.map(pricingMethodList, (s) => (
                <Option key={s.value} value={s.value}>
                  {s.text}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
        <FormBlock col={1}>
          {System.isB() && (
            <FormItem required label={i18next.t('是否时价')}>
              <Switch
                type='primary'
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                checked={!!is_price_timing}
                onChange={this.handleChangeTimingPrice.bind(this)}
                disabled={!p_editSku}
              />
            </FormItem>
          )}
        </FormBlock>
        {!is_price_timing && (
          <FormBlock col={1}>
            <FormItem required label={i18next.t('定价规则')}>
              <RadioGroup
                name='pricingRules'
                inline
                value={is_step_price}
                onChange={this.handleChangePricingRules}
              >
                <Radio value={0}>{i18next.t('常规定价')}</Radio>
                <Radio value={1}>
                  {i18next.t('阶梯定价')}
                  <ToolTip
                    className='gm-margin-left-5'
                    left
                    popup={
                      <div className='gm-padding-5'>
                        {i18next.t(
                          '阶梯定价优先于其他定价模式(锁价、上浮定价、整单折扣定价)',
                        )}
                      </div>
                    }
                  />
                </Radio>
              </RadioGroup>
            </FormItem>
          </FormBlock>
        )}
        {!is_price_timing && is_step_price === 0 && (
          <FormBlock col={2}>
            <FormItem
              label={i18next.t('单价(基本单位)')}
              required
              {...addValidateProps(std_sale_price_forsale)}
            >
              <div className='input-group'>
                <InputNumber
                  className='form-control'
                  name='std_sale_price_forsale'
                  value={std_sale_price_forsale}
                  precision={2}
                  onChange={this.handleChangeStdSalePrice}
                  disabled={!p_editSku}
                />
                <div className='input-group-addon'>
                  {Price.getUnit(feeType) + ' / '}
                  {std_unit_name_forsale}
                </div>
                <CalculationPopover
                  onOk={this.handleChangeStdSalePrice}
                  taxPrice={Number(std_sale_price_forsale)}
                />
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('单价(销售单位)')}
              required
              {...addValidateProps(sale_price)}
            >
              <div className='input-group'>
                <InputNumber
                  className='form-control'
                  name='sale_price'
                  precision={2}
                  value={sale_price}
                  onChange={this.handleChangeSalePrice}
                  disabled={!p_editSku}
                />
                <div className='input-group-addon'>
                  {Price.getUnit(feeType) + ' / '}
                  {sale_unit_name || std_unit_name_forsale}
                </div>
                <CalculationPopover
                  onOk={this.handleChangeSalePrice}
                  taxPrice={Number(sale_price)}
                />
              </div>
            </FormItem>
          </FormBlock>
        )}
        {!is_price_timing && is_step_price === 1 && (
          <FormBlock col={1}>
            <FormItem
              required
              {...validateStepPrice()}
              colWidth='1000px'
              label={i18next.t('设置定价')}
            >
              <TieredPriceTable
                priceUnit={Price.getUnit(feeType)}
                std_unit_name_forsale={std_unit_name_forsale}
                sale_unit_name={sale_unit_name}
              />
            </FormItem>
          </FormBlock>
        )}
        <FormPanel.More>
          <FormBlock col={2}>
            <FormItem label={i18next.t('规格ID')}>
              <div className='gm-margin-top-5'>{sku_id || '-'}</div>
            </FormItem>
            <FormItem
              label={i18next.t('自定义编码')}
              validate={Validator.create(
                [],
                outer_id,
                this.validateOuterId.bind(this, outer_id),
              )}
            >
              <input
                name='outer_id'
                value={outer_id}
                placeholder={i18next.t('选填...')}
                onChange={this.handleChangeInputValue}
                disabled={!p_editSku}
              />
            </FormItem>
            {globalStore.otherInfo.showSuggestPrice && (
              <FormItem
                label={
                  <span>
                    {i18next.t('建议价格区间')}
                    <br />({i18next.t('基本单位')})
                  </span>
                }
                toolTip={
                  <div className='gm-padding-5'>
                    {i18next.t(
                      '设置单价（基本单位）的建议价格区间， 当所设置的单价 <下限或 >上限时，则展示商品预警。避免超限定价。',
                    )}
                  </div>
                }
              >
                <Flex>
                  <div className='input-group'>
                    <InputNumber
                      className='form-control'
                      value={suggest_price_min}
                      min={0}
                      max={9999999999}
                      precision={2}
                      onChange={this.handleChangeInputNumberValue.bind(
                        this,
                        'suggest_price_min',
                      )}
                      disabled={!p_editSku}
                    />
                    <div className='input-group-addon'>
                      {Price.getUnit(feeType) + '/'} {std_unit_name_forsale}
                    </div>
                  </div>
                  <div
                    className='gm-margin-lr-5'
                    style={{ lineHeight: '30px' }}
                  >
                    -
                  </div>
                  <div className='input-group'>
                    <InputNumber
                      className='form-control'
                      value={suggest_price_max}
                      min={0}
                      max={9999999999}
                      precision={2}
                      onChange={this.handleChangeInputNumberValue.bind(
                        this,
                        'suggest_price_max',
                      )}
                      disabled={!p_editSku}
                    />
                    <div className='input-group-addon'>
                      {Price.getUnit(feeType) + '/'} {std_unit_name_forsale}
                    </div>
                  </div>
                </Flex>
              </FormItem>
            )}
            <FormItem label={i18next.t('状态')}>
              <Flex style={{ width: '420px', marginTop: '3px' }}>
                {System.isB() && (
                  <>
                    <div className='gm-gap-10' />
                    <div>
                      {i18next.t('是否称重')}
                      <div className='gm-gap-5' />
                      <Switch
                        type='primary'
                        checked={!!is_weigh}
                        onChange={this.handleChangeSwitch.bind(
                          this,
                          'is_weigh',
                        )}
                        disabled={!p_editSku || !!clean_food}
                      />
                    </div>
                    <div className='gm-gap-10' />
                  </>
                )}
                <div>
                  {i18next.t('是否上架')}
                  <div className='gm-gap-5' />
                  <Switch
                    type='primary'
                    checked={!!state}
                    onChange={this.handleChangeSwitch.bind(this, 'state')}
                    disabled={!p_editSku}
                  />
                </div>
              </Flex>
            </FormItem>
            <FormItem label={i18next.t('品牌')}>
              <Input
                name='brand'
                disabled={!p_editSku}
                value={_.isNil(brand) ? '' : brand}
                className='form-control'
                onChange={this.handleChangeInputValue}
              />
            </FormItem>
            {sku_id && (
              <FormItem label={i18next.t('小程序链接')}>
                <div style={{ paddingTop: '6px' }}>
                  <Copy text={xcxUrl}>
                    <span className='gm-text-primary gm-cursor'>
                      {i18next.t('点此复制')}
                    </span>
                  </Copy>
                </div>
                <div className='gm-text-desc gm-margin-top-5'>
                  {i18next.t('此链接用于开启小程序直播时使用')}
                </div>
              </FormItem>
            )}
            <FormItem label={i18next.t('区域')}>
              <Input
                name='origin_area'
                disabled={!p_editSku}
                value={_.isNil(origin_area) ? '' : origin_area}
                className='form-control'
                onChange={this.handleChangeInputValue}
              />
            </FormItem>
            <FormItem label={i18next.t('商品图片')}>
              <ImgUploader
                style={{ width: '330px' }}
                disabled={!p_editSku}
                data={(image_list || []).slice()}
                onUpload={this.handleUploadImg}
                onChange={this.handleChangeImg}
                imgRender={(img) => <SpreadImg src={img.url} />}
                accept='image/*'
                desc='图片尺寸720*720像素，支持JPG/PNG格式'
                multiple
              />
            </FormItem>
            <FormItem label={i18next.t('产地')}>
              <Input
                name='origin_place'
                disabled={!p_editSku}
                value={_.isNil(origin_place) ? '' : origin_place}
                className='form-control'
                onChange={this.handleChangeInputValue}
              />
            </FormItem>
            <FormItem label={i18next.t('描述')}>
              <textarea
                rows='4'
                placeholder={i18next.t('规格描述')}
                value={desc || ''}
                name='desc'
                onChange={this.handleChangeInputValue}
                disabled={!p_editSku}
              />
            </FormItem>
            <FormItem label={i18next.t('商品规格')}>
              <textarea
                rows='4'
                value={_.isNil(specification_desc) ? '' : specification_desc}
                name='specification_desc'
                onChange={this.handleChangeInputValue}
                disabled={!p_editSku}
              />
            </FormItem>
            <FormItem label={i18next.t('商品特征')}>
              <textarea
                rows='4'
                value={_.isNil(feature_desc) ? '' : feature_desc}
                name='feature_desc'
                onChange={this.handleChangeInputValue}
                disabled={!p_editSku}
              />
            </FormItem>
            <FormItem label={i18next.t('售后标准')}>
              <textarea
                rows='4'
                value={_.isNil(after_sale_desc) ? '' : after_sale_desc}
                name='after_sale_desc'
                onChange={this.handleChangeInputValue}
                disabled={!p_editSku}
              />
            </FormItem>
          </FormBlock>
          {globalStore.hasPermission('open_app_pospal_sync_order') && (
            <FormItem label={i18next.t('银豹商品编码')}>
              <div className='gm-margin-top-5' style={{ minWidth: '500px' }}>
                {pospal_data && pospal_data.length > 0
                  ? _.join(
                      _.map(pospal_data, (item) => {
                        return item.pospal_name + '(' + item.pospal_code + ')'
                      }),
                      '，',
                    )
                  : '-'}
              </div>
            </FormItem>
          )}
        </FormPanel.More>
      </Form>
    )
  }
}

SaleForm.propTypes = {
  salemenuId: PropTypes.string,
  salemenuSelected: PropTypes.array,
  // salemenuSelected: PropTypes.object,
  forwardRef: PropTypes.object,
  measurementUnitList: PropTypes.array,
  feeType: PropTypes.string,
}

// 转发form示例，在提交的时候能触发验证
export default React.forwardRef((props, ref) => (
  <SaleForm forwardRef={ref} {...props} />
))
