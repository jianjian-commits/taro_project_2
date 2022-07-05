import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Sheet,
  SheetColumn,
  Flex,
  SheetSelect,
  Tip,
  InputNumber,
  Form,
  FormItem,
  FormBlock,
  FormButton,
  Button,
} from '@gmfe/react'
import { Trigger } from '@gmfe/react-deprecated'
import Big from 'big.js'
import _ from 'lodash'
import moment from 'moment'

import '../actions'
import '../reducer'
import actions from '../../actions'

import styles from '../product.module.less'

class OutStockBatchSelect extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      batch_list: [],
      residue_num: 0,
      searchWord: '',
    }

    this.handleSelectBatch = ::this.handleSelectBatch
    this.handleSelectBatchCancel = ::this.handleSelectBatchCancel
    this.handleSelectBatchOk = ::this.handleSelectBatchOk
    this.handleChangeSearchWord = ::this.handleChangeSearchWord
    this.handleSearch = ::this.handleSearch
  }

  componentDidMount() {
    const { details, selected_batch } = this.props
    const { id: sku_id, clean_food } = details
    sku_id &&
      actions
        .product_stock_get_out_batch({
          sku_id: sku_id,
          clean_food: clean_food ? 1 : 0,
        })
        .then((json) => {
          this.renderTable({ json, details, selected_batch })
        })
  }

  renderTable({ json, details, selected_batch }) {
    let selected_sum = 0

    // 匹配已选择的批次
    if (details.batch_details) {
      _.forEach(details.batch_details, (batch) => {
        _.forEach(json.data, (val) => {
          if (batch.batch_number === val.batch_number) {
            val._gm_select = true
            val.out_stock_base = batch.out_stock_base
            selected_sum = Big(selected_sum)
              .plus(val.out_stock_base || 0)
              .toFixed(2)
          }
        })
      })
    }
    const num = Big(details.quantity)
      .mul(details.sale_ratio)
      .mul(details.std_ratio)
      .toFixed(2) // 出库数
    const residue_num = Big(num).sub(selected_sum).toFixed(2)

    // 把相同sup_id list所选批次的出库数减去
    if (selected_batch) {
      _.forEach(
        _.filter(selected_batch, (v) => !!v),
        (batch) => {
          _.forEach(json.data, (da) => {
            if (batch.batch_number === da.batch_number) {
              da.remain = Big(da.remain).sub(batch.out_stock_base).toFixed(2)
            }
          })
        }
      )
    }

    this.setState({
      batch_list: json.data,
      residue_num,
    })
  }

  calculate(index, value) {
    const { quantity, sale_ratio, std_ratio } = this.props.details
    const { batch_list } = this.state
    let selected_sum = 0
    batch_list[index].out_stock_base = value

    _.forEach(batch_list, (be) => {
      if (be._gm_select) {
        selected_sum = Big(selected_sum)
          .plus(be.out_stock_base || 0)
          .toFixed(2)
      }
    })
    const num = Big(quantity).mul(sale_ratio).mul(std_ratio).toFixed(2) // 出库数
    const residue_num = Big(num).sub(selected_sum).toFixed(2)

    this.setState({
      batch_list,
      residue_num,
    })
  }

  handleSelectBatchOk() {
    const { batch_list, residue_num } = this.state
    let selected_list = _.map(batch_list, (batch) => {
      if (batch._gm_select) {
        return {
          batch_number: batch.batch_number,
          out_stock_base: _.toNumber(batch.out_stock_base),
        }
      }
    })
    selected_list = _.filter(selected_list, (v) => !!v)
    let sum = 0
    _.forEach(selected_list, (list) => {
      sum = Big(sum)
        .plus(list.out_stock_base || 0)
        .toFixed(2)
    })

    if (!selected_list.length) {
      Tip.warning(i18next.t('请选择出库批次'))
      return false
    } else if (_.toNumber(sum) === 0) {
      Tip.warning(i18next.t('请填写出库数'))
      return false
    } else if (_.toNumber(residue_num) !== 0) {
      Tip.warning(i18next.t('所选批次输入的库存总数小于出库数'))
      return false
    }

    this.setState({
      batch_list: [],
    })
    this.props.handleBatchSelected(
      _.filter(selected_list, (v) => !!v.out_stock_base)
    )
  }

  handleSelectBatch(checked, index) {
    const { batch_list } = this.state

    batch_list[index]._gm_select = checked
    if (!batch_list[index]._gm_select) {
      this.calculate(index, '')
    }

    this.setState({ batch_list })
  }

  handleSelectBatchCancel() {
    this.setState({
      batch_list: [],
      residue_num: 0,
    })
    this.props.handleSelectBatchCancel()
  }

  hoverTips(tips) {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ minWidth: '160px', color: '#333' }}
      >
        {tips}
      </div>
    )
  }

  handleChangeSearchWord(e) {
    this.setState({
      searchWord: e.target.value,
      error: !e.target.value,
    })
  }

  handleSearch() {
    const { details, selected_batch } = this.props
    const { id: sku_id, clean_food } = details
    const { searchWord: q } = this.state
    actions
      .product_stock_get_out_batch(
        Object.assign(
          {
            sku_id: sku_id,
            clean_food: clean_food ? 1 : 0,
          },
          q && { q }
        )
      )
      .then((json) => {
        this.renderTable({ json, details, selected_batch })
      })
  }

  render() {
    const {
      quantity,
      sale_unit_name,
      sale_ratio,
      std_unit_name,
      std_ratio,
    } = this.props.details
    const { batch_list, residue_num, searchWord } = this.state

    return (
      <div className={styles.batchList}>
        <Flex className='gm-margin-15'>
          <Form horizontal onSubmit={this.handleSearch}>
            <FormBlock inline>
              <FormItem label={i18next.t('搜索')}>
                <input
                  value={searchWord}
                  onChange={this.handleChangeSearchWord}
                  className='form-control'
                  type='text'
                  placeholder={i18next.t('请输入供应商或批次号搜索')}
                  style={{ width: '200px' }}
                />
              </FormItem>
              <FormButton>
                <Button type='primary' htmlType='submit'>
                  {i18next.t('搜索')}
                </Button>
              </FormButton>
            </FormBlock>
          </Form>
        </Flex>
        <Flex className='gm-margin-15'>
          <div className='gm-margin-right-15'>
            {i18next.t('出库数')}：
            {sale_unit_name === std_unit_name
              ? quantity + sale_unit_name
              : Big(quantity).mul(sale_ratio).mul(std_ratio).toFixed(2) +
                std_unit_name +
                '(' +
                quantity +
                sale_unit_name +
                ')'}
          </div>
          <div>
            {i18next.t('待分配出库数')}：
            {parseFloat(residue_num) + std_unit_name}
          </div>
        </Flex>
        <Sheet
          list={batch_list}
          enableEmptyTip={i18next.t('当前没有可用的出库批次，请先进行入库操作')}
        >
          <SheetColumn field='in_stock_time' name={i18next.t('入库时间')}>
            {(in_stock_time) => {
              return moment(in_stock_time).format('YYYY-MM-DD')
            }}
          </SheetColumn>
          {window.g_clean_food && (
            <SheetColumn field='batch_number' name={i18next.t('成品批次')} />
          )}
          <SheetColumn field='production_time' name={i18next.t('生产日期')}>
            {(production_time) => production_time || '-'}
          </SheetColumn>
          {!window.g_clean_food && (
            <SheetColumn field='life_time' name={i18next.t('保质期')}>
              {(life_time) => life_time || '-'}
            </SheetColumn>
          )}
          {!window.g_clean_food && (
            <SheetColumn field='supplier_name' name={i18next.t('供应商信息')}>
              {(supplier_name, index) => {
                return `${supplier_name}(${batch_list[index].customer_id})`
              }}
            </SheetColumn>
          )}
          {!window.g_clean_food && (
            <SheetColumn field='batch_number' name={i18next.t('批次号')} />
          )}
          {!window.g_clean_food && (
            <SheetColumn field='shelf_name' name={i18next.t('货位名')}>
              {(shelf_name) => {
                const len = shelf_name ? shelf_name.length : 0
                if (Big(len).gt(7)) {
                  return (
                    <Trigger
                      showArrow
                      component={<div />}
                      type='hover'
                      popup={this.hoverTips(shelf_name)}
                    >
                      <p className={styles.shelf}>{shelf_name}</p>
                    </Trigger>
                  )
                }
                return shelf_name || '-'
              }}
            </SheetColumn>
          )}
          <SheetColumn
            field='remain'
            name={
              window.g_clean_food
                ? i18next.t('剩余库存(销售单位)')
                : i18next.t('剩余库存')
            }
          >
            {(remain) => {
              return Big(remain).toFixed(2) + std_unit_name
            }}
          </SheetColumn>
          <SheetColumn field='out_stock_base' name={i18next.t('选择出库数')}>
            {(out_stock_base, index) => {
              const remain = batch_list[index].remain
              const residue = Big(residue_num)
                .add(batch_list[index].out_stock_base || 0)
                .toFixed(2)
              const max = Big(residue).gt(remain)
                ? _.toNumber(remain)
                : _.toNumber(residue)

              return (
                <Flex alignCenter>
                  <InputNumber
                    value={out_stock_base || (out_stock_base === 0 ? 0 : '')}
                    onChange={this.calculate.bind(this, index)}
                    min={0}
                    max={max}
                    className='form-control input-sm'
                    style={{ width: '100px' }}
                    disabled={!batch_list[index]._gm_select}
                  />
                  <span className='gm-padding-5'>{std_unit_name}</span>
                </Flex>
              )
            }}
          </SheetColumn>
          <SheetSelect
            onSelect={this.handleSelectBatch}
            onSelectAll={() => null}
          />
        </Sheet>
        <Flex justifyCenter className='gm-padding-15'>
          <Button
            className='gm-margin-right-5'
            onClick={this.handleSelectBatchCancel}
          >
            {i18next.t('取消')}
          </Button>
          <Button type='primary' onClick={this.handleSelectBatchOk}>
            {i18next.t('确定')}
          </Button>
        </Flex>
      </div>
    )
  }
}

export default OutStockBatchSelect
