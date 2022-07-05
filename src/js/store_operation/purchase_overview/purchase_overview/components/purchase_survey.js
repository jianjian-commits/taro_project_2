import React from 'react'
import { Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import Store from '../store'
import _ from 'lodash'
import CommonVerticalLayout from '../../../common/common_vertical_layout'
import FourCornerBorder from 'common/components/four_corner_border'
import UiStyle from '../../ui_style'

@observer
class PurchaseSurvey extends React.Component {
  contentComponent = (survey) => {
    const { isFullScreen } = Store

    return (
      <Flex
        flex={survey.length}
        style={UiStyle.getMoneyModalBackgroundColor(isFullScreen)}
      >
        {_.map(survey, (item, i) => (
          <CommonVerticalLayout
            name={item.name}
            tipContent={isFullScreen ? null : item.tipContent}
            value={item.value}
            symbol={item.symbol}
            key={i}
            color={item.color}
            className={item.className}
          />
        ))}
      </Flex>
    )
  }

  render() {
    const { overview, isFullScreen } = Store
    const survey = [
      {
        name: i18next.t('实际采购金额'),
        tipContent: i18next.t(
          '已提交采购单据的商品，通过采购数*采购价计算而得'
        ),
        value: overview.purchase_sum_money,
        symbol: '¥',
        color: isFullScreen ? '#1f94ff' : '',
        className: isFullScreen ? 'gm-text-white gm-text-16' : '',
      },
      {
        name: i18next.t('参考采购金额'),
        tipContent: i18next.t(
          '所有采购任务，通过计划采购数*最近采购价计算而得'
        ),
        value: overview.plan_sum_money,
        symbol: '¥',
        color: isFullScreen ? '#1f94ff' : '',
        className: isFullScreen ? 'gm-text-white gm-text-16' : '',
      },
      {
        name: i18next.t('实际入库金额'),
        tipContent: i18next.t('根据入库时间，通过入库数*入库价计算而得'),
        value: overview.stock_sum_money,
        symbol: '¥',
        color: isFullScreen ? '#1f94ff' : '',
        className: isFullScreen ? 'gm-text-white gm-text-16' : '',
      },
      {
        name: i18next.t('已采购商品种类数'),
        tipContent: i18next.t('已提交的采购单据的商品种类数'),
        value: overview.purchase_kinds,
        color: isFullScreen ? '#1f94ff' : '#515D74',
        className: isFullScreen ? 'gm-text-white gm-text-16' : '',
      },
    ]

    return isFullScreen ? (
      <FourCornerBorder>{this.contentComponent(survey)}</FourCornerBorder>
    ) : (
      this.contentComponent(survey)
    )
  }
}

export default PurchaseSurvey
