import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  MoreSelect,
  Price,
  InputNumber,
  Popover,
  Modal,
} from '@gmfe/react'
import store from './store'
import { Table, TableUtil, EditTable } from '@gmfe/table'
import { SvgWarningCircle } from 'gm-svg'
import { observer, Observer } from 'mobx-react'
import Big from 'big.js'
import InStockBatch from './in_stock_batch'
import _ from 'lodash'

@observer
class DetailTable extends React.Component {
  render() {
    const { detail } = store
    return (
      <Table
        data={detail.details}
        columns={[
          {
            Header: i18next.t('采购规格ID'),
            accessor: 'spec_id',
          },
          {
            Header: i18next.t('商品名称'),
            accessor: 'name',
          },
          {
            Header: i18next.t('商品分类'),
            accessor: 'category_2_name',
          },
          {
            Header: i18next.t('入库批次号'),
            accessor: 'batch_number',
          },
          {
            Header: i18next.t('关联入库单号'),
            accessor: 'in_stock_number',
          },
          {
            Header: i18next.t('入库数（基本单位）'),
            id: 'quantity',
            Cell: ({ original }) => {
              const { quantity, unit_name } = original
              return (
                <div>
                  {`${_.isNil(quantity) ? '-' : quantity}${unit_name || '-'}`}
                </div>
              )
            },
          },
          {
            Header: i18next.t('调整前单价'),
            id: 'old_price',
            Cell: ({ original }) => {
              const { old_price, unit_name } = original
              return (
                <div>
                  {`${_.isNil(old_price) ? '-' : old_price}${Price.getUnit()}/${
                    unit_name || '-'
                  }`}
                </div>
              )
            },
          },
          {
            Header: i18next.t('调整后单价'),
            id: 'new_price',
            Cell: ({ original }) => {
              const { new_price, unit_name } = original
              return (
                <div>{`${
                  _.isNil(new_price) ? '-' : new_price
                }${Price.getUnit()}/${unit_name || '-'}`}</div>
              )
            },
          },
          {
            Header: i18next.t('调整差异'),
            id: 'different_price',
            Cell: ({ original }) => {
              const { old_price, new_price, unit_name } = original
              return new_price && old_price ? (
                <div>
                  {parseFloat(
                    Big(new_price || 0)
                      .minus(old_price || 0)
                      .toFixed(2)
                  ) +
                    Price.getUnit() +
                    '/' +
                    (unit_name || '-')}
                </div>
              ) : (
                '-'
              )
            },
          },
          {
            Header: i18next.t('操作人'),
            accessor: 'operator',
          },
        ]}
      />
    )
  }
}

@observer
class DetailEditTable extends React.Component {
  handleSelect = (index, selected) => {
    // 切换商品，需要清空批次相关信息
    const { name, spec_id } = store.detail.details[index] || {}
    if (!selected || (name !== selected.text && spec_id !== selected.value)) {
      store.clearBatchSelected(index)
    }
    store.changeSkuSelected(index, selected)
  }

  handleSearch = (value) => {
    if (value) {
      setTimeout(() => store.getSkuList(value), 500)
    } else {
      store.clearSkuList()
    }
  }

  handleSelectBatchNum = (index, spec_id, batch_number) => {
    const disableList = _.map(
      _.filter(
        store.detail.details,
        (s, i) => index !== i && s.spec_id && s.batch_number
      ),
      (d) => d.spec_id + '_' + d.batch_number
    )
    Modal.render({
      children: (
        <InStockBatch
          spec_id={spec_id}
          index={index}
          batch_number={batch_number}
          disableList={disableList}
        />
      ),
      title: i18next.t('选择关联入库批次'),
      size: 'lg',
      onHide: Modal.hide,
    })
  }

  handleChangeValue = (index, value) => {
    store.changeSku(index, 'new_price', value)
  }

  render() {
    const { detail, skuList } = store
    const dataList = detail.details.length ? detail.details.slice() : [{}]

    return (
      <EditTable
        data={dataList}
        columns={[
          {
            Header: i18next.t('商品名称'),
            id: 'name',
            Cell: ({ original, index }) => {
              return (
                <Observer>
                  {() => {
                    const { name, spec_id } = original
                    return (
                      <MoreSelect
                        data={skuList}
                        selected={{ text: name, value: spec_id }}
                        onSelect={this.handleSelect.bind(this, index)}
                        onSearch={this.handleSearch}
                        placeholder={i18next.t('请输入商品名搜索')}
                        renderListFilterType='pinyin'
                      />
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: i18next.t('商品分类'),
            accessor: 'category_2_name',
          },
          {
            Header: i18next.t('入库批次号'),
            id: 'batch_number',
            Cell: ({ original, index }) => {
              const { batch_number, spec_id } = original
              return spec_id ? (
                <a
                  className='gm-cursor'
                  onClick={this.handleSelectBatchNum.bind(
                    this,
                    index,
                    spec_id,
                    batch_number
                  )}
                >
                  {batch_number || i18next.t('选择入库批次')}
                </a>
              ) : (
                '-'
              )
            },
          },
          {
            Header: i18next.t('关联入库单号'),
            accessor: 'in_stock_number',
          },
          {
            Header: i18next.t('入库数（基本单位）'),
            id: 'quantity',
            Cell: ({ original }) => {
              const { quantity, unit_name } = original
              return <div>{`${quantity || '-'}${unit_name || '-'}`}</div>
            },
          },
          {
            Header: i18next.t('调整前单价'),
            id: 'old_price',
            Cell: ({ original }) => {
              const { old_price, unit_name } = original
              return (
                <div>{`${old_price || '-'}${Price.getUnit()}/${
                  unit_name || '-'
                }`}</div>
              )
            },
          },
          {
            Header: i18next.t('调整后单价'),
            id: 'new_price',
            width: 150,
            Cell: ({ original, index }) => {
              return (
                <Observer>
                  {() => {
                    const { new_price, old_price, unit_name } = original
                    return (
                      <Flex alignCenter>
                        <InputNumber
                          className='form-control'
                          style={{ width: 90, height: 30 }}
                          value={new_price || ''}
                          precision={2}
                          min={0}
                          onChange={this.handleChangeValue.bind(this, index)}
                        />
                        <div className='gm-margin-lr-5'>{`${Price.getUnit()}/${
                          unit_name || '-'
                        }`}</div>
                        {new_price &&
                          old_price &&
                          Number(new_price) === Number(old_price) && (
                            <Popover
                              showArrow
                              type='hover'
                              popup={
                                <div className='gm-padding-5'>
                                  {i18next.t('调整后单价不可与调整前单价相同')}
                                </div>
                              }
                            >
                              <div className='gm-text-red'>
                                <SvgWarningCircle />
                              </div>
                            </Popover>
                          )}
                      </Flex>
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: i18next.t('调整差异'),
            id: 'different_price',
            Cell: ({ original }) => {
              return (
                <Observer>
                  {() => {
                    const { old_price, new_price, unit_name } = original
                    return new_price && old_price ? (
                      <div>
                        {parseFloat(
                          Big(new_price || 0)
                            .minus(old_price || 0)
                            .toFixed(2)
                        ) +
                          Price.getUnit() +
                          '/' +
                          (unit_name || '-')}
                      </div>
                    ) : (
                      '-'
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: i18next.t('操作人'),
            accessor: 'operator',
          },
          {
            Header: TableUtil.OperationHeader,
            fixed: 'left',
            width: 100,
            Cell: ({ index }) => (
              <TableUtil.EditTableOperation
                onAddRow={() => store.addSku(index)}
                onDeleteRow={() => store.deleteSku(index)}
              />
            ),
          },
        ]}
      />
    )
  }
}

export { DetailTable, DetailEditTable }
