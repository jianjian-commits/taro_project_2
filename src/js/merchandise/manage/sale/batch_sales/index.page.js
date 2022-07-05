import { i18next } from 'gm-i18n'
import React from 'react'
import { observer, Observer } from 'mobx-react'
import {
  Flex,
  Sheet,
  SheetColumn,
  SheetAction,
  Switch,
  InputNumber,
  Popover,
  FilterSelect,
  FormItem,
  Validator,
  Tip,
  Price,
  RadioGroup,
  Radio,
  Select,
  Option,
  Button,
  MoreSelect,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import Big from 'big.js'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'
import { history, System } from 'common/service'
import { SvgDelete } from 'gm-svg'
import store from '../batch/store'
import globalStore from 'stores/global'
import qs from 'query-string'
import { getOptionalMeasurementUnitList } from '../../../util'

@observer
class BatchNewSale extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      status: {
        state: true,
        is_weigh: true,
        is_price_timing: false,
        unit: false, // 销售计量单位
      },
    }
  }

  componentDidMount() {
    const { spuIdList } = this.props.location.query

    store.getBatchSkuList({ spu_ids: spuIdList }).then(() => {
      // 零食不显示是否时价和是否称重、默认非时价 不称重
      if (!System.isB()) {
        this.batchChangeStatus('is_price_timing', false)
        this.batchChangeStatus('is_weigh', false)
      }
      this.setState({ loading: false })
    })
  }

  handleStatus(field, e) {
    this.batchChangeStatus(field, e.target.checked)
  }

  batchChangeStatus = (field, value) => {
    store.batchChangeStatus(field, value ? 1 : 0)
    const status = Object.assign({}, this.state.status)
    status[field] = value
    this.setState({ status })
  }

  handleChangeSwitch(field, index, value) {
    store.changeSpuListInfo(field, value ? 1 : 0, index)
  }

  handleChangeValue(index, e) {
    store.changeSpuListInfo(e.target.name, e.target.value, index)
  }

  handleChangeNum(field, index, value) {
    store.changeSpuListInfo(field, value, index)
  }

  handleChangeBoxType = (field, index, value) => {
    store.changeSpuListInfo(field, value, index)
  }

  handleChangeStockType(field, index, val) {
    const stock = +val === 2 ? '' : -99999
    store.changeSpuListInfo(field, val, index)
    store.changeSpuListInfo('stock', stock, index)
  }

  handleDelete(index) {
    store.deleteSpu(index)
  }

  handleSearchData = (list, query) => {
    return pinYinFilter(list, query, (value) => value.name)
  }

  handleSelectData(field, index, selected) {
    field === 'supplier_name'
      ? store.changeSpuListInfo(field, selected?.text, index)
      : store.changeSpuListInfo(field, selected?.value, index)
  }

  handleChangeSelect = (index, selected) => {
    if (this.state.status.unit) {
      // 若勾选了，表示修改所有的销售计量单位
      const { saleSpuList } = store
      _.forEach(saleSpuList, (v, spuIndex) => {
        if (getOptionalMeasurementUnitList(v.std_unit_name).length) {
          store.changeSpuListInfo('std_unit_name_forsale', selected, spuIndex)
          store.changeSpuListInfo('sale_unit_name', selected, spuIndex)
        }
      })
      return
    }

    store.changeSpuListInfo('std_unit_name_forsale', selected, index)
    store.changeSpuListInfo('sale_unit_name', selected, index)
  }

  handleChangeRadio = (index, val) => {
    store.changeSpuListInfo('sale_ratio', val, index)
    if (val === 1) {
      const { saleSpuList } = store
      store.changeSpuListInfo(
        'sale_unit_name',
        saleSpuList[index].std_unit_name_forsale,
        index,
      )
    }
  }

  handleCreate = () => {
    const { saleSpuList } = store
    const {
      salemenuId,
      salemenuType,
      name,
      guide_type,
    } = this.props.location.query

    if (!this.validateData()) {
      Tip.warning(i18next.t('信息填写有误或不完善'))
      return false
    }
    const skusData = _.map(saleSpuList.slice(), (data) => {
      const {
        spu_id,
        sku_name,
        sale_price,
        ratio,
        sale_ratio,
        sale_unit_name,
        sale_num_least,
        state,
        is_weigh,
        is_price_timing,
        supplier_id,
        pur_spec_id,
        stock_type,
        stock,
        std_unit_name_forsale,
        desc,
        box_type,
      } = data
      const saleInfo = {
        spu_id,
        sku_name,
        sale_price: Number(Big(sale_price).times(100)),
        ratio,
        sale_unit_name,
        sale_num_least,
        is_weigh,
        state,
        is_price_timing,
        stock_type,
        std_unit_name_forsale,
        desc,
        box_type,
      }

      if (sale_ratio === 1) {
        saleInfo.ratio = 1
        saleInfo.sale_unit_name = std_unit_name_forsale
      }

      if (+stock_type === 2) {
        saleInfo.stock = stock
      } else {
        saleInfo.stock = -99999
      }

      if (supplier_id) {
        saleInfo.supplier_id = supplier_id
      }

      if (pur_spec_id) {
        saleInfo.pur_spec_id = pur_spec_id
      }

      return saleInfo
    })

    return store
      .batchCreateSpu({
        skus: JSON.stringify(skusData),
        salemenu_id: salemenuId,
      })
      .then(() => {
        Tip.success(i18next.t('新建成功'))
        setTimeout(() => {
          if (System.isC()) {
            history.push('/c_retail/basic_info/list')
          } else {
            history.push(
              '/merchandise/manage/sale/sale_list?' +
                qs.stringify({
                  id: salemenuId,
                  salemenuType,
                  name,
                  guide_type,
                }),
            )
          }
        }, 500)
      })
  }

  validateData() {
    const { saleSpuList } = store
    const data = _.find(saleSpuList.slice(), (newSaleInfo) => {
      const {
        sku_name,
        sale_price,
        sale_unit_name,
        ratio,
        sale_num_least,
        stock_type,
        stock,
      } = newSaleInfo
      if (+ratio === 0 || +sale_num_least === 0) {
        return true
      }
      return (
        sku_name === '' ||
        sale_price === '' ||
        sale_unit_name === '' ||
        ratio === '' ||
        sale_num_least === '' ||
        (+stock_type === 2 && stock === '')
      )
    })

    return _.isEmpty(data)
  }

  handleValidateStock(data) {
    if (+data.stock_type === 2 && data.stock === '') {
      return i18next.t('请填写')
    }
    return ''
  }

  handleValidateRatio(ratio, sale_unit_name) {
    if (ratio === '' || _.trim(sale_unit_name) === '') {
      return i18next.t('请填写')
    }
    if (+ratio === 0) {
      return i18next.t('销售规格不能为0')
    }
    return ''
  }

  handleValidateNumLeast(sale_num_least) {
    if (_.trim(sale_num_least) === '') {
      return i18next.t('请填写')
    }

    if (+sale_num_least === 0) {
      return i18next.t('最小下单数不能为0')
    }
    return ''
  }

  handleCancel = () => {
    history.go(-1)
  }

  handleTextSearch = (text) => {
    if (!text) return
    store.getSupplierList(text)
  }

  render() {
    const { saleSpuList, supplierList } = store
    const {
      loading,
      status: { state, is_weigh, is_price_timing, unit },
    } = this.state
    const list = saleSpuList.slice()
    const { feeType } = this.props.location.query

    const tipWarning = (
      <div className='gm-border gm-padding-10 gm-bg' style={{ width: '200px' }}>
        {i18next.t(
          '采购规格：无可选采购规格时，默认取此商品的基本单位作为采购规格。',
        )}
      </div>
    )

    return (
      <div>
        <QuickPanel title={i18next.t('新建销售商品')}>
          <Sheet list={list} enableEmptyTip loading={loading} scrollX>
            <SheetColumn
              field='sku_name'
              name={i18next.t('规格名称')}
              style={{ minWidth: '200px' }}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() => (
                      <FormItem
                        disabledCol
                        validate={Validator.create(
                          [Validator.TYPE.required],
                          _.trim(original.sku_name),
                        )}
                        canValidate
                      >
                        <input
                          type='text'
                          name='sku_name'
                          value={original.sku_name}
                          onChange={this.handleChangeValue.bind(this, index)}
                        />
                      </FormItem>
                    )}
                  </Observer>
                )
              }}
            />
            <SheetColumn
              field='spu_name'
              name={i18next.t('分类')}
              style={{ minWidth: '100px' }}
              render={(val, index, original) => {
                return (
                  original.category_1_name +
                  '/' +
                  original.category_2_name +
                  '/' +
                  original.pinlei_name +
                  '/' +
                  original.spu_name
                )
              }}
            />
            {globalStore.hasPermission('edit_measurement') && (
              <SheetColumn
                field='std_unit_name_forsale'
                name={
                  <div>
                    {i18next.t('销售计量单位')}&nbsp;
                    <input
                      type='checkbox'
                      checked={unit}
                      onChange={this.handleStatus.bind(this, 'unit')}
                    />
                  </div>
                }
                style={{ minWidth: '110px' }}
                render={(val, index, original) => {
                  return (
                    <Observer>
                      {() =>
                        getOptionalMeasurementUnitList(original.std_unit_name)
                          .length ? (
                          <Select
                            value={original.std_unit_name_forsale}
                            onChange={this.handleChangeSelect.bind(this, index)}
                          >
                            {_.map(
                              getOptionalMeasurementUnitList(
                                original.std_unit_name,
                              ),
                              (s) => (
                                <Option key={s.value} value={s.value}>
                                  {s.text}
                                </Option>
                              ),
                            )}
                          </Select>
                        ) : (
                          original.std_unit_name_forsale
                        )
                      }
                    </Observer>
                  )
                }}
              />
            )}
            <SheetColumn
              field='sale_price'
              name={i18next.t('销售单价')}
              style={{ minWidth: '100px' }}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() => (
                      <FormItem
                        disabledCol
                        validate={Validator.create(
                          [Validator.TYPE.required],
                          original.sale_price,
                        )}
                        canValidate
                      >
                        <Flex>
                          <InputNumber
                            className='form-control'
                            style={{ width: '50px' }}
                            min={0}
                            precision={2}
                            value={original.sale_price}
                            disabled={original.is_price_timing}
                            onChange={this.handleChangeNum.bind(
                              this,
                              'sale_price',
                              index,
                            )}
                          />
                          <span style={{ lineHeight: '30px' }}>
                            {Price.getUnit(feeType) + '/'}
                            {original.std_unit_name_forsale}
                          </span>
                        </Flex>
                      </FormItem>
                    )}
                  </Observer>
                )
              }}
            />
            <SheetColumn
              field='ratio'
              name={i18next.t('销售规格')}
              style={{ minWidth: '180px' }}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() => (
                      <FormItem
                        disabledCol
                        validate={Validator.create(
                          [Validator.TYPE.required],
                          original.ratio,
                          this.handleValidateRatio.bind(
                            this,
                            original.ratio,
                            original.sale_unit_name,
                          ),
                        )}
                        canValidate
                      >
                        <RadioGroup
                          name={'ratio_' + index}
                          value={original.sale_ratio}
                          onChange={this.handleChangeRadio.bind(this, index)}
                        >
                          <Radio value={1}>
                            {i18next.t('按')}
                            {original.std_unit_name_forsale}
                          </Radio>
                          <Radio value={2}>
                            <Flex row style={{ display: 'inline-flex' }}>
                              <InputNumber
                                className='form-control'
                                style={{ width: '50px' }}
                                min={0}
                                precision={2}
                                value={original.ratio}
                                disabled={original.sale_ratio === 1}
                                onChange={this.handleChangeNum.bind(
                                  this,
                                  'ratio',
                                  index,
                                )}
                              />
                              <div style={{ lineHeight: '30px' }}>
                                {original.std_unit_name_forsale}/
                              </div>
                              <input
                                className='form-control'
                                style={{ width: '50px' }}
                                type='text'
                                name='sale_unit_name'
                                value={original.sale_unit_name}
                                disabled={original.sale_ratio === 1}
                                onChange={this.handleChangeValue.bind(
                                  this,
                                  index,
                                )}
                              />
                            </Flex>
                          </Radio>
                        </RadioGroup>
                      </FormItem>
                    )}
                  </Observer>
                )
              }}
            />
            <SheetColumn
              field='ratio'
              name={i18next.t('销售价')}
              style={{ minWidth: '70px' }}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() =>
                      Big(original.sale_price || 0).times(original.ratio || 0) +
                      Price.getUnit(feeType) +
                      '/' +
                      original.sale_unit_name
                    }
                  </Observer>
                )
              }}
            />
            <SheetColumn
              field='sale_num_least'
              name={i18next.t('最小下单数')}
              style={{ minWidth: '80px' }}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() => (
                      <FormItem
                        disabledCol
                        validate={Validator.create(
                          [Validator.TYPE.required],
                          original.sale_num_least,
                          this.handleValidateNumLeast.bind(
                            this,
                            original.sale_num_least,
                          ),
                        )}
                        canValidate
                      >
                        <InputNumber
                          className='form-control'
                          style={{ width: '50px' }}
                          min={0}
                          precision={2}
                          value={original.sale_num_least}
                          onChange={this.handleChangeNum.bind(
                            this,
                            'sale_num_least',
                            index,
                          )}
                        />
                      </FormItem>
                    )}
                  </Observer>
                )
              }}
            />
            {System.isB() ? (
              <SheetColumn
                field='is_price_timing'
                style={{ minWidth: '85px' }}
                name={
                  <div>
                    {i18next.t('是否时价')}&nbsp;
                    <input
                      type='checkbox'
                      checked={is_price_timing}
                      onChange={this.handleStatus.bind(this, 'is_price_timing')}
                    />
                  </div>
                }
                render={(val, index, original) => {
                  return (
                    <Observer>
                      {() => (
                        <Switch
                          type='primary'
                          checked={original.is_price_timing === 1}
                          on={i18next.t('时价')}
                          off={i18next.t('非时价')}
                          onChange={this.handleChangeSwitch.bind(
                            this,
                            'is_price_timing',
                            index,
                          )}
                        />
                      )}
                    </Observer>
                  )
                }}
              />
            ) : null}
            <SheetColumn
              field='state'
              style={{ minWidth: '85px' }}
              name={
                <div>
                  {i18next.t('销售状态')}&nbsp;
                  <input
                    type='checkbox'
                    checked={state}
                    onChange={this.handleStatus.bind(this, 'state')}
                  />
                </div>
              }
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() => (
                      <Switch
                        type='primary'
                        checked={original.state === 1}
                        on={i18next.t('上架')}
                        off={i18next.t('下架')}
                        onChange={this.handleChangeSwitch.bind(
                          this,
                          'state',
                          index,
                        )}
                      />
                    )}
                  </Observer>
                )
              }}
            />
            {System.isB() ? (
              <SheetColumn
                field='is_weigh'
                style={{ minWidth: '85px' }}
                name={
                  <div>
                    {i18next.t('是否称重')}&nbsp;
                    <input
                      type='checkbox'
                      checked={is_weigh}
                      onChange={this.handleStatus.bind(this, 'is_weigh')}
                    />
                  </div>
                }
                render={(val, index, original) => {
                  return (
                    <Observer>
                      {() => (
                        <Switch
                          type='primary'
                          checked={original.is_weigh === 1}
                          on={i18next.t('称重')}
                          off={i18next.t('不称重')}
                          onChange={this.handleChangeSwitch.bind(
                            this,
                            'is_weigh',
                            index,
                          )}
                        />
                      )}
                    </Observer>
                  )
                }}
              />
            ) : null}

            {globalStore.hasPermission('edit_box_type') && (
              <SheetColumn
                field='box_type'
                name={i18next.t('装箱类型')}
                style={{ minWidth: '120px' }}
                render={(val, index, original) => {
                  return (
                    <Observer>
                      {() => (
                        <FormItem>
                          <RadioGroup
                            name={`box_type_${index}`}
                            value={original.box_type}
                            onChange={(value) =>
                              this.handleChangeBoxType('box_type', index, value)
                            }
                          >
                            <Radio value={0}>{i18next.t('散件装箱')}</Radio>
                            <Radio value={1}>{i18next.t('整件装箱')}</Radio>
                          </RadioGroup>
                        </FormItem>
                      )}
                    </Observer>
                  )
                }}
              />
            )}

            <SheetColumn
              field='stock_type'
              name={i18next.t('库存设置')}
              style={{ minWidth: '220px' }}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() => (
                      <FormItem
                        disabledCol
                        validate={Validator.create(
                          [Validator.TYPE.required],
                          original.stock_type,
                          this.handleValidateStock.bind(this, original),
                        )}
                        canValidate
                      >
                        <RadioGroup
                          name={'storeSetting_' + index}
                          value={+original.stock_type || 1}
                          onChange={this.handleChangeStockType.bind(
                            this,
                            'stock_type',
                            index,
                          )}
                        >
                          <Radio value={1}>{i18next.t('不设置库存')}</Radio>
                          <Radio value={3}>{i18next.t('限制库存')}&nbsp;</Radio>
                          <Radio value={2}>
                            <div className='sku-detail-radio gm-inline-block'>
                              {i18next.t('设置库存')}&nbsp;
                              <InputNumber
                                className='sku-detail-radio-input'
                                style={{ width: '80px' }}
                                min={0}
                                precision={2}
                                value={original.stock}
                                onChange={this.handleChangeNum.bind(
                                  this,
                                  'stock',
                                  index,
                                )}
                              />
                              <div className='sku-detail-radio-input-addon'>
                                {_.trim(original.sale_unit_name)
                                  ? original.sale_unit_name
                                  : original.std_unit_name_forsale}
                              </div>
                            </div>
                          </Radio>
                        </RadioGroup>
                      </FormItem>
                    )}
                  </Observer>
                )
              }}
            />
            <SheetColumn
              field='suppliers'
              name={i18next.t('供应商设置')}
              style={{ minWidth: '150px' }}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() => {
                      return (
                        <MoreSelect
                          data={supplierList}
                          selected={{
                            text: list[index].supplier_name,
                            value: list[index].supplier_id,
                          }}
                          renderListFilterType='pinyin'
                          onSelect={(item) => {
                            this.handleSelectData('supplier_id', index, item)
                            this.handleSelectData('supplier_name', index, item)
                          }}
                          placeholder={i18next.t('选择供应商')}
                          onSearch={this.handleTextSearch}
                        />
                      )
                    }}
                  </Observer>
                )
              }}
            />
            <SheetColumn
              field='pur_specs'
              style={{ minWidth: '150px' }}
              name={
                <Flex>
                  {i18next.t('采购规格')}
                  <Popover
                    showArrow
                    right
                    component={<div />}
                    type='hover'
                    popup={tipWarning}
                  >
                    <div style={{ paddingLeft: '5px', paddingRight: '8px' }}>
                      <i className='ifont ifont-warning' />
                    </div>
                  </Popover>
                </Flex>
              }
              render={(val, index, original) => {
                const purSpecList = _.map(
                  original.pur_specs.slice(),
                  (spec) => {
                    return { name: spec.name, value: spec.pur_spec_id }
                  },
                )
                return (
                  <Observer>
                    {() => (
                      <FilterSelect
                        id={'spec_' + index}
                        list={purSpecList || []}
                        selected={_.find(purSpecList, (spec) => {
                          return spec.value === original.pur_spec_id
                        })}
                        withFilter={this.handleSearchData}
                        onSelect={this.handleSelectData.bind(
                          this,
                          'pur_spec_id',
                          index,
                        )}
                        placeholder={i18next.t('选择规格')}
                      />
                    )}
                  </Observer>
                )
              }}
            />
            <SheetAction>
              {(val, index) => (
                <a
                  onClick={this.handleDelete.bind(this, index)}
                  style={{ minWidth: '30px' }}
                >
                  <SvgDelete />
                </a>
              )}
            </SheetAction>
          </Sheet>
          <Flex justifyCenter className='gm-margin-15'>
            <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
            <div className='gm-gap-5' />
            <Button
              type='primary'
              onClick={this.handleCreate}
              disabled={list.length === 0}
            >
              {i18next.t('新建')}
            </Button>
          </Flex>
        </QuickPanel>
      </div>
    )
  }
}

export default BatchNewSale
