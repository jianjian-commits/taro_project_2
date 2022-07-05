import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, Dialog, Tip, Button, Modal } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil, selectTableV2HOC } from '@gmfe/table'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { history } from '../../../../../common/service'
import BatchModify from '../components/batch_modify'
import SupplierSelect from '../components/supplier_select'
import Filter from '../components/filter'
import supplierStore from '../store'
import store from './store'
import BatchToLead from '../components/batch_to_lead'

const SelectTable = selectTableV2HOC(Table)

@observer
class Component extends React.Component {
  componentDidMount() {
    this.handleSearch()
  }

  componentWillUnmount() {
    store.clear()
  }

  getQuery = () => {
    const { sku_id, sale_menu_name, sku, supplier } = this.props.location.query
    return {
      sku_id,
      sku,
      text: `${sale_menu_name}(${sku}, ${supplier})`,
    }
  }

  getData = () => {
    const data = []
    const { suppliers, selectedRecord } = store
    _.each(suppliers, (item) => {
      if (selectedRecord.includes(item.address_id)) {
        data.push(item.address_id)
      }
    })
    return data
  }

  handleSearch = () => {
    const { filter } = store
    const { sku_id } = this.props.location.query
    this.pagination.apiDoFirstRequest()
    supplierStore.getStatistics({
      sku_id,
      route_id: filter.routerSelected.id || null,
      q: filter.q,
    })
  }

  handleBatchModify = () => {
    const { isSelectAllPage, filter, selectedRecord } = store
    const { statistics } = supplierStore
    const { sku_id } = this.props.location.query
    const address_ids = this.getData()
    let addressNum = address_ids.length
    let params = {
      sku_id,
      all: isSelectAllPage ? 1 : 0,
    }
    if (!selectedRecord.slice().length) {
      Tip.info(i18next.t('至少勾选一条数据'))
      return Promise.reject(new Error('至少勾选一条数据'))
    }
    if (isSelectAllPage) {
      addressNum = statistics.address_num
      params = {
        ...params,
        route_id: filter.routerSelected.id || null,
        q: filter.q,
      }
    } else {
      params = {
        ...params,
        address_ids: JSON.stringify(address_ids),
      }
    }

    Dialog.confirm({
      children: (
        <BatchModify
          cancel
          statistics={{ address_num: addressNum, sku_num: 1 }}
        />
      ),
      onOK: () => {
        const {
          suppliers: { selected },
        } = supplierStore
        if (!selected) {
          Tip.info(i18next.t('请选择供应商'))
          return Promise.reject(new Error('请选择供应商'))
        }

        // 修改供应商和取消供应商调不同的接口
        // 取消优先供应商
        if (!selected.supplier_id) {
          const ids = _.map(
            _.filter(
              store.suppliers.slice(),
              (i) => selectedRecord.includes(i.address_id) && i.id,
            ),
            (i) => i.id,
          )

          if (!isSelectAllPage) {
            params.ids = JSON.stringify(ids)
          }
          store.deleteByBatch(params).then((json) => {
            Tip.success(i18next.t('批量取消成功'))
            this.pagination.doCurrentRequest()
          })
        } else {
          params.supplier_id = selected.supplier_id
          store.setAllTypeByBatch(params).then((json) => {
            const { error_list } = json.data
            const { sku } = this.getQuery()
            if (error_list.length) {
              supplierStore.setError(json.data)
              history.push({
                pathname:
                  '/merchandise/manage/sale/priority_supplier/error_list_by_sku',
                search: `?sku=${sku}`,
              })
            } else {
              Tip.success(i18next.t('批量修改成功'))
              this.pagination.doCurrentRequest()
            }
          })
        }
      },
    })
  }

  handleRequest = (params) => {
    const { sku_id } = this.getQuery()
    return store.getSuppliersBySku({ ...params, sku_id })
  }

  // 保存优先供应商
  handleSavePrioritySupplier = (supplier) => {
    const params = {
      all: 0,
      sku_id: supplier.sku_id,
      supplier_id: supplier.selected.id,
      address_ids: JSON.stringify([supplier.address_id]),
    }
    store.setAllTypeByBatch(params).then(() => {
      this.pagination.doCurrentRequest()
    })
  }

  // 删除优先供应商
  handleDeletePrioritySupplier = (id) => {
    supplierStore.deletePrioritySupplier(id).then(() => {
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
    const { sku_id } = this.props.location.query

    Modal.render({
      children: <BatchToLead sku_id={sku_id} />,
      size: 'md',
      title: i18next.t('批量导入设置优先供应商'),
      onHide: Modal.hide,
    })
  }

  render() {
    const { suppliers, selectedRecord, isSelectAllPage } = store
    const { routerSelected, q } = store.filter
    const { text } = this.getQuery()
    return (
      <div>
        <Filter
          onSubmit={this.handleSearch}
          setFilter={(key, value) => {
            store.setFilter(key, value)
          }}
          routerSelected={routerSelected}
          placeholder={i18next.t(
            '输入商户信息,供应商信息或[商户,供应商]组合搜索',
          )}
          q={q}
        />
        <BoxTable
          info={<BoxTable.Info>{text}</BoxTable.Info>}
          action={
            <Button className='gm-margin-right-5' onClick={this.handleToLead}>
              {i18next.t('批量导入')}
            </Button>
          }
        >
          <ManagePaginationV2
            id='pagination_in_merchandise_priority_supplier_list_by_sku'
            disablePage
            onRequest={this.handleRequest}
            ref={(pagination) => {
              this.pagination = pagination
            }}
          >
            <SelectTable
              data={suppliers.slice()}
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
                  Header: i18next.t('商户路线'),
                  accessor: 'route_name',
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
              keyField='address_id'
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
            <div className='gm-gap-15' />
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
