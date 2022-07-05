import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('商户名'), value: '{{商户名}}' },
    { key: i18next.t('报价时间'), value: '{{当前时间}}' },
    { key: i18next.t('商品数'), value: '{{商品数}}' },
    { key: i18next.t('定价周期'), value: '{{定价周期}}' },
    { key: i18next.t('订货电话'), value: '{{订货电话}}' },
    { key: i18next.t('规则生效时间'), value: '{{规则生效时间}}' },
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: '{{当前页码}}/{{页码总数}}' },
    { key: i18next.t('logo'), value: '{{logo}}', type: 'image' },
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
    {
      key: i18next.t('销售价'),
      value: `{{列.销售价_销售单位}}`,
    },
    { key: i18next.t('描述'), value: '{{列.描述}}' },
    { key: i18next.t('商品特征'), value: '{{列.商品特征}}' },
    { key: i18next.t('品牌'), value: '{{列.品牌}}' },
    { key: i18next.t('区域'), value: '{{列.区域}}' },
    { key: i18next.t('产地'), value: '{{列.产地}}' },
    { key: i18next.t('商品规格'), value: '{{列.商品规格}}' },
    { key: i18next.t('售后标准'), value: '{{列.售后标准}}' },
  ],
  [i18next.t('数量')]: [
    { key: i18next.t('库存'), value: '{{列.库存}}{{列.基本单位}}' },
  ],
}

export default {
  commonFields,
  tableFields,
}
