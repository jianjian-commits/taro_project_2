import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxTable,
  Dialog,
  RightSideModal,
  Tip,
  Button,
  Modal,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import _ from 'lodash'
import { selectTableV2HOC, Table, TableUtil } from '@gmfe/table'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import PropTypes from 'prop-types'

import BatchModify from '../components/batch_modify'
import Filter from '../components/filter'
import SupplierSelect from '../components/supplier_select'
import TaskList from '../../../../../task/task_list'
import { history } from 'common/service'
import TableTotalText from 'common/components/table_total_text'
import { getXlsxJson } from '../util'
import store from './store'
import supplierStore from '../store'
import globalStore from '../../../../../stores/global'
import BatchToLead from '../components/batch_to_lead'

const SelectTable = selectTableV2HOC(Table)

@observer
class Component extends React.Component {
  componentDidMount() {
    globalStore.setBreadcrumbs([i18next.t('优先供应商设置')])
    this.handleSearch()
  }

  componentWillUnmount() {
    globalStore.setBreadcrumbs([])
    store.clear()
  }

  getData = () => {
    const data = []
    const { prioritySuppliers, selectedRecord } = store
    _.each(prioritySuppliers, (item) => {
      if (selectedRecord.includes(item.id)) {
        data.push({
          sku_id: item.sku_id,
          address_id: item.address_id,
        })
      }
    })
    return data
  }

  handleSearch = () => {
    const { filter } = store
    this.pagination.apiDoFirstRequest()
    supplierStore.getStatistics({
      salemenu_id: this.props.location.query.salemenu_id,
      route_id: filter.routerSelected.id || null,
      q: filter.q,
    })
  }

  handleExport = () => {
    store
      .exportXlsx({ salemenu_id: this.props.location.query.salemenu_id })
      .then((json) => {
        const response = json.data
        if (response.async) {
          this.renderTaskList()
        } else {
          requireGmXlsx((res) => {
            const { jsonToSheet } = res
            const jsonList = getXlsxJson(response.data)
            const sheetOption = { SheetNames: [i18next.t('优先供应商')] }
            jsonToSheet(jsonList, {
              ...sheetOption,
              fileName: json.data.filename,
            })
          })
        }
      })
  }

  handleRequest = (params = null) => {
    return store.getPrioritySuppliers({
      salemenu_id: this.props.location.query.salemenu_id,
      ...params,
    })
  }

  handleBatchModify = () => {
    const { isSelectAllPage, filter, selectedRecord } = store
    const { statistics } = supplierStore
    const analyse = { ...statistics }
    const data = this.getData()
    const { salemenu_id, name } = this.props.location.query
    let params
    if (!selectedRecord.length) {
      Tip.info(i18next.t('至少勾选一条数据'))
      return Promise.reject(new Error('至少勾选一条数据'))
    }
    if (!isSelectAllPage) {
      analyse.sku_num = _.keys(_.groupBy(data, 'sku_id')).length
      analyse.address_num = _.keys(_.groupBy(data, 'address_id')).length
      params = {
        all: 0,
      }
    } else {
      params = {
        all: 1,
        salemenu_id: this.props.location.query.salemenu_id,
        route_id: filter.routerSelected.id || null,
        q: filter.q,
      }
    }
    Dialog.confirm({
      children: <BatchModify cancel statistics={analyse} />,
      onOK: () => {
        const {
          suppliers: { selected },
        } = supplierStore

        if (!selected) {
          Tip.info(i18next.t('请选择供应商'))
          return Promise.reject(new Error('请选择供应商'))
        }

        if (!params.all) {
          // 取消优先供应商
          if (!selected.supplier_id) {
            params.ids = JSON.stringify(selectedRecord.slice())
          } else {
            params.data = JSON.stringify(
              _.map(data, (v) => {
                return { ...v, supplier_id: selected.supplier_id }
              }),
            )
          }
        } else {
          params.supplier_id = selected.supplier_id
        }

        // 取消优先供应商
        if (!selected.supplier_id) {
          supplierStore.cancelBatchSupplier(params).then((json) => {
            Tip.success(i18next.t('批量取消成功'))
            this.pagination.doCurrentRequest()
          })
        } else {
          supplierStore.updateByBatch(params).then((json) => {
            if (json.data.async) {
              this.renderTaskList(1)
            } else {
              const { error_list } = json.data
              if (error_list.length) {
                history.push({
                  pathname:
                    '/merchandise/manage/sale/priority_supplier/error_list',
                  search: `?batch=1&salemenu_id=${salemenu_id}&name=${name}`,
                })
              } else {
                Tip.success(i18next.t('批量修改成功'))
                this.pagination.doCurrentRequest()
              }
            }
          })
        }
      },
    })
  }

  // 删除优先供应商
  handleDeletePrioritySupplier = (id) => {
    supplierStore.deletePrioritySupplier(id).then(() => {
      this.pagination.doCurrentRequest()
    })
  }

  // 保存优先供应商
  handleSavePrioritySupplier = (supplier) => {
    const { selected } = supplier
    const params = {
      all: 0,
      data: JSON.stringify([
        {
          sku_id: supplier.sku_id,
          address_id: supplier.address_id,
          supplier_id: selected.id,
        },
      ]),
    }
    supplierStore.updateByBatch(params).then(() => {
      this.pagination.doCurrentRequest()
    })
  }

  handleSave = (d) => {
    if (!d.selected.id) {
      Dialog.confirm({
        children: i18next.t(
          '是否取消优先供应商？取消优先供应商后该商户此商品将没有优先供应商。',
        ),
        title: i18next.t('提示'),
      }).then(() => {
        this.handleDeletePrioritySupplier(d.id)
      })
    } else {
      this.handleSavePrioritySupplier(d)
    }
  }

  // 批量导入
  handleToLead = () => {
    const { salemenu_id } = this.props.location.query

    Modal.render({
      children: <BatchToLead salemenu_id={salemenu_id} />,
      size: 'md',
      title: i18next.t('批量导入设置优先供应商'),
      onHide: Modal.hide,
    })
  }

  renderTaskList = (tab = 0) => {
    RightSideModal.render({
      children: <TaskList tabKey={tab} />,
      onHide: RightSideModal.hide,
      style: {
        width: '300px',
      },
    })
  }

  render() {
    const { filter, prioritySuppliers, selectedRecord, isSelectAllPage } = store
    const { name, salemenu_id } = this.props.location.query
    const { q, routerSelected } = filter
    return (
      <div>
        <Filter
          onSubmit={this.handleSearch}
          onExport={this.handleExport}
          setFilter={(key, value) => {
            store.setFilter(key, value)
          }}
          routerSelected={routerSelected}
          placeholder={i18next.t(
            '输入商品信息,商户信息,供应商信息,或[商品,商户,供应商]组合搜索',
          )}
          q={q}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[{ label: i18next.t('优先供应商列表'), content: name }]}
              />
            </BoxTable.Info>
          }
          action={
            <>
              <Button className='gm-margin-right-5' onClick={this.handleToLead}>
                {i18next.t('批量导入')}
              </Button>
              <Button
                type='primary'
                className='gm-margin-right-5'
                onClick={() => {
                  window.location.href = `#/merchandise/manage/sale/priority_supplier/add?salemenu_id=${salemenu_id}&name=${name}`
                }}
              >
                {i18next.t('设置优先供应商')}
              </Button>
            </>
          }
        >
          <ManagePaginationV2
            id='pagination_in_merchandise_priority_supplier_list'
            disablePage
            onRequest={this.handleRequest}
            ref={(pagination) => {
              this.pagination = pagination
            }}
          >
            <SelectTable
              data={prioritySuppliers.slice()}
              columns={[
                {
                  Header: i18next.t('商户ID'),
                  accessor: 'address_id',
                },
                {
                  Header: i18next.t('商户名称'),
                  accessor: 'address_name',
                },
                {
                  Header: i18next.t('商品名称'),
                  id: 'sku_name',
                  accessor: (d) => <span>{`${d.sku_name}/${d.sku_id}`}</span>,
                },
                {
                  Header: i18next.t('销售规格名'),
                  id: 'sale_name',
                  accessor: (d) => (
                    <span>{`${d.sale_ratio}${d.std_unit_name_forsale}/${d.sale_unit_name}`}</span>
                  ),
                },
                {
                  Header: i18next.t('商户路线'),
                  accessor: 'route_name',
                },
                {
                  Header: i18next.t('优先供应商ID'),
                  accessor: 'supplier_id',
                },
                {
                  Header: i18next.t('优先供应商'),
                  accessor: 'supplier_name',
                  Cell: ({ original: d, index }) => {
                    return (
                      <SupplierSelect
                        key={`${d.id}_${d.supplier_id}_${d.isEditing}`}
                        supplier={d}
                        selected={d.selected}
                        isEditing={!!d.isEditing}
                        onSelect={(selected) => {
                          store.editColumn(index, { selected })
                        }}
                      />
                    )
                  },
                },
                {
                  width: 100,
                  Header: TableUtil.OperationHeader,
                  Cell: ({ original: d, index }) => (
                    <TableUtil.OperationRowEdit
                      isEditing={!!d.isEditing}
                      onClick={() =>
                        store.editColumn(index, {
                          isEditing: true,
                          selected: d.supplier_id
                            ? { id: d.supplier_id, name: d.supplier_name }
                            : null,
                        })
                      }
                      onSave={() => this.handleSave(d)}
                      onCancel={() =>
                        store.editColumn(index, { isEditing: false })
                      }
                    />
                  ),
                },
              ]}
              keyField='id'
              onSelectAll={(isSelectedAll) =>
                store.toggleSelectAll(isSelectedAll)
              }
              batchActionBar={
                selectedRecord.length ? (
                  <TableUtil.BatchActionBar
                    onClose={() => store.toggleSelectAll(false)}
                    toggleSelectAll={(bool) =>
                      store.toggleIsSelectAllPage(bool)
                    }
                    batchActions={[
                      {
                        name: i18next.t('批量修改'),
                        onClick: this.handleBatchModify,
                        type: 'edit',
                      },
                    ]}
                    count={isSelectAllPage ? null : selectedRecord.length}
                    isSelectAll={isSelectAllPage}
                  />
                ) : null
              }
              selected={selectedRecord.slice()}
              onSelect={(selected) => store.setSelect(selected)}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

Component.propTypes = {
  location: PropTypes.object,
}

export default Component
