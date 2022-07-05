import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Flex, Popover, RightSideModal } from '@gmfe/react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../store'
import { saleReferencePrice } from '../../../../../common/enum'
import globalStore from '../../../../../stores/global'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import { SvgXinxi } from 'gm-svg'
import { is } from '@gm-common/tool'
import GoodHeader from './good_detail_header'
import PurchaseQuotations from '../../../../../common/components/purchase_quotations'
import '../../../../../common/components/tree_list/tree_list.less'

const CellName = observer((props) => {
  const { data, index } = props

  const [skuList, setSkuList] = useState([])
  const [skuGroupList, setSkuGroupList] = useState([])
  const { settle_supplier_id } = store.billDetail
  useEffect(() => {
    setSkuGroupList([])
  }, [settle_supplier_id])

  const { spec_id, spu_status, spec_name, text, std_unit_name } = data
  const specName = spec_name || text

  const selectedSpec = _.find(skuList, (v) => v.value === spec_id)
  const p_get_purchase_spec_price_info = globalStore.hasPermission(
    'get_purchase_spec_price_info',
  )

  const handlePopupGoodDetail = () => {
    const {
      billDetail: { supplier_name, operator, settle_supplier_id },
      progressUnit,
    } = store
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: (
        <Flex column>
          <Flex column className='gm-padding-tb-10 gm-padding-lr-20 gm-back-bg'>
            <GoodHeader
              id={props.id}
              task={data}
              settle_supplier_name={supplier_name}
              operator={operator}
              progressUnit={progressUnit}
            />
          </Flex>
          <PurchaseQuotations
            id={spec_id}
            supplier_id={settle_supplier_id}
            std_unit_name={std_unit_name}
          />
        </Flex>
      ),
    })
  }

  const handleSelect = (selected) => {
    store.changeEditTask(true)
    new Promise((resolve) => {
      const refPrice = store.fetchRefPriceData({
        spec_id: selected.sku_id,
        spu_id: selected.spu_id,
        settle_supplier_id: selected.settle_supplier_id,
      })
      resolve(refPrice)
    }).then((res) => {
      const { reference_price_type } = store
      const purchaseRefPriceType = globalStore.otherInfo.purchaseSheetRefPrice
      console.log(
        reference_price_type,
        purchaseRefPriceType,
        'purchaseRefPriceType',
      )
      let ref_price = 0
      let purchase_price = 0
      const getPrice = (field, item) => {
        return _.includes([1, 2, 3], field)
          ? res.data[item.flag].newest.price
          : res.data[item.flag]
      }
      _.forEach(saleReferencePrice, (item) => {
        if (item.type === reference_price_type) {
          ref_price = getPrice(reference_price_type, item) * 100 ?? 0
        }
        if (purchaseRefPriceType === 0) {
          purchase_price = 0
          return false
        }
        if (item.type === purchaseRefPriceType) {
          purchase_price = getPrice(purchaseRefPriceType, item) ?? 0
        }
      })
      Object.assign(selected, { ref_price, purchase_price })
      store.changeListItemName(index, selected, true)
    })
  }

  const handleSearch = (text) => {
    if (_.trim(text)) {
      return store.searchSku(text).then((json) => {
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
                  ...sku,
                  tax_rate: item.tax_rate,
                  value: sku_id,
                  text: `${sku_name} (${sale_ratio}${std_unit_name}/${sale_unit_name})`,
                }
              }),
            }
          },
        )

        setSkuGroupList(list)
        setSkuList([
          ..._.map(json.data.target_supplier, (ts) => ({
            ...ts,
            value: ts.spec_id,
            text: ts.spec_name,
          })),
          ..._.map(json.data.other_supplier, (os) => ({
            ...os,
            value: os.spec_id,
            text: os.spec_name,
          })),
        ])
      })
    }
  }

  if (spec_id) {
    if (p_get_purchase_spec_price_info) {
      return (
        <div>
          <a onClick={handlePopupGoodDetail}>{specName}</a>
          {spu_status === 0 && (
            <Popover
              showArrow
              component={<div />}
              type='hover'
              popup={
                <div
                  className='gm-border gm-padding-5 gm-bg gm-text-12'
                  style={{ width: '100px' }}
                >
                  {t('该商品已被删除')}
                </div>
              }
            >
              <span>
                <SvgXinxi style={{ color: 'red', marginLeft: '5px' }} />
              </span>
            </Popover>
          )}
        </div>
      )
    } else {
      return specName
    }
  }
  return (
    <KCMoreSelect
      isGroupList
      data={skuGroupList}
      selected={selectedSpec}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder={t('输入采购规格名')}
      renderListItem={(item) => {
        return (
          <div>
            <span className='gm-margin-right-5'>{item.text}</span>
            <span
              className='tree-station'
              style={{
                marginRight: '4px',
                padding: '0px 1px',
              }}
            >
              {item.p_type === 0 ? t('通用') : t('本站')}
            </span>
            {item.sku_active_count ? (
              <span className='gm-text-primary'>
                {t('在售')}:{item.sku_active_count}
              </span>
            ) : (
              <span className='gm-text-red'>{t('暂无在售')}</span>
            )}
          </div>
        )
      }}
      renderListFilter={(data) => {
        return data
      }}
    />
  )
})

CellName.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isEdit: PropTypes.bool,
}

export default memoComponentWithDataHoc(CellName)
