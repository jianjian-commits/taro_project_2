import React from 'react'
import { observer } from 'mobx-react'
import { ToolTip } from '@gmfe/react'
import { t } from 'gm-i18n'
import globalStore from 'stores/global'
import { history } from 'common/service'

const SuggestPlanAmountHeader = observer((props) => {
  const {
    is_active,
    query_order_type, // 日均下单数设置
    query_order_days, // 手动填写的最近下单数，query_order_type === 1时使用
    adjust_ratio, // 调整比例
    stock_up_type, // 备货天数类型，1为按手动填写，2为按保质期
    stock_up_days, // 手动填写的备货天数，stock_up_type === 1 时使用
  } = globalStore.processInfo.processPlanAlgorithmInfo

  const renderText = () => {
    let text
    if (is_active) {
      let orderNumberText
      let preparNumberText

      if (query_order_type === 1) {
        orderNumberText = t('近') + query_order_days + t('天')
      } else if (query_order_type === 2) {
        orderNumberText = t('以各个商品的保质天数来计算各个商品日均下单数')
      }

      if (stock_up_type === 1) {
        preparNumberText = stock_up_days + t('天')
      } else if (stock_up_type === 2) {
        preparNumberText = t('以各个商品的保质天数来作为备货天数')
      }

      text =
        t('默认按公式“日均下单数（') +
        orderNumberText +
        t(') x 调整比例（') +
        adjust_ratio +
        t('%) x 预计备货天数（') +
        preparNumberText +
        t(')”展示，')
    } else {
      text = t('未设置“建议计划生产数”默认值，')
    }

    return text
  }

  const handleSetting = () => {
    history.push('/system/setting/system_setting?activeType=sales_invoicing')
  }

  return (
    <>
      <span>{t('建议计划生产数')}</span>
      <ToolTip
        popup={
          <div className='gm-padding-5'>
            {renderText()}
            <a onClick={handleSetting}>{t('点此设置')}</a>
          </div>
        }
      />
    </>
  )
})

export default SuggestPlanAmountHeader
