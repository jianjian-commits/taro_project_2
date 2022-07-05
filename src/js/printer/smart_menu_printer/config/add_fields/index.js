import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('智能菜单名称'), value: '{{智能菜单名称}}' },
    { key: i18next.t('店铺名称'), value: '{{店铺名称}}' },
    { key: i18next.t('客服电话'), value: '{{客服电话}}' },
    { key: i18next.t('商户'), value: '{{商户}}' },
    { key: i18next.t('联系方式'), value: '{{联系方式}}' },
    { key: i18next.t('备注信息'), value: '{{备注信息}}' },
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: '{{当前页码}}/{{页码总数}}' },
  ],
}

const tableFields = {
  [i18next.t('菜单信息')]: [
    { key: i18next.t('商品名'), value: '{{列.商品名1}}' },
    { key: i18next.t('规格'), value: '{{列.规格1}}' },
    { key: i18next.t('下单数'), value: '{{列.下单数1}}' },
    { key: i18next.t('商品名1'), value: '{{列.商品名2}}' },
    { key: i18next.t('规格1'), value: '{{列.规格2}}' },
    { key: i18next.t('下单数1'), value: '{{列.下单数2}}' },
    { key: i18next.t('商品名2'), value: '{{列.商品名3}}' },
    { key: i18next.t('规格2'), value: '{{列.规格3}}' },
    { key: i18next.t('下单数2'), value: '{{列.下单数3}}' },
  ],
}

export default {
  commonFields,
  tableFields,
}
