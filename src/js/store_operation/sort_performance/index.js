/*
 * @Description: 分拣绩效
 */
import React, { useEffect } from 'react'
import moment from 'moment'
import qs from 'query-string'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  Button,
  DateRangePicker,
  RightSideModal,
  Dialog,
  BoxTable,
} from '@gmfe/react'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'

import SidePrintModal from '../../supply_chain/purchase/components/side_print_modal.js'
import ShareModal from './components/share_modal'
import SVGPrint from 'svg/print.svg'
import SvgDownload from 'svg/download.svg'
import { openNewTab } from 'common/util'
import TableTotalText from 'common/components/table_total_text'

import store from './store'
import { t } from 'gm-i18n'

// 打印模板选项
const templates = [
  {
    type: 1,
    value: 1,
    name: t('绩效工资总表'),
    text: t('绩效工资总表'),
  },
  {
    type: 2,
    value: 2,
    name: t('绩效工资总表及明细表'),
    text: t('绩效工资总表及明细表'),
  },
]
const columns = [
  {
    Header: t('用户名'),
    id: 'username',
    accessor: 'username',
  },
  {
    Header: t('姓名'),
    id: 'name',
    accessor: 'name',
  },
  {
    Header: t('绩效总额'),
    id: 'total_salary',
    accessor: 'total_salary',
  },
  {
    Header: t('基本工资'),
    id: 'base_salary',
    accessor: 'base_salary',
  },
  {
    Header: t('计件绩效'),
    id: 'piece_salary',
    accessor: 'piece_salary',
  },
  {
    Header: t('计重绩效'),
    id: 'weight_salary',
    accessor: 'weight_salary',
  },
]
const SelectTable = selectTableXHOC(TableX)
const {
  OperationHeader,
  OperationCell,
  OperationIconTip,
  BatchActionBar,
} = TableXUtil
function SortPerformance() {
  const { data, filterRules, loading, selected } = store

  const { q, start_date, end_date } = filterRules

  useEffect(() => {
    store.getSorterList()
  }, [start_date, end_date])

  useEffect(() => {
    return () => {
      store.clearStore()
    }
  }, [])

  function onDateRangeChange(start_date, end_date) {
    store.filterChange({
      start_date: moment(start_date).startOf('date').format('YYYY-MM-DD'),
      end_date: moment(end_date).endOf('date').format('YYYY-MM-DD'),
    })
  }

  function handleSelectTemplate(user_ids) {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <SidePrintModal
          name='sort_performance_sheet_print'
          onPrint={({ type }) => onPrint(type, user_ids)}
          templates={templates}
          user_ids={user_ids.join(',')}
          start_date={start_date}
          end_date={end_date}
        />
      ),
    })
  }

  function onPrint(type, user_ids) {
    const query = qs.stringify({
      type,
      user_ids: user_ids.join(','),
      start_date,
      end_date,
    })
    const URL = '#/supply_chain/sorting/performance/print'
    openNewTab(`${URL}?${query}`)
    RightSideModal.hide()
  }

  function onClickShare(user_id) {
    Dialog.dialog({
      title: t('绩效工资单分享'),
      children: (
        <ShareModal
          selectLabel={t('请选择分享内容')}
          selectData={templates}
          qrcodeId='performanceShareCode'
          user_id={user_id}
          start_date={start_date}
          end_date={end_date}
        />
      ),
      size: 'md',
      OKBtn: false,
    })
  }

  const operateArray = [
    {
      tip: t('打印'),
      onClick: (user_id) => handleSelectTemplate([user_id]),
      Icon: <SVGPrint />,
    },
    {
      tip: t('导出'),
      onClick: (user_id) => store.exportList(user_id),
      Icon: <SvgDownload />,
    },
    {
      tip: t('分享'),
      onClick: onClickShare,
      Icon: <i className='xfont xfont-share-bold gm-text-16' />,
    },
  ]
  const selectedList = selected.slice()
  const selectLength = selectedList.length
  const list = data.salaries.slice()

  return (
    <>
      <Box hasGap>
        <Form inline onSubmit={() => store.getSorterList()}>
          <FormItem label={t('操作日期')}>
            <DateRangePicker
              begin={start_date}
              end={end_date}
              onChange={onDateRangeChange}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              className='form-control'
              value={q}
              placeholder={t('分拣员姓名或用户名')}
              onChange={(e) => store.filterChange({ q: e.target.value })}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' onClick={() => store.getSorterList()}>
              {t('搜索')}
            </Button>
            <Button
              className='gm-margin-left-10'
              onClick={() => store.exportList()}
            >
              {t('导出')}
            </Button>
          </FormButton>
        </Form>
      </Box>
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: t('用户数'),
                  content: list.length,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <SelectTable
          data={list}
          keyField='user_id'
          columns={[
            ...columns,
            {
              Header: OperationHeader,
              id: 'operate',
              Cell: (cellProp) => (
                <OperationCell>
                  {operateArray.map((item, index) => {
                    const { tip, onClick, Icon } = item

                    return (
                      <OperationIconTip key={tip} tip={tip}>
                        <span
                          className={`gm-cursor gm-text-16 gm-text-hover-primary
                      ${index > 0 ? 'gm-margin-left-5' : ''}`}
                          onClick={() => onClick(cellProp.row.original.user_id)}
                          key={tip}
                        >
                          {Icon}
                        </span>
                      </OperationIconTip>
                    )
                  })}
                </OperationCell>
              ),
            },
          ]}
          selected={selectedList}
          onSelect={(selected) => store.onSelect(selected)}
          loading={loading}
          batchActionBar={
            selectLength ? (
              <BatchActionBar
                isSelectAll={selectLength === list.length}
                onClose={() => store.clearSelect()}
                toggleSelectAll={(isSelectAllPage) =>
                  store.selectAllPage(isSelectAllPage)
                }
                count={selectLength || null}
                batchActions={[
                  {
                    name: t('批量打印'),
                    type: 'business',
                    onClick: () => handleSelectTemplate(selectedList),
                  },
                ]}
              />
            ) : null
          }
        />
      </BoxTable>
    </>
  )
}

export default observer(SortPerformance)
