import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip, Dialog } from '@gmfe/react'
import { FullTab } from '@gmfe/frame'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import SPUCreate from './spu_detail'
import SkuGroupPanel from './component/sku_button_panel'
import SkuDetail from './component/sku_detail'
import _ from 'lodash'
import { initTurnOverFields } from '../util'
import { getSkuChangeInfo } from './init_data'
import globalStore from '../../stores/global'
import actions from '../../actions'
import '../actions'
import '../reducer'
import './actions'
import './reducer'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: props.location.query.sku_id ? 1 : 0,
    }
  }

  async componentDidMount() {
    const {
      query: { spu_id, sku_id, salemenuId, salemenuType },
    } = this.props.location

    if (salemenuId) {
      // SKU列表
      await actions.merchandise_sku_common_sku_list(spu_id, salemenuId)
      // 报价单列表
      await actions.merchandise_sku_common_sale_list(salemenuType)
    } else {
      await actions.merchandise_sku_common_sku_list(spu_id, null)
      await actions.merchandise_sku_common_sale_list(4)
    }

    await actions.merchandise_sku_common_supply_list({ spu_id })

    // 默认选择路由给的skuId,如果不存在，默认选择skuList的第一个元素的sku_id
    // 如果skuList为空数组，则无
    const { skuList } = this.props.merchandiseDetail
    let skuId = null
    if (sku_id) {
      skuId = sku_id
    } else if (skuList.length) {
      skuId = skuList[0].sku_id
    }
    if (skuId) await actions.merchandise_sku_common_sku_selected(skuId)

    // 点击spu进入索引详情的时候,sku_id为空,也就是changeInfo为空
    const changeInfo = _.find(skuList, (sku) => {
      return sku.sku_id === skuId
    })
    await actions.merchandise_sku_common_change_sku_info(changeInfo)

    await actions.merchandise_common_get_reference_price_type(1)
  }

  componentWillUnmount() {
    actions.merchandise_sku_common_reset_store()
    actions.merchandise_list_spu_detail_init()
  }

  handleUploadSkuImg = (file, type, index) => {
    actions.merchandise_sku_common_img_upload(file, type, index)
  }

  handleRequestNewSkuDetail = (skuId) => {
    actions.merchandise_sku_common_sku_selected(skuId)
    actions.merchandise_common_clear_ingredient_list() // 切换销售规格时，需清楚物料信息
  }

  handleChangeSkuInfo = (changeInfo) => {
    actions.merchandise_sku_common_change_sku_info(changeInfo)
  }

  handleAddNewSku = () => {
    const { spuDetail, saleList, supplyList } = this.props.merchandiseDetail
    const changeInfo = getSkuChangeInfo(
      spuDetail,
      supplyList,
      saleList,
      this.props.location.query.salemenuId
    )
    // 周转物字段
    initTurnOverFields(changeInfo)

    actions.merchandise_sku_common_change_sku_info(changeInfo)
    actions.merchandise_common_clear_ingredient_list() // 切换销售规格时，需清楚物料信息
  }

  handleSaveSku = async (supplier_id, purchase_spec_id) => {
    const { skuDetail } = this.props.merchandiseDetail
    const req = Object.assign(skuDetail, { supplier_id, purchase_spec_id })

    if (skuDetail.sku_id !== '') {
      if (globalStore.hasPermission('edit_sku')) {
        await actions.merchandise_sku_common_sku_update(req)
        Tip.success(i18next.t('更新规格详情成功!'))
      }
    } else {
      if (globalStore.hasPermission('add_sku')) {
        await actions.merchandise_sku_common_sale_sku_create(req)
        Tip.success(i18next.t('新建售卖商品成功!'))
      }
    }
  }

  handleDelete = (skuId) => {
    Dialog.confirm({
      children: i18next.t('是否确定要删除该商品规格?'),
      onOK: () => {
        actions.merchandise_sku_common_sku_delete(skuId)
      },
    }).then(() => {
      Tip.success(i18next.t('删除成功'))
    })
  }

  handleChangeTab = (tab) => {
    this.setState({ activeTab: tab })
  }

  // 修改净菜类商品信息
  handleChangeCleanFoodInfo = (changeInfo) => {
    actions.merchandise_sku_change_clean_food_info(changeInfo)
  }

  render() {
    const { reference_price_type } = this.props.merchandiseCommon
    const {
      skuDetail,
      saleList,
      skuList,
      supplyList,
      skuSelected,
      spuDetail,
      ingredientList,
    } = this.props.merchandiseDetail
    const {
      sku_id,
      spu_id,
      salemenuType,
      salemenuId,
    } = this.props.location.query

    const p_view_sku = globalStore.hasPermission('get_sku')
    let p_addSku = globalStore.hasPermission('add_sku')
    // 代售单不能新建sku
    if (salemenuType === 2) p_addSku = false
    if (!p_view_sku) {
      return (
        <p className='bg-warning gm-padding-15 gm-margin-10'>
          {i18next.t('你没有查看销售商品规格的权限!')}
        </p>
      )
    }

    return (
      <FullTab
        active={this.state.activeTab}
        onChange={this.handleChangeTab}
        tabs={[i18next.t('基础信息'), i18next.t('规格信息')]}
      >
        <SPUCreate {...this.props} />
        <div>
          <SkuGroupPanel
            skuList={skuList}
            saleList={saleList}
            skuSelected={skuSelected}
            skuDetail={skuDetail}
            onClickBtn={this.handleRequestNewSkuDetail}
            onAddNew={this.handleAddNewSku}
            canAddNew={p_addSku}
            skuId={sku_id}
          />
          {skuDetail && (skuDetail.sku_id || skuDetail.isNew) && (
            <>
              <div className='gm-gap-10' />
              <SkuDetail
                saleList={saleList}
                skuDetail={skuDetail}
                supplyList={supplyList}
                showOuterId={globalStore.otherInfo.showSkuOuterId}
                spuId={spu_id}
                spuName={spuDetail.name}
                spuUnitName={spuDetail.std_unit_name}
                reference_price_type={reference_price_type}
                ingredientList={ingredientList}
                onUploadImg={this.handleUploadSkuImg}
                onSave={this.handleSaveSku}
                onDelete={this.handleDelete}
                onChangeInfo={this.handleChangeSkuInfo}
                salemenuId={salemenuId || ''}
                salemenuType={salemenuType || ''}
                onChangeCleanFoodInfo={this.handleChangeCleanFoodInfo}
              />
            </>
          )}
        </div>
      </FullTab>
    )
  }
}

Detail.propTypes = {
  merchandiseDetail: PropTypes.object.isRequired,
  merchandiseCommon: PropTypes.object.isRequired,
}

export default connect((state) => ({
  merchandiseDetail: state.merchandiseDetail,
  merchandiseCommon: state.merchandiseCommon,
}))(Detail)
