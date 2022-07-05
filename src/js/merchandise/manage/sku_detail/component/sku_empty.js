import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Button } from '@gmfe/react'
import emptyImg from '../../../../../img/empty.png'
import { System } from '../../../../common/service'
import { observer } from 'mobx-react'
import merchandiseStore from '../../store'
import globalStore from '../../../../stores/global'
import skuStore from '../sku_store'
import spuStore from '../spu_store'
import _ from 'lodash'
import { getFirstSupplier } from '../util'

const SkuEmpty = observer((props) => {
  const { canAddNew } = props

  const handleAddNewSku = () => {
    const { spuSupplierList, salemenuList } = merchandiseStore
    let salemenuSelected = {}
    if (System.isC()) {
      salemenuSelected.value = globalStore.c_salemenu_id
    } else {
      const { salemenuId } = props
      // 所在报价单，若当前是通过报价单进入的，则取当前报价单。否则取报价单列表的第一个
      salemenuSelected = salemenuId
        ? _.find(salemenuList, (v) => v.value === salemenuId)
        : salemenuList.length
        ? salemenuList[0]
        : {}
    }
    // 默认供应商取供应商列表的第一个
    const supplier_id = getFirstSupplier(spuSupplierList)
    const feeType = salemenuSelected ? salemenuSelected.fee_type : ''

    skuStore.addNewSku(spuStore.spuDetail, supplier_id, salemenuSelected)
    skuStore
      .getPurchaseSpecList(spuStore.spuDetail.id, supplier_id, feeType)
      .then((json) => {
        // 新建sku时需要设置默认选中第一个采购规格
        if (!_.isEmpty(json.data)) {
          skuStore.changeSkuDetail({
            purchase_spec_id: json.data[0].id,
          })
        }
      })
  }

  return (
    <Flex alignCenter justifyCenter column style={{ height: '100vh' }}>
      <img src={emptyImg} alt={t('您好，暂未建立销售规格')} width={320} />
      <p className='gm-padding-top-20 gm-padding-bottom-10 gm-text-desc'>
        {t('您好，暂未建立销售规格')}
      </p>
      {canAddNew && (
        <div className='sku-button-group-module'>
          <Button type='primary' onClick={handleAddNewSku}>
            {t('新建销售规格')}
          </Button>
        </div>
      )}
    </Flex>
  )
})

SkuEmpty.propTypes = {
  canAddNew: PropTypes.bool,
  salemenuId: PropTypes.string,
}

export default SkuEmpty
