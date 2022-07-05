import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import { Tip } from '@gmfe/react'
import { FullTab } from '@gmfe/frame'
import SkuGroupPanel from './component/sku_button_panel'
import SkuDetail from './component/sku_detail'
import SPUCreate from './spu_create'
import globalStore from '../../stores/global'
import _ from 'lodash'
import { history } from '../../common/service'
import { initTurnOverFields } from '../util'
import { getSkuChangeInfo } from './init_data'
import PropTypes from 'prop-types'

import actions from '../../actions'

import '../actions'
import '../reducer'
import './actions'
import './reducer'

class SkuCreate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSkuDetail: false,
    }
  }

  componentWillUnmount() {
    actions.merchandise_sku_common_reset_store()
    actions.merchandise_list_spu_detail_init()
  }

  handleCreateSpuSuccess = async () => {
    const { spuDetail } = this.props.merchandiseDetail

    // sale 特有
    const { salemenuId } = this.props.location.query
    if (salemenuId) {
      // 获取sku列表
      await actions.merchandise_sku_common_sku_list(spuDetail.id, salemenuId)
      // 默认选中新建
      // await actions.merchandise_sku_common_sku_selected('')
      // 获得用户报价单列表
      // sale内拉取所有的报价单只是为了匹配改salemenuId获得其他信息，报价单已确认，不能修改
      await actions.merchandise_sku_common_sale_list(4)
    } else {
      // 获得用户报价单列表
      // 只能拉取自售且已激活的报价单
      await actions.merchandise_sku_common_sale_list(4)
    }

    // 获得采购来源列表
    await actions.merchandise_sku_common_supply_list({ spu_id: spuDetail.id })

    const { supplyList, saleList } = this.props.merchandiseDetail
    const changeInfo = getSkuChangeInfo(
      spuDetail,
      supplyList,
      saleList,
      salemenuId
    )

    // 周转物字段
    initTurnOverFields(changeInfo)
    await actions.merchandise_sku_common_change_sku_info(changeInfo)
    this.setState({
      showSkuDetail: true,
    })
  }

  handleUploadSkuImg = async (file, type, index) => {
    await actions.merchandise_sku_common_img_upload(file, type, index)
  }

  handleChangeSkuInfo = (changeInfo) => {
    actions.merchandise_sku_common_change_sku_info(changeInfo)
  }

  handleRequestNewSkuDetail = async (skuId) => {
    await actions.merchandise_sku_common_sku_selected(skuId)
    await actions.merchandise_common_clear_ingredient_list() // 切换销售规格时，需清楚物料信息
  }

  handleAddNewSku = async () => {
    const { supplyList, saleList, spuDetail } = this.props.merchandiseDetail
    const salemenuId = this.props.location.query.salemenuId

    const changeInfo = getSkuChangeInfo(
      spuDetail,
      supplyList,
      saleList,
      salemenuId
    )
    await actions.merchandise_sku_common_change_sku_info(changeInfo)
    await actions.merchandise_common_clear_ingredient_list() // 切换销售规格时，需清楚物料信息
  }

  handleSaveSku = async (supplier_id, purchase_spec_id) => {
    const { skuDetail } = this.props.merchandiseDetail
    const req = Object.assign(skuDetail, { supplier_id, purchase_spec_id })

    if (skuDetail.sku_id) {
      if (globalStore.hasPermission('edit_sku')) {
        await actions.merchandise_sku_common_sku_update(req)
        Tip.success(i18next.t('更新规格详情成功!'))
      }
    } else {
      if (globalStore.hasPermission('add_sku')) {
        await actions.merchandise_sku_common_sale_sku_create(req)
        Tip.success(i18next.t('新建售卖商品成功!'))
        history.go(-1)
      }
    }
  }

  // 修改净菜类商品信息
  handleChangeCleanFoodInfo = (changeInfo) => {
    actions.merchandise_sku_change_clean_food_info(changeInfo)
  }

  render() {
    const {
      spuDetail: { id, name, std_unit_name },
      skuDetail,
      saleList,
      skuList,
      supplyList,
      skuSelected,
      ingredientList,
    } = this.props.merchandiseDetail

    const { salemenuId } = this.props.location.query
    const salemenu = _.find(saleList, (sale) => sale.id === salemenuId)

    // 添加sku权限
    let p_add_sku = globalStore.hasPermission('add_sku')
    // 代售单没权限
    if (salemenu && salemenu.type === '2') {
      p_add_sku = false
    }

    return (
      <FullTab tabs={[i18next.t('基础信息'), i18next.t('规格信息')]}>
        <SPUCreate {...this.props} onSuccess={this.handleCreateSpuSuccess} />
        {this.state.showSkuDetail ? (
          <>
            <SkuGroupPanel
              saleList={saleList}
              skuList={skuList}
              skuSelected={skuSelected}
              skuDetail={skuDetail}
              canAddNew={p_add_sku}
              onClickBtn={this.handleRequestNewSkuDetail}
              onAddNew={this.handleAddNewSku}
            />
            <div className='gm-gap-5' />
            <SkuDetail
              type='saleOnly'
              spuId={id}
              spuUnitName={std_unit_name}
              saleMenuId={salemenuId}
              spuName={name}
              saleList={saleList}
              skuDetail={skuDetail}
              supplyList={supplyList}
              ingredientList={ingredientList}
              onChangeInfo={this.handleChangeSkuInfo}
              onUploadImg={this.handleUploadSkuImg}
              onSave={this.handleSaveSku}
              onChangeCleanFoodInfo={this.handleChangeCleanFoodInfo}
            />
          </>
        ) : null}
      </FullTab>
    )
  }
}

SkuCreate.propTypes = {
  merchandiseCommon: PropTypes.object,
  merchandiseDetail: PropTypes.object,
}

export default connect((state) => ({
  merchandiseCommon: state.merchandiseCommon,
  merchandiseDetail: state.merchandiseDetail,
}))(SkuCreate)
