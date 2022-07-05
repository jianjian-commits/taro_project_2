import { i18next } from 'gm-i18n'
import React from 'react'
import {
  BoxTable,
  FormItem,
  Validator,
  InputNumber,
  Price,
  Flex,
  Tip,
  FunctionSet,
  Button,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import { SvgMinus } from 'gm-svg'
import { Table, TableUtil } from '@gmfe/table'

import { connect } from 'react-redux'
import _ from 'lodash'
import Big from 'big.js'
import { history } from 'common/service'
import { saleState } from 'common/filter'
import { saleReferencePrice } from 'common/enum'
import SkuSearch from './components/sku_search'
import { isDecimalNumber, isNumber } from 'common/util'
import { getMutltiColumnName } from './util'
import TableListTips from 'common/components/table_list_tips'

import actions from '../../../actions'
import './actions'
import './reducer'

class DetailSkuUpload extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchList: [],
      skuList: [],
    }
  }

  componentDidMount() {
    actions.price_rule_upload_clear()
  }

  handleUpload = (e) => {
    const files = e.target.files
    const { salemenu_id, type } = this.props.location.query
    const postData = {
      upload_type: 'sku',
      upload_file: files[0],
      salemenu_id: salemenu_id,
      rule_type: type,
      uploading: true,
    }

    actions.price_rule_upload(postData)
  }

  handleDownload = () => {
    window.open('/station/price_rule/download?download_type=sku')
  }

  validateSkuid = (sku) => {
    const {
      check_data: { in_salemenu },
    } = sku

    if (in_salemenu !== 1) {
      return i18next.t('商品不属于该报价单')
    }
    return ''
  }

  validateFixedValue = (sku) => {
    if (getMutltiColumnName(sku, 'fixed_value'))
      return getMutltiColumnName(sku, 'fixed_value')

    if (
      +sku.price_rule.fixed_value !== 0 &&
      sku.price_rule.fixed_value &&
      sku.price_rule.fixed_value < 0
    ) {
      return i18next.t('固定价格不能少于0')
    }
    return ''
  }

  validateVariation = (sku) => {
    if (getMutltiColumnName(sku, 'variation'))
      return getMutltiColumnName(sku, 'variation')

    const variation = sku.price_rule.variation
    if (
      isDecimalNumber(variation) &&
      Big(sku.sale_price).plus(variation).lt(0)
    ) {
      return i18next.t('规则价不能少于0')
    }
    return ''
  }

  validateMultiple = (sku) => {
    if (getMutltiColumnName(sku, 'multiple'))
      return getMutltiColumnName(sku, 'multiple')

    const variation = sku.price_rule.multiple
    if (+variation !== 0 && variation && variation < 0) {
      return i18next.t('倍数不能少于0')
    }
    return ''
  }

  handleSelectSkuid = (index, selected) => {
    actions.price_rule_detail_upload_sku_select(index, selected)
  }

  handleSave = () => {
    const { list } = this.props.price_rule.upload

    if (!list || !list.length) {
      Tip.warning(i18next.t('请选择文件上传~'))
      return false
    }

    if (
      _.find(
        list,
        (sku) =>
          (sku.price_rule.fixed_value === '' &&
            sku.price_rule.multiple === '' &&
            sku.price_rule.variation === '') ||
          this.validateSkuid(sku)
      )
    ) {
      Tip.warning(i18next.t('请填写完整信息'))
      return false
    }

    const inValidSku = _.find(
      list,
      (sku) =>
        this.validateFixedValue(sku) ||
        this.validateMultiple(sku) ||
        this.validateSkuid(sku) ||
        this.validateVariation(sku)
    )

    if (inValidSku) {
      Tip.warning(
        i18next.t('KEY142', {
          VAR1: inValidSku.id,
        }) /* src:`${inValidSku.id}锁价设置错误` => tpl:${VAR1}锁价设置错误 */
      )
      return false
    }

    actions.price_rule_sku_pagination_clear()

    actions.price_rule_update_detail_list(list, 'sku')
    history.go(-1)
  }

  handleCancel = () => {
    history.go(-1)
  }

  render() {
    const { upload } = this.props.price_rule
    const { refPriceType, fee_type } = this.props.location.query
    const refPriceTypeFlag = saleReferencePrice
      ? _.find(saleReferencePrice, (v) => v.type === +refPriceType).flag
      : ''

    return (
      <div>
        <TableListTips
          tips={[
            i18next.t(
              '导入后将覆盖原有商品，请谨慎操作！（如需在已有商品上增减，请在列表导出编辑后导入，两处模板均可支持）'
            ),
          ]}
        />
        <BoxTable
          action={
            <Flex>
              <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
              <div className='gm-gap-5' />
              <Button
                type='primary'
                htmlType='submit'
                onClick={this.handleSave}
              >
                {i18next.t('保存')}
              </Button>
              <div className='gm-gap-5' />
              <FunctionSet
                data={[
                  {
                    text: i18next.t('上传表格'),
                    onClick: () => {
                      this.uploaderRef.click()
                    },
                  },
                  {
                    text: i18next.t('模板下载'),
                    onClick: this.handleDownload.bind(this),
                  },
                ]}
              />
              <input
                accept='.xlsx'
                type='file'
                ref={(ref) => (this.uploaderRef = ref)}
                onChange={this.handleUpload}
                style={{ display: 'none' }}
              />
            </Flex>
          }
        >
          <Table
            data={upload.list}
            columns={[
              {
                id: 'id',
                minWidth: 40,
                Header: i18next.t('商品ID'),
                Cell: ({ original, index }) => {
                  const {
                    check_data: { in_salemenu },
                    id,
                    outer_id,
                    price_rule,
                  } = original
                  if (in_salemenu === 1) return <div>{outer_id || id}</div>

                  return (
                    <FormItem
                      required
                      disabledCol
                      validate={Validator.create(
                        [],
                        original,
                        this.validateSkuid.bind(this, original)
                      )}
                      canValidate
                    >
                      <SkuSearch
                        index={index}
                        salemenu_id={this.props.location.query.salemenu_id}
                        price_rule={price_rule}
                        uploadList={upload.list}
                        refPriceTypeFlag={refPriceTypeFlag}
                        selected={null}
                        onSelect={this.handleSelectSkuid.bind(this, index)}
                      />
                    </FormItem>
                  )
                },
              },
              {
                accessor: 'name',
                minWidth: 25,
                Header: i18next.t('商品名'),
              },
              {
                accessor: 'guige',
                minWidth: 20,
                Header: i18next.t('规格'),
              },
              {
                accessor: 'chengben',
                minWidth: 25,
                Header: i18next.t('成本价'),
                Cell: ({ original, value }) => {
                  return (
                    value +
                    Price.getUnit(fee_type) +
                    '/' +
                    original.sale_unit_name
                  )
                },
              },
              {
                accessor: 'yuanjia',
                minWidth: 40,
                Header: i18next.t('原价'),
                Cell: ({ original, value }) => {
                  return (
                    value +
                    Price.getUnit(fee_type) +
                    '/' +
                    original.sale_unit_name
                  )
                },
              },
              {
                id: 'price_rule',
                minWidth: 65,
                Header: i18next.t('固定价格'),
                Cell: ({ original, index }) => {
                  const { price_rule, sale_unit_name } = original
                  return (
                    <FormItem
                      disabledCol
                      validate={Validator.create(
                        [],
                        original,
                        this.validateFixedValue.bind(this, original)
                      )}
                      canValidate
                    >
                      <Flex row alignCenter>
                        <InputNumber
                          value={price_rule.fixed_value}
                          onChange={(value) => {
                            actions.price_rule_detail_upload_sku_change(
                              {
                                fixed_value: value,
                              },
                              index
                            )
                          }}
                          type='text'
                          placeholder={i18next.t('固定价格')}
                          className='form-control input-sm'
                          minus={price_rule.fixed_value < 0}
                        />
                        <span>
                          {Price.getUnit(fee_type) + '/'}
                          {sale_unit_name}
                        </span>
                      </Flex>
                    </FormItem>
                  )
                },
              },
              {
                id: 'price_rule',
                minWidth: 65,
                Header: i18next.t('价格变动'),
                Cell: ({ original, index }) => {
                  const { price_rule, sale_unit_name } = original
                  return (
                    <FormItem
                      disabledCol
                      validate={Validator.create(
                        [],
                        original,
                        this.validateVariation.bind(this, original)
                      )}
                      canValidate
                    >
                      <Flex row alignCenter>
                        <InputNumber
                          value={price_rule.variation}
                          onChange={(value) => {
                            actions.price_rule_detail_upload_sku_change(
                              {
                                variation: value,
                              },
                              index
                            )
                          }}
                          type='text'
                          placeholder={i18next.t('价格变动')}
                          className='form-control input-sm'
                          minus
                        />
                        <span>
                          {Price.getUnit(fee_type) + '/'}
                          {sale_unit_name}
                        </span>
                      </Flex>
                    </FormItem>
                  )
                },
              },
              {
                id: 'price_rule',
                minWidth: 65,
                Header: i18next.t('倍数'),
                Cell: ({ original, index }) => {
                  const { price_rule } = original
                  return (
                    <FormItem
                      disabledCol
                      validate={Validator.create(
                        [],
                        original,
                        this.validateMultiple.bind(this, original)
                      )}
                      canValidate
                    >
                      <InputNumber
                        value={price_rule.multiple}
                        onChange={(value) => {
                          actions.price_rule_detail_upload_sku_change(
                            {
                              multiple: value,
                            },
                            index
                          )
                        }}
                        type='text'
                        placeholder={i18next.t('倍数')}
                        className='form-control input-sm'
                        precision={4}
                        minus={price_rule.multiple < 0}
                      />
                    </FormItem>
                  )
                },
              },
              {
                id: 'sale_price',
                minWidth: 40,
                Header: i18next.t('规则价'),
                Cell: ({ original }) => {
                  const { price_rule, sale_unit_name, sale_price } = original
                  const ruleObj = _.pickBy(price_rule, (value) => value !== '')
                  const keys = _.keys(ruleObj)
                  let rulePrice = ''

                  if (keys.length === 1) {
                    const key = keys[0]
                    if (key === 'fixed_value') {
                      rulePrice = ruleObj.fixed_value
                    } else if (
                      key === 'variation' &&
                      isDecimalNumber(ruleObj.variation)
                    ) {
                      rulePrice = Big(sale_price)
                        .plus(ruleObj.variation)
                        .toFixed(2)
                    } else if (
                      key === 'multiple' &&
                      isNumber(ruleObj.multiple)
                    ) {
                      rulePrice = Big(sale_price)
                        .times(ruleObj.multiple)
                        .toFixed(2)
                    }
                  }

                  return rulePrice
                    ? `${rulePrice}${
                        Price.getUnit(fee_type) + '/'
                      }${sale_unit_name}`
                    : '-'
                },
              },
              {
                id: 'state',
                minWidth: 30,
                Header: i18next.t('销售状态'),
                Cell: ({ original }) => saleState(original.state),
              },
              {
                id: 'del',
                minWidth: 20,
                Header: TableUtil.OperationHeader,
                Cell: ({ index }) => {
                  return (
                    <Flex justifyCenter>
                      <Button
                        type='danger'
                        onClick={actions.price_rule_detail_upload_sku_del.bind(
                          null,
                          index
                        )}
                        style={{
                          width: '22px',
                          height: '22px',
                          padding: 0,
                          borderRadius: '3px',
                        }}
                      >
                        <SvgMinus />
                      </Button>
                    </Flex>
                  )
                },
              },
            ]}
          />
        </BoxTable>
      </div>
    )
  }
}

DetailSkuUpload.propTypes = {
  price_rule: PropTypes.object,
}

export default connect((state) => ({
  price_rule: state.price_rule,
}))(DetailSkuUpload)
