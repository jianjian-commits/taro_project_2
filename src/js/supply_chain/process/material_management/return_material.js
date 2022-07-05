import { t } from 'gm-i18n'
import React, { createRef } from 'react'
import {
  Form,
  FormItem,
  FormButton,
  DateRangePicker,
  Modal,
  Popover,
  Select,
  Box,
  Button,
  BoxTable,
  Flex,
  MoreSelect,
  Price,
} from '@gmfe/react'
import { TableX } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import moment from 'moment'
import _ from 'lodash'
import { observer } from 'mobx-react'
import ReturnSkusTable from './components/return_skus'
import { idConvert2Show, urlToParams } from 'common/util'
import store from './store'
import BatchPopover from './components/batch_popover'

@observer
class ReturnMaterial extends React.Component {
  pagination = createRef()

  componentDidMount() {
    this.handleSubmit()
  }

  handleSubmit = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handleExport = () => {
    const params = urlToParams(store.filterReturnSearchData)
    window.open(
      `/stock/process/process_order/ingredient_return/export?` + params,
    )
  }

  handleChangePage = (pagination) => {
    return store.getReturnMaterialList(
      Object.assign({}, store.filterReturnSearchData, pagination),
    )
  }

  handleNewReturn = () => {
    Modal.render({
      children: <ReturnSkusTable />,
      title: `${t('物料退还')}`,
      size: 'lg',
      onHide: ReturnSkusTable.hide,
    })
  }

  render() {
    const { returnMaterialList, returnMaterialFilter, recverList } = store
    const recverSelected = _.find(
      recverList,
      (v) => v.value === returnMaterialFilter.recver_id,
    )

    const placeholder = {
      1: t('请输入领料批次'),
      2: t('请输入计划编号'),
      3: t('请输入商品信息'),
    }[returnMaterialFilter.search_type]
    return (
      <div>
        <Box hasGap>
          <Form disabledCol onSubmit={this.handleSubmit} inline>
            <FormItem label={t('退料日期')}>
              <DateRangePicker
                style={{ width: '250px' }}
                begin={returnMaterialFilter.begin}
                end={returnMaterialFilter.end}
                onChange={(begin, end) => {
                  store.setReturnMaterialFilter('begin', begin)
                  store.setReturnMaterialFilter('end', end)
                }}
                endProps={{ min: returnMaterialFilter.begin }}
              />
            </FormItem>
            <FormItem labelWidth='0'>
              <Flex>
                <Select
                  clean
                  style={{ width: '100px' }}
                  value={returnMaterialFilter.search_type}
                  onChange={(value) =>
                    store.setReturnMaterialFilter('search_type', value)
                  }
                  data={[
                    { value: 1, text: t('按领料批次') },
                    { value: 2, text: t('按计划编号') },
                    { value: 3, text: t('按商品信息') },
                  ]}
                />
                <input
                  type='text'
                  name='q'
                  placeholder={placeholder}
                  style={{ width: '250px' }}
                  value={returnMaterialFilter.q}
                  className='form-control'
                  onChange={(e) =>
                    store.setReturnMaterialFilter(e.target.name, e.target.value)
                  }
                />
              </Flex>
            </FormItem>
            <FormItem label={t('领料人')} col={1}>
              <div style={{ width: '250px' }}>
                <MoreSelect
                  data={recverList.slice()}
                  selected={recverSelected}
                  onSelect={(selected) =>
                    store.setReturnMaterialFilter(
                      'recver_id',
                      selected ? selected.value : -1,
                    )
                  }
                  renderListFilterType='pinyin'
                />
              </div>
            </FormItem>
            <FormButton>
              <Button
                type='primary'
                htmlType='submit'
                className=' gm-margin-right-5'
              >
                {t('搜索')}
              </Button>
              <Button onClick={this.handleExport}>{t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>
        <BoxTable
          action={
            <Button type='primary' onClick={this.handleNewReturn}>
              {t('新建退料')}
            </Button>
          }
        >
          <ManagePaginationV2
            onRequest={this.handleChangePage}
            id='return'
            ref={this.pagination}
          >
            <TableX
              data={returnMaterialList.slice()}
              columns={[
                {
                  Header: `${t('退料时间')}`,
                  accessor: 'create_time',
                  Cell: ({
                    row: {
                      original: { create_time },
                    },
                  }) => moment(create_time).format('YYYY-MM-DD'),
                },
                {
                  Header: `${t('退料ID')}`,
                  accessor: 'id',
                  Cell: ({
                    row: {
                      original: { id },
                    },
                  }) => idConvert2Show(id, 'TL'),
                },
                {
                  Header: `${t('计划编号')}`,
                  accessor: 'proc_order_id',
                },
                {
                  Header: `${t('关联领料id')}`,
                  accessor: 'recv_id',
                  Cell: ({
                    row: {
                      original: { recv_id },
                    },
                  }) => idConvert2Show(recv_id, 'LL'),
                },
                {
                  Header: `${t('商品信息')}`,
                  accessor: 'ingredient_name',
                },
                {
                  Header: t('退料批次'),
                  accessor: 'batch',
                  Cell: ({ row: { original } }) => {
                    const { batch } = original
                    return batch.length ? (
                      <Popover
                        popup={<BatchPopover batch={batch.slice()} />}
                        type='hover'
                        showArrow
                        right
                      >
                        <div className='gm-cursor'>{batch[0].batch_number}</div>
                      </Popover>
                    ) : (
                      '-'
                    )
                  },
                },
                {
                  Header: t('退还数量'),
                  accessor: 'return_amount',
                  Cell: ({
                    row: {
                      original: { return_amount, unit_name },
                    },
                  }) => `${return_amount}${unit_name}`,
                },
                {
                  Header: t('退料成本'),
                  accessor: 'total_batch_price',
                  Cell: ({
                    row: {
                      original: { total_batch_price },
                    },
                  }) => <span>{total_batch_price + Price.getUnit()}</span>,
                },
                {
                  Header: `${t('领料人')}`,
                  accessor: 'recver',
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default ReturnMaterial
