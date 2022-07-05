/** value 不要加多语言,加者GG🔥🚸 */
import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('账户名'), value: '{{账户名}}' },
    { key: i18next.t('手机号'), value: '{{手机号}}' },
    { key: i18next.t('打印时间'), value: '{{当前时间}}' },
    { key: i18next.t('结款人'), value: '{{结款人}}' },
    { key: i18next.t('结款电话'), value: '{{结款电话}}' },
    { key: i18next.t('结算方式'), value: '{{结算方式}}' },
    { key: i18next.t('结款周期'), value: '{{结款周期}}' },
    { key: i18next.t('授信额度'), value: '{{授信额度}}' },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('下单金额'), value: '{{下单金额}}' },
    { key: i18next.t('出库金额'), value: '{{出库金额}}' },
    { key: i18next.t('运费'), value: '{{运费}}' },
    { key: i18next.t('异常金额'), value: '{{异常金额}}' },
    { key: i18next.t('销售额(含运税)'), value: '{{销售额_含运税}}' },
    { key: i18next.t('优惠金额'), value: '{{优惠金额}}' },
  ],
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('序号'), value: '{{列.序号}}' },
    { key: i18next.t('商户名'), value: '{{列.商户名}}' },
    { key: i18next.t('商品名'), value: '{{列.商品名}}' },
    { key: i18next.t('类别'), value: '{{列.类别}}' },
    { key: i18next.t('规格'), value: '{{列.规格}}' },
    { key: i18next.t('明细'), value: '{{列.明细}}' },
    { key: i18next.t('自定义'), value: '' },
  ],
  [i18next.t('数量')]: [
    {
      key: i18next.t('下单数'),
      value: '{{列.下单数}}{{列.销售单位}}',
    },
    {
      key: i18next.t('出库数(基本单位)'),
      value: '{{列.出库数_基本单位}}{{列.基本单位}}',
    },
    {
      key: i18next.t('出库数(销售单位)'),
      value: '{{列.出库数_销售单位}}{{列.销售单位}}',
    },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('单价(基本单位)'), value: '{{列.单价_基本单位}}' },
    { key: i18next.t('单价(销售单位)'), value: '{{列.单价_销售单位}}' },
    { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
  ],
}
const summaryFields = []

export default {
  commonFields,
  tableFields,
  summaryFields,
}
