import { t } from 'gm-i18n'
import moment from 'moment'
import { getStrByte } from 'common/util'

export const handleValidateName = value => {
  if (getStrByte(value) > 60) {
    return t('长度限制30个汉字或60个英文')
  }
  return ''
}

export const handleValidatorPhone = phone => {
  if (phone && phone.length > 11) {
    return t('手机号长度为1-11位')
  }
  return ''
}

export const handleValidatorNumber = number => {
  if (number && number.length > 30) {
    return t('长度限制30位数字')
  }
  return ''
}

/**
 * 团长有关的收货日期和下单日期时间段都只能选三个月
 */
export const DisableDate = (date, begin = new Date()) => {
  if (
    +moment(date) >= +moment(begin).add(-3, 'month').startOf('day') &&
    +moment(date) <= +moment()
  ) {
    return false
  }
  return true
}
