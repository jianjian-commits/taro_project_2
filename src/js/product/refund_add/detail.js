/* eslint-disable react/prop-types */
import { Price, Tip, ToolTip, BoxPanel } from '@gmfe/react'
import {
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableX,
  diyTableXHOC,
  TableXUtil,
} from '@gmfe/table-x'
import { i18next } from 'gm-i18n'
import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  keyboardTableXHOC,
  KCInputNumberV2,
  KCMoreSelect,
  KCInput,
} from '@gmfe/keyboard'
import { observer, Observer } from 'mobx-react'
import refundAddStore from './store'
import Big from 'big.js'
import globalStore from '../../stores/global'
import selectBatch from './batch_select'
import KeyBoardTips from '../../common/components/key_board_tips'
import TaxRateCell from './components/tax_rate_cell'
import TaxMoneyCell from './components/tax_money_cell'
import ReturnMoneyNoTaxCell from './components/return_money_no_tax_cell'
import _ from 'lodash'
import { t } from 'gm-i18n'
import '../../common/components/tree_list/tree_list.less'

const { OperationHeader, EditOperation, TABLE_X } = TableXUtil
const KeyboardFixedColumnsEditTableX = fixedColumnsTableXHOC(
  keyboardTableXHOC(editTableXHOC(diyTableXHOC(TableX))),
)

const CellMoreSelect = observer((props) => {
  const { index, placeholder } = props

  const [skuList, setSkuList] = useState([])

  const handleSearch = (query) => {
    if (_.trim(query)) {
      return refundAddStore.searchSkuList(query).then((json) => {
        const target_supplier = _.forIn(json.data.target_supplier, (item) => {
          item.type = 'target'
        })
        const other_supplier = _.forIn(json.data.other_supplier, (item) => {
          item.type = 'other'
        })
        const list = _.map(
          Object.assign(target_supplier, other_supplier),
          (item) => {
            return {
              label: (
                <div>
                  {item.category_name}
                  <span
                    className='gm-margin-left-5 gm-inline-block '
                    style={{
                      border: '1px solid #798294',
                      borderRadius: '2px',
                      padding: '2px',
                    }}
                  >
                    {t(
                      `${item.type === 'target' ? '当前供应商' : '其他供应商'}`,
                    )}
                  </span>
                </div>
              ),
              children: _.map(item.skus, (sku) => {
                const {
                  sku_id,
                  sku_name,
                  sale_ratio,
                  std_unit_name,
                  sale_unit_name,
                } = sku
                return {
                  value: sku_id,
                  text: `${sku_name} (${sale_ratio}${std_unit_name}/${sale_unit_name})`,
                  sku,
                  tax_rate: item.tax_rate,
                }
              }),
            }
          },
        )
        setSkuList(list)
      })
    }
  }
  const handleSelect = (selected) => {
    const { id } = refundAddStore.data.details[index]
    const { stock_method } = globalStore.user
    if (selected) {
      refundAddStore.setDetailBatch(index, {
        id: selected.value,
        name: selected.text,
        category: `${selected.sku.category_id_1_name}/${selected.sku.category_id_2_name}`,
        spu_id: selected.sku.spu_id,
        std_unit: selected.sku.std_unit_name,
        tax_rate: selected.tax_rate,
      })
    } else {
      refundAddStore.setDetailBatch(index, {
        id: null,
        name: null,
        category: null,
        spu_id: null,
        std_unit: null,
        tax_rate: null,
      })
    }

    // 清空batch_number
    if (stock_method === 2 && (!selected || selected.value !== id)) {
      refundAddStore.setDetail(index, 'batch_number', null)
      refundAddStore.setDetail(index, 'remain', null)
    }
  }

  // eslint-disable-next-line react/prop-types
  const renderProductItem = ({ text, sku }) => {
    return (
      <div>
        <span className='gm-margin-right-5'>{text}</span>
        <span
          className='tree-station'
          style={{
            marginRight: '4px',
            padding: '0px 1px',
          }}
        >
          {sku.p_type === 0 ? i18next.t('通用') : i18next.t('本站')}
        </span>
        {sku.sku_active_count ? (
          <span className='gm-text-primary'>
            {t('在售')}:{sku.sku_active_count}
          </span>
        ) : (
          <span className='gm-text-red'>{t('暂无在售')}</span>
        )}
      </div>
    )
  }

  const { details } = refundAddStore.data

  let selected = null
  // 如果选择了
  if (details[index] && details[index].id) {
    selected = {
      value: details[index].id,
      text: details[index].name,
    }
  }

  return (
    <KCMoreSelect
      style={{ width: TABLE_X.WIDTH_SEARCH }}
      isGroupList
      data={skuList}
      selected={selected}
      onSearch={handleSearch}
      onSelect={handleSelect}
      renderListFilterType='pinyin'
      renderListItem={renderProductItem}
      placeholder={i18next.t(placeholder)}
      renderListFilter={(data) => {
        return data
      }}
    />
  )
})

CellMoreSelect.propTypes = {
  index: PropTypes.number.isRequired,
}

const CellNumber = observer((props) => {
  const { index, field } = props
  const { details } = refundAddStore.data

  const value = details[index][field]

  const handleChange = (value) => {
    refundAddStore.setDetail(index, field, value)
  }

  return (
    <KCInputNumberV2
      autocomplete='off'
      value={value}
      onChange={handleChange}
      className='form-control gm-inline-block'
      style={{ width: TABLE_X.WIDTH_NUMBER }}
      min={0}
    />
  )
})

CellNumber.propTypes = {
  index: PropTypes.number.isRequired,
  field: PropTypes.string.isRequired,
}

const Anomaly = () => {
  return (
    <ToolTip
      right
      popup={
        <div className='gm-padding-10'>
          {i18next.t('所选批次库存数小于退货数，请更改批次或修改退货数')}
        </div>
      }
    >
      <span className='gm-text-red'>异常</span>
    </ToolTip>
  )
}

const CellInput = observer((props) => {
  const { index, len } = props
  const { details } = refundAddStore.data

  const value = details[index].spu_remark

  const handleChange = (e) => {
    refundAddStore.setDetail(index, 'spu_remark', e.target.value)
  }

  return (
    <KCInput
      type='text'
      maxLength={len || 50}
      name='spu_remark'
      className='gm-paddingLR5 form-control'
      value={value}
      onChange={handleChange}
    />
  )
})

CellInput.propTypes = {
  index: PropTypes.number.isRequired,
}

const Detail = observer(() => {
  const { details } = refundAddStore.data

  const columns = useMemo(
    () =>
      [
        {
          Header: i18next.t('序号'),
          Cell: ({ row }) => row.index + 1,
          fixed: 'left',
          id: 'number',
          width: TABLE_X.WIDTH_NO,
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: OperationHeader,
          fixed: 'left',
          diyGroupName: i18next.t('基础字段'),
          diyItemText: i18next.t('操作'),
          width: TABLE_X.WIDTH_OPERATION,
          id: 'operation',
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => (
            <EditOperation
              onAddRow={() => {
                // eslint-disable-next-line react/prop-types
                refundAddStore.addDetail()
              }}
              onDeleteRow={
                refundAddStore.data.details.length > 1
                  ? // eslint-disable-next-line react/prop-types
                    () => refundAddStore.removeDetail(row.index)
                  : null
              }
            />
          ),
        },
        {
          Header: i18next.t('商品名'),
          isKeyboard: true,
          diyEnable: false,
          accessor: 'id',
          minWidth: 200,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => {
            // eslint-disable-next-line react/prop-types
            return (
              <CellMoreSelect
                // eslint-disable-next-line react/prop-types
                index={row.index}
                placeholder={i18next.t('输入采购规格名')}
              />
            )
          },
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: i18next.t('商品分类'),
          accessor: 'category',
          minWidth: 100,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => (
            // eslint-disable-next-line react/prop-types
            <Observer>{() => <div>{row.original.category}</div>}</Observer>
          ),
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: i18next.t('退货数'),
          isKeyboard: true,
          diyEnable: false,
          accessor: 'quantity',
          minWidth: 140,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => (
            <Observer>
              {() => (
                <div>
                  {/* eslint-disable-next-line react/prop-types */}
                  <CellNumber index={row.index} field='quantity' />
                  &nbsp;
                  {/* eslint-disable-next-line react/prop-types */}
                  {row.original.std_unit || '-'}
                </div>
              )}
            </Observer>
          ),
          diyGroupName: i18next.t('基础字段'),
        },
        globalStore.user.stock_method === 2 && {
          Header: i18next.t('退货批次'),
          minWidth: 120,
          diyEnable: true,
          id: 'batch',
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => {
            return (
              <Observer>
                {() => {
                  // eslint-disable-next-line react/prop-types
                  const { batch_number, quantity, remain } = row.original
                  const isAnomaly =
                    batch_number && quantity && quantity > remain
                  return (
                    <a
                      href='javascript:;'
                      /* eslint-disable-next-line react/prop-types */
                      onClick={() => handleBatch(row.index)}
                    >
                      {batch_number ? '查看批次' : '选择批次'}
                      {!!isAnomaly && <Anomaly />}
                    </a>
                  )
                }}
              </Observer>
            )
          },
          width: 100,
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: i18next.t('退货单价'),
          isKeyboard: true,
          accessor: 'unit_price',
          diyEnable: false,
          minWidth: 150,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => (
            <Observer>
              {() => (
                <div>
                  {/* eslint-disable-next-line react/prop-types */}
                  <CellNumber index={row.index} field='unit_price' />
                  &nbsp;
                  {Price.getUnit() + '/'}
                  {/* eslint-disable-next-line react/prop-types */}
                  {row.original.std_unit || '-'}
                </div>
              )}
            </Observer>
          ),
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: i18next.t('补差'),
          diyEnable: false,
          id: 'different_price',
          minWidth: 80,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => (
            <Observer>
              {() => {
                // eslint-disable-next-line react/prop-types
                if (row.original.different_price === null) {
                  return '-'
                } else {
                  return (
                    // eslint-disable-next-line react/prop-types
                    Big(row.original.different_price || 0).toFixed(2) +
                    Price.getUnit()
                  )
                }
              }}
            </Observer>
          ),
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: i18next.t('退货金额'),
          minWidth: 140,
          diyEnable: false,
          isKeyboard: true,
          accessor: 'money',
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => (
            <div>
              {/* eslint-disable-next-line react/prop-types */}
              <CellNumber index={row.index} field='money' />
              &nbsp;
              {Price.getUnit()}
            </div>
          ),
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: i18next.t('退货金额（不含税）'),
          id: 'return_money_no_tax',
          minWidth: 140,
          diyGroupName: i18next.t('基础字段'),
          Cell: (cellProps) => (
            <ReturnMoneyNoTaxCell index={cellProps.row.index} />
          ),
        },
        {
          Header: i18next.t('进项税率'),
          id: 'tax_rate',
          diyGroupName: i18next.t('基础字段'),
          minWidth: 100,
          Cell: (cellProps) => <TaxRateCell index={cellProps.row.index} />,
        },
        {
          Header: i18next.t('进项税额'),
          id: 'tax_money',
          diyGroupName: i18next.t('基础字段'),
          minWidth: 140,
          Cell: (cellProps) => <TaxMoneyCell index={cellProps.row.index} />,
        },
        {
          Header: i18next.t('商品退货备注'),
          minWidth: 140,
          isKeyboard: true,
          accessor: 'spu_remark',
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => <CellInput index={row.index} len={15} />,
          diyGroupName: i18next.t('基础字段'),
        },
        {
          Header: i18next.t('操作人'),
          accessor: 'operator',
          minWidth: 100,
          diyGroupName: i18next.t('基础字段'),
        },
      ].filter((item) => item),
    [globalStore.user.stock_method],
  )

  const handleAddRow = () => {
    refundAddStore.addDetail()
  }

  const handleBatch = (index) => {
    const data = details[index]
    const canSelect = data.id && data.quantity

    if (!canSelect) {
      Tip.warning(i18next.t('请先填写商品名和退货数'))
      return false
    }

    // 先进先出选择商品后 将批次库存均价设置为退货单价
    selectBatch(data).then(({ batch_number, remain, avg_price }) => {
      refundAddStore.setDetail(index, 'batch_number', batch_number)
      refundAddStore.setDetail(index, 'remain', remain)
      refundAddStore.setDetail(index, 'unit_price', avg_price)
    })
  }

  return (
    <BoxPanel
      summary={[{ text: i18next.t('合计'), value: details.length }]}
      title={i18next.t('退货商品明细')}
      collapse
      right={<KeyBoardTips />}
    >
      <KeyboardFixedColumnsEditTableX
        id='keyboard_refund_add'
        diyGroupSorting={[i18next.t('基础字段')]}
        onAddRow={handleAddRow}
        loading={refundAddStore.loading}
        data={details.slice()}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default Detail
