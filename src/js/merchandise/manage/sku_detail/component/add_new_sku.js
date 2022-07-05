import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import skuStore from '../sku_store'
import spuStore from '../spu_store'
import merchandiseStore from '../../store'
import globalStore from '../../../../stores/global'
import { Flex } from '@gmfe/react'
import SVGPlus from '../../../../../svg/plus.svg'
import { System } from '../../../../common/service'
import _ from 'lodash'
import { getFirstSupplier } from '../util'

@observer
class AddNewSku extends React.Component {
  handleAddNewSku = () => {
    const { spuSupplierList, activeSelfSalemenuList } = merchandiseStore
    // 修改为已激活的自售报价单
    let salemenuSelected = {}
    if (System.isC()) {
      salemenuSelected.value = globalStore.c_salemenu_id
    } else {
      const { salemenuId } = this.props
      // 所在报价单，若当前是通过报价单进入的，则取当前报价单。否则取报价单列表的第一个
      salemenuSelected = salemenuId
        ? _.find(activeSelfSalemenuList, (v) => v.value === salemenuId)
        : activeSelfSalemenuList.length
        ? activeSelfSalemenuList[0]
        : {}
    }
    // 默认供应商取供应商列表的第一个
    const supplier_id = getFirstSupplier(spuSupplierList)
    const feeType = salemenuSelected ? salemenuSelected.fee_type : ''
    skuStore.addNewSku(spuStore.spuDetail, supplier_id, salemenuSelected)
    skuStore
      .getPurchaseSpecList(spuStore.spuDetail.id, supplier_id, feeType)
      .then((json) => {
        // 切换供应商和新建sku时需要设置默认选中第一个采购规格
        if (!_.isEmpty(json.data)) {
          skuStore.changeSkuDetail({
            purchase_spec_id: json.data[0].id,
          })
        }
      })
  }

  render() {
    return (
      <Flex
        column
        alignCenter
        justifyCenter
        className='gm-text-14 gm-cursor b-sepc-group-add'
        onClick={this.handleAddNewSku}
      >
        <span>
          <SVGPlus />
        </span>
        {i18next.t('添加销售规格')}
      </Flex>
    )
  }
}

AddNewSku.propTypes = {
  salemenuId: PropTypes.string,
}

export default AddNewSku
