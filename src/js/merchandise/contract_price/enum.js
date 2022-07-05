import { t } from 'gm-i18n'

export const STATUS_TYPE = [
  {
    value: '',
    text: t('全部'),
  },
  {
    value: 3,
    text: t('有效'),
  },
  {
    value: 1,
    text: t('无效'),
  },
]

export const STATUS_ENUM = {
  3: t('有效'),
  1: t('无效'),
}
