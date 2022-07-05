import { i18next } from 'gm-i18n'
import moment from 'moment'
import {
  orderState,
  orderPackageStatus,
  skuBoxStatus,
} from '../../../../common/filter'

const excelSkuHeader = {
  category1_name: i18next.t('一级分类'),
  category2_name: i18next.t('二级分类'),
  spu_id: i18next.t('商品ID'),
  sku_id: i18next.t('商品规格'),
  sku_name: i18next.t('规格名称'),
  order_id: i18next.t('订单编号'),
  address_name: ({ row, value }) => {
    return [i18next.t('商户名称/SID'), `${value}${row.address_id}`]
  },
  order_status: ({ value }) => {
    return [i18next.t('订单状态'), orderState(value)]
  },
  route_name: i18next.t('线路'),
  driver_name: i18next.t('司机'),
  order_box_status: ({ value }) => {
    return [i18next.t('集包状态'), orderPackageStatus(value)]
  },
  quantity: i18next.t('下单数(销售单位)'),
  std_unit_quantity: i18next.t('下单数(基本单位)'),
  weight_quantity: i18next.t('称重数(基本单位)'),
  sku_box_status: ({ value }) => {
    return [i18next.t('装箱状态'), skuBoxStatus(value)]
  },
  box_code: ({ row: { box } }) => {
    return [i18next.t('箱子ID'), box ? box.box_code : '']
  },
  box_no: ({ row: { box } }) => {
    return [i18next.t('箱号'), box ? box.box_no : '']
  },
  box_time: ({ row: { box } }) => {
    return [
      i18next.t('装箱时间'),
      box ? moment(box.box_time).format('YYYY-MM-DD HH:mm:ss') : '',
    ]
  },
  box_operator: ({ row: { box } }) => {
    return [i18next.t('装箱人'), box ? box.box_operator : '']
  },
}

const excelOrderHeader = {
  service_time_period: i18next.t('运营周期'),
  order_id: i18next.t('订单号'),
  address_name: i18next.t('商户名'),
  status: ({ value }) => {
    return [i18next.t('订单状态'), orderState(value)]
  },
  route: i18next.t('线路'),
  driver: i18next.t('司机名'),
  order_box_status: ({ value }) => {
    return [i18next.t('集包状态'), orderPackageStatus(value)]
  },
  box_count: i18next.t('箱数'),
}

export { excelOrderHeader, excelSkuHeader }
