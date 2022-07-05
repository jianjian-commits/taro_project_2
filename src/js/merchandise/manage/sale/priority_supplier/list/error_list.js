import React from 'react'
import { i18next } from 'gm-i18n'
import { BoxTable, Dialog, Button } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import { history } from 'common/service'
import { prioritySupplierStatus } from 'common/filter'
import TableListTips from 'common/components/table_list_tips'
import SupplierSelect from '../components/supplier_select'

import supplierStore from '../store'

@observer
class Component extends React.Component {
  componentDidMount() {
    this.getErrorList()
  }

  getErrorList = () => {
    const { task_id } = this.props.location.query
    if (task_id) {
      supplierStore.getErrorListByTaskId(task_id)
    }
  }

  // 删除优先供应商
  handleDeletePrioritySupplier = (index, supplier) => {
    if (supplier.id) {
      supplierStore.deletePrioritySupplier(supplier.id).then(() => {
        supplierStore.deleteUpdated(index)
      })
    } else {
      supplierStore.deleteUpdated(index)
    }
  }

  jumpToList = () => {
    const { salemenu_id, name } = this.props.location.query
    if (salemenu_id && name) {
      history.replace({
        pathname: '/merchandise/manage/sale/priority_supplier',
        search: `?salemenu_id=${salemenu_id}&name=${name}`,
      })
    } else {
      history.goBack()
    }
  }

  // 保存优先供应商
  handleSavePrioritySupplier = (index, supplier) => {
    const params = {
      all: 0,
      data: JSON.stringify([
        {
          sku_id: supplier.sku_id,
          address_id: supplier.address_id,
          supplier_id: supplier.selected.id,
        },
      ]),
    }
    const updateOne = true
    supplierStore.updateByBatch(params, updateOne).then((json) => {
      const { error_list } = json.data
      !error_list.length && supplierStore.deleteUpdated(index)
    })
  }

  handleSave = (index, d) => {
    if (!d.selected.id) {
      Dialog.confirm({
        children: i18next.t(
          '是否取消优先供应商？取消优先供应商后该商户此商品将没有优先供应商。'
        ),
        title: i18next.t('提示'),
      }).then(() => {
        this.handleDeletePrioritySupplier(index, d)
      })
    } else {
      this.handleSavePrioritySupplier(index, d)
    }
  }

  render() {
    const {
      error: { error_list, total_num, error_num },
    } = supplierStore
    const { batch } = this.props.location.query
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            {batch ? i18next.t('批量修改失败列表') : i18next.t('设置失败列表')}
          </BoxTable.Info>
        }
      >
        <div>
          <TableListTips
            tips={[
              i18next.t('set_priority_supplier_error', {
                VAR1: total_num - error_num,
                VAR2: error_num,
              }),
            ]}
          />
          <Table
            defaultPageSize={9999}
            data={error_list.slice()}
            columns={[
              {
                Header: i18next.t('商户ID'),
                accessor: 'address_id',
              },
              {
                Header: i18next.t('商户名'),
                accessor: 'address_name',
              },
              {
                Header: i18next.t('商品名称'),
                id: 'spu_name',
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
                Header: i18next.t('失败原因'),
                id: 'status',
                accessor: (d) => prioritySupplierStatus(d.status),
              },
              {
                Header: i18next.t('优先供应商'),
                id: 'supplier_name',
                Cell: ({ original: d, index }) => {
                  return (
                    <SupplierSelect
                      key={`${d.address_id}_${d.sku_id}_${d.isEditing}`}
                      supplier={d}
                      selected={d.selected}
                      isEditing={!!d.isEditing}
                      onSelect={(selected) => {
                        supplierStore.editColumn(index, { selected })
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
                      supplierStore.editColumn(index, {
                        isEditing: true,
                        selected: d.supplier_id
                          ? { id: d.supplier_id, name: d.supplier_name }
                          : null,
                      })
                    }
                    onSave={() => this.handleSave(index, d)}
                    onCancel={() =>
                      supplierStore.editColumn(index, { isEditing: false })
                    }
                  />
                ),
              },
            ]}
          />
          <div className='gm-padding-15 text-center'>
            <Button type='primary' onClick={this.jumpToList}>
              {i18next.t('完成')}
            </Button>
          </div>
        </div>
      </BoxTable>
    )
  }
}

Component.propTypes = {
  location: PropTypes.object,
}

export default Component
