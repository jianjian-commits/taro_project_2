import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Flex, ToolTip as GMToolTip, Select, Price } from '@gmfe/react'

import { priceDateSelectedList } from '../util'
import store from '../store'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import lineEChartsHoc from 'common/components/customize_echarts/line_echarts_hoc'

const LineECharts = lineEChartsHoc(BaseECharts)

const Tooltip = (props) => (
  <GMToolTip
    popup={
      <div className='gm-padding-5' style={props.popupStyle}>
        {props.text}
      </div>
    }
    className='gm-margin-left-5'
  />
)

Tooltip.propTypes = {
  popupStyle: PropTypes.object,
  text: PropTypes.string,
}

const PriceModal = observer(({ data }) => {
  useEffect(() => {
    store.setPriceModal({ sku_id: data.sku_id })
    store.getSkuHistoryPriceList()

    return () => store.initPriceModalData()
  }, [])

  const handleSelect = (v) => {
    store.setSelectedPriceModalDate(v)
    store.getSkuHistoryPriceList()
  }

  const { sku_name, sku_id } = data
  const { start_time, end_time, priceList, dateSelected } = store.priceModal

  return (
    <>
      <div className='gm-padding-20'>
        <div className='gm-text-20'>
          {sku_name}
          {sku_id}
        </div>
        <div className='gm-margin-top-20'>
          <Select
            data={priceDateSelectedList}
            value={dateSelected}
            onChange={handleSelect}
          />
        </div>
      </div>
      <Flex>
        <Flex
          flex={1}
          column
          className='gm-back-bg gm-padding-tb-10 gm-margin-right-5'
        >
          <Flex justifyCenter alignCenter>
            <i
              className='xfont xfont-avgprice gm-text-14'
              style={{ color: '#00A6F4', paddingRight: '2px' }}
            />
            {t(/* src:`${x}天均价` => tpl:${x}天均价 */ 'KEY_avage_11', {
              x: dateSelected,
            })}
            <Tooltip
              text={t(
                /* src:`所选商品最近${x}天均价 => tpl:所选商品最近${x}天均价 */ 'KEY_avage',
                {
                  x: dateSelected,
                },
              )}
            />
          </Flex>
          <Flex justifyCenter>
            {store.averagePrice}
            {Price.getUnit()}
          </Flex>
        </Flex>
        <Flex
          flex={1}
          column
          justifyCenter
          className='gm-back-bg gm-padding-tb-10'
        >
          <Flex justifyCenter alignCenter>
            <i
              className='xfont xfont-linechart-up gm-text-14'
              style={{ color: '#FB3838', paddingRight: '2px' }}
            />
            {t(/* src:`${x}天最高` => tpl:${x}天最高 */ 'KEY_avage_1', {
              x: dateSelected,
            })}
            <Tooltip
              text={t(
                /* src:`所选商品最近${x}天的最高单价` => tpl:所选商品最近${x}天的最高单价 */ 'KEY_avage_223',
                {
                  x: dateSelected,
                },
              )}
            />
          </Flex>
          <Flex justifyCenter>
            {store.maxPrice}
            {Price.getUnit()}
          </Flex>
        </Flex>
        <Flex flex={1} column className='gm-back-bg gm-padding-tb-10'>
          <Flex justifyCenter alignCenter>
            <i
              className='xfont xfont-linechart-down gm-text-14'
              style={{ color: '#5EBC5E', paddingRight: '2px' }}
            />
            {t(
              /* src:`${dateSelected}天最低` => tpl:${x}天最低 */ 'KEY_avage_12',
              {
                x: dateSelected,
              },
            )}
            <Tooltip
              text={t(
                /* src:`所选商品最近${dateSelected}天的最低单价` => tpl:所选商品最近${x}天的最低单价 */ 'KEY_avage_2',
                {
                  x: dateSelected,
                },
              )}
            />
          </Flex>
          <Flex justifyCenter>
            {store.minPrice}
            {Price.getUnit()}
          </Flex>
        </Flex>
      </Flex>
      <LineECharts
        data={priceList.slice()}
        axisGroup={[{ x: 'date', y: 'price' }]}
        axisGroupName={[t('销售单价')]}
        axisName={{ x: t('日期'), y: t('基本单位单价(元)') }}
        fillAndFormatDate={{
          begin: start_time,
          end: end_time,
          fillItemName: 'date',
          dateFormatType: 'MM-DD',
        }}
        style={{ height: '381px', width: '100%' }}
        hasNoData={!priceList.length}
        customOption={{
          mainColor: ['#007EFF'],
        }}
        onSetCustomOption={(option) => ({
          ...option,
          grid: {
            ...option.grid,
            left: '50px',
            right: '5%',
            bottom: '45px',
          },
          legend: {
            ...option.legend,
            top: '10px',
          },
        })}
      />
    </>
  )
})

export default PriceModal
