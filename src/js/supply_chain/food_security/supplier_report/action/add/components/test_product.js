import React, { Component, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import {
  FormItem,
  RadioGroup,
  Radio,
  TreeV2,
  Form,
  Validator,
  DatePicker,
  Tip,
  BoxTable,
  Button,
  Flex,
} from '@gmfe/react'
import { store } from '../../store'
import { t } from 'gm-i18n'
import global from 'stores/global'
import BatchTable from './batch_table/index'
import batch from './batch_table/index.store'
import BatchFilter from './batch_table/filter'
import Row from './batch_table/Row'

@observer
class TestProduct extends Component {
  componentDidMount() {
    store.fetchProducts()
  }

  handleSelected = (list) => {
    if (list.filter((item) => item[0] === 'C').length > 1000) {
      Tip.warning(t('同一检测报告所含商品不能超过1000个，请重新选择'))
      return
    }
    store.setSelected(list)
  }

  handleBindProduct = (value) => {
    store.setBindProduct(value)
  }

  handleValidateSelected = (value) => {
    return value.length ? '' : t('请选择')
  }

  handleChangeDate = (date) => {
    store.setValidity(date)
  }

  handleValidateValidity = (value) => {
    const { bindProduct } = store
    if (bindProduct !== 0) {
      return
    }
    return value ? null : t('请选择')
  }

  handleValidateRadio = (value) => {
    if (value === undefined || value === null) {
      return t('请选择商品绑定方式')
    }
    return null
  }

  /** 批次导入 */
  handleBatchImport = async () => {
    const selected = await BatchFilter.popup()
    if (!batch.list[0].data?.batch_number) {
      batch.removeItem(0)
    }
    selected.forEach((data) => {
      const exist = batch.list.find(
        (row) => row.data.batch_number === data.batch_number,
      )
      if (exist) return
      batch.newItem(new Row(data))
    })
  }

  renderBindProduct = () => {
    const { bindProduct, validity, tree, selected } = store
    if (bindProduct === 1) {
      return (
        <>
          <FormItem
            label={t('检测商品')}
            required
            col={3}
            validate={Validator.create(
              [],
              selected.slice(),
              this.handleValidateSelected,
            )}
          >
            <TreeV2
              list={tree}
              onSelectValues={this.handleSelected}
              selectedValues={selected.slice()}
              style={{ width: '300px', height: '500px' }}
              title={t('全部商品')}
            />
          </FormItem>
          <FormItem
            label={t('有效期')}
            required
            labelWidth='150px'
            colWidth='400px'
            validate={Validator.create(
              [],
              validity,
              this.handleValidateValidity,
            )}
          >
            <DatePicker onChange={this.handleChangeDate} date={validity} />
          </FormItem>
        </>
      )
    } else if (bindProduct === 0) {
      return (
        <FormItem
          label={t('选择批次')}
          required
          disabledCol
          validate={Validator.create([], batch.selected.slice(), () => {
            return (
              !batch.list.filter((row) => row.data.batch_number).length &&
              '请完善批次信息'
            )
          })}
        >
          <BoxTable
            info={
              <Flex alignCenter>
                <span className='gm-border-right gm-margin-right-10 gm-padding-right-10'>
                  批次总数: {batch.list.length}
                </span>

                <Button
                  type='primary'
                  className='gm-margin-right-10'
                  onClick={() => this.handleBatchImport()}
                >
                  {t('批量添加')}
                </Button>
                {!!batch.selected.length && (
                  <Button
                    type='danger'
                    className='gm-margin-right-10'
                    onClick={() => batch.removeSelected()}
                  >
                    {t('批量删除')}({batch.selected.length})
                  </Button>
                )}
              </Flex>
            }
          >
            <BatchTable />
          </BoxTable>
        </FormItem>
      )
    } else {
      return null
    }
  }

  render() {
    const { bindProduct } = store
    const { innerRef } = this.props
    const { stock_method } = global.user

    return (
      <Form labelWidth='90px' ref={innerRef}>
        <FormItem
          label={t('绑定商品')}
          col={3}
          required
          validate={Validator.create([], bindProduct, this.handleValidateRadio)}
        >
          <RadioGroup
            name='product'
            value={bindProduct}
            onChange={this.handleBindProduct}
          >
            {stock_method === 2 && (
              <Radio value={0} className='gm-margin-bottom-20'>
                {t('检测批次')}
                <span style={{ color: '#888' }}>
                  {t('（检测报告绑定检测日期后商品的入库批次）')}
                </span>
              </Radio>
            )}
            <Radio value={1} className='gm-margin-bottom-20'>
              {t('不绑定检测批次')}
              <span style={{ color: '#888' }}>
                {t('（检测报告绑定所选分类或商品）')}
              </span>
            </Radio>
          </RadioGroup>
        </FormItem>
        {this.renderBindProduct()}
      </Form>
    )
  }
}

TestProduct.propTypes = {
  innerRef: PropTypes.object,
}

export default forwardRef((_, ref) => <TestProduct innerRef={ref} />)
