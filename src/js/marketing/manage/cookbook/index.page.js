import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import {
  FormPanel,
  FormItem,
  Switch,
  Tip,
  Affix,
  Button,
  Flex,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import { CookbookSearchSelector, CookbookTable } from './components/index'
import CookbookStore from './store'

const Cookbook = () => {
  const {
    initDataList: { is_show },
    setSwitch,
    getInitData,
    saveCookbook,
    getCombineGoodsList,
    validatorCookbookInfo,
  } = CookbookStore

  useEffect(() => {
    getInitData().then(() => {
      getCombineGoodsList()
    })
  }, [])

  const handleSubmit = () => {
    if (!validatorCookbookInfo()) {
      Tip.danger(i18next.t('不可以添加空的餐次！'))
      return
    }
    saveCookbook().then(() => {
      Tip.success(i18next.t('保存成功！'))
      getInitData().then(() => {
        getCombineGoodsList()
      })
    })
  }

  const handleSwitch = (value) => {
    setSwitch(value)
  }

  return (
    <div>
      <FormPanel title={i18next.t('菜谱设置')}>
        <FormItem label={i18next.t('设置可见报价单')}>
          <CookbookSearchSelector />
        </FormItem>
        <CookbookTable />
        <FormItem
          label={i18next.t('设置是否在商城显示')}
          className='gm-margin-top-20'
          colWidth='900px'
        >
          <Switch
            type='primary'
            on={i18next.t('开启')}
            off={i18next.t('关闭')}
            checked={is_show}
            onChange={handleSwitch}
          />
          <div className='gm-text-desc gm-margin-top-5'>
            <p className='gm-margin-bottom-5'>
              {i18next.t('开启后')}：
              {i18next.t(
                '商城底部将不展示“订单”入口，商城底部的导航为“首页”，“菜谱”，“分类”，“购物车”，“我的”。',
              )}
            </p>
            <p className='gm-margin-bottom-5'>
              {i18next.t('在“我的”里面可查看订单')}
            </p>
          </div>
        </FormItem>
      </FormPanel>
      <Affix bottom={0}>
        <div style={{ background: '#fff' }}>
          <Flex justifyCenter>
            <Button type='primary' onClick={handleSubmit}>
              {i18next.t('保存')}
            </Button>
          </Flex>
        </div>
      </Affix>
    </div>
  )
}

export default observer(Cookbook)
