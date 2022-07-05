import React, { useState, useEffect, useRef } from 'react'
import {
  Form,
  FormItem,
  FormButton,
  FormBlock,
  Button,
  Select,
  DateRangePicker,
} from '@gmfe/react'
import { selectTableXHOC, TableX } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import moment from 'moment'

const SelectTableX = selectTableXHOC(TableX)

const statusType = [
  { value: '', text: t('全部状态') },
  { value: 2, text: t('未开工') },
  { value: 4, text: t('已开工') },
]
const statusMap = {
  2: t('未开工'),
  4: t('已开工'),
}
const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
  page_obj: null,
}

const ChooseSideModal = (props) => {
  const paginationRef = useRef()

  const {
    onCancel,
    index,
    onRowChange,
    original: { plan_finish_time, proc_order_custom_id = '', sku_id },
  } = props

  // 计算计划完成时间是否大于当前时间
  const isBefore = moment().isBefore(moment(plan_finish_time))

  const [list, setList] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [begin, setBegin] = useState(
    moment(isBefore ? undefined : plan_finish_time),
  )
  const [end, setEnd] = useState(
    moment(isBefore ? plan_finish_time : undefined),
  ) // 设置计划完成时间的默认值，plan_finish_time比当前时间大就放后面

  // search 默认值=><><><><> 花里胡哨，这需求不写注释谁看得懂
  // 如果先填写商品名称， 搜索条件带上sku_id ,如果先选择加工单，则默认带出计划编号

  const [search, setSearch] = useState(
    plan_finish_time ? proc_order_custom_id : sku_id || '',
  ) // plan_finish_time 存在才给默认搜索值
  const [status, setStatus] = useState('')

  useEffect(() => {
    paginationRef.current.apiDoFirstRequest()
  }, [])

  const onSelect = (val) => {
    setSelected(val)
  }

  const handleSearch = (pageObj = initPagination) => {
    setLoading(true)
    const params = {
      status,
      begin_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
      q: search,
      ...pageObj,
    }

    return Request('/stock/process/process_order/simple_search/list')
      .data(params)
      .get()
      .then((res) => {
        const { code, data } = res
        if (code === 0) {
          setList(data)
          setLoading(false)
        }
        return res
      })
  }

  const handleConfirm = () => {
    const val = list
      .map((item) => item.id === selected[0] && item)
      .filter((f) => f)

    onCancel()
    onRowChange(val[0], index)
  }

  return (
    <>
      <Form
        className='gm-padding-15'
        onSubmit={() => paginationRef?.current?.apiDoFirstRequest()}
        labelWidth='90px'
        colWidth='300px'
      >
        <FormBlock col={3}>
          <FormItem label={t('计划完成日期')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={(start, finish) => {
                console.log(start, finish)
                setBegin(start)
                setEnd(finish)
              }}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              type='text'
              name='search_text'
              value={search}
              placeholder={t('输入计划编号')}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FormItem>
          <FormButton>
            <Button htmlType='submit' type='primary'>
              {t('搜索')}
            </Button>
          </FormButton>
          <FormItem label={t('状态筛选')}>
            <Select
              name='status'
              value={status}
              onChange={(val) => setStatus(val)}
              data={statusType}
            />
          </FormItem>
        </FormBlock>
      </Form>
      <ManagePaginationV2
        id='settle_sheet_list'
        ref={paginationRef}
        onRequest={handleSearch}
      >
        <SelectTableX
          selectType='radio'
          data={list}
          keyField='id'
          loading={loading}
          selected={selected}
          onSelect={onSelect}
          columns={[
            {
              Header: t('计划编号'),
              accessor: 'id',
            },
            {
              Header: t('生产成品'),
              accessor: 'sku_name',
            },
            {
              Header: (
                <div style={{ textAlign: 'left' }}>
                  <div>{t('计划生产数')}</div>
                  <div>{t('(销售单位)')}</div>
                </div>
              ),
              width: '150px',
              accessor: 'plan_amount',
              align: 'center',
              Cell: (cellProps) =>
                +cellProps.row.original.plan_amount +
                cellProps.row.original.sale_unit_name,
            },
            {
              Header: (
                <div style={{ textAlign: 'left' }}>
                  <div>{t('已完成数')}</div>
                  <div>{t('（销售单位)')}</div>
                </div>
              ),
              accessor: 'finish_amount',
              Cell: (cellProps) =>
                +cellProps.row.original.finish_amount +
                cellProps.row.original.sale_unit_name,
            },
            {
              Header: t('计划完成日期'),
              accessor: 'plan_finish_time',
              Cell: ({
                row: {
                  original: { plan_finish_time },
                },
              }) =>
                plan_finish_time
                  ? moment(plan_finish_time).format('YYYY-MM-DD')
                  : '-',
            },
            {
              Header: t('计划状态'),
              accessor: 'status',
              Cell: ({
                row: {
                  original: { status },
                },
              }) => statusMap[status],
            },
          ]}
        />
      </ManagePaginationV2>
      {/* 样式兼容 */}
      <div style={{ marginTop: '50px' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          zIndex: 999,
          width: '100%',
          padding: '12px 20px',
          textAlign: 'right',
          backgroundColor: ' #fff',
          borderTop: '1px solid #e9e9e9',
        }}
      >
        <Button onClick={() => onCancel()} className='gm-margin-right-10'>
          {t('取消')}
        </Button>
        <Button
          onClick={() => handleConfirm()}
          type='primary'
          disabled={!selected.length}
        >
          {t('确定')}
        </Button>
      </div>
    </>
  )
}

ChooseSideModal.propTypes = {
  index: PropTypes.number,
  onCancel: PropTypes.func,
  onRowChange: PropTypes.func,
  original: PropTypes.object,
}

export default ChooseSideModal
