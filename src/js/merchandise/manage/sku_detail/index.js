import { i18next } from 'gm-i18n'
import React from 'react'
import { observer, Observer } from 'mobx-react'
import spuStore from './spu_store'
import skuStore from './sku_store'
import merchandiseStore from '../store'
import globalStore from '../../../stores/global'
import _ from 'lodash'
import { SpecTab } from '../../component/spec'
import SpuCreate from './component/spu_create'
import SpuDetail from './component/spu_detail'
import SkuDetail from './component/sku_detail'
import SkuEmpty from './component/sku_empty'
import SpuEmpty from './component/spu_empty'

@observer
class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: props.location.query.sku_id ? 1 : 0,
    }
  }

  async componentDidMount() {
    const { spu_id, sku_id, fee_type } = this.props.location.query
    globalStore.setBreadcrumbs([
      !spu_id ? i18next.t('新建商品') : i18next.t('商品详情'),
    ])

    if (spu_id) {
      await spuStore.getSpuDetail(spu_id)
      await skuStore.getSkuListDetail(spu_id).then((list) => {
        // 若url上带有sku_id，则展示该sku详情
        // 否则默认显示第一个sku
        if (sku_id) {
          const activeIndex = _.findIndex(list, (v) => v.sku_id === sku_id)
          skuStore.changeActiveIndex(activeIndex)

          // 拉取采购规格列表
          skuStore.getPurchaseSpecList(
            spu_id,
            list[activeIndex].supplier_id,
            fee_type,
          )
        } else if (list.length) {
          skuStore.changeActiveIndex(0)
          // 拉取采购规格列表
          skuStore.getPurchaseSpecList(spu_id, list[0].supplier_id)
        }
      })
      // 拉取供应商列表
      merchandiseStore.getSpuSupplierList(spu_id)
    }

    // 拉取自售单的可选报价单列表——新建销售商品时 选择用
    merchandiseStore.getSalemenuList({ type: 4 })
    // 拉取所有报价单——匹配已有商品报价单用
    merchandiseStore.getAllSalemenuList()
    // 拉取参考成本
    merchandiseStore.getRefPriceType(1)
    // 拉取商品加工标签
    merchandiseStore.fetchProcessLabelList()
    // 拉取激活的自售单
    merchandiseStore.getActiveSelfSalemenuList()
  }

  componentWillUnmount() {
    skuStore.init()
    spuStore.init()
    globalStore.setBreadcrumbs([])
  }

  render() {
    const { activeTab } = this.state
    const { salemenuId, salemenuType } = this.props.location.query
    let p_addSku = globalStore.hasPermission('add_sku')
    // 代售单不能新建sku
    if (salemenuType && salemenuType === 2) p_addSku = false
    return (
      <>
        <SpecTab
          active={activeTab}
          className='gm-padding-top-10'
          tabs={[i18next.t('基础信息'), i18next.t('规格信息')]}
        >
          <Observer>
            {() =>
              spuStore.spuDetail.id ? (
                <SpuDetail {...this.props} />
              ) : (
                <SpuCreate {...this.props} />
              )
            }
          </Observer>
          <Observer>
            {() => {
              if (!spuStore.spuDetail.id) return <SpuEmpty />
              else if (!skuStore.skuList.length)
                return <SkuEmpty salemenuId={salemenuId} canAddNew={p_addSku} />
              else return <SkuDetail {...this.props} />
            }}
          </Observer>
        </SpecTab>
      </>
    )
  }
}

export default Detail
