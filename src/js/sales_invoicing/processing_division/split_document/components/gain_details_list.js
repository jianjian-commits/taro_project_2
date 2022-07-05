import React, { useContext, useMemo } from 'react'
import { observer } from 'mobx-react'
import { TableXUtil, TableX } from '@gmfe/table-x'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import { BoxPanel } from '@gmfe/react'
import { t } from 'gm-i18n'
// import TableHeaderSettingHover from 'common/components/table_header_setting_hover'
// import globalStore from 'stores/global'
// import { history } from 'common/service'
import RealQuantityCell from './real_quantity_cell'
import InStockPriceCell from './in_stock_price_cell'
import { storeContext } from './details_component'
import Big from 'big.js'
import RemainQuantityCell from './remain_quantity_cell'

const KeyboardTableX = keyboardTableXHOC(TableX)
const {
  TABLE_X: { WIDTH_NO },
} = TableXUtil

const GainDetailsList = () => {
  const columns = useMemo(
    () => [
      {
        Header: t('序号'),
        width: WIDTH_NO,
        accessor: 'no',
        Cell: (cellProps) => cellProps.row.index + 1,
      },
      {
        Header: t('获得品'),
        accessor: 'spu',
        Cell: (cellProps) => {
          const { spu_name } = cellProps.row.original
          return spu_name
        },
      },
      { Header: t('单位'), accessor: 'std_unit_name' },
      {
        Header: t('参考分割系数'),
        accessor: 'split_ratio',
        Cell: (cellProps) => {
          const { split_ratio } = cellProps.row.original
          return Big(split_ratio).toFixed(2)
        },
      },
      {
        Header: t('参考获得量'),
        accessor: 'remain_quantity',
        Cell: (cellProps) => {
          return <RemainQuantityCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('实际获得量'),
        accessor: 'real_quantity',
        isKeyboard: true,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return <RealQuantityCell index={index} />
        },
      },
      {
        Header: <InStockPriceHeader />,
        accessor: 'in_stock_price',
        isKeyboard: true,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return <InStockPriceCell index={index} />
        },
      },
    ],
    [],
  )

  const { gainSpus, loading } = useContext(storeContext)

  return (
    <BoxPanel title={t('获得品明细')} collapse>
      <KeyboardTableX
        onAddRow={() => {}}
        id='gain_details_list'
        columns={columns}
        loading={loading}
        data={gainSpus.slice()}
      />
    </BoxPanel>
  )
}

export default observer(GainDetailsList)

const InStockPriceHeader = () => {
  // 这一期先不做
  return t('入库价（基本单位）')
  // const inStockRefPriceType = globalStore.otherInfo.inStockRefPrice
  //
  // const handlePush = () => {
  //   history.push('/system/setting/system_setting?activeType=sales_invoicing')
  // }
  //
  // return (
  //   <TableHeaderSettingHover
  //     currentSettingType={inStockRefPriceType}
  //     title={t('入库价（基本单位）')}
  //     onSettingClick={handlePush}
  //   />
  // )
}
