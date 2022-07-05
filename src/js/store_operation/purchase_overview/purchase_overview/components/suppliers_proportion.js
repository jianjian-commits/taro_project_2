import React from 'react'
import { Box } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import Store from '../store'
import UiStyle from '../../ui_style'
import PurchaseOverviewTitle from '../../../common/purchase_overview_title'

import BaseECharts from 'common/components/customize_echarts/base_echarts'
import pieEChartsHoc from 'common/components/customize_echarts/pie_echarts_hoc'
import FourCornerBorder from 'common/components/four_corner_border'

const PieECharts = pieEChartsHoc(BaseECharts)
@observer
class SuppliersProportion extends React.Component {
  contentComponent = () => {
    const { begin_time, end_time } = Store.purchaseFilter
    const { suppliersProportion, isFullScreen } = Store

    return (
      <Box hasGap style={UiStyle.getModalBackgroundColor(isFullScreen)}>
        <PurchaseOverviewTitle
          title={i18next.t('供应商占比')}
          style={isFullScreen ? { color: '#daeeff' } : ''}
          type={isFullScreen ? 'fullScreen' : 'more'}
          linkRoute={
            '/supply_chain/purchase/analysis?tab=0&begin_time=' +
            begin_time +
            '&end_time=' +
            end_time
          }
          linkText={i18next.t('查看更多')}
        />
        <div>
          <PieECharts
            style={{
              height: isFullScreen ? '250px' : '196px',
              width: '100%',
              marginTop: '10px',
            }}
            data={suppliersProportion.slice()}
            axisGroup={[
              { itemName: 'supplier_name', value: 'purchase_sum_money' },
            ]}
            hasNoData={suppliersProportion.length === 0}
            axisGroupName={['供应商占比']}
            radiusList={[40, 70]}
            onSetCustomOption={(option) => {
              return {
                ...option,
                legend: {
                  ...option.legend,
                  top: '10px',
                  textStyle: isFullScreen
                    ? {
                        color: '#c3cad9', // 文案颜色
                      }
                    : { ...option.legend.textStyle },
                },
                color: isFullScreen
                  ? [
                      '#08a5f1',
                      '#0576ea',
                      '#6dd5a0',
                      '#ece339',
                      '#ffcc5e',
                      '#f0970f',
                      '#fc6263',
                      '#ad40e9',
                      '#18dd7b',
                      '#6351bb',
                    ]
                  : option.color,
              }
            }}
          />
        </div>
      </Box>
    )
  }

  render() {
    const { isFullScreen } = Store

    return isFullScreen ? (
      <FourCornerBorder>{this.contentComponent()}</FourCornerBorder>
    ) : (
      this.contentComponent()
    )
  }
}

export default SuppliersProportion
