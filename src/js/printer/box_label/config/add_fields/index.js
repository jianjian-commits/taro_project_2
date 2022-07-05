import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('箱号'), value: '{{箱号}}' },
    { key: i18next.t('商品数'), value: '{{商品数}}' },
    { key: i18next.t('客服电话'), value: '{{客服电话}}' },
    { key: i18next.t('打印时间'), value: '{{打印时间}}' },
  ],
  [i18next.t('配送')]: [
    { key: i18next.t('商户名'), value: '{{商户名}}' },
    { key: i18next.t('自定义编码'), value: '{{自定义编码}}' },
    { key: i18next.t('收货时间'), value: '{{收货时间}}' },
    { key: i18next.t('收货人'), value: '{{收货人}}' },
    { key: i18next.t('收货电话'), value: '{{收货电话}}' },
    { key: i18next.t('订单号'), value: '{{订单号}}' },
    { key: i18next.t('分拣序号'), value: '{{分拣序号}}' },
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: '{{当前页码}}/{{页码总数}}' },
  ],
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('商品名'), value: '{{列.商品名}}' },
    {
      key: i18next.t('下单数（销售单位）'),
      value: '{{列.下单数_销售单位}}',
    },
    {
      key: i18next.t('下单数（销售单位&基本单位）'),
      value: '{{列.下单数_销售单位_基本单位}}',
    },
    { key: i18next.t('实称数'), value: '{{列.实称数}}' },
    { key: i18next.t('商品备注'), value: '{{列.商品备注}}' },
    { key: i18next.t('实称数(销售单位)'), value: '{{列.实称数_销售单位}}' },
  ],
}

export default {
  commonFields,
  tableFields,
}
