import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { printStore } from './store'
import {
  Flex,
  Sheet,
  SheetColumn,
  InputNumber,
  Button,
  Loading,
  Price,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { isMoneyField, getFirstLineHeight } from './util'
import Big from 'big.js'
import qs from 'query-string'
import _ from 'lodash'
import classNames from 'classnames'

const defaultFontSize = 10

// 必须传的字段不能为空
const isInvalid = (field, value) => {
  // submit 接口必须传的字段
  const requiredFields = [
    'name',
    'std_sale_price',
    'sale_unit_name',
    'std_unit_name',
    'money_delta',
    'std_unit_name',
    'sale_ratio',
    'real_weight',
    'quantity',
  ]
  return (
    _.includes(requiredFields, field) &&
    (value === '' || value === undefined || value === null)
  )
}

const isDisable = () => {
  const { details, allAbnormalList } = printStore.printData
  // 异常列表必填金额字段
  const isDisable = _.some(
    allAbnormalList.slice(),
    (sku) =>
      sku.money_delta === '' ||
      sku.money_delta === undefined ||
      sku.money_delta === null
  )
  if (isDisable) {
    return true
  }
  // 判断存在无效字段
  return _.some(details.slice(), (sku) => {
    return _.some(sku, (value, key) => isInvalid(key, value))
  })
}

const Img = ({ logo, header }) => {
  if (!logo || !header) return null
  // 第一行的高度(取这一行中的最大高度)
  const firstLineHeight = getFirstLineHeight(header)

  return (
    <img
      src={logo}
      alt='logo'
      style={{
        width: '100px',
        height: `${firstLineHeight}px`,
        position: 'absolute',
        top: '62px',
        objectFit: 'contain',
      }}
    />
  )
}

@observer
class EditPrintDistribute extends Component {
  constructor() {
    super()
    this.handlePrint = ::this.handlePrint
  }

  async componentDidMount() {
    const { template_id, order_id } = this.props.history.location.query
    await printStore.getPrintData(order_id)
    await printStore.getTemplateConfig()
    printStore.setTemplateID(template_id)
  }

  handlePrint() {
    const { id } = printStore.curTemplateConfig
    // 提交编辑后的配送单
    return printStore.submitDistributeOrder().then((printData) => {
      window.open(
        `#/system/setting/distribute_templete/print_edited_distribute?${qs.stringify(
          {
            data: JSON.stringify(printData),
            template_id: id,
          }
        )}`
      )
    })
  }

  render() {
    const { curTemplateConfig, isLoading } = printStore

    if (isLoading) {
      return <Loading />
    }

    if (!curTemplateConfig) {
      return (
        <QuickPanel title={i18next.t('编辑配送单')} icon='bill'>
          <div className='gm-text-red text-center gm-padding-20'>
            {i18next.t('模板配置发生变化,请返回上一页')}
          </div>
        </QuickPanel>
      )
    }
    const {
      headerBlockLines,
      topInfoBlockLines,
      productBlockHeader,
      bottomInfoBlockLines,
      logo,
    } = curTemplateConfig

    return (
      <QuickPanel
        title={i18next.t('编辑配送单')}
        icon='bill'
        right={
          <Button
            type='primary'
            onClick={this.handlePrint}
            disabled={isDisable()}
          >
            {i18next.t('打印')}
          </Button>
        }
      >
        <Img logo={logo} header={headerBlockLines} />
        <BlockLines lines={headerBlockLines} printData={printStore.printData} />
        <BlockLines
          lines={topInfoBlockLines}
          printData={printStore.printData}
        />

        <CategorySummary
          skuDetail={printStore.printData.details}
          productBlockHeader={productBlockHeader}
        />

        <SkuTable
          header={productBlockHeader.tr}
          skuDetail={printStore.printData.details}
        />

        <AbnormalTable
          allAbnormalList={printStore.printData.allAbnormalList}
          productBlockHeader={productBlockHeader}
        />

        <Summary
          skuDetail={printStore.printData.details}
          productBlockHeader={productBlockHeader}
        />
        <BlockLines
          lines={bottomInfoBlockLines}
          printData={printStore.printData}
        />
      </QuickPanel>
    )
  }
}

class SkuTable extends Component {
  handleChange(field, skuIndex, e) {
    const value = e.target.value
    printStore.setSkuDetailValue(field, skuIndex, value)
  }

  handleNumberChange(field, skuIndex, value) {
    printStore.setSkuDetailValue(field, skuIndex, value)
  }

  handleDel(skuIndex) {
    printStore.deleteDetailSku(skuIndex)
  }

  handleAdd() {
    printStore.addDetailSku()
  }

  render() {
    const inputStyle_1 = { width: '30px' }
    const inputStyle = { width: '50px' }
    const { header, skuDetail = [] } = this.props

    let headerList = header
      .slice()
      .concat({ text: i18next.t('操作'), field: i18next.t('操作') })

    // 去掉应付金额（不含税）和不含税单价
    headerList = _.remove(headerList, (list) => {
      return (
        list.field !== 'real_item_price_without_tax' &&
        list.field !== 'sale_price_without_tax'
      )
    })

    return (
      <Sheet list={skuDetail.slice()}>
        {headerList.map((tr, index) => {
          const field = tr.field
          return (
            <SheetColumn
              field={field}
              name={tr.text}
              key={index}
              render={(value, skuIndex) => {
                switch (field) {
                  // 序号
                  case '_index':
                    return skuIndex + 1

                  case 'real_item_price':
                  case 'sale_price':
                  case 'real_weight_sale': // 出库数(销售单位)
                    return skuDetail[skuIndex][field]

                  case 'std_sale_price':
                    return (
                      <InputNumber
                        value={skuDetail[skuIndex][field]}
                        style={inputStyle}
                        className={classNames({
                          'b-bg-warning': isInvalid(
                            field,
                            skuDetail[skuIndex][field]
                          ),
                        })}
                        min={0}
                        onChange={this.handleNumberChange.bind(
                          this,
                          field,
                          skuIndex
                        )}
                      />
                    )
                  // 下单数
                  case 'quantity':
                    return (
                      <div>
                        <InputNumber
                          value={skuDetail[skuIndex]['quantity']}
                          style={inputStyle_1}
                          className={classNames({
                            'b-bg-warning': isInvalid(
                              'quantity',
                              skuDetail[skuIndex]['quantity']
                            ),
                          })}
                          onChange={this.handleNumberChange.bind(
                            this,
                            'quantity',
                            skuIndex
                          )}
                        />
                        {skuDetail[skuIndex]['sale_unit_name']}
                      </div>
                    )
                  // 出库数(基本单位)
                  case 'real_weight_std':
                    return (
                      <div>
                        <InputNumber
                          value={skuDetail[skuIndex]['real_weight']}
                          style={inputStyle_1}
                          className={classNames({
                            'b-bg-warning': isInvalid(
                              'real_weight',
                              skuDetail[skuIndex]['real_weight']
                            ),
                          })}
                          onChange={this.handleNumberChange.bind(
                            this,
                            'real_weight',
                            skuIndex
                          )}
                        />
                        {skuDetail[skuIndex]['std_unit_name']}
                      </div>
                    )
                  // 规格
                  case 'specs':
                    return (
                      <div>
                        {i18next.t('按')}
                        <InputNumber
                          value={skuDetail[skuIndex]['sale_ratio']}
                          className={classNames({
                            'b-bg-warning': isInvalid(
                              'sale_ratio',
                              skuDetail[skuIndex]['sale_ratio']
                            ),
                          })}
                          style={inputStyle_1}
                          onChange={this.handleNumberChange.bind(
                            this,
                            'sale_ratio',
                            skuIndex
                          )}
                        />
                        <input
                          type='text'
                          maxLength='50'
                          value={skuDetail[skuIndex]['std_unit_name']}
                          className={classNames({
                            'b-bg-warning': isInvalid(
                              'std_unit_name',
                              skuDetail[skuIndex]['std_unit_name']
                            ),
                          })}
                          style={inputStyle_1}
                          onChange={this.handleChange.bind(
                            this,
                            'std_unit_name',
                            skuIndex
                          )}
                        />
                        /
                        <input
                          type='text'
                          maxLength='50'
                          value={skuDetail[skuIndex]['sale_unit_name']}
                          className={classNames({
                            'b-bg-warning': isInvalid(
                              'sale_unit_name',
                              skuDetail[skuIndex]['sale_unit_name']
                            ),
                          })}
                          style={inputStyle_1}
                          onChange={this.handleChange.bind(
                            this,
                            'sale_unit_name',
                            skuIndex
                          )}
                        />
                      </div>
                    )

                  case 'tax': {
                    // 税额 = （出库数*含税单价 * 税率） 除以 1+税额
                    const tax_rate = Big(skuDetail[skuIndex].tax_rate || 0)
                      .div(100)
                      .toFixed(6)
                    const price = Big(skuDetail[skuIndex].real_weight || 0)
                      .times(skuDetail[skuIndex].std_sale_price || 0)
                      .times(tax_rate)
                      .toFixed(6)
                    return Big(price).div(Big(1).plus(tax_rate)).toFixed(2)
                  }

                  // 操作
                  case i18next.t('操作'):
                    return (
                      <div>
                        <i
                          className='xfont xfont-plus gm-cursor'
                          onClick={this.handleAdd.bind(this)}
                        />
                        <div className='gm-gap-10' />
                        <i
                          className='xfont xfont-minus gm-cursor'
                          onClick={this.handleDel.bind(this, skuIndex)}
                        />
                      </div>
                    )

                  default:
                    return (
                      <input
                        type='text'
                        value={skuDetail[skuIndex][field] || ''}
                        style={inputStyle}
                        maxLength='50'
                        className={classNames({
                          'b-bg-warning': isInvalid(
                            field,
                            skuDetail[skuIndex][field]
                          ),
                        })}
                        onChange={this.handleChange.bind(this, field, skuIndex)}
                      />
                    )
                }
              }}
            />
          )
        })}
      </Sheet>
    )
  }
}

class AbnormalTable extends Component {
  handleChange(field, index, e) {
    const value = e.target.value
    printStore.setAbnormalListValue(field, index, value)
  }

  handleNumberChange(field, index, value) {
    printStore.setAbnormalListValue(field, index, value)
  }

  handleDel(index) {
    printStore.deleteAbnormal(index)
  }

  handleAdd() {
    printStore.addAbnormal()
  }

  render() {
    const headerFieldList = [
      { field: 'name', text: i18next.t('商品名') },
      { field: 'type_text', text: i18next.t('异常原因') },
      { field: 'text', text: i18next.t('异常描述') },
      { field: 'count', text: i18next.t('异常/退货(数量)') },
      { field: 'money_delta', text: i18next.t('异常/退货(金额)') },
      { field: i18next.t('操作'), text: i18next.t('操作') },
    ]
    const { allAbnormalList, productBlockHeader } = this.props

    if (!allAbnormalList.length || !productBlockHeader.abnormals_detail)
      return null

    return (
      <div>
        <div>{i18next.t('异常明细')}:</div>
        <Sheet list={allAbnormalList.slice()}>
          {headerFieldList.map((tr, index) => {
            const field = tr.field
            return (
              <SheetColumn
                field={field}
                name={tr.text}
                key={index}
                render={(value, skuIndex) => {
                  switch (field) {
                    // 操作
                    case i18next.t('操作'):
                      return (
                        <div>
                          <i
                            className='xfont xfont-plus gm-cursor'
                            onClick={this.handleAdd.bind(this)}
                          />
                          <div className='gm-gap-10' />
                          <i
                            className='xfont xfont-minus gm-cursor'
                            onClick={this.handleDel.bind(this, skuIndex)}
                          />
                        </div>
                      )
                    case 'count':
                      return (
                        <div>
                          <InputNumber
                            value={allAbnormalList[skuIndex]['amount_delta']}
                            minus
                            onChange={this.handleNumberChange.bind(
                              this,
                              'amount_delta',
                              skuIndex
                            )}
                          />
                          <input
                            type='text'
                            maxLength='50'
                            value={
                              allAbnormalList[skuIndex]['std_unit_name'] || ''
                            }
                            style={{ width: '30px' }}
                            onChange={this.handleChange.bind(
                              this,
                              'std_unit_name',
                              skuIndex
                            )}
                          />
                        </div>
                      )
                    case 'money_delta':
                      return (
                        <InputNumber
                          className={classNames({
                            'b-bg-warning': isInvalid(
                              'money_delta',
                              allAbnormalList[skuIndex]['money_delta']
                            ),
                          })}
                          value={allAbnormalList[skuIndex]['money_delta']}
                          minus
                          onChange={this.handleNumberChange.bind(
                            this,
                            'money_delta',
                            skuIndex
                          )}
                        />
                      )
                    default:
                      return (
                        <input
                          type='text'
                          maxLength='50'
                          value={allAbnormalList[skuIndex][field] || ''}
                          onChange={this.handleChange.bind(
                            this,
                            field,
                            skuIndex
                          )}
                        />
                      )
                  }
                }}
              />
            )
          })}
        </Sheet>
      </div>
    )
  }
}

const BlockLines = ({ lines, printData }) => {
  return (
    <div>
      {lines.map((line, index) => {
        if (line.type === 'columns') {
          return (
            <BlockColumns
              key={index}
              columns={line.content}
              printData={printData}
            />
          )
        }
      })}
    </div>
  )
}

const BlockColumns = ({ columns, printData }) => {
  const maxHeightColumn = _.maxBy(columns, (col) => col.height)
  const maxLineHeight = maxHeightColumn ? `${maxHeightColumn.height}pt` : null

  const fieldText = (field) =>
    isMoneyField(field)
      ? `${Price.getCurrency()}${Big(printData[field] || 0).toFixed(2)}`
      : printData[field]

  return (
    <Flex style={{ height: maxLineHeight }}>
      {columns.map((column, index) => {
        const {
          text,
          width,
          fontSize = defaultFontSize,
          alignment,
          bold,
          color,
          field,
        } = column
        const columnStyle = {
          fontSize: `${fontSize}pt`,
          width: `${width}pt`,
          height: maxHeightColumn,
          color,
          fontWeight: bold ? 'bold' : 'normal',
        }

        return (
          <Flex
            key={index}
            flex={column.width === undefined || column.width === ''}
            alignCenter
            justifyStart
            justifyCenter={alignment === 'center'}
            justifyEnd={alignment === 'right'}
            style={columnStyle}
          >
            {text}
            {printData[field] !== undefined ? ': ' : null}
            {field === 'freight' ? (
              <FieldInput value={printData[field]} field={'freight'} />
            ) : (
              fieldText(field)
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

class FieldInput extends Component {
  handleChange = (value) => {
    printStore.setFieldValue(this.props.field, value)
  }

  render() {
    const inputStyle = { width: '50px' }
    const { value = 0, field } = this.props
    return (
      <span>
        {Price.getCurrency()}
        <InputNumber
          value={value}
          className={classNames({ 'b-bg-warning': isInvalid(field, value) })}
          onChange={this.handleChange}
          style={inputStyle}
        />
      </span>
    )
  }
}

// 类别汇总
const CategorySummary = ({ skuDetail, productBlockHeader }) => {
  const groupByCategory = _.groupBy(skuDetail, (item) =>
    item.category_title_1.trim()
  )
  if (!productBlockHeader.category_number) return null

  return (
    <Flex row>
      {_.map(groupByCategory, (val, key) => {
        return (
          <Flex column key={key} className='text-center'>
            <div className='gm-padding-5 gm-border'>
              {key || <span>&nbsp;</span>}
            </div>
            <div className='gm-padding-5 gm-border'>{val.length}</div>
          </Flex>
        )
      })}
    </Flex>
  )
}

// 小计
const Summary = ({ skuDetail, productBlockHeader }) => {
  if (!productBlockHeader.category_total) return null
  const sum = _.reduce(
    skuDetail,
    (sum, sku) => Big(sum).add(sku.real_item_price).toFixed(2),
    0
  )
  return (
    <div>
      {i18next.t('小计') + ':' + Price.getCurrency()}
      {sum}
    </div>
  )
}

export default EditPrintDistribute
