import { t } from 'gm-i18n'
import { changeDomainName, System } from '../../../common/service'

const STATUS = {
  10: t('全部状态'),
  0: t('无效'),
  1: t('有效'),
}

const USAGESTATUS = {
  10: t('全部优惠券'),
  1: t('待使用'),
  2: t('已使用'),
  3: t('已过期'),
}

const TYPE = {
  1: t('满减券-通用券'),
  2: t('满减券-分类券'),
}

const AUDIENCETYPE = () => {
  if (System.isC()) {
    return {
      21: t('全部客户'),
      22: t('新客户'),
      23: t('按客户标签'),
      24: t('指定客户'),
      25: t('会员'),
      26: t('邀请有礼'),
      27: t('红包分享'),
    }
  } else {
    return {
      1: t('全部商户'),
      2: t('新商户'),
      3: t('按商户标签'),
      4: t('指定商户'),
    }
  }
}

// 优惠券发放方式
const RECEIVETYPT = () => {
  if (System.isC()) {
    return [
      { value: 1, text: t('客户领取') },
      { value: 2, text: t('平台发放') },
    ]
  } else {
    return [
      { value: 1, text: t('商户领取') },
      { value: 2, text: t('平台发放') },
    ]
  }
}

// 优惠券状态
const isActive = (is_active) => {
  if (is_active === 1) {
    return t('有效')
  } else if (is_active === 0) {
    return t('无效')
  } else return '-'
}

const audienceType = (type) => {
  switch (type + '') {
    case '1':
      return t('全部商户')
    case '2':
      return t('新商户')
    case '3':
      return t('按商户标签')
    case '4':
      return t('指定商户')
    case '21':
      return t('全部客户')
    case '22':
      return t('新客户')
    case '23':
      return t('按客户标签')
    case '24':
      return t('指定客户')
    case '25':
      return t('会员')
    case '26':
      return t('邀请有礼')
    case '27':
      return t('红包分享')

    default:
      return ''
  }
}

const usageStatus = (status) => {
  switch (status + '') {
    case '1':
      return t('待使用')
    case '2':
      return t('已使用')
    case '3':
      return t('已过期')

    default:
      return ''
  }
}

// 优惠券url
const createCouponUrl = (id, key) => {
  if (System.isC()) {
    return `${changeDomainName('', 'cshop')}/?cms_key=${key}#/coupon/${id}`
  } else {
    return `${changeDomainName(
      'station',
      'bshop',
    )}?cms_key=${key}#/coupon/${id}`
  }
}

const splitPhone = (phone, gid) => phone.split(gid)[1]

const TIME_TYPE = [
  { text: t('有效期天数'), value: 1 },
  { text: t('自定义时间'), value: 2 },
]

const getCouponLabel = (coupon) => {
  const labelList = []
  if (coupon.category_id_1_list?.length > 0) {
    labelList.push(t('分类券'))
  } else {
    labelList.push(t('通用券'))
  }

  if (coupon.audience_type === 2 || coupon.audience_type === 22) {
    labelList.push(t('新人券'))
  }

  return labelList.length > 0 ? labelList : ''
}

export {
  STATUS,
  USAGESTATUS,
  RECEIVETYPT,
  TYPE,
  AUDIENCETYPE,
  isActive,
  audienceType,
  usageStatus,
  createCouponUrl,
  splitPhone,
  TIME_TYPE,
  getCouponLabel,
}
