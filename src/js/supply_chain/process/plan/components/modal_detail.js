import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import React from 'react'
import {
  Form,
  FormItem,
  Flex,
  MultipleFilterSelect,
  Modal,
  Tip,
  Sheet,
  SheetColumn,
  SheetSelect,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import classNames from 'classnames'

import { isNumber } from 'common/util'
import { planDetailStore } from '../store'

const store = planDetailStore

const preBatchListFun = (list, selectedBatch) => {
  return _.map(list, (item) => {
    item._gm_select = false
    if (item.batch_num === selectedBatch) {
      item._gm_select = true
    }
    return item
  })
}

const multipleFilterBatchListFun = (list, filterList) => {
  if (filterList && filterList.length) {
    return _.filter(list, (item) => {
      const flowList = item.technic_flows_done
      return _.intersection(
        _.map(flowList, (item) => item.name),
        _.map(filterList, (item) => item)
      ).length
    })
  } else {
    return list
  }
}

const findBatchListFun = (list) => _.find(list, (item) => item._gm_select)

@observer
class ModalDetail extends React.Component {
  constructor() {
    super()
    this.state = {
      selected: [],
      list: [],
      filterList: [],
    }
    this.handleInputChange = ::this.handleInputChange
    this.handleSelect = ::this.handleSelect
    this.handleRadioChange = ::this.handleRadioChange
    this.handleConfirm = ::this.handleConfirm
  }

  componentWillMount() {
    const { feederType, product } = store
    // 1 是原料，2 是半成品
    if (feederType === 1) {
      store.getMaterialBatch(product.id).then(() => {
        const { batchList } = store
        this.setState({
          list: batchList,
        })
      })
    } else if (feederType === 2) {
      store.getSemiBatch(product.id).then(() => {
        const { batchList } = store
        this.setState({
          list: toJS(batchList),
        })
      })
    }
  }

  componentWillUnmount() {
    store.clearBatchBackup()
  }

  handleRadioChange(value, index) {
    const { batchList } = store
    store.setBatchBackup('selectedBatch', batchList[index].batch_num)
  }

  handleInputChange(e) {
    const { name, value } = e.target
    if (/\s/g.test(value)) {
      return
    }
    if (isNumber(value) || !value) {
      if (!(/^00/g.test(value) || /^0[^\\.]/g.test(value))) {
        store.setBatchBackup(name, value)
      }
    }
  }

  handleSelect(selected) {
    const filterList = []
    _.each(selected, (item) => {
      filterList.push(item.name)
    })
    this.setState({
      selected,
      filterList,
    })
  }

  handleCancel() {
    Modal.hide()
  }

  handleConfirm() {
    const { feederType, batchBackup, technic_flow } = store
    const { list } = this.state

    const selectedStock = findBatchListFun(list) || {}

    if (!toJS(batchBackup.put_amount)) {
      Tip.warning(i18next.t('请填写投放数!'))
      return
    }
    if (!toJS(batchBackup.selectedBatch)) {
      Tip.warning(i18next.t('请选择批次!'))
      return
    }

    if (
      !_.isNull(selectedStock.stock_num) ||
      !_.isUndefined(selectedStock.stock_num)
    ) {
      if (+toJS(batchBackup.put_amount) > +selectedStock.stock_num) {
        Tip.warning(i18next.t('投放数不能大于所选批次的库存数!'))
        return
      }
    }
    if (feederType === 2) {
      store.setDoneAndFlowList(
        selectedStock.technic_flows_done,
        toJS(technic_flow)
      )
      store.setFilterChange('hasChangeBatch', true)
    }
    // 确认的时候需要将备份同步到当前修改的数据
    store.confirmAndSync()
    Modal.hide()
  }

  render() {
    const { feederType, technic_flow, batchBackup } = store
    const { selected, list, filterList } = this.state
    const { disabled, detail } = this.props
    // 批次过滤（是否是选中）
    const preBatchList = preBatchListFun(list, toJS(batchBackup.selectedBatch))
    // 批次过滤（MultipleFilterSelect）
    const multipleFilterBatchList = multipleFilterBatchListFun(
      preBatchList,
      filterList
    )

    return (
      <Flex column>
        <Form>
          <FormItem
            label={i18next.t('成品所需工艺')}
            inline
            labelWidth='100px'
            style={{ alignItems: 'center' }}
          >
            <ul
              className='gm-inline-block gm-padding-0 gm-margin-0'
              style={{ float: 'left', textDecoration: 'none' }}
            >
              {_.map(technic_flow, (item, i) => (
                <li
                  className='gm-inline-block gm-margin-5 gm-padding-lr-10 gm-back-bg'
                  key={i + item.name}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </FormItem>

          <FormItem
            label={i18next.t('投放数')}
            inline
            labelWidth='100px'
            style={{ alignItems: 'center' }}
          >
            <input
              className='form-control gm-inline-block'
              disabled={disabled}
              type='text'
              name='put_amount'
              style={{ width: '80px' }}
              value={batchBackup.put_amount}
              onChange={this.handleInputChange}
            />
            <span className='gm-inline-block gm-margin-left-10'>
              {detail.std_unit_name}
            </span>
          </FormItem>
          {feederType === 1 ? null : (
            <FormItem
              label={i18next.t('已完成工艺筛选')}
              inline
              labelWidth='100px'
              style={{ alignItems: 'center' }}
            >
              <MultipleFilterSelect
                disabled={disabled}
                disableSearch
                id='feederTypeList'
                list={technic_flow}
                selected={selected}
                onSelect={this.handleSelect}
                placeholder={i18next.t('搜索')}
              />
            </FormItem>
          )}
        </Form>

        <Sheet
          list={feederType === 1 ? preBatchList : multipleFilterBatchList}
          enableEmptyTip
        >
          <SheetSelect
            onSelect={this.handleRadioChange}
            isDisabled={() => disabled}
            isRadio
          />
          <SheetColumn field='batch_num' name={i18next.t('入库批号')} />
          {feederType === 1 ? null : (
            <SheetColumn
              field='technic_flows_done'
              name={i18next.t('已完成工艺')}
            >
              {(v) =>
                _.map(v, (item, i) => (
                  <span
                    className={classNames({
                      'gm-padding-left-0': i === 0,
                    })}
                    key={i}
                  >
                    {item.name}
                    {i === v.length - 1 ? '' : '、'}
                  </span>
                ))
              }
            </SheetColumn>
          )}
          <SheetColumn field='shelf_name' name={i18next.t('存放货位')} />
          <SheetColumn field='stock_num' name={i18next.t('可用库存')}>
            {(v) => (
              <div>
                {v}
                {detail.std_unit_name}
              </div>
            )}
          </SheetColumn>
        </Sheet>
        {disabled ? null : (
          <Flex justifyCenter className='gm-margin-top-20'>
            <Button className='gm-margin-right-20' onClick={this.handleCancel}>
              {i18next.t('取消')}
            </Button>
            <Button type='primary' onClick={this.handleConfirm}>
              {i18next.t('保存')}
            </Button>
          </Flex>
        )}
      </Flex>
    )
  }
}

export default ModalDetail
