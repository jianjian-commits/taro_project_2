import React from 'react'
import { InputNumberV2, ToolTip } from '@gmfe/react'
import { EditTable, TableUtil } from '@gmfe/table'
import { inject, observer, Observer } from 'mobx-react'
import SpuSearchSelector from './spu_search_selector'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
const { OperationHeader, referOfWidth, EditTableOperation } = TableUtil

const CombineSpuTable = (props) => {
  const handleSelect = (selected, spu) => {
    if (selected) {
      spu.init({
        spu_id: selected.id,
        spu_name: selected.name,
        std_unit_name: selected.std_unit_name,
        category_title_2: selected.category_2_name,
        quantity: '',
        origin: selected.is_combine ? selected.name : '普通商品',
        origin_id: selected.is_combine ? selected.id : '',
        combineQuantity: '',
        combineSpus: '',
      })
      if (selected.is_combine) {
        // 获取选中的二级组合商品信息
        props.store.handleNestCombineGood(selected.id)
      }
    } else {
      spu.init({}) // 清空当前行
    }
  }

  const handleChangeSpuQuantity = (num, d) => {
    props.store.changeSpuQuantity(num, d)
  }

  const {
    spus,
    addEmptySpu,
    delSpuByIndex,
    selectedSpus,
    detailFields: { combine_level },
  } = props.store
  return (
    <EditTable
      className='gm-border'
      data={spus.slice()}
      columns={[
        {
          Header: t('商品名'),
          id: 'name',
          accessor: (d) => (
            <Observer>
              {() => {
                const selected = d.spu_id
                  ? { value: d.spu_id, text: d.spu_name }
                  : null
                return (
                  <SpuSearchSelector
                    selected={selected}
                    onSelect={(selected) => handleSelect(selected, d)}
                    selectedSpus={selectedSpus}
                    combineLevel={Number(combine_level)}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          width: 90,
          id: 'category_title_2',
          Header: t('分类'),
          accessor: (d) => {
            return <Observer>{() => d.category_title_2 || '-'}</Observer>
          },
        },
        {
          Header: () => {
            return (
              <div>
                <span className='gm-margin-right-5'>{t('单位数量')}</span>
                <ToolTip
                  popup={
                    <div className='gm-padding-5'>
                      <div className='t-margin-top-5'>
                        {t('普通商品：基本单位')}
                      </div>
                      <div>{t('二级组合商品：销售单位')}</div>
                    </div>
                  }
                />
              </div>
            )
          },
          id: 'quantity',
          accessor: (d) => (
            <Observer>
              {() => (
                <div>
                  <InputNumberV2
                    style={{ width: '80px' }}
                    min={0.0}
                    precision={2}
                    onChange={(num) => handleChangeSpuQuantity(num, d)}
                    value={d.quantity === '' ? undefined : d.quantity}
                  />{' '}
                  {d.std_unit_name || '-'}
                </div>
              )}
            </Observer>
          ),
        },
        {
          Header: OperationHeader,
          accessor: 'action',
          width: referOfWidth.operationCell,
          Cell: (cellProps) => (
            <EditTableOperation
              onAddRow={addEmptySpu}
              onDeleteRow={() => delSpuByIndex(cellProps.index)}
            />
          ),
        },
      ]}
    />
  )
}

CombineSpuTable.propTypes = {
  store: PropTypes.object.isRequired,
}

export default inject('store')(observer(CombineSpuTable))
