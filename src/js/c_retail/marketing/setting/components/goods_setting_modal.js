import { t } from 'gm-i18n'
import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import _ from 'lodash'
import {
  Flex,
  RightSideModal,
  Loading,
  Button,
  InputNumberV2,
  FormBlock,
  Tip,
  Form,
  FormItem
} from '@gmfe/react'

import store from '../store'
import Transfer from '../../../../common/components/sku_transfer'
import { filterGroupList } from '../../../../common/util'

@observer
class CustomerSettingModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      list: [],
      selected: [],
      discount: store.goods.discount
    }
  }

  componentDidMount() {
    store.getSkuList()
  }

  handleSave = () => {
    if (!this.state.discount) {
      Tip.warning(t('请填写1~99的整数'))
      return
    }

    // 设置折扣
    store.setGoods('discount', this.state.discount)
    // 获取已选择商品id
    store.setGoods(
      'sku_ids',
      _.map(store.skus.slice(), item => item.id)
    )
    RightSideModal.hide()
  }

  handleRightListChange = rightList => {
    store.setSkuList(rightList)
  }

  handleChangeDiscount = val => {
    this.setState({ discount: val })
  }

  render() {
    const skuList = toJS(store.skuList)
    const skus = toJS(store.skus)
    const arraySkusValues = _.map(skus, v => v.id || v.value)
    const skuFilterList = filterGroupList(skuList, v => {
      return !_.includes(arraySkusValues, v.id || v.value)
    })
    const { discount } = this.state

    return (
      <div className='gm-padding-lr-15'>
        <div className='gm-text-14 gm-padding-tb-10'>{t('专属折扣商品')}</div>
        <Flex justifyEnd>
          <Button type='primary' onClick={this.handleSave}>
            {t('确定')}
          </Button>
        </Flex>
        <hr />
        <Form className='gm-margin-top-20' disabledCol labelWidth='100px'>
          <FormBlock col={3}>
            <FormItem label={t('设置统一折扣')}>
              <Flex className='gm-margin-bottom-10'>
                <InputNumberV2
                  value={discount}
                  precision={0}
                  min={1}
                  max={99}
                  onChange={this.handleChangeDiscount}
                />
                <span className='gm-padding-5'>%</span>
              </Flex>
              <span className='gm-text-desc'>{t('请填写1~99的整数')}</span>
            </FormItem>
          </FormBlock>
          <FormBlock col={3}>
            <FormItem label={t('设置商品')}>
              {store.skuListLoading ? (
                <Loading />
              ) : (
                <>
                  <Transfer
                    listStyle={{
                      width: '400px',
                      height: '300px',
                      overflowY: 'auto'
                    }}
                    showSaleMenuName={false}
                    placeholder={t('输入商品名')}
                    leftTitle={t('选择商品')}
                    rightTitle={
                      t('KEY52', {
                        VAR1: skus && skus.length
                      }) /* src:`已选商品：${skus && skus.length}` => tpl:已选商品：${VAR1} */
                    }
                    leftList={skuFilterList}
                    rightList={skus}
                    onRightListChange={this.handleRightListChange}
                    leftDisableSelectAll
                  />
                  <span className='gm-text-desc'>
                    {t('如商品已经加入限时抢购，会员折扣将失效')}
                  </span>
                </>
              )}
            </FormItem>
          </FormBlock>
        </Form>
      </div>
    )
  }
}

export default CustomerSettingModal
