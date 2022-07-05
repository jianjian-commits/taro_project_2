import React, { Component } from 'react'
import store from '../store'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Button, Flex, Input, TreeV2, Modal, Tip } from '@gmfe/react'
import TableTotalText from 'common/components/table_total_text'
import { TableXVirtualized, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import { convertNumber2Sid } from 'common/filter'

const SelectTableXVirtualized = selectTableXHOC(TableXVirtualized)
const { TABLE_X } = TableXUtil

@observer
class MerchantsModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
  }

  componentWillUnmount() {
    const {
      setTreeSelected,
      setTableSelected,
      setWord,
      resetMerchantsMap,
    } = store
    setTreeSelected([])
    setTableSelected([])
    setWord('')
    resetMerchantsMap()
  }

  componentDidMount() {
    const { fetchTreeData } = store
    fetchTreeData()
  }

  handleSelectTree = (list) => {
    const {
      treeSelected,
      fetchMerchantsMap,
      setTreeSelected,
      deleteMerchantsMapItem,
    } = store
    const difference = list
      .concat(treeSelected.slice())
      .filter((v) => !list.includes(v) || !treeSelected.includes(v))
    difference.forEach((item) => {
      if (list.length > treeSelected.length) {
        fetchMerchantsMap(item)
      } else {
        deleteMerchantsMapItem(item)
      }
    })
    setTreeSelected(list)
  }

  handleFilter = (event) => {
    const { setWord } = store
    setWord(event.target.value)
  }

  handleSelectTable = (list) => {
    const { setTableSelected } = store
    setTableSelected(list)
  }

  handleCancel = () => {
    Modal.hide()
  }

  handleOk = () => {
    const { tableSelected, merchantsList } = store
    if (!tableSelected.length) {
      Tip.warning(t('请选择商户'))
      return
    }
    const { onOk } = this.props
    const list = merchantsList.filter((value) =>
      tableSelected.includes(value.address_id),
    )
    onOk && onOk(list)
    Modal.hide()
  }

  render() {
    const { treeData, treeSelected, tableSelected, word, merchantsList } = store
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
              list={treeData.slice()}
              selectedValues={treeSelected.slice()}
              onSelectValues={this.handleSelectTree}
            />
          </div>
          <div className='gm-margin-left-20' style={{ flex: 1 }}>
            <Flex className='gm-margin-bottom-10'>
              <TableTotalText
                data={[{ label: t('已选商户'), content: tableSelected.length }]}
              />
              <Input
                className='gm-margin-left-10 form-control'
                style={{ width: '180px' }}
                placeholder={t('请输入商户名称')}
                value={word}
                onChange={this.handleFilter}
              />
            </Flex>
            <SelectTableXVirtualized
              data={merchantsList}
              keyField='address_id'
              virtualizedHeight={
                TABLE_X.HEIGHT_HEAD_TR +
                Math.min(8, merchantsList.length) * TABLE_X.HEIGHT_TR
              }
              virtualizedItemSize={TABLE_X.HEIGHT_TR}
              columns={[
                {
                  Header: t('商户ID'),
                  accessor: 'address_id',
                  Cell: (cellProps) =>
                    `${convertNumber2Sid(cellProps.row.original.address_id)}`,
                },
                { Header: t('商户名称'), accessor: 'address_name' },
              ]}
              selected={tableSelected.slice()}
              onSelect={this.handleSelectTable}
            />
          </div>
        </Flex>
        <Flex justifyEnd>
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

export default MerchantsModal
