import React, { useCallback } from 'react'
import { keyboardTableXHOC, KCSelect } from '@gmfe/keyboard'
import { Dialog, Select } from '@gmfe/react'
import {
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableXVirtualized,
  TableXUtil,
  selectTableXHOC,
} from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import {
  ProductNameCell,
  OperationHeaderCell,
  PercentageCell,
} from './table_cell'
import store from './goods_store'

const KeyboardVirtualTable = selectTableXHOC(
  keyboardTableXHOC(fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized))),
)

const { OperationHeader, TABLE_X } = TableXUtil

const EditList = observer((props) => {
  const { labelList, searchIndex, refList } = props
  const { skus, skusListSelected, enable_label_2, handleItemChange } = store
  // 转成select data的数据结构
  const selectLabelList = _.map(labelList, (item) => {
    return {
      value: item.id,
      text: item.name,
    }
  })
  const handleDetailAdd = useCallback((index) => {
    store.addSkusListItem(index === undefined ? store.skus.length - 1 : index)
  }, [])

  const handleSelected = useCallback(
    (selected, index) => {
      const res = _.filter(labelList, (item) => selected === item.id)
      store.setSkusListItem(index, {
        ...skus[index],
        label_2_id: res[0].id,
        label_2_name: res[0].name,
      })
    },
    [skus, labelList],
  )

  const limit = 9
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR + Math.min(limit, skus.length) * TABLE_X.HEIGHT_TR

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns = React.useMemo(() => {
    return [
      {
        Header: t('序号'),
        accessor: 'num',
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return <span>{index + 1}</span>
        },
      },
      {
        Header: OperationHeader,
        accessor: 'action',
        diyItemText: t('操作'),
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          return (
            <OperationHeaderCell
              index={cellProps.row.index}
              onAddRow={handleDetailAdd}
            />
          )
        },
      },
      {
        Header: t('商品ID'),
        accessor: 'id',
        minWidth: 150,
      },
      {
        Header: t('商品名'),
        accessor: 'name',
        minWidth: 300,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ProductNameCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('规格'),
        accessor: 'std_unit_name',
        minWidth: 100,
        Cell: (cellProps) => {
          const { original } = cellProps.row
          const { sale_ratio, std_unit_name_forsale, sale_unit_name } = original
          return sale_ratio && std_unit_name_forsale && sale_unit_name ? (
            <span>
              {`${sale_ratio}${std_unit_name_forsale}/${sale_unit_name}`}
            </span>
          ) : (
            ''
          )
        },
      },
      {
        Header: t('报价单简称'),
        accessor: 'salemenu_name',
        minWidth: 240,
      },
      {
        Header: t('分佣比例'),
        accessor: 'percentage',
        minWidth: 80,
        isKeyboard: true,
        Cell: (d) => (
          <PercentageCell
            sku={d.row.original}
            index={d.row.index}
            skuProperty='percentage'
          />
        ),
      },
      {
        Header: t('销售状态'),
        accessor: 'state',
        minWidth: 100,
        Cell: (cellProps) => {
          const { original } = cellProps.row
          if (original.state === undefined) {
            return ''
          } else {
            const bg_color = original.state ? '#56A3F2' : '#e8eaf0'
            return (
              <span
                className='text-center gm-padding-5'
                style={{
                  backgroundColor: bg_color,
                  color: '#ffffff',
                }}
              >
                {original.state ? t('上架') : t('下架')}
              </span>
            )
          }
        },
      },
      {
        Header: t('二级标签'),
        minWidth: 200,
        accessor: 'label_2_name',
        show: !!enable_label_2,
        isKeyboard: true,
        Cell: (cellProps) => {
          const { original, index } = cellProps.row
          return (
            <KCSelect
              data={selectLabelList}
              value={original.label_2_id}
              placeholder={t('请选择')}
              onChange={(select) => handleSelected(select, index)}
            />
          )
        },
      },
    ]
  }, [
    handleDetailAdd,
    skus,
    enable_label_2,
    handleItemChange,
    handleSelected,
    selectLabelList,
  ]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  const handleTableSelect = useCallback((selected) => {
    store.changeSkusListSelected(selected)
  }, [])

  const handleTableSelectAll = useCallback((isSelectAll) => {
    store.changeSkusListSelectedAll(isSelectAll)
  }, [])

  const handleBatchSelected = (selected) => {
    const res = _.filter(labelList, (item) => selected === item.id)
    store.setLabel2Select(res[0])
  }

  const handleHighLight = useCallback(
    (data, index) => {
      if (searchIndex !== null && searchIndex === index) {
        return true
      } else {
        return false
      }
    },
    [searchIndex],
  )

  const handleBatchSetLabel = () => {
    Dialog.confirm({
      title: t('批量更改二级标签'),
      size: 'sm',
      children: (
        <Observer>
          {() => (
            <div>
              <span>{t('二级标签：')}</span>
              <Select
                value={store.label_2_selected.id}
                onChange={handleBatchSelected}
                data={selectLabelList}
              />
            </div>
          )}
        </Observer>
      ),
      onOK: () => {
        _.forEach(skus.slice(), (item, index) => {
          if (_.includes(skusListSelected.slice(), item.id)) {
            store.setSkusListItem(index, {
              ...item,
              label_2_id: store.label_2_selected.id,
              label_2_name: store.label_2_selected.name,
            })
          }
        })
      },
    })
  }

  const handleBatchDelete = () => {
    const currentList = _.filter(store.skus, (item) => {
      return !_.includes(store.skusListSelected, item.id)
    })

    store.setSkuList(currentList)
    // 删除的时候需要将selected去掉该数据
    store.changeSkusListSelected([])
  }

  return (
    <KeyboardVirtualTable
      onAddRow={handleDetailAdd}
      virtualizedItemSize={TABLE_X.HEIGHT_TR}
      virtualizedHeight={tableHeight}
      data={skus.slice()}
      columns={columns}
      keyField='id'
      fixedSelect
      loading={false}
      refVirtualized={refList}
      id='market_tag_edit_table'
      selected={skusListSelected.slice()}
      onSelect={handleTableSelect}
      isTrHighlight={handleHighLight}
      batchActionBar={
        skusListSelected.length ? (
          <TableXUtil.BatchActionBar
            pure
            onClose={() => handleTableSelectAll(false)}
            count={skusListSelected.length}
            batchActions={[
              {
                name: t('批量修改二级标签'),
                onClick: handleBatchSetLabel,
                show: !!enable_label_2,
              },
              {
                name: t('批量删除'),
                onClick: handleBatchDelete,
              },
            ]}
          />
        ) : null
      }
    />
  )
})

export default EditList
