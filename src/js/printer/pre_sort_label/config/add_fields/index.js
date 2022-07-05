import { i18next } from 'gm-i18n'

const addFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('商品名'), value: '{{SKU}}' },
    { key: i18next.t('商品ID'), value: '{{SKU_ID}}' },
    { key: i18next.t('实称数(基本单位)'), value: '{{实称数_基本单位}}' },
    { key: i18next.t('规格'), value: '{{规格}}' },
    { key: i18next.t('商品描述'), value: '{{商品描述}}' },
    { key: i18next.t('商品验货码'), value: '{{商品码}}' },
    { key: i18next.t('自定义编码'), value: '{{自定义编码}}' },
    { key: i18next.t('站点名'), value: '{{站点名}}' },
    { key: i18next.t('客服电话'), value: '{{客服电话}}' },
  ],
  [i18next.t('操作')]: [
    { key: i18next.t('打包员账号'), value: '{{打包员账号}}' },
    { key: i18next.t('打包员名称'), value: '{{打包员名称}}' },
    { key: i18next.t('打印时间'), value: '{{当前时间_年月日}}' },
  ],
}

export default addFields
