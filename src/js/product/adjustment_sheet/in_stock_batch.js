import { i18next } from 'gm-i18n'
import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import {
  Form,
  FormItem,
  DateRangePicker,
  FormButton,
  Flex,
  Price,
  Modal,
  Tip,
  Box,
  Button,
} from '@gmfe/react'
import { Table, selectTableV2HOC } from '@gmfe/table'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import _ from 'lodash'
import store from './store'

const SelectTable = selectTableV2HOC(Table)

const date = moment().startOf('day')
const initTime = {
  begin_time: date,
  end_time: date,
}

const InStockBatch = (props) => {
  const { spec_id, index, batch_number, disableList } = props
  const [time, setTime] = useState(initTime)
  const [q, setQ] = useState('')
  const [batchList, setBatchList] = useState([])
  const [selectedList, setSelectedList] = useState([])

  const fetchData = useCallback(() => {
    const params = {
      spec_id,
      begin_time: moment(time.begin_time).format('YYYY-MM-DD'),
      end_time: moment(time.end_time).format('YYYY-MM-DD'),
      q,
    }
    Request('/stock/in_stock_adjust_sheet/batch_info/get')
      .data(params)
      .get()
      .then((json) => {
        // 如果已经存在批次号，并且在列表中，则默认勾选
        const defaultBatch = _.find(
          json.data,
          (batch) => batch.batch_number === batch_number
        )
        if (defaultBatch) {
          defaultBatch._gm_select = true
        }
        setBatchList(json.data)
      })
  }, [time.begin_time, time.end_time, q])

  const selectBatch = useCallback(
    (selectedList) => {
      const selected = _.find(
        batchList,
        (batch) => batch.batch_number === selectedList[0]
      )
      if (!selectedList.length) {
        Tip.warning('请选择批次')
        return
      }
      store.changeBatchSelected(index, selected)
      Modal.hide()
    },
    [batchList]
  )

  const isDisabled = useCallback((data) => {
    return _.includes(disableList, spec_id + '_' + data.batch_number)
  }, [])

  useEffect(() => {
    fetchData()
    return () => {
      setBatchList([])
    }
  }, [])

  let start = moment(new Date()).subtract(30, 'd')
  const minStart = moment('2019-08-10')
  if (start.isBefore(minStart, 'day')) {
    start = minStart
  }

  return (
    <>
      <Box hasGap>
        <Form inline onSubmit={fetchData} colWidth='350px'>
          <FormItem label={i18next.t('入库日期')}>
            <DateRangePicker
              begin={time.begin_time}
              end={time.end_time}
              min={start}
              onChange={(begin, end) =>
                setTime({ begin_time: begin, end_time: end })
              }
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              className='form-control'
              placeholder={i18next.t('输入入库单号、入库批次、供应商信息')}
              style={{ width: '280px' }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
      <div className='gm-gap-10' />
      <SelectTable
        data={batchList.slice()}
        keyField='batch_number'
        selectType='radio'
        isSelectorDisable={(row) => isDisabled(row)}
        selected={selectedList.slice()}
        onSelect={(selected) => setSelectedList(selected)}
        onSelectAll={(all) => {}}
        columns={[
          {
            Header: i18next.t('入库日期'),
            accessor: 'in_stock_date',
          },
          {
            Header: i18next.t('入库批次'),
            width: 200,
            accessor: 'batch_number',
          },
          {
            Header: i18next.t('供应商信息'),
            accessor: 'settle_suplier_name',
          },
          {
            Header: i18next.t('入库数（基本单位）'),
            id: 'quantity',
            Cell: (cellProps) => {
              return (
                <div>{`${cellProps.original.quantity || '-'}${
                  cellProps.original.unit_name || '-'
                }`}</div>
              )
            },
          },
          {
            Header: i18next.t('入库单价（基本单位）'),
            id: 'price',
            Cell: (cellProps) => {
              return (
                <div>{`${cellProps.original.price || '-'}${Price.getUnit()}/${
                  cellProps.original.unit_name || '-'
                }`}</div>
              )
            },
          },
          {
            Header: i18next.t('入库金额'),
            id: 'money',
            Cell: (cellProps) => (
              <div>{`${
                cellProps.original.money || '-'
              }${Price.getUnit()}`}</div>
            ),
          },
        ]}
      />
      <div className='gm-gap-10' />
      <Flex justifyEnd>
        <Button
          className='gm-margin-right-10'
          onClick={() => {
            Modal.hide()
          }}
        >
          {i18next.t('取消')}
        </Button>
        <Button type='primary' onClick={() => selectBatch(selectedList)}>
          {i18next.t('确定')}
        </Button>
      </Flex>
    </>
  )
}

InStockBatch.propTypes = {
  spec_id: PropTypes.string.isRequired,
  batch_number: PropTypes.string,
  disableList: PropTypes.array,
  index: PropTypes.number.isRequired,
}
export default InStockBatch
