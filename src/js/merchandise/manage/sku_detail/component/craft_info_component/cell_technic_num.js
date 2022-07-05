import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import skuStore from '../../sku_store'
import spuStore from '../../spu_store'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { Drawer } from '@gmfe/react'
import TechnologyFlow from '../technology_flow'

const CellTechnicNum = observer((props) => {
  const { data, index, onChangeTechnicFlowLen, sku_id } = props
  const { technic_flow_len, remark_type, id } = data

  const renderTechnologyFlow = (_id) => {
    const _sku_id = _id || sku_id
    Drawer.render({
      children: (
        <TechnologyFlow
          sku_id={_sku_id}
          ingredient_id={id}
          remark_type={remark_type}
          index={index}
          onChangeTechnicFlowLen={onChangeTechnicFlowLen}
          type={1} // 物料工艺
        />
      ),
      onHide: Drawer.hide,
      opacityMask: false,
      style: {
        width: '700px',
      },
    })
  }

  const handleSettingTech = () => {
    // 希捷说，在设置工艺的时候要强制保存sku信息，才能进行设置，因为工艺是单独接口，如果不保存sku也是可以绑定的
    // 所以导致这里有可能会出现物料信息没有，但是工艺已经绑定给sku了。在设置工艺的时候强行保存sku信息，希捷说的，这样改动最少，所需时间最少
    if (sku_id) {
      // 更新sku信息
      skuStore.updateSku().then(() => {
        renderTechnologyFlow()
      })
    } else {
      // 新增sku
      skuStore.createSku(spuStore.spuDetail.id).then((id) => {
        renderTechnologyFlow(id)
      })
    }
  }

  return (
    <a
      href='javascript:;'
      onClick={() => handleSettingTech(sku_id, id, remark_type, index)}
    >
      {technic_flow_len || i18next.t('设置工艺')}
    </a>
  )
})

CellTechnicNum.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object,
  onChangeTechnicFlowLen: PropTypes.func,
  sku_id: PropTypes.string,
}

export default memoComponentWithDataHoc(CellTechnicNum)
