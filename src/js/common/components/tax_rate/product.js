import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import TableTotalText from '../table_total_text'
import { Button, Flex, Modal, Tip } from '@gmfe/react'
import {
  TableXUtil,
  TableXVirtualized,
  expandTableXHOC,
  TableX,
} from '@gmfe/table-x'
import { SvgMinus } from 'gm-svg'
import ProductSearch from './product_search'
import Position from '../position'
import ProductSubTable from './product_sub_table'
import AddProductModal from './add_product_modal'
import BatchSetModal from './batch_set_modal'
import { isNil } from 'lodash'

const { TABLE_X, OperationCell, OperationHeader } = TableXUtil
const ExpandTableX = expandTableXHOC(TableX)

class Product extends Component {
  static propTypes = {
    category: PropTypes.array,
    spu: PropTypes.array,
    edit: PropTypes.bool,
    onChange: PropTypes.func,
  }

  state = {
    expanded: {},
    highlightIndex: null,
  }

  _tableRef = createRef()

  columns = [
    {
      Header: `${t('商品名')}/${t('商品ID')}`,
      id: 'spu',
      Cell: (cellProps) => (
        <>
          {cellProps.row.original.spu_name}
          <br />
          {cellProps.row.original.spu_id}
        </>
      ),
    },
    {
      Header: t('税率'),
      id: 'tax_rate',
      Cell: (cellProps) => `${cellProps.row.original.tax_rate}%`,
    },
    {
      Header: OperationHeader,
      id: 'operation',
      Cell: () => <OperationCell>-</OperationCell>,
    },
  ]

  handleExpand = (expanded) => {
    this.setState({ expanded })
  }

  handleDelete = (index) => {
    const { onChange, category } = this.props
    const { expanded } = this.state
    this.setState({
      expanded: Object.assign(expanded, {
        [category[index].category_1_id]: false,
      }),
    })
    category.splice(index, 1)
    onChange(category)
  }

  handleOpenAddModal = () => {
    Modal.render({
      title: t('添加商品'),
      children: <AddProductModal onOk={this.handleAddModal} />,
      size: 'lg',
      onHide: Modal.hide,
    })
  }

  handleAddModal = (list) => {
    const option = {}
    const { category, onChange } = this.props
    category.forEach((value) => {
      option[value.category_1_id] = value
    })
    list.forEach((value) => {
      const {
        spu_name,
        spu_id,
        category_1_name,
        category_1_id,
        tax_rate,
      } = value
      if (option[category_1_id]) {
        if (
          option[category_1_id].children.every((item) => item.spu_id !== spu_id)
        ) {
          option[category_1_id].children.push({ spu_name, spu_id, tax_rate })
        }
      } else {
        option[category_1_id] = {
          category_1_id,
          category_1_name,
          children: [{ spu_name, spu_id, tax_rate }],
        }
      }
    })
    onChange && onChange(Object.values(option))
  }

  handleOpenBatchSetModal = () => {
    const { category } = this.props
    if (!category.length) {
      Tip.warning(t('请先添加商品'))
      return
    }
    Modal.render({
      title: t('批量设置税率'),
      children: <BatchSetModal list={category} onOk={this.handleBatchSet} />,
      onHide: Modal.hide,
    })
  }

  handleBatchSet = (list) => {
    const { onChange, category } = this.props
    list.forEach((item) => {
      const value = category.find((value) => value.category_1_id === item.id)
      value.children.forEach((val) => {
        if (!isNil(item.tax_rate)) {
          val.tax_rate = item.tax_rate
        }
      })
    })
    onChange && onChange(category)
  }

  handleSearch = (index, subIndex) => {
    if (isNil(index) && isNil(subIndex)) {
      this.setState({ expand: {}, highlightIndex: null })
      return
    }
    this.setState(
      { expanded: { [index]: true }, highlightIndex: subIndex },
      () => {
        const Table = document
          .querySelector('#b-product')
          .querySelectorAll('.gm-table-x-tr')
        Table[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
        this._tableRef.current.scrollToItem(subIndex, 'start')
      }
    )
  }

  handleHighlight = (index) => {
    this.setState({ highlightIndex: index })
  }

  handleChangeTaxRate = (value, index, subIndex) => {
    const { category, onChange } = this.props
    category[index].children[subIndex].tax_rate = value
    onChange && onChange(category)
  }

  handleSubDelete = (index, subIndex) => {
    const { category, onChange } = this.props
    category[index].children.splice(subIndex, 1)
    onChange && onChange(category)
  }

  render() {
    const { spu, category, edit } = this.props
    const { expanded, highlightIndex } = this.state

    const count = edit
      ? category.length
        ? category
            .map((v) => v.children.length)
            .reduce((count, item) => count + item)
        : 0
      : spu.length

    return (
      <div
        className='gm-border gm-margin-lr-10 gm-padding-10'
        id='b-product'
        style={{ flex: 1 }}
      >
        <div className='gm-text-14'>
          <TableTotalText data={[{ label: t('商品数'), content: count }]} />
        </div>
        <Flex className='gm-margin-tb-10'>
          {edit && (
            <Button
              type='primary'
              className='gm-margin-right-10'
              onClick={this.handleOpenAddModal}
            >
              {t('添加商品')}
            </Button>
          )}
          {edit ? (
            <ProductSearch list={category} onSearch={this.handleSearch} />
          ) : (
            <Position
              placeholder={t('请输入商品名或商品ID')}
              onHighlight={this.handleHighlight}
              list={spu}
              tableRef={this._tableRef}
              filterText={['spu_name', 'spu_id']}
            />
          )}
          {edit && (
            <Button type='primary' onClick={this.handleOpenBatchSetModal}>
              {t('批量设置税率')}
            </Button>
          )}
        </Flex>
        {edit ? (
          <ExpandTableX
            columns={[
              { Header: t('一级分类'), accessor: 'category_1_name' },
              { Header: t('税率'), id: 'tax_rate' },
              {
                Header: OperationHeader,
                id: 'operation',
                Cell: (cellProps) => (
                  <OperationCell>
                    <Button
                      type='danger'
                      style={{ width: '22px', height: '22px' }}
                      className='gm-padding-0'
                      onClick={() => this.handleDelete(cellProps.row.index)}
                    >
                      <SvgMinus />
                    </Button>
                  </OperationCell>
                ),
              },
            ]}
            data={category}
            expanded={expanded}
            onExpand={this.handleExpand}
            SubComponent={({ original, index }) => (
              <ProductSubTable
                original={original}
                highlightIndex={highlightIndex}
                parentIndex={index}
                ref={this._tableRef}
                onChange={this.handleChangeTaxRate}
                onDelete={this.handleSubDelete}
              />
            )}
          />
        ) : (
          <TableXVirtualized
            columns={this.columns}
            refVirtualized={this._tableRef}
            isTrHighlight={(_, index) => index === highlightIndex}
            data={spu}
            virtualizedHeight={
              TABLE_X.HEIGHT_HEAD_TR +
              Math.min(10, spu.length) * TABLE_X.HEIGHT_TR
            }
            virtualizedItemSize={TABLE_X.HEIGHT_TR}
          />
        )}
      </div>
    )
  }
}

export default Product
