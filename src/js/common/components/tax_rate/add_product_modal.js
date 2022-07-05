import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Button, Flex, Input, Modal, Tip, TreeV2 } from '@gmfe/react'
import { Request } from '@gm-common/request'
import { dealProductTreeData } from './utils'
import TableTotalText from '../table_total_text'
import { selectTableXHOC, TableXUtil, TableXVirtualized } from '@gmfe/table-x'

const SelectTableXVirtualized = selectTableXHOC(TableXVirtualized)
const { TABLE_X } = TableXUtil

class AddProductModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
  }

  state = {
    treeList: [],
    treeSelected: [],
    tableSelected: [],
    tableMap: {},
    word: '',
    loading: false,
  }

  async componentDidMount() {
    const { data } = await Request('/station/promotion/category/tree').get()
    this.setState({ treeList: dealProductTreeData(data) })
  }

  handleSelectTree = (list) => {
    const { treeSelected } = this.state
    const difference = list
      .concat(treeSelected)
      .filter((v) => !list.includes(v) || !treeSelected.includes(v))
    this.setState({ treeSelected: list, tableSelected: [] }, () => {
      if (list.length > treeSelected.length) {
        const requests = difference.map((item) =>
          Request('/station/tax/category/spu/list')
            .data({ category_2_id: item })
            .get()
        )
        this.setState({ loading: true }, () => {
          Promise.all(requests)
            .then((result) => {
              result.forEach((item, index) => {
                const { data } = item
                const { tableMap } = this.state
                this.setState({
                  tableMap: Object.assign({}, tableMap, {
                    [difference[index]]: data,
                  }),
                })
              })
            })
            .finally(() => {
              this.setState({ loading: false })
            })
        })
      } else {
        difference.forEach((item) => {
          const { tableMap } = this.state
          delete tableMap[item]
          this.setState({ tableMap: Object.assign({}, tableMap) })
        })
      }
    })
  }

  handleFilter = (e) => {
    this.setState({ word: e.target.value })
  }

  handleSelectTable = (list) => {
    this.setState({ tableSelected: list })
  }

  handleCancel = () => {
    Modal.hide()
  }

  handleOk = () => {
    const { tableSelected, tableMap } = this.state
    const { onOk } = this.props
    const tableMapValues = Object.values(tableMap)
    const tableList = tableMapValues.length
      ? tableMapValues.reduce((all, item) => all.concat(item))
      : []
    if (!tableSelected.length) {
      Tip.warning(t('请选择商品'))
      return
    }
    onOk &&
      onOk(tableList.filter((value) => tableSelected.includes(value.spu_id)))
    Modal.hide()
  }

  render() {
    const {
      treeSelected,
      treeList,
      tableSelected,
      word,
      loading,
      tableMap,
    } = this.state
    const tableMapValues = Object.values(tableMap)

    const tableList = tableMapValues.length
      ? tableMapValues
          .reduce((all, item) => all.concat(item))
          .filter((item) => (item.spu_id + item.spu_name).includes(word))
      : []
    return (
      <>
        <Flex>
          <div>
            <style jsx>{`
              div {
                width: 250px;
                min-height: 600px;
              }
            `}</style>
            <TreeV2
              list={treeList}
              selectedValues={treeSelected}
              onSelectValues={this.handleSelectTree}
            />
          </div>
          <div className='gm-margin-left-20' style={{ flex: 1 }}>
            <Flex className='gm-margin-bottom-10'>
              <TableTotalText
                data={[{ label: t('已选商品'), content: tableSelected.length }]}
              />
              <Input
                className='gm-margin-left-10 form-control'
                style={{ width: '180px' }}
                placeholder={t('请输入商品名称')}
                value={word}
                onChange={this.handleFilter}
              />
            </Flex>
            <SelectTableXVirtualized
              virtualizedHeight={
                TABLE_X.HEIGHT_HEAD_TR +
                Math.min(8, tableList.length) * TABLE_X.HEIGHT_TR
              }
              virtualizedItemSize={TABLE_X.HEIGHT_TR}
              data={tableList}
              loading={loading}
              keyField='spu_id'
              columns={[
                {
                  Header: t('商品'),
                  accessor: 'spu_name',
                  Cell: (cellProps) => (
                    <>
                      {cellProps.row.original.spu_name}
                      <br />
                      {cellProps.row.original.spu_id}
                    </>
                  ),
                },
                {
                  Header: t('商品分类'),
                  id: 'category',
                  Cell: ({ row: { original } }) =>
                    `${original.category_1_name}/${original.category_2_name}`,
                },
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

export default AddProductModal
