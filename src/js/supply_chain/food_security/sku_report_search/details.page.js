import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withBreadcrumbs, withRouter } from 'common/service'
import { t } from 'gm-i18n'
import { Flex, LoadingFullScreen } from '@gmfe/react'
import './index.less'
import ProductInformation from './components/product_information'
import InventoryInformation from './components/inventory_information'
import TestingInformation from './components/testing_information'
import ProcessInformation, { splitDate } from './components/process_information'
import { Request } from '@gm-common/request'
import moment from 'moment'

const Details = ({
  location: {
    query: { id },
  },
}) => {
  const [data, setData] = useState({})
  useEffect(() => {
    LoadingFullScreen.render({ text: t('加载中') })
    Request('/station/food_security/sku_detail/get')
      .data({ id })
      .get()
      .then(({ data }) => {
        setData(data)
      })
      .finally(() => LoadingFullScreen.hide())
  }, [])

  const {
    sku_image,
    sku_id,
    sku_name,
    sale_specification,
    sku_category,
    sku_quantity,
    out_base_quantity,
    exception_base_quantity,
    shall_return_quantity,
    real_return_quantity,
    in_stock_sheet,
    out_stock_sheet_id,
    out_stock_time,
    out_stock_creator,
    detect_institution,
    detect_images,
    order_date,
    purchase_time,
    purchaser_name,
    sort_time,
    sort_operator,
    plate_number,
    driver_name,
    distribute_time,
    exception_type,
    exception_time,
  } = data

  let in_stock_creator, in_stock_time
  if (in_stock_sheet) {
    in_stock_creator = in_stock_sheet[0].in_stock_creator
    in_stock_time = in_stock_sheet[0].in_stock_time
  }

  const processData = [
    {
      date: order_date,
      icon: 'order',
      title: [{ value: t('下单成功') }],
      show: !!order_date,
    },
    {
      date: purchase_time,
      icon: 'purchase',
      title: [
        { value: t('完成采购') },
        { label: t('采购员'), value: purchaser_name },
      ],
      show: !!purchase_time,
    },
    {
      date: in_stock_time,
      icon: 'submitIn',
      title: [
        { value: t('提交入库') },
        { label: t('建单员'), value: in_stock_creator },
      ],
      show: !!in_stock_time,
    },
    {
      date: sort_time,
      icon: 'sorting',
      title: [
        { value: t('完成分拣') },
        { label: t('分拣员'), value: sort_operator },
      ],
      show: !!sort_time,
    },
    {
      date: out_stock_time,
      icon: 'submitOut',
      title: [
        { value: t('提交出库') },
        { label: t('建单员'), value: out_stock_creator },
      ],
      show: !!out_stock_time,
    },
    {
      date: distribute_time,
      icon: 'driver',
      title: [
        { label: t('车牌号'), value: plate_number },
        { label: t('司机'), value: driver_name },
      ],
      show: !!distribute_time,
    },
    {
      date: exception_time,
      icon: 'warning',
      title: [{ value: `${t('异常')}/${exception_type}` }],
      show: !!exception_time,
    },
  ]

  processData.sort((current, next) =>
    moment(current.date).isBefore(next.date) ? -1 : 1
  )

  return (
    <Flex justifyAround wrap>
      <ProductInformation
        skuId={sku_id}
        saleSpecification={sale_specification}
        skuImage={sku_image}
        skuName={sku_name}
        skuCategory={sku_category}
        skuQuantity={sku_quantity}
        outBaseQuantity={out_base_quantity}
        exceptionBaseQuantity={exception_base_quantity}
        shallReturnQuantity={shall_return_quantity}
        realReturnQuantity={real_return_quantity}
      />
      <InventoryInformation
        inStockSheet={in_stock_sheet}
        outStockSheetId={out_stock_sheet_id}
        outStockTime={splitDate(out_stock_time)}
        outStockCreator={out_stock_creator}
      />
      <TestingInformation
        detectInstitution={detect_institution}
        detectImages={detect_images}
      />
      <ProcessInformation data={processData} />
    </Flex>
  )
}

Details.propTypes = {
  location: PropTypes.object,
}

export default withBreadcrumbs([t('商品详情')])(withRouter(Details))
