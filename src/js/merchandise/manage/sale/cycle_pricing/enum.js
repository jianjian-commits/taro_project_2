import { i18next } from 'gm-i18n'

// 周期定价表状态
export const STATUS_TYPE = [
  {
    value: '',
    text: i18next.t('全部状态'),
  },
  {
    value: 2,
    text: i18next.t('已结束'),
  },
  {
    value: 1,
    text: i18next.t('已生效'),
  },
  {
    value: 0,
    text: i18next.t('未开始'),
  },
]
