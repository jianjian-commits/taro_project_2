import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import moment from 'moment'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from './store'
import {
  BoxForm,
  Button,
  DateRangePicker,
  Flex,
  FormBlock,
  FormButton,
  FormItem,
  Input,
  MoreSelect,
  Select,
  Tip,
  Price,
} from '@gmfe/react'
import { TableX, TableXUtil, selectTableXHOC } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import { idConvert2Show, urlToParams, doNumberDigitFixed } from 'common/util'
import { remarkType } from 'common/filter'
import { MATERIAL_TYPE } from 'common/enum'
import RecverCell from './components/recver_cell'
import RecvTimeCell from './components/recv_time_cell'
import BatchNumberCell from './components/batch_number_cell'
import StatusCell from './components/status_cell'
import BatchEditModal from './components/batch_edit_modal'
import StatusEditModal from './components/status_edit_modal'
import RecverEditModal from './components/recver_edit_modal'
import { createDialog } from './tools'
import ScanBarcode from './components/scan_barcode'
import AmountCell from './components/amount_cell'

const { More } = BoxForm
const { BatchActionBar } = TableXUtil
const SelectTableX = selectTableXHOC(TableX)

@observer
class ReceiveMaterial extends Component {
  pagination = createRef()
  columns = [
    {
      Header: t('计划下达日期'),
      accessor: 'release_time',
      Cell: ({
        row: {
          original: { release_time },
        },
      }) => moment(release_time).format('YYYY-MM-DD'),
    },
    { Header: t('计划编号'), accessor: 'proc_order_id' },
    {
      Header: t('领取ID'),
      accessor: 'id',
      Cell: ({
        row: {
          original: { id },
        },
      }) => idConvert2Show(id, 'LL'),
    },
    {
      Header: t('领料商品'),
      Cell: ({
        row: {
          original: { ingredient_name, ingredient_id },
        },
      }) => `${ingredient_name}(${ingredient_id})`,
    },
    {
      Header: t('商品类型'),
      accessor: 'remark_type',
      Cell: ({
        row: {
          original: { remark_type },
        },
      }) => remarkType(remark_type),
    },
    {
      Header: t('需求数'),
      accessor: 'plan_recv_amount',
      Cell: (cellProps) => {
        const { plan_recv_amount } = cellProps.row.original
        return doNumberDigitFixed(plan_recv_amount)
      },
    },
    {
      Header: t('领取批次'),
      accessor: 'batch',
      Cell: ({ row: { index } }) => <BatchNumberCell index={index} />,
      width: 300,
    },
    {
      Header: t('领取数'),
      accessor: 'count',
      Cell: ({ row: { index } }) => <AmountCell index={index} />,
    },
    {
      Header: t('领料成本'),
      accessor: 'total_batch_price',
      Cell: ({
        row: {
          original: { total_batch_price },
        },
      }) => <span>{total_batch_price + Price.getUnit()}</span>,
    },
    {
      Header: t('领料人'),
      accessor: 'person',
      Cell: ({ row: { index } }) => <RecverCell index={index} />,
    },
    {
      Header: t('领取状态'),
      accessor: 'status',
      Cell: ({ row: { index } }) => <StatusCell index={index} />,
    },
    {
      Header: t('领料时间'),
      accessor: 'recv_time',
      Cell: ({ row: { index } }) => <RecvTimeCell index={index} />,
    },
  ]

  state = {
    selected: [],
  }

  componentDidMount() {
    this._init().then()
  }

  _init = async () => {
    // 管理员才拉全部数据，其他用户默认为当前登录账号
    await store.searchReceiver()
    this.pagination.current.apiDoFirstRequest()
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handleExport = (event) => {
    event.preventDefault()
    const params = urlToParams(store.filterReceiveSearchData)
    window.open(`/stock/process/process_order/ingredient_recv/export?${params}`)
  }

  handleChangePage = (pagination) => {
    const { filterReceiveSearchData } = store

    return store
      .getReceiveMaterialList({
        ...filterReceiveSearchData,
        ...pagination,
      })
      .then((json) => {
        store.changePagination(pagination)
        store.setSelectAll(false)
        this.setState({
          selected: [],
        })
        return json
      })
  }

  handleSelect = (selected) => {
    this.setState({
      selected,
    })
    store.setSelectAll(false)
  }

  onSelectAll = () => {
    const { allSelect } = store
    store.setSelectAll(!allSelect)
  }

  /**
   * 批量编辑领取批次
   */
  handleEditBatch = () => {
    const { receiveMaterialList } = store
    const { selected } = this.state
    const error = this._judgeError()
    if (error) {
      Tip.warning(error)
      return
    }
    const req = store.getBatchSelectFilter(this.state.selected)

    store.fetchBatchEditList(req, 'set_batch_num').then(() => {
      if (store.batch_edit_list.length === 0) {
        Tip.warning(t('已选商品无库存可领取，请先进行入库操作'))
        return
      }

      createDialog(BatchEditModal, this.state, {
        title: t('批量编辑领取批次'),
        OKBtn: t('确定领料'),
        onOK: () => {
          const { batch_edit_list } = store
          const selectedData = receiveMaterialList.filter((item) => {
            return selected.includes(item.id)
          })

          const ids = []

          // 匹配选中的物料id，找到修改的对应领料id
          batch_edit_list.forEach((item) => {
            selectedData.forEach((selected) => {
              if (selected.ingredient_id === item.ingredient_id) {
                ids.push(selected.id)
              }
            })
          })
          store.changeEarlySelectedIds(ids) // 因为数据会变化，所以记录之前的ids供第二次领料人使用
          return this._handleOk(
            {
              update_type: 'set_batch_num',
              set_batch_list: JSON.stringify(
                batch_edit_list.slice().map((item) => {
                  const { ingredient_id, amount } = item
                  return { ingredient_id, amount }
                }),
              ),
            },
            ids,
          ).then(() => {
            setTimeout(() => {
              this.handleEditRecver({ isAfterBatchNum: true })
            })
          })
        },
      })
    })
  }

  handleEditRecver = (params) => {
    const error = this._judgeError()
    if (error) {
      Tip.warning(error)
      return
    }
    createDialog(
      (props) => (
        <RecverEditModal
          {...props}
          isAfterBatchNum={!!params?.isAfterBatchNum}
        />
      ),
      this.state,
      {
        title: t('批量编辑领料人'),
        onOK: () =>
          this._handleOk(
            {
              update_type: 'set_recver',
              set_recver: store.batch_recver,
            },
            store.earlySelectedIds,
          ).then(() => {
            store.changeEarlySelectedIds([])
          }),
      },
    )
  }

  handleEditStatus = () => {
    const error = this._judgeError()
    if (error) {
      Tip.warning(error)
      return
    }
    createDialog(StatusEditModal, this.state, {
      title: t('批量编辑领料状态'),
      onOK: () =>
        this._handleOk({
          update_type: 'set_status',
          set_status: store.status,
        }),
    })
  }

  _judgeError = () => {
    const { selected } = this.state
    const { allSelect } = store
    if (!(selected.length || allSelect)) {
      return t('请勾选至少一条领料数据')
    }
    if (!allSelect) {
      const { receiveMaterialList } = store
      const selectedData = receiveMaterialList
        .slice()
        .filter((i) => selected.includes(i.id))
      if (selectedData.some((i) => i.status === 2)) {
        return t('已领取的数据不能修改')
      }
    }
  }

  /**
   * 批量操作确认
   * @param filter {{
   * update_type?:'set_batch_num'|'set_status'|'set_recver',
   * set_batch_list?:string,
   * set_status?:1|2,
   * set_recver?:number
   * }}
   * 更新方式 领料列表 领料状态 领料人id
   * @private
   * @returns {Promise<void>}
   */
  _handleOk = (filter, batch_num_ids) => {
    const { allSelect, filterReceiveSearchData } = store
    const { selected } = this.state
    /**
     * @type {{
     * begin?:string,
     * end?:string,
     * q?:string,
     * status?:string,
     * ids?:string,
     * update_type?:'set_batch_num'|'set_status'|'set_recver',
     * set_batch_list?:{ingredient_id:string,amount:number}[],
     * set_status?:1|2,set_recver?:number
     * }}
     */
    let option = { ...filter }

    if (allSelect) {
      option = { ...option, ...filterReceiveSearchData }
    } else {
      option.ids = JSON.stringify(
        batch_num_ids?.length > 0 ? batch_num_ids : selected,
      ) // 设置完批次后再次设置领料人会出现数据对不上，因此用批次时候的id即可
    }

    return store.batchUpdate(option).then(() => {
      Tip.success(t('批量更新成功'))
      if (filter.update_type !== 'set_batch_num') {
        this.setState({ selected: [] })
        store.setSelectAll(false)
      }

      store.getReceiveMaterialList({
        ...store.filterReceiveSearchData,
        ...store.pagination,
      })

      store.searchReceiver()
      return undefined
    })
  }

  render() {
    const {
      receiveMaterialFilter,
      receiveMaterialList,
      allSelect,
      recverList,
    } = store
    const recverSelected = _.find(
      recverList,
      (v) => v.value === receiveMaterialFilter.recver_id,
    )
    const { selected } = this.state
    const placeholder = {
      1: t('请输入领料批次'),
      2: t('请输入计划编号'),
      3: t('请输入商品信息'),
    }[receiveMaterialFilter.search_type]
    return (
      <>
        <BoxForm
          btnPosition='left'
          labelWidth='100px'
          colWidth='360px'
          onSubmit={this.handleSearch}
        >
          <FormBlock col={3}>
            <FormItem label={t('计划下达日期')}>
              <DateRangePicker
                begin={receiveMaterialFilter.begin}
                end={receiveMaterialFilter.end}
                onChange={(begin, end) => {
                  store.setReceiveMaterialFilter('begin', begin)
                  store.setReceiveMaterialFilter('end', end)
                }}
                endProps={{ min: receiveMaterialFilter.begin }}
              />
            </FormItem>
            <FormItem>
              <Flex>
                <Select
                  clean
                  style={{ width: '100px' }}
                  value={receiveMaterialFilter.search_type}
                  onChange={(value) =>
                    store.setReceiveMaterialFilter('search_type', value)
                  }
                  data={[
                    { value: 1, text: t('按领料批次') },
                    { value: 2, text: t('按计划编号') },
                    { value: 3, text: t('按商品信息') },
                  ]}
                />
                <Flex flex={1}>
                  <Input
                    className='form-control'
                    placeholder={placeholder}
                    value={receiveMaterialFilter.q}
                    onChange={({ target: { value } }) =>
                      store.setReceiveMaterialFilter('q', value)
                    }
                  />
                </Flex>
              </Flex>
            </FormItem>
          </FormBlock>
          <More>
            <FormBlock col={3}>
              <FormItem label={t('领料状态')}>
                <Select
                  onChange={(value) =>
                    store.setReceiveMaterialFilter('status', value)
                  }
                  data={[
                    { value: 0, text: t('全部状态') },
                    { value: 1, text: t('未领取') },
                    { value: 2, text: t('已领取') },
                  ]}
                  value={receiveMaterialFilter.status}
                />
              </FormItem>
              <FormItem label={t('商品类型')}>
                <Select
                  onChange={(value) =>
                    store.setReceiveMaterialFilter('remark_type', value)
                  }
                  data={MATERIAL_TYPE}
                  value={receiveMaterialFilter.remark_type}
                />
              </FormItem>
              <FormItem label={t('领料人')}>
                <MoreSelect
                  data={recverList.slice()}
                  selected={recverSelected}
                  onSelect={(selected) =>
                    store.setReceiveMaterialFilter(
                      'recver_id',
                      selected ? selected.value : -1,
                    )
                  }
                  renderListFilterType='pinyin'
                />
              </FormItem>
            </FormBlock>
          </More>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{t('导出')}</Button>
          </FormButton>
        </BoxForm>
        <ManagePaginationV2
          onRequest={this.handleChangePage}
          id='receive'
          ref={this.pagination}
        >
          <SelectTableX
            columns={this.columns}
            data={receiveMaterialList.slice()}
            keyField='id'
            selected={selected}
            onSelect={this.handleSelect}
            isSelectorDisable={(item) => {
              return item.status === 2
            }}
            batchActionBar={
              selected.length ? (
                <BatchActionBar
                  batchActions={[
                    {
                      name: t('批量编辑领取批次'),
                      type: 'edit',
                      onClick: this.handleEditBatch,
                    },
                    {
                      name: t('批量设置领料人'),
                      type: 'edit',
                      onClick: () => this.handleEditRecver(),
                    },
                    {
                      name: t('批量设置领料状态'),
                      type: 'edit',
                      onClick: this.handleEditStatus,
                    },
                  ]}
                  onClose={() => this.handleSelect([])}
                  isSelectAll={allSelect}
                  count={allSelect ? null : selected.length}
                  toggleSelectAll={this.onSelectAll}
                />
              ) : null
            }
          />
        </ManagePaginationV2>
        <ScanBarcode onSearch={this.handleSearch} />
      </>
    )
  }
}

export default ReceiveMaterial
