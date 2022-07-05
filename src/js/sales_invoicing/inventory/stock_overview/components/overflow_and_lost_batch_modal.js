import React from 'react'
import {
  Flex,
  Form,
  FormItem,
  DateRangePicker,
  FormButton,
  InputNumberV2,
  Modal,
  Tip,
  Box,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { i18next } from 'gm-i18n'
import store from '../store'
import { Table, selectTableV2HOC } from '@gmfe/table'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import moment from 'moment'
import FixedButton from 'common/components/fixed_button'
import Big from 'big.js'
import PropTypes from 'prop-types'
import SupplierDel from 'common/components/supplier_del_sign'

const SelectedTable = selectTableV2HOC(Table)

@observer
class OverflowAndLostBatchModal extends React.Component {
  componentDidMount() {
    store.setSpuId(this.props.spuId)
    this.pagination.apiDoFirstRequest()
    store.setSelectedData(this.props.isOverflowType)
  }

  componentWillUnmount() {
    store.clearOperatedBatchData()
    store.clearBatchFilter()
  }

  handleDatePickerChange = (begin, end) => {
    store.changeBatchFilter('begin', begin)
    store.changeBatchFilter('end', end)
  }

  handleInputFilterChange = (e) => {
    store.changeBatchFilter('q', e.target.value)
  }

  handleChangeOverflowAndLostNumber = (batchNumber, value) => {
    store.changeBatchOverflowAndLostNumber(batchNumber, value)
  }

  handleSelectBatch = (selected) => {
    store.changeBatchSelected(selected)
  }

  handleSelectAllBatch = () => {
    store.changeSelectBatchAll()
  }

  handleSearch = () => {
    const { begin, end } = store.batchFilter

    if (moment(begin).add(2, 'M').isBefore(end)) {
      Tip.warning(i18next.t('时间范围不能超过两个月'))
      return null
    } else {
      this.pagination.apiDoFirstRequest()
    }
  }

  handleSaveOperatedBatchData = () => {
    const { unassignedNum } = store
    const { isOverflowType } = this.props

    if (Big(unassignedNum).gt(0)) {
      Tip.warning(
        isOverflowType
          ? i18next.t('已分配数需等于待报溢数')
          : i18next.t('已分配数需等于待报损数'),
      )
      return false
    }

    store.saveOperatedBatchData(isOverflowType, this.handleHideModal)
  }

  handleHideModal = () => {
    Modal.hide()
  }

  handleRenderFilter = () => {
    const {
      selectFilter: { clean_food },
      batchFilter: { begin, end, q },
    } = store
    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={i18next.t('入库日期')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={this.handleDatePickerChange}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              value={q}
              onChange={this.handleInputFilterChange}
              name='q'
              type='text'
              className='form-control'
              placeholder={
                clean_food
                  ? i18next.t('请输入批次号搜索')
                  : i18next.t('请输入供应商或批次号搜索')
              }
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }

  render() {
    const { isOverflowType, stdUnitName, spuId, spuName } = this.props
    const {
      assignedNum,
      unassignedNum,
      batchOverflowAndLostNumMap,
      overflowAndLostNumber,
      batchSelected,
      batchList,
      isSelectBatchAll,
      selectFilter: { clean_food },
    } = store

    const signStyle = {
      lineHeight: '28px',
      width: '40px',
      textAlign: 'center',
      height: '28px',
      fontSize: '12px',
      color: '#fff',
    }

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Flex className='gm-padding-top-10 gm-padding-bottom-10 gm-back-bg'>
          {isOverflowType ? (
            <span
              style={{ background: '#36ad3b', ...signStyle }}
              className='gm-margin-lr-10'
            >
              {i18next.t('报溢')}
            </span>
          ) : (
            <span
              style={{ background: '#ff0000', ...signStyle }}
              className='gm-margin-lr-10'
            >
              {i18next.t('报损')}
            </span>
          )}
          <Flex column>
            <Flex>
              <span className='gm-margin-right-10'>{spuName}</span>
              <span>{spuId}</span>
            </Flex>
            <Flex>
              <span className='gm-margin-right-10'>
                {isOverflowType
                  ? i18next.t('待报溢数') + '：'
                  : i18next.t('待报损数') + '：'}
                {Big(overflowAndLostNumber.get(spuId)).abs().toFixed(2) +
                  stdUnitName}
              </span>
              <span className='gm-margin-right-10'>
                {i18next.t('已分配') + '：'}
                {Big(assignedNum).toFixed(2) + stdUnitName}
              </span>
              <span>
                {i18next.t('待分配') + '：'}
                {Big(unassignedNum).toFixed(2) + stdUnitName}
              </span>
            </Flex>
          </Flex>
        </Flex>
        <Flex column style={{ marginBottom: '42px' }}>
          {this.handleRenderFilter()}

          <ManagePaginationV2
            id='pagination_in_product_overflow_and_lost_batch_modal_list'
            onRequest={(pagination) => store.getBatchList(pagination)}
            ref={(ref) => (this.pagination = ref)}
          >
            <SelectedTable
              data={batchList.slice()}
              keyField='batch_number'
              selected={batchSelected.slice()}
              selectAll={isSelectBatchAll}
              onSelectAll={this.handleSelectAllBatch}
              onSelect={this.handleSelectBatch}
              columns={[
                {
                  id: 'create_time',
                  Header: i18next.t('入库日期'),
                  accessor: (d) => {
                    return moment(new Date(d.create_time)).format('YYYY-MM-DD')
                  },
                },
                !clean_food && {
                  Header: i18next.t('供应商'),
                  accessor: 'supplier_name',
                  Cell: (cellProps) => {
                    const {
                      supplier_name,
                      supplier_status,
                    } = cellProps.original

                    return (
                      <Flex>
                        {supplier_status === 0 && <SupplierDel />}
                        {supplier_name}
                      </Flex>
                    )
                  },
                },
                {
                  Header: i18next.t('批次号'),
                  accessor: 'batch_number',
                },
                {
                  id: 'remain',
                  Header: i18next.t('剩余库存'),
                  accessor: (d) => {
                    return <span>{Big(d.remain).toFixed(2)}</span>
                  },
                },
                {
                  id: 'diffNumber',
                  Header: isOverflowType
                    ? i18next.t('报溢数')
                    : i18next.t('报损数'),
                  Cell: (row) => {
                    const batchNumber = row.original.batch_number
                    const isDisable = !_.includes(batchSelected, batchNumber)
                    const value = batchOverflowAndLostNumMap.has(batchNumber)
                      ? batchOverflowAndLostNumMap.get(batchNumber)
                      : null
                    let max = 0
                    if (isOverflowType) {
                      max = Big(value || 0).plus(unassignedNum || 0)
                    } else {
                      max = Big(row.original.remain).gt(
                        Big(value || 0).plus(unassignedNum || 0),
                      )
                        ? Big(value || 0).plus(unassignedNum || 0)
                        : row.original.remain
                    }

                    return (
                      <Flex alignCenter>
                        <Observer>
                          {() => {
                            return (
                              <InputNumberV2
                                className='form-control input-sm'
                                style={{
                                  width: '80%',
                                  cursor: isDisable ? 'not-allowed' : 'text',
                                  backgroundColor: isDisable ? '#eee' : 'white',
                                }}
                                value={value}
                                onChange={this.handleChangeOverflowAndLostNumber.bind(
                                  this,
                                  batchNumber,
                                )}
                                disabled={isDisable}
                                min={0}
                                max={parseFloat(max)}
                              />
                            )
                          }}
                        </Observer>
                        {stdUnitName}
                      </Flex>
                    )
                  },
                },
              ].filter((f) => f)}
            />
          </ManagePaginationV2>
        </Flex>
        <FixedButton
          onCancel={this.handleHideModal}
          onSubmit={this.handleSaveOperatedBatchData}
        />
      </div>
    )
  }
}

OverflowAndLostBatchModal.propTypes = {
  spuId: PropTypes.string.isRequired,
  isOverflowType: PropTypes.bool.isRequired,
  spuName: PropTypes.string.isRequired,
  stdUnitName: PropTypes.string.isRequired,
}

export default OverflowAndLostBatchModal
