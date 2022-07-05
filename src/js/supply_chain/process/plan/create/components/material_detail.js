import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import DetailSvg from 'svg/detail.svg'
import { RightSideModal } from '@gmfe/react'
import { t } from 'gm-i18n'
import { TableX } from '@gmfe/table-x'
import { remarkType } from 'common/filter'
import Big from 'big.js'

const MaterialTable = observer((props) => {
  const { materialDetail } = store
  const { sku_id, plan_amount } = props.productData

  useEffect(() => {
    store.fetchMaterialDetail({ sku_id: sku_id })
  }, [])

  const columns = [
    {
      Header: t('物料名'),
      accessor: 'ingredient_name',
    },
    {
      Header: t('物料类型'),
      accessor: 'remark_type',
      Cell: (cellProps) => {
        const { remark_type } = cellProps.row.original
        return remarkType(remark_type)
      },
    },
    {
      Header: t('所需数量（基本单位）'),
      accessor: 'plan_amount',
      Cell: (cellProps) => {
        const { proportion, std_unit_name } = cellProps.row.original

        return (
          Big(proportion || 0) // 计划生成数和数量间的换算
            .times(plan_amount || 0)
            .toFixed(2) + std_unit_name
        )
      },
    },
    {
      Header: t('所需数量（包装单位）'),
      accessor: 'sale_plan_amount',
      Cell: (cellProps) => {
        const { proportion, sale_unit_name, ratio } = cellProps.row.original

        return (
          Big(proportion || 0) // 计划生成数和数量间的换算
            .times(plan_amount || 0)
            .div(ratio)
            .toFixed(2) + sale_unit_name
        )
      },
    },
    {
      Header: t('当前库存'),
      accessor: 'ingredient_stock',
      Cell: (cellProps) => {
        const {
          std_unit_name,
          sale_unit_name,
          ingredient_stock,
          sale_ingredient_stock, // 物料销售库存数
        } = cellProps.row.original

        const std = `${Big(ingredient_stock || 0).toFixed(2)}${std_unit_name}`
        const saleAndStd = `${sale_ingredient_stock}${sale_unit_name} (${std})`

        const isStdNameReqSaleName = std_unit_name === sale_unit_name
        let showText = std

        // 当有基本单位和销售单位不同并且有销售库存数时才显示sale
        if (!isStdNameReqSaleName && sale_ingredient_stock) {
          showText = saleAndStd
        }

        return showText
      },
    },
  ]

  return (
    <TableX
      data={materialDetail.slice()}
      columns={columns}
      className='gm-margin-top-10'
    />
  )
})

const MaterialDetail = observer((props) => {
  const { data } = props
  const { sku_id } = data

  const handleShowDetail = () => {
    RightSideModal.render({
      children: <MaterialTable productData={data} />,
      onHide: RightSideModal.hide,
      title: t('物料明细'),
    })
  }

  return sku_id ? (
    <div onClick={handleShowDetail}>
      <DetailSvg style={{ fontSize: '18px' }} />
    </div>
  ) : null
})

export default MaterialDetail
