import { t } from 'gm-i18n'
import React from 'react'
import {
  BoxForm,
  FormItem,
  FormBlock,
  FormButton,
  Select,
  DateRangePicker,
  Modal,
  Tip,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import ProcessStatus from './process_status'
import { productDefaultImg } from 'common/service'
import globalStore from 'stores/global'
import demandStore from './store'
import BatchModifyModal from './batch_modify_modal'
import { PROCESS_STATUS, DEMAND_TYPES } from 'common/enum'
import { Table, selectTableV2HOC, TableUtil } from '@gmfe/table'

import { findByValue } from './util'
const SelectTable = selectTableV2HOC(Table)

@observer
class DemandListView extends React.Component {
  componentDidMount() {
    this.pagination.apiDoFirstRequest()
  }

  handleBatchModify = () => {
    const { ids, selectAllType } = demandStore
    if (ids.length === 0 && !selectAllType) {
      Tip.warning(t('没有选择新品'))
      return
    }

    Modal.render({
      children: (
        <BatchModifyModal
          ids={ids.slice()}
          type={selectAllType}
          onSave={this.handleBatchSave}
        />
      ),
      title: t('修改选中处理状态'),
      onHide: Modal.hide,
    })
  }

  handleDisabled(scope) {
    return scope.status !== 1
  }

  handleBatchSave(status, ids) {
    demandStore.handleChangeMultiStatus(status, ids).then(() => {
      Tip.success(t('修改成功!'))
      Modal.hide()
    })
  }

  handleSave(id, index) {
    demandStore.handleChangeSingleStatus(id, index).then(() => {
      Tip.success(t('修改成功'))
    })
  }

  handleBatchClose() {
    demandStore.handleSelectAll(false)
  }

  handleSelectAll(bool) {
    demandStore.handleSelectAll(bool)
  }

  handlePageChange(pagination) {
    demandStore.handleSelectAll(false)
    return demandStore.fetchData(pagination)
  }

  render() {
    const editPermession = globalStore.hasPermission(
      'edit_demand_for_new_merchandise'
    )
    const { params, list, loading, selectAllType, ids } = demandStore

    return (
      <div className='b-merchandise-demand'>
        <BoxForm
          btnPosition='left'
          onSubmit={() => {
            this.pagination.apiDoFirstRequest()
          }}
        >
          <FormBlock col={3}>
            <FormItem label={t('提交时间')}>
              <DateRangePicker
                begin={params.begin}
                end={params.end}
                onChange={(begin, end) => {
                  demandStore.handleChangeParems({ begin, end })
                }}
              />
            </FormItem>
            <FormItem label={t('搜索')}>
              <input
                name='orderInput'
                value={demandStore.searchText}
                onChange={(e) =>
                  demandStore.handleChangeParems({
                    searchText: e.target.value,
                  })
                }
                placeholder={t('输入提交人ID/提交人名称')}
              />
            </FormItem>
            <FormItem label={t('处理状态')}>
              <Select
                value={params.status}
                data={[{ text: t('全部状态'), value: '' }, ...PROCESS_STATUS]}
                onChange={(v) => {
                  demandStore.handleChangeParems({ status: v })
                }}
              />
            </FormItem>
            <BoxForm.More>
              <FormItem label={t('需求来源')}>
                <Select
                  value={params.from}
                  data={[{ text: t('全部状态'), value: 0 }, ...DEMAND_TYPES]}
                  onChange={(v) => {
                    demandStore.handleChangeParems({ from: v })
                  }}
                />
              </FormItem>
            </BoxForm.More>
          </FormBlock>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={() => demandStore.handleExport()}>
              {t('导出')}
            </Button>
          </FormButton>
        </BoxForm>
        <ManagePaginationV2
          id='pagination_in_merchandise_demand_list'
          onRequest={this.handlePageChange.bind(this)}
          ref={(ref) => (this.pagination = ref)}
        >
          <SelectTable
            data={list.slice()}
            loading={loading}
            keyField='_id'
            selected={ids.slice()}
            onSelectAll={this.handleSelectAll.bind(this)}
            onSelect={(ids) => {
              demandStore.handleSelect(ids)
            }}
            isSelectorDisable={this.handleDisabled}
            batchActionBar={
              !!ids.length && (
                <TableUtil.BatchActionBar
                  onClose={this.handleBatchClose.bind(this)}
                  isSelectAll={selectAllType}
                  toggleSelectAll={(bool) =>
                    demandStore.handleChangeSelectAllType(bool)
                  }
                  count={selectAllType ? t('所有') : ids.length}
                  batchActions={[
                    {
                      name: t('批量修改状态'),
                      onClick: this.handleBatchModify,
                      show: editPermession,
                      type: 'edit',
                    },
                  ]}
                />
              )
            }
            columns={[
              {
                Header: t('提交时间'),
                accessor: 'create_time',
                width: 100,
              },
              {
                Header: t('商品图片'),
                accessor: 'image',
                width: 80,
                Cell: ({ original: { image } }) => (
                  <img
                    style={{ width: '40px', height: '40px' }}
                    src={image || productDefaultImg}
                  />
                ),
              },
              {
                Header: t('商品名称'),
                accessor: 'name',
              },
              {
                Header: t('提交人ID'),
                width: 100,
                accessor: 'commit_id',
              },
              {
                Header: t('提交人名称'),
                accessor: 'commit_name',
              },
              {
                Header: t('需求来源'),
                accessor: 'type',
                Cell: ({ value }) => findByValue(DEMAND_TYPES, value),
              },
              {
                Header: t('处理状态'),
                accessor: 'status',
                width: 180,
                Cell: ({ original: { status, _edit, _status }, index }) => (
                  <ProcessStatus
                    edit={_edit}
                    onChange={(status) =>
                      demandStore.changeStatus(status, index)
                    }
                    status={_edit ? _status : status}
                  />
                ),
              },
              {
                Header: t('其他描述'),
                accessor: 'desc',
              },
              {
                Header: TableUtil.OperationHeader,
                Cell: ({ index, original: { status, _id, _edit } }) => {
                  // canEdit 是否允许编辑
                  const canEdit = editPermession && status === 1
                  // 允许编辑 或者 当前正处在编辑态
                  if (canEdit || _edit)
                    return (
                      <TableUtil.OperationRowEdit
                        isEditing={_edit}
                        onClick={() => demandStore.toggleEdit(index)}
                        onSave={() => this.handleSave(_id, index)}
                        onCancel={() => demandStore.toggleEdit(index)}
                      />
                    )
                },
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

export default DemandListView
