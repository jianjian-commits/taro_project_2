import React from 'react'
import { observer } from 'mobx-react'
import { Flex, Button } from '@gmfe/react'
import { t } from 'gm-i18n'
import { Table } from '@gmfe/table'
import store from '../../store'
import Big from 'big.js'

const ReplaceProductModal = observer((props) => {
  const { waitForReplaceProductData } = store
  const { onCancel, onCover, onNotCover } = props

  const columns = [
    {
      Header: t('商品'),
      accessor: 'product',
      Cell: (cellProps) => {
        const { sku_id, sku_name } = cellProps.original
        return (
          <>
            {sku_name}
            <br />
            {sku_id}
          </>
        )
      },
    },
    {
      Header: t('销售规格'),
      accessor: 'sale_ratio',
      Cell: (cellProps) => {
        const { sale_ratio, std_unit_name, sale_unit_name } = cellProps.original
        return sale_ratio + std_unit_name + '/' + sale_unit_name
      },
    },
    {
      Header: t('建议计划生产数'),
      accessor: 'product',
      Cell: (cellProps) => {
        const { suggest_plan_amount, sale_unit_name } = cellProps.original

        return Big(suggest_plan_amount).toFixed(2) + sale_unit_name
      },
    },
    {
      Header: t('计划生产数'),
      accessor: 'product',
      Cell: (cellProps) => {
        const { suggest_plan_amount, sale_unit_name } = cellProps.original

        return Big(suggest_plan_amount).toFixed(2) + sale_unit_name
      },
    },
  ]

  return (
    <Flex column>
      <span className='gm-padding-bottom-10'>
        {t('以下商品已添加，是否覆盖原商品计划生产数？')}
      </span>
      <Table data={waitForReplaceProductData.slice()} columns={columns} />
      <span className='gm-margin-top-10'>{t('您可以：')}</span>
      <span>{t('1.点击“否，不覆盖”后，已添加商品仍以原计划生产数为准；')}</span>
      <span>{t('2.点击“是，覆盖”后，已添加商品以建议计划生产数为准。')}</span>
      <Flex justifyCenter alignCenter className='gm-margin-top-20'>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <Button
          type='primary'
          plain
          onClick={onNotCover}
          className='gm-margin-left-10'
        >
          {t('否，不覆盖')}
        </Button>
        <Button type='primary' onClick={onCover} className='gm-margin-left-10'>
          {t('是，覆盖')}
        </Button>
      </Flex>
    </Flex>
  )
})

export default ReplaceProductModal
