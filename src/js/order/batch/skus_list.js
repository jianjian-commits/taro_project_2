import { i18next } from 'gm-i18n'
import React from 'react'
import { Table, TableUtil } from '@gmfe/table'
import { Flex, InputNumber, Price, RightSideModal, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import classNames from 'classnames'
import _ from 'lodash'

import SkuSelect from './components/sku_select'
import TipBox from './components/tip_box'
import SalePriceCell from './components/sale_price_cell'
import { getSkusExpanded, getUnit } from './util'
import {
  getDynamicFreight,
  getCombineGoodsClass,
  deleteConfirmText,
} from '../util'
import { convertNumber2Sid } from '../../common/filter'
import { copywriterByTaxRate } from '../../common/service'
import { Customize } from 'common/components/customize'

import store from './store'
import globalStore from '../../stores/global'

const SkusList = observer(({ index }) => {
  const { details } = store
  const order = details[index]
  if (!order) {
    RightSideModal.hide()
    return null
  }
  const {
    skus,
    address_id,
    resname,
    total_price,
    freight,
    time_config_info,
    receive_way,
  } = order || {}
  const dynamicFreight = getDynamicFreight(freight, total_price, receive_way)

  const handleChange = (orderIndex, skuIndex, data) => {
    store.skuEdit(orderIndex, skuIndex, data)
  }

  const handleCustomizeChange = (
    orderIndex,
    skuIndex,
    detail_customized_field,
    key,
    value,
  ) => {
    const customizedField = {
      ...detail_customized_field,
      [key]: value,
    }
    handleChange(orderIndex, skuIndex, {
      key: 'detail_customized_field',
      value: customizedField,
    })
  }

  const detailConfigs = globalStore.customizedDetailConfigs.filter(
    (v) => v.permission.write_station,
  )

  return (
    <div
      className='b-order'
      style={{ overflowY: 'scroll', minHeight: '100vh' }}
    >
      <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
        <strong
          className='gm-padding-left-5 gm-text-14'
          style={{ borderLeft: '3px solid rgb(54, 173, 58)' }}
        >
          {i18next.t('编辑订单')}
          {dynamicFreight ? (
            <span>
              {i18next.t('（含运费:') + Price.getCurrency(order.fee_type)}
              {dynamicFreight.toFixed(2)}）
            </span>
          ) : (
            <span>{i18next.t('（免运费）')}</span>
          )}
        </strong>
        <div className='gm-padding-top-15'>
          <span className='gm-margin-right-15'>
            {i18next.t('商户：')}
            {`${resname || '-'}/${convertNumber2Sid(address_id) || '-'}`}
          </span>
          <span className='gm-margin-right-15'>
            {i18next.t('运营时间')}：
            {(time_config_info && time_config_info.name) || '-'}
          </span>
        </div>
      </div>
      <Flex column className='gm-padding-lr-20 gm-padding-tb-10'>
        <SkuSelect
          order={details[index]}
          showOuterId={globalStore.otherInfo.showSkuOuterId}
          onSearch={(searchText) => {
            return store.getSkus(index, searchText)
          }}
          onSelect={(sku) => {
            store.skuAdd(index, sku)
          }}
        />
        <Table
          data={(skus || []).slice()}
          getTrGroupProps={(state, row) => {
            return getCombineGoodsClass(row, skus)
          }}
          columns={[
            {
              Header: i18next.t('商品ID'),
              minWidth: 80,
              accessor: 'id',
            },
            {
              Header: i18next.t('商品名'),
              minWidth: 80,
              accessor: 'name',
            },
            {
              Header: i18next.t('规格'),
              accessor: 'std_unit_name_forsale',
              minWidth: 50,
              Cell: ({ original }) => {
                if (original.code) return '-'
                return getUnit(original)
              },
            },
            {
              Header: i18next.t('分类'),
              accessor: 'category_title_2',
              minWidth: 50,
            },
            {
              Header: i18next.t('报价单简称（对外）'),
              minWidth: 80,
              accessor: 'supplier_name',
            },
            {
              Header: i18next.t('下单数'),
              accessor: 'quantity',
              minWidth: 85,
              Cell: (row) => (
                <Observer>
                  {() => {
                    const { original } = row
                    if (original.code > 0) return '-'
                    return (
                      <Flex>
                        <InputNumber
                          value={original.quantity}
                          max={9999}
                          onChange={(value) => {
                            handleChange(index, row.index, {
                              key: 'quantity',
                              value,
                            })
                          }}
                          min={0}
                          className={classNames(
                            'form-control input-sm b-order-quantity-input',
                            {
                              'b-bg-warning':
                                !original.quantity || original.quantity === '0',
                            },
                          )}
                          style={{ width: '60px' }}
                          placeholder={i18next.t('下单数')}
                        />
                        <span className='gm-padding-5'>
                          {original.sale_unit_name}
                        </span>
                      </Flex>
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: i18next.t('销售单位'),
              accessor: 'sale_unit_name',
              minWidth: 80,
            },
            {
              Header: copywriterByTaxRate(
                i18next.t('单价（销售单位）'),
                i18next.t('含税单价（销售单位）'),
              ),
              accessor: 'sale_price',
              minWidth: 110,
              Cell: (row) => (
                <Observer>
                  {() => {
                    const { original } = row
                    if (original.code > 0) return '-'
                    return (
                      <SalePriceCell
                        key={original.id}
                        sku={original}
                        onChange={handleChange.bind(this, index, row.index)}
                      />
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: i18next.t('备注'),
              minWidth: 100,
              accessor: 'spu_remark',
              Cell: (row) => (
                <Observer>
                  {() => {
                    const { original } = row
                    if (original.code > 0 || original.isCombineGoodsTop)
                      return '-'
                    return (
                      <Flex>
                        <input
                          key={original.id}
                          className='form-control input-sm'
                          value={original.spu_remark}
                          placeholder={i18next.t('备注')}
                          onChange={(e) => {
                            handleChange(index, row.index, {
                              key: 'spu_remark',
                              value: e.target.value,
                            })
                          }}
                        />
                      </Flex>
                    )
                  }}
                </Observer>
              ),
            },
            ..._.map(detailConfigs, (v) => {
              const radioList = (v.radio_list || []).map((v) => ({
                value: v.id,
                text: v.name,
              }))
              return {
                Header: v.field_name,
                minWidth: 100,
                accessor: `detail_customized_field.${v.id}`,
                Cell: (row) => {
                  return (
                    <Observer>
                      {() => {
                        const { original } = row
                        if (original.code > 0 || original.isCombineGoodsTop)
                          return '-'
                        return (
                          <Customize
                            type={v.field_type}
                            value={
                              (original.detail_customized_field || {})[v.id]
                            }
                            onChange={handleCustomizeChange.bind(
                              null,
                              index,
                              row.index,
                              original.detail_customized_field,
                              v.id,
                            )}
                            data={radioList}
                          />
                        )
                      }}
                    </Observer>
                  )
                },
              }
            }),
            {
              minWidth: 40,
              Header: TableUtil.OperationHeader,
              Cell: (row) => {
                const { original: sku } = row
                let text = '是否确定要移除该商品？'
                if (sku.is_combine_goods) {
                  text = deleteConfirmText(skus, sku)
                }
                return (
                  <TableUtil.OperationCell>
                    <TableUtil.OperationDelete
                      onClick={() => {
                        store.skuDelete(index, row.index)
                      }}
                    >
                      {text}
                    </TableUtil.OperationDelete>
                  </TableUtil.OperationCell>
                )
              },
            },
            {
              expander: true,
              show: false,
              Expander: null,
            },
          ]}
          expanded={getSkusExpanded(skus)}
          defaultPageSize={9999}
          SubComponent={(row) => {
            const {
              original: { code, sku_data, msg },
            } = row
            const style = row.index % 2 ? { backgroundColor: '#f5f5f7' } : {}
            return (
              <TipBox
                style={style}
                tip={
                  code > 0
                    ? msg || i18next.t('商品异常未能识别')
                    : i18next.t('商品未完全识别，为你推荐：')
                }
                others={
                  sku_data && sku_data.length ? (
                    <Flex>
                      {_.map(sku_data, (item, i) => {
                        return (
                          <Button
                            className='gm-margin-right-5'
                            key={i}
                            onClick={() => {
                              store.skuTrans(index, row.index, item)
                            }}
                          >
                            {/* 加上数量 */}
                            {`${item.name} ${item.sale_ratio}${item.std_unit_name_forsale}/${item.sale_unit_name}`}
                          </Button>
                        )
                      })}
                    </Flex>
                  ) : null
                }
              />
            )
          }}
        />
      </Flex>
    </div>
  )
})

SkusList.propTypes = {
  index: PropTypes.number,
}

export default SkusList
