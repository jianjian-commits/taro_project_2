import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('打印时间'), value: '{{当前时间}}' },
    { key: i18next.t('采购经办'), value: '{{采购员}}' },
    { key: i18next.t('采购单位'), value: '{{采购单位}}' },
    { key: i18next.t('供应商'), value: '{{供应商}}' },
    { key: i18next.t('供应商编号'), value: '{{供应商编号}}' },
    { key: i18next.t('预采购金额'), value: '{{预采购金额}}' },
    { key: i18next.t('采购金额'), value: '{{采购金额}}' },
    { key: i18next.t('任务数'), value: '{{任务数}}' },
    { key: i18next.t('采购员电话'), value: '{{采购员电话}}' },
    { key: i18next.t('供应商电话'), value: '{{供应商电话}}' },
    { key: i18next.t('采购单据号'), value: '{{采购单据号}}' },
    { key: i18next.t('单据备注'), value: '{{单据备注}}' },
    { key: i18next.t('最早收货时间'), value: '{{最早收货时间}}' },
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: '{{当前页码}} / {{页码总数}}' },
    { key: i18next.t('电子签名'), value: '{{电子签名}}', type: 'image' },
  ],
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('序号'), value: '{{列.序号}}' },
    { key: i18next.t('商品名称'), value: '{{列.商品名称}}' },
    { key: i18next.t('规格'), value: '{{列.规格}}' },
    { key: i18next.t('一级分类'), value: '{{列.一级分类}}' },
    { key: i18next.t('二级分类'), value: '{{列.二级分类}}' },
    { key: i18next.t('品类'), value: '{{列.品类}}' },
    { key: i18next.t('参考成本'), value: '{{列.参考成本}}' },
    { key: i18next.t('采购描述'), value: '{{列.采购描述}}' },
    { key: i18next.t('采购备注'), value: '{{列.采购备注}}' },
    { key: i18next.t('明细数'), value: '{{列.明细数}}' },
  ],
  [i18next.t('数量')]: [
    { key: i18next.t('库存'), value: '{{列.库存}}' },
    {
      key: i18next.t('计划采购(基本单位)'),
      value: '{{列.计划采购_基本单位}}{{列.基本单位}}',
    },
    {
      key: i18next.t('计划采购(采购单位)'),
      value: '{{列.计划采购_采购单位}}{{列.采购单位}}',
    },
    {
      key: i18next.t('实采(基本单位)'),
      value: '{{列.实采_基本单位}}{{列.基本单位}}',
    },
    {
      key: i18next.t('实采(采购单位)'),
      value: '{{列.实采_采购单位}}{{列.采购单位}}',
    },
    { key: i18next.t('建议采购'), value: '{{列.建议采购}}' },
  ],
  [i18next.t('价格')]: [
    {
      key: i18next.t('单价(基本单位)'),
      value: '{{列.单价_基本单位}}',
    },
    {
      key: i18next.t('单价(采购单位)'),
      value: '{{列.单价_采购单位}}',
    },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('预采购金额'), value: '{{列.预采购金额}}' },
    { key: i18next.t('采购金额'), value: '{{列.采购金额}}' },
    { key: i18next.t('采购金额（不含税)'), value: '{{列.采购金额_不含税}}' },
    { key: i18next.t('进项税率'), value: '{{列.进项税率}}' },
    { key: i18next.t('进项税额'), value: '{{列.进项税额}}' },
  ],
}

const detailFields = [
  { key: i18next.t('商户名'), value: '{{商户名}}' },
  { key: i18next.t('商户ID'), value: '{{商户ID}}' },
  { key: i18next.t('商户自定义编码'), value: '{{商户自定义编码}}' },
  {
    key: i18next.t('采购数量(采购单位)'),
    value: '{{采购数量_采购单位}}{{采购单位}}',
  },
  {
    key: i18next.t('采购数量(基本单位)'),
    value: '{{采购数量_基本单位}}{{基本单位}}',
  },
  { key: i18next.t('分拣序号'), value: '{{分拣序号}}' },
  { key: i18next.t('商品备注'), value: '{{商品备注}}' },
  { key: i18next.t('收货时间'), value: '{{收货时间}}' },
]

export default {
  commonFields,
  tableFields,
  detailFields,
}
