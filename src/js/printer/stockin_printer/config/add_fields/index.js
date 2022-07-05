import { i18next } from 'gm-i18n'
import { Price } from '@gmfe/react'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('单据日期'), value: '{{单据日期}}' },
    { key: i18next.t('单据编号'), value: '{{单据编号}}' },
    { key: i18next.t('往来单位'), value: '{{往来单位}}' },
    { key: i18next.t('单据备注'), value: '{{单据备注}}' },
    { key: i18next.t('打印时间'), value: '{{打印时间}}' },
    { key: i18next.t('打单人'), value: '{{打单人}}' },
    { key: i18next.t('建单人'), value: '{{建单人}}' },
  ],
  [i18next.t('金额')]: [
    {
      key: i18next.t('整单金额'),
      value: `${Price.getCurrency()}{{整单金额}}`,
    },
    {
      key: i18next.t('商品金额'),
      value: `${Price.getCurrency()}{{商品金额}}`,
    },
    {
      key: i18next.t('折让金额'),
      value: `${Price.getCurrency()}{{折让金额}}`,
    },
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: '{{当前页码}}/{{页码总数}}' },
  ],
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('批次号'), value: '{{列.批次号}}' },
    { key: i18next.t('商品ID'), value: '{{列.商品ID}}' },
    { key: i18next.t('规格ID'), value: '{{列.规格ID}}' },
    { key: i18next.t('商品名称'), value: '{{列.商品名称}}' },
    { key: i18next.t('商品分类'), value: '{{列.商品分类}}' },
    { key: i18next.t('一级分类'), value: '{{列.一级分类}}' },
    { key: i18next.t('最高入库单价'), value: '{{列.最高入库单价}}' },
    { key: i18next.t('生产日期'), value: '{{列.生产日期}}' },
    { key: i18next.t('保质期'), value: '{{列.保质期}}' },
    { key: i18next.t('存放货位'), value: '{{列.存放货位}}' },
    { key: i18next.t('操作人'), value: '{{列.操作人}}' },
    { key: i18next.t('商品备注'), value: '{{列.商品备注}}' },
    { key: i18next.t('自定义'), value: '' },
    { key: i18next.t('采购描述'), value: '{{列.采购描述}}' },
  ],
  [i18next.t('单位')]: [
    {
      key: i18next.t('入库单位(基本单位)'),
      value: '{{列.入库单位_基本单位}}',
    },
    {
      key: i18next.t('入库单位(包装单位)'),
      value: '{{列.入库单位_包装单位}}',
    },
  ],
  [i18next.t('数量')]: [
    {
      key: i18next.t('入库数(基本单位)'),
      value: '{{列.入库数_基本单位}}',
    },
    {
      key: i18next.t('入库数(包装单位)'),
      value: '{{列.入库数_包装单位}}',
    },
  ],
  [i18next.t('金额')]: [
    {
      key: i18next.t('入库单价(基本单位)'),
      value: '{{列.入库单价_基本单位}}',
    },
    {
      key: i18next.t('入库单价(包装单位)'),
      value: '{{列.入库单价_包装单位}}',
    },
    { key: i18next.t('入库金额'), value: '{{列.入库金额}}' },
    { key: i18next.t('补差金额'), value: '{{列.补差金额}}' },
    { key: i18next.t('入库金额（不含税)'), value: '{{列.入库金额_不含税}}' },
    { key: i18next.t('进项税率'), value: '{{列.进项税率}}' },
    { key: i18next.t('进项税额'), value: '{{列.进项税额}}' },
  ],
}

export default {
  commonFields,
  tableFields,
}
