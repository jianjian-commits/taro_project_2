import React from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  Form,
  FormBlock,
  FormButton,
  FormItem,
  Button,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import store from '../store/receipt_store'

const BatchHeader = observer((props) => {
  const { index } = props

  const { q } = store.batchFilter
  const {
    quantity,
    sale_unit_name,
    real_std_count,
    std_unit_name,
    clean_food,
  } = store.outStockList[index]

  const { unAssignedNum } = store
  const handleSearch = () => {
    store.fetchBatchList()
  }

  const handleInputChange = (e) => {
    store.changeBatchFilter('q', e.target.value)
  }

  const isShowDiffUnit = sale_unit_name === std_unit_name
  // quantity为销售单位值
  const saleText = quantity + sale_unit_name
  const amount = parseFloat(Big(real_std_count || 0).toFixed(2))
  const stdText = amount + std_unit_name // 供港需要计算计量单位
  const diffStockAmountText = clean_food
    ? `${saleText}(${stdText})` // 销售单位（基本单位）
    : `${stdText}(${saleText})` // 基本单位（销售单位）

  // 若基本单位和销售单位相同，则仅显示销售单位
  const outStockAmountText = isShowDiffUnit ? saleText : diffStockAmountText

  return (
    <>
      <Flex className='gm-margin-15'>
        <Form onSubmit={handleSearch} disabledCol>
          <FormBlock inline>
            <FormItem label={t('搜索')}>
              <input
                value={q}
                onChange={handleInputChange}
                className='form-control'
                type='text'
                placeholder={
                  clean_food
                    ? t('请输入批次号搜索') // 成品没有供应商
                    : t('请输入供应商或批次号搜索')
                }
                style={{ width: '200px' }}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {t('搜索')}
              </Button>
            </FormButton>
          </FormBlock>
        </Form>
      </Flex>
      <Flex className='gm-margin-15'>
        <div className='gm-margin-right-15'>
          {t('出库数')}：{outStockAmountText}
        </div>
        <div>
          {t('待分配出库数')}：
          {unAssignedNum + (clean_food ? sale_unit_name : std_unit_name)}
        </div>
      </Flex>
    </>
  )
})

export default BatchHeader
