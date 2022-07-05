import { t } from 'gm-i18n'

const STATUS_DATA = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('审核中') },
  { value: 2, text: t('审核通过') },
  { value: 3, text: t('已删除') },
  { value: 4, text: t('不通过') },
]

const RETURN_STATUS_DATA = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('未归还') },
  { value: 2, text: t('已归还') },
  { value: 3, text: t('已删除') },
]

export { STATUS_DATA, RETURN_STATUS_DATA }
