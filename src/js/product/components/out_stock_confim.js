import React, { Component } from 'react'
import { Flex, Sheet, SheetColumn } from '@gmfe/react'
import { i18next } from 'gm-i18n'

class OutStockConfim extends Component {
  renderTable() {
    const { list } = this.props
    return (
      <Sheet list={list}>
        <SheetColumn field='spu_id' name={i18next.t('商品ID')} />
        <SheetColumn field='spu_name' name={i18next.t('商品名')} />
        <SheetColumn field='quantity' name={i18next.t('出库数')} />
        <SheetColumn field='remain' name={i18next.t('当前剩余库存')} />
      </Sheet>
    )
  }

  render() {
    return (
      <Flex flex={1} column style={{ maxHeight: '300px', overflow: 'auto' }}>
        <p>{i18next.t('以下商品出库后将导致库存不足, 确认出库？')}</p>
        <Flex column className='gm-padding-tb-5'>
          {this.renderTable()}
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
        </Flex>
      </Flex>
    )
  }
}

export default OutStockConfim
