import React, { Component } from 'react'
import store from '../store'
import { observer } from 'mobx-react'
import { Flex, TreeV2, Button, Input, Modal, Tip } from '@gmfe/react'
import { SUPPLIER_INVOICE_TYPE } from 'common/enum'
import TableTotalText from 'common/components/table_total_text'
import { t } from 'gm-i18n'
import { TableX, selectTableXHOC } from '@gmfe/table-x'

const SelectTableX = selectTableXHOC(TableX)

@observer
class AddSupplierModal extends Component {
  componentWillUnmount() {
    const {
      setTreeSelected,
      setTableSelected,
      resetSupplierMap,
      setWord,
    } = store
    setWord('')
    setTreeSelected([])
    setTableSelected([])
    resetSupplierMap()
  }

  handleSelectTree = (list) => {
    const {
      setTreeSelected,
      treeSelected,
      fetchSupplierMap,
      deleteSupplierMapItem,
    } = store
    const difference = list
      .concat(treeSelected.slice())
      .filter((v) => !list.includes(v) || !treeSelected.includes(v))
    difference.forEach((item) => {
      if (list.length > treeSelected.length) {
        fetchSupplierMap(item)
      } else {
        deleteSupplierMapItem(item)
      }
    })
    setTreeSelected(list)
  }

  handleFilter = (e) => {
    const { setWord } = store
    setWord(e.target.value)
  }

  handleSelectTable = (list) => {
    const { setTableSelected } = store
    setTableSelected(list)
  }

  handleCancel = () => {
    Modal.hide()
  }

  handleOk = () => {
    const {
      supplierList,
      tableSelected,
      setSupplier,
      details: { supplier },
    } = store
    if (!tableSelected.length) {
      Tip.warning(t('请选择供应商'))
      return
    }
    setSupplier(
      supplier.concat(
        supplierList
          .filter((v) => tableSelected.includes(v.supplier_id))
          .filter(
            (v) => !supplier.map((i) => i.supplier_id).includes(v.supplier_id)
          )
      )
    )
    Modal.hide()
  }

  render() {
    const {
      tableSelected,
      treeSelected,
      supplierList,
      word,
      supplierLoading,
    } = store
    return (
      <>
        <Flex>
          <div>
            <style jsx>{`
              div {
                width: 250px;
                min-height: 400px;
              }
            `}</style>
            <TreeV2
              list={Object.entries(SUPPLIER_INVOICE_TYPE).map(
                ([key, value]) => ({
                  value: Number(key),
                  text: value,
                })
              )}
              selectedValues={treeSelected.slice()}
              onSelectValues={this.handleSelectTree}
            />
          </div>
          <div className='gm-margin-left-20' style={{ flex: 1 }}>
            <Flex className='gm-margin-bottom-10'>
              <TableTotalText
                data={[
                  { label: t('已选供应商'), content: tableSelected.length },
                ]}
              />
              <Input
                className='gm-margin-left-10 form-control'
                style={{ width: '180px' }}
                placeholder={t('请输入供应商编号或名称')}
                value={word}
                onChange={this.handleFilter}
              />
            </Flex>
            <SelectTableX
              data={supplierList}
              loading={supplierLoading}
              style={{ maxHeight: '500px' }}
              keyField='supplier_id'
              columns={[
                { Header: t('供应商编号'), accessor: 'customer_id' },
                { Header: t('供应商名称'), accessor: 'supplier_name' },
              ]}
              selected={tableSelected.slice()}
              onSelect={this.handleSelectTable}
            />
          </div>
        </Flex>
        <Flex justifyEnd className='gm-margin-top-10'>
          <Button onClick={this.handleCancel}>{t('取消')}</Button>
          <Button
            type='primary'
            className='gm-margin-left-10'
            onClick={this.handleOk}
          >
            {t('确定')}
          </Button>
        </Flex>
      </>
    )
  }
}

export default AddSupplierModal
