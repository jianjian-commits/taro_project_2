import React from 'react'
import { Flex } from '@gmfe/react'
import { TableX } from '@gmfe/table-x'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'

import { history } from 'common/service'
import globalStore from 'stores/global'

const OutStockConfirm = (props) => {
  const { list, single, canOutStock } = props

  const allowNegativeOutOfStockInfo = () => {
    return (
      <Flex column>
        <p>{i18next.t('您可以：')}</p>
        <p>
          {i18next.t('1. 点击')}“<strong>{i18next.t('继续出库')}</strong>”
          {i18next.t('后继续出库，')}
          <span className='gm-text-red'>{i18next.t('出库后库存为负')}</span>
        </p>
        <p>
          {i18next.t('2. 点击')}“<strong>{i18next.t('取消操作')}</strong>”
          {i18next.t('后在“商品盘点”中修改库存，或在“出库单”中修改出库数')}
        </p>
      </Flex>
    )
  }

  const handleToSystemSetting = (event) => {
    event.preventDefault()
    props.onHide()
    history.push('/system/setting/system_setting?activeType=sales_invoicing')
  }

  const notAllowNegativeOutOfStock = () => {
    // 区分批量出库及单个出库文案，单个库存为负不允许出库
    return (
      <Flex column className='gm-margin-top-10'>
        {!single && (
          <p>
            {canOutStock && (
              <span>{i18next.t('继续出库将只出库满足库存条件的出库单')}</span>
            )}
          </p>
        )}
        {single && <p>{i18next.t('库存不足，不允许出库')}</p>}
        <p>
          {!single && <span>{i18next.t('不满足库存条件的出库单')}</span>}
          <span>{i18next.t('仍要出库请前往 ')}</span>
          <a onClick={handleToSystemSetting} className='gm-cursor'>
            {i18next.t('系统设置')}
          </a>
          {i18next.t(' 修改进销存设置')}
        </p>
      </Flex>
    )
  }

  const renderTableInfo = () => {
    const { isNegativeAllow } = globalStore.otherInfo
    return isNegativeAllow
      ? allowNegativeOutOfStockInfo()
      : notAllowNegativeOutOfStock()
  }

  return (
    <Flex flex={1} column style={{ maxHeight: '300px', overflow: 'auto' }}>
      {/* 净菜沿用默认逻辑，即开启允许出库 */}
      {!!globalStore.otherInfo.isNegativeAllow && (
        <p>{i18next.t('以下商品出库后将导致库存不足, 确认出库？')}</p>
      )}
      {renderTableInfo()}
      <Flex column className='gm-padding-tb-5'>
        <TableX
          data={list.slice()}
          columns={[
            {
              Header: i18next.t('商品ID'),
              accessor: 'spu_id',
            },
            {
              Header: i18next.t('商品名'),
              accessor: 'spu_name',
            },
            {
              Header: i18next.t('出库数'),
              accessor: 'quantity',
            },
            {
              Header: i18next.t('当前剩余库存'),
              accessor: 'remain',
            },
          ]}
        />
      </Flex>
    </Flex>
  )
}

OutStockConfirm.propTypes = {
  list: PropTypes.array,
  isNegativeAllow: PropTypes.bool,
  onHide: PropTypes.func,
  single: PropTypes.bool,
  canOutStock: PropTypes.bool,
}

export default OutStockConfirm
