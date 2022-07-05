import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import skuStore from '../sku_store'
import merchandiseStore from '../../store'
import globalStore from '../../../../stores/global'
import {
  FormItem,
  FormBlock,
  Flex,
  Validator,
  MoreSelect,
  RadioGroup,
  Radio,
  InputNumber,
  InputNumberV2,
  Price,
  Switch,
  ToolTip,
  Form,
  Select,
} from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import { history } from '../../../../common/service'
import { getRefParams } from '../../util'
import { toJS } from 'mobx'
import spuStore from '../spu_store'
import { getStrByte } from 'common/util'
import NutritionTable from './nutrition_table'

const cleanFoodInfos = [
  {
    value: 'origin_place',
    name: i18next.t('产地'),
  },
  {
    value: 'shelf_life',
    name: i18next.t('保质期'),
  },
  {
    value: 'material_description',
    name: i18next.t('原料说明'),
  },
  {
    value: 'recommended_method',
    name: i18next.t('建议使用方法'),
  },
  {
    value: 'storage_condition',
    name: i18next.t('贮存条件'),
  },
  {
    value: 'cut_specification',
    name: i18next.t('切配规格'),
  },
  {
    value: 'license',
    name: i18next.t('许可证'),
  },
  {
    value: 'product_performance_standards',
    name: i18next.t('产品执行标准'),
  },
]

@observer
class SupplyChainForm extends React.Component {
  validateStock = (stock_type, stocks) => {
    if (+stock_type === 2 && stocks === '') {
      return i18next.t('请填写')
    }
    return ''
  }

  validatePecSpec = (purchaseSpecInfo) => {
    const { purchaseSpec, ratio, unit_name } = purchaseSpecInfo

    if (+purchaseSpec === 2) {
      if (_.trim(unit_name) === '' || _.trim(ratio) === '') {
        return i18next.t('请填写')
      }

      if (+ratio === 0) {
        return i18next.t('采购规格不能为0')
      }
    }

    return ''
  }

  handleChangeSkuSupplier = (selected) => {
    const { id: spu_id } = spuStore.spuDetail
    const { feeType } = this.props

    skuStore.changeSkuDetail({
      supplier_id: selected?.value,
      createPurchaseSpec: false,
      purchase_spec_id: '',
    })

    // 由于其他供应商拉取的采购规格跟本站不同，因此不能完全解藕，还是需要重新拉取数据
    skuStore
      .getPurchaseSpecList(spu_id, selected?.value, feeType)
      .then((json) => {
        // 切换供应商和新建sku时需要设置默认选中第一个采购规格
        if (!_.isEmpty(json.data)) {
          skuStore.changeSkuDetail({ purchase_spec_id: json.data[0].id })
        }
      })
  }

  handleToPrioritySupplier = (
    sku_id,
    sku_name,
    saleName,
    supplierSelectedName,
    salemenuSelectedName,
  ) => {
    history.push({
      pathname: '/merchandise/manage/sale/priority_supplier/all_by_sku',
      search: `?sku_id=${sku_id}&sale_menu_name=${supplierSelectedName}&sku=${`${sku_name}：${saleName}`}&supplier=${`${i18next.t(
        '供应商',
      )}：${salemenuSelectedName}`}`,
    })
  }

  handleChangeStockType = (v) => {
    if (skuStore.skuDetail.stock_type === v) {
      return
    }

    if (v === 2) {
      skuStore.changeSkuDetail({ stocks: '', stock_type: v })
    } else {
      skuStore.changeSkuDetail({ stocks: -99999, stock_type: v })
    }
  }

  handleChangeInputNumberValue = (name, value) => {
    skuStore.changeSkuDetail({ [name]: value })
  }

  handleSelectBoxType = (selected) => {
    skuStore.changeSkuDetail({
      box_type: selected,
    })
  }

  handleSelectPurchaseSpec = (selected) => {
    if (selected?.value === -1) {
      skuStore.changeSkuDetail({
        purchase_spec_id: selected.value,
        createPurchaseSpec: true,
      })
    } else {
      skuStore.changeSkuDetail({
        purchase_spec_id: selected?.value,
      })
    }
  }

  handleChangePurchaseSpec = (value) => {
    skuStore.changePurchaseSpecInfo({
      purchaseSpec: value,
      ratio: 1,
    })
  }

  handleChangePurchaseRatio = (value) => {
    skuStore.changePurchaseSpecInfo({ ratio: value })
  }

  handleChangePurchaseUnitName = (e) => {
    const { name, value } = e.target
    skuStore.changePurchaseSpecInfo({ [name]: value })
  }

  handleChangeStatus = (name) => {
    skuStore.changeSkuDetail({ [name]: !skuStore.skuDetail[name] })
  }

  handleChangeCleanFood = () => {
    // 当修改为净菜时，此时只能为不计重商品，所以此时必须修改计重属性值为不计重
    const { clean_food } = skuStore.skuDetail
    if (clean_food) {
      skuStore.changeSkuDetail({
        clean_food: false,
      })
    } else {
      skuStore.changeSkuDetail({
        clean_food: true,
        is_weigh: 0,
      })
    }
  }

  handleChangeCleanFoodValue = (name, e) => {
    const value =
      name === 'shelf_life' || name === 'nutrition_status' ? e : e.target.value

    skuStore.changeCleanFoodInfo({ [name]: value })
  }

  handleChangeIsRound = () => {
    const { isRound } = skuStore.skuDetail
    skuStore.changeSkuDetail({ isRound: !isRound })
  }

  handleChangeOrderRound = () => {
    const { roundType } = skuStore.skuDetail
    skuStore.changeSkuDetail({ roundType: roundType === 1 ? 2 : 1 })
  }

  validateCFTextLength = (name, value) => {
    if (getStrByte(value) > 100) {
      return name + i18next.t('不能大于50个汉字或100个字符')
    }
    return ''
  }

  validateNutrition = (data) => {
    const { nutrition_status } = skuStore.skuDetail.clean_food_info
    let inValid = false
    data.forEach((item) => {
      if (!item.key || _.isNil(item.per_100g) || _.isNil(item.NRV)) {
        inValid = true
      }
    })

    if (nutrition_status && inValid) {
      return i18next.t('营养成分表不能为空')
    }

    return ''
  }

  render() {
    const {
      supplierSelected,
      salemenuSelected,
      psSelected,
      psList,
      stdUnitNameForSaleRatio,
      feeType,
    } = this.props
    const { spuSupplierList, reference_price_type } = merchandiseStore
    const {
      skuDetail: {
        clean_food,
        clean_food_info,
        sale_ratio,
        std_unit_name,
        std_unit_name_forsale,
        sale_unit_name,
        sku_id,
        sku_name,
        stock_type,
        stocks,
        spu_stock,
        purchase_spec_id,
        partframe,
        slitting,
        attrition_rate,
        createPurchaseSpec,
        is_already_clean_food,
        box_type,
        isRound,
        roundType,
      },
      purchaseSpecInfo,
    } = skuStore

    const saleName = `${sale_ratio || 1}${std_unit_name}/${
      sale_unit_name || std_unit_name
    }`
    const { referencePriceName } = getRefParams(reference_price_type)

    const p_editSku = globalStore.hasPermission('edit_sku')
    const p_editPrioritySupplier = globalStore.hasPermission(
      'edit_priority_supplier',
    )
    const p_editBoxType = globalStore.hasPermission('edit_box_type')
    const p_viewRound = globalStore.hasPermission('get_rounding')
    const p_editRound = globalStore.hasPermission('edit_rounding')

    return (
      <Form
        hasButtonInGroup
        ref={this.props.forwardRef}
        labelWidth='179px'
        colWidth='500px'
      >
        <FormBlock col={2}>
          {globalStore.isCleanFood() && (
            <FormItem label={i18next.t('开启加工')}>
              <Flex alignCenter>
                <Switch
                  type='primary'
                  checked={!!clean_food}
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  onChange={this.handleChangeCleanFood}
                  disabled={is_already_clean_food}
                  title={
                    is_already_clean_food
                      ? i18next.t(
                          '已开启加工商品不可关闭加工，如需修改商品为不启用加工，可删除后重新创建商品',
                        )
                      : ''
                  }
                />

                <ToolTip
                  popup={
                    <div className='gm-padding-5'>
                      {i18next.t(
                        '开启后商品额外进入生产流程，发布生产计划；如无需进入生产流程，选择“关闭”。开启加工并创建商品成功后，不可再次关闭，请谨慎创建',
                      )}
                    </div>
                  }
                  className='gm-padding-lr-5'
                />
              </Flex>
            </FormItem>
          )}
          {globalStore.isCleanFood() &&
            clean_food &&
            _.map(cleanFoodInfos, (item, index) => {
              if (item.value === 'shelf_life') {
                return (
                  <FormItem
                    label={item.name}
                    key={index}
                    style={{ width: '50%' }}
                  >
                    <div className='input-group'>
                      <InputNumberV2
                        value={clean_food_info[item.value]}
                        precision={0}
                        min={1}
                        max={999}
                        onChange={this.handleChangeCleanFoodValue.bind(
                          this,
                          `${item.value}`,
                        )}
                        className='form-control'
                      />
                      <div className='input-group-addon'>{i18next.t('天')}</div>
                    </div>
                  </FormItem>
                )
              } else {
                return (
                  <FormItem
                    label={item.name}
                    key={index}
                    style={{ width: '50%' }}
                    validate={Validator.create(
                      [],
                      clean_food_info[item.value],
                      this.validateCFTextLength.bind(
                        this,
                        item.name,
                        clean_food_info[item.value],
                      ),
                    )}
                  >
                    <input
                      value={clean_food_info[item.value]}
                      onChange={this.handleChangeCleanFoodValue.bind(
                        this,
                        `${item.value}`,
                      )}
                    />
                  </FormItem>
                )
              }
            })}
        </FormBlock>
        <FormBlock col={2}>
          {globalStore.isCleanFood() && clean_food && (
            <FormItem
              label={i18next.t('营养成分表')}
              colWidth='1000'
              validate={Validator.create(
                [],
                clean_food_info.nutrition_info,
                this.validateNutrition.bind(
                  this,
                  clean_food_info.nutrition_info,
                ),
              )}
            >
              <Switch
                type='primary'
                checked={!!clean_food_info.nutrition_status}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={() =>
                  this.handleChangeCleanFoodValue(
                    'nutrition_status',
                    !clean_food_info.nutrition_status,
                  )
                }
                className='gm-margin-bottom-10'
              />
              {!!clean_food_info.nutrition_status && <NutritionTable />}
            </FormItem>
          )}
        </FormBlock>
        <FormBlock col={2}>
          {!clean_food && (
            <FormItem
              label={i18next.t('默认供应商')}
              toolTip={
                <div className='gm-padding-5'>
                  {i18next.t(
                    '采购任务优先按默认供应商汇总，如设置客户指定供应商后，则此客户的订单将按指定供应商汇总',
                  )}
                </div>
              }
            >
              <Flex column>
                <MoreSelect
                  data={toJS(spuSupplierList)}
                  selected={supplierSelected}
                  isGroupList
                  onSelect={this.handleChangeSkuSupplier}
                  renderListFilterType='pinyin'
                />
                {p_editPrioritySupplier &&
                  supplierSelected &&
                  salemenuSelected &&
                  !!sku_id && (
                    <a
                      className='gm-margin-right-5'
                      onClick={this.handleToPrioritySupplier.bind(
                        this,
                        sku_id,
                        sku_name,
                        saleName,
                        salemenuSelected.text,
                        supplierSelected.text,
                      )}
                      href='javascript:;'
                    >
                      {i18next.t('设置客户指定供应商')}
                    </a>
                  )}
              </Flex>
            </FormItem>
          )}
          {!clean_food &&
            (createPurchaseSpec ? (
              <FormItem
                label={i18next.t('采购规格')}
                required
                validate={Validator.create(
                  [],
                  purchaseSpecInfo.purchaseSpec,
                  this.validatePecSpec.bind(this, purchaseSpecInfo),
                )}
              >
                <RadioGroup
                  data-id='initSaleCheckDetailItemPurchaseSpec'
                  style={{ marginTop: '-4px' }}
                  name='purchaseSpec'
                  value={purchaseSpecInfo.purchaseSpec || 1}
                  inline
                  onChange={this.handleChangePurchaseSpec}
                >
                  <Radio value={1} disabled={!p_editSku}>
                    {i18next.t('按')}
                    {purchaseSpecInfo.std_unit_name}
                  </Radio>
                  <Radio value={2} disabled={!p_editSku}>
                    <div className='sku-detail-radio gm-inline-block'>
                      <InputNumber
                        value={purchaseSpecInfo.ratio}
                        onChange={this.handleChangePurchaseRatio}
                        min={0}
                        precision={2}
                        className='sku-detail-radio-input'
                        disabled={
                          !p_editSku ||
                          purchaseSpecInfo.purchaseSpec !== 2 ||
                          purchase_spec_id !== -1
                        }
                      />
                      <div className='sku-detail-radio-input-addon'>
                        {purchaseSpecInfo.std_unit_name} /
                      </div>
                      <input
                        className='sku-detail-radio-input'
                        type='text'
                        name='unit_name'
                        value={purchaseSpecInfo.unit_name}
                        onChange={this.handleChangePurchaseUnitName}
                        disabled={
                          !p_editSku ||
                          purchaseSpecInfo.purchaseSpec !== 2 ||
                          purchase_spec_id !== -1
                        }
                      />
                    </div>
                  </Radio>
                </RadioGroup>
              </FormItem>
            ) : (
              <FormItem
                label={i18next.t('采购规格')}
                required
                validate={Validator.create(
                  [],
                  psSelected ? psSelected.value : '',
                )}
              >
                <div data-id='initSaleCheckDetailItemPurchaseSpec'>
                  <MoreSelect
                    data={psList}
                    selected={psSelected}
                    renderListFilterType='pinyin'
                    onSelect={this.handleSelectPurchaseSpec}
                    placeholder={i18next.t('选择采购规格')}
                  />
                </div>
              </FormItem>
            ))}
          {supplierSelected && +supplierSelected.upstream === 1 && (
            <FormItem label={i18next.t('分拣设置')}>
              <Flex style={{ marginTop: '4px' }}>
                <label className='checkbox-inline'>
                  <input
                    type='checkbox'
                    value='slitting'
                    checked={slitting}
                    onChange={this.handleChangeStatus.bind(this, 'slitting')}
                    disabled={!p_editSku}
                  />{' '}
                  {i18next.t('我能分切')}
                </label>
                <label className='checkbox-inline'>
                  <input
                    type='checkbox'
                    value='partframe'
                    checked={partframe}
                    onChange={this.handleChangeStatus.bind(this, 'partframe')}
                    disabled={!p_editSku}
                  />{' '}
                  {i18next.t('我能投框')}
                </label>
              </Flex>
            </FormItem>
          )}
          {slitting && !clean_food && (
            <FormItem
              label={i18next.t('耗损比例')}
              toolTip={
                <div className='gm-padding-5'>
                  {i18next.t('根据耗损的百分比额外增加采购数量')}
                </div>
              }
            >
              <div className='input-group'>
                <InputNumber
                  value={attrition_rate}
                  onChange={this.handleChangeInputNumberValue.bind(
                    this,
                    'attrition_rate',
                  )}
                  min={0}
                  precision={2}
                  className='form-control'
                />
                <div className='input-group-addon'>%</div>
              </div>
            </FormItem>
          )}
          {supplierSelected && +supplierSelected.upstream !== 1 && (
            <FormItem label={i18next.t('参考成本')}>
              <Flex style={{ paddingTop: '6px' }}>
                <div>
                  {psSelected
                    ? (psSelected.price || '-') +
                      Price.getUnit(feeType) +
                      '/' +
                      std_unit_name
                    : '-'}
                </div>
                <ToolTip
                  popup={
                    <div className='gm-padding-5'>
                      {i18next.t('来源')}：{referencePriceName}
                    </div>
                  }
                  className='gm-padding-left-5'
                />
              </Flex>
            </FormItem>
          )}

          {p_editBoxType && (
            <FormItem label={i18next.t('装箱类型')}>
              <Select
                onChange={this.handleSelectBoxType}
                data={[
                  { value: 0, text: i18next.t('散件装箱') },
                  { value: 1, text: i18next.t('整件装箱') },
                ]}
                value={box_type}
              />
            </FormItem>
          )}

          {/* 小布说 不用权限控制是否可见是否可编辑 */}
          <FormItem
            label={i18next.t('库存设置')}
            required
            validate={Validator.create(
              [],
              stock_type,
              this.validateStock.bind(this, stock_type, stocks),
            )}
          >
            <RadioGroup
              style={{ width: '500px', marginTop: '-5px' }}
              name='storeSetting'
              value={stock_type}
              inline
              onChange={this.handleChangeStockType}
            >
              <Radio value={1} disabled={!p_editSku}>
                {i18next.t('不设置库存')}
              </Radio>
              {supplierSelected && +supplierSelected.upstream === 1 && (
                <Radio value={0} disabled={!p_editSku}>
                  {i18next.t('读取上游库存')}
                </Radio>
              )}
              <Radio value={3} disabled={!p_editSku}>
                {i18next.t('限制库存')}&nbsp;
                {
                  // 若是净菜，则直接取skuDetail.spu_stock的值
                  sku_id
                    ? i18next.t('当前可用库存') +
                      (!clean_food
                        ? _.floor(
                            spu_stock / sale_ratio / stdUnitNameForSaleRatio,
                          ) + sale_unit_name
                        : `${parseFloat(
                            Big(spu_stock || 0).toFixed(2),
                          )}${sale_unit_name}`)
                    : ''
                }
              </Radio>
              <Radio value={2} disabled={!p_editSku}>
                <div className='sku-detail-radio gm-inline-block'>
                  {stock_type !== 2 ? (
                    <div className='sku-detail-radio-stocks-block' />
                  ) : null}
                  {i18next.t('设置库存')}&nbsp;
                  <InputNumber
                    className='sku-detail-radio-input'
                    min={0}
                    precision={2}
                    value={stocks}
                    onChange={this.handleChangeInputNumberValue.bind(
                      this,
                      'stocks',
                    )}
                    disabled={!p_editSku}
                  />
                  <div className='sku-detail-radio-input-addon'>
                    {_.trim(sale_unit_name)
                      ? sale_unit_name
                      : std_unit_name_forsale}
                  </div>
                </div>
              </Radio>
            </RadioGroup>
          </FormItem>
          {p_viewRound && (
            <FormItem label={i18next.t('下单取整')} col={2}>
              <Switch
                type='primary'
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={this.handleChangeIsRound}
                checked={isRound}
                disabled={!p_editRound}
              />
              <div className='gm-gap-5' />
              <ToolTip
                popup={
                  <div className='gm-padding-5'>
                    {i18next.t(
                      '开启取整后，该商品在下单时的汇总数量会自动截取为整数保存（编辑订单时还原），后续采购/分拣/配送按整数下单数进行',
                    )}
                  </div>
                }
              />
              {isRound && (
                <div className='gm-margin-tb-10'>
                  {i18next.t('选择取整方式:')}
                  <div className='gm-gap-5' />
                  <ToolTip
                    popup={
                      <div className='gm-padding-5'>
                        <div>
                          {i18next.t('向上取整：向上取最近的整数，如5.5→6.0；')}
                        </div>
                        <div className='gm-padding-top-5'>
                          {i18next.t('向下取整：向下取最近的整数，如5.5→5.0')}
                        </div>
                      </div>
                    }
                  />
                  <RadioGroup
                    inline
                    name='roundType'
                    value={roundType}
                    onChange={this.handleChangeOrderRound}
                    className='gm-margin-top-5'
                  >
                    <Radio value={1} disabled={!p_editRound}>
                      {i18next.t('向上取整')}
                    </Radio>
                    <Radio value={2} disabled={!p_editRound}>
                      {i18next.t('向下取整')}
                    </Radio>
                  </RadioGroup>
                </div>
              )}
            </FormItem>
          )}
        </FormBlock>
      </Form>
    )
  }
}

SupplyChainForm.propTypes = {
  spu_id: PropTypes.string,
  supplierSelected: PropTypes.object,
  salemenuSelected: PropTypes.object,
  forwardRef: PropTypes.object,
  psList: PropTypes.array,
  psSelected: PropTypes.object,
  stdUnitNameForSaleRatio: PropTypes.number,
  feeType: PropTypes.string,
}

// 转发form示例，在提交的时候能触发验证
export default React.forwardRef((props, ref) => (
  <SupplyChainForm forwardRef={ref} {...props} />
))
