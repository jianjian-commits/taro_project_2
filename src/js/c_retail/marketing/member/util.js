import { t } from 'gm-i18n'

const checkMemberType = state => {
  const status = {
    0: t('非会员'),
    1: t('正常'),
    2: t('过期')
  }

  return status[state]
}

const checkMemberCardType = state => {
  const status = {
    1: t('月卡'),
    2: t('年卡')
  }

  return status[state]
}

export { checkMemberType, checkMemberCardType }
