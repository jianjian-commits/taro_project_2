import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Modal, Flex, Tip, Dialog, Button } from '@gmfe/react'
import globalStore from '../../../../stores/global'
import skuStore from '../sku_store'
import spuStore from '../spu_store'
import { SpecGroup } from '../../../component/spec'
import AddNewSku from './add_new_sku'

@observer
class SkuListCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fitstIn: true,
    }
  }

  deleteSku = (index) => {
    skuStore.deleteSku(index).then(() => {
      Tip.success(i18next.t('删除成功'))
      Modal.hide()
    })
  }

  handleDeleteSku = (index) => {
    // 暂时这样清除popover的active
    window.document.body.click()

    Modal.render({
      children: (
        <div>
          <span>{i18next.t('是否确认要删除该商品规格')}</span>
          <div className='gm-gap-10' />
          <Flex justifyEnd>
            <Button onClick={() => Modal.hide()}>{i18next.t('取消')}</Button>
            <div className='gm-gap-5' />
            <Button type='danger' onClick={() => this.deleteSku(index)}>
              {i18next.t('删除')}
            </Button>
          </Flex>
        </div>
      ),
      style: { width: '300px' },
      title: i18next.t('删除商品'),
      onHide: Modal.hide,
    })
  }

  handleChangeSpec = (index) => {
    const {
      activeIndex,
      skuDetail: { sku_id },
    } = skuStore
    if (activeIndex === index) {
      return null
    } else if (activeIndex === 0 && !sku_id) {
      return Dialog.confirm({
        children: i18next.t('当前页面所填内容尚未保存，确认离开当前页面？'),
        title: i18next.t('提示'),
      }).then(() => {
        skuStore.removeNewSku()
        this.afterChangeSku(index - 1)

        return index - 1
      })
    } else {
      this.afterChangeSku(index)
    }
  }

  afterChangeSku = (index) => {
    const { id } = spuStore.spuDetail
    // 对比 supplier_id和fee_type
    // 如果当前sku的这两个值与用户点击的下一个sku的两个值不一致，就重新拉取采购规格列表
    const {
      supplier_id: old_supplier_id,
      fee_type: old_fee_type,
    } = skuStore.skuDetail
    const {
      supplier_id: new_supplier_id,
      fee_type: new_fee_type,
    } = skuStore.skuList[index]

    if (old_supplier_id !== new_supplier_id || old_fee_type !== new_fee_type) {
      // 拉取采购规格列表
      skuStore.getPurchaseSpecList(id, new_supplier_id, new_fee_type)
    }
    skuStore.changeActiveIndex(index)

    skuStore.copyNowSkuCardDetail()
    // 获取修改前的skudetail
  }

  render() {
    const {
      skuListCard,
      activeIndex,
      skuDetail: { sku_id },
    } = skuStore
    if (this.state.fitstIn && sku_id) {
      skuStore.copyNowSkuCardDetail()
      this.setState({ fitstIn: false })
    }
    const { salemenuId, salemenuType } = this.props.location.query
    let p_addSku = globalStore.hasPermission('add_sku')
    const p_deleteSku = globalStore.hasPermission('delete_sale_sku')
    // 代售单不能新建sku
    if (salemenuType && salemenuType === 2) p_addSku = false

    return (
      <SpecGroup
        active={activeIndex}
        popup={(info, index) => {
          return !sku_id || !p_deleteSku ? null : (
            <div className='gm-padding-10'>
              <span
                className='gm-cursor'
                onClick={this.handleDeleteSku.bind(this, index)}
              >
                {i18next.t('删除')}
              </span>
            </div>
          )
        }}
        onChange={(info, index) => this.handleChangeSpec(index)}
        group={skuListCard.slice()}
      >
        {p_addSku && <AddNewSku salemenuId={salemenuId} />}
      </SpecGroup>
    )
  }
}

export default SkuListCard
