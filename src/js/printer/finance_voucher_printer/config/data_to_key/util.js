import _ from 'lodash'
import Big from 'big.js'
import { t } from 'gm-i18n'

export const coverDigit2Uppercase = (n) => {
  if (_.isNil(n) || _.isNaN(n)) {
    return '-'
  }

  const fraction = ['角', '分']

  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']

  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]

  const head = n < 0 ? '欠' : ''

  n = Math.abs(n)

  let left = ''
  let right = ''
  let i = 0
  for (i; i < fraction.length; i++) {
    right +=
      digit[
        Math.floor(
          Big(n)
            .times(Big(10).pow(i + 1))
            .mod(10)
            .toString(),
        )
      ] + fraction[i]
  }
  // 1.06 --- 壹元零陆分
  right = right.replace(/(零分)/, '').replace(/(零角)/, '零')
  // 1.00 --- 壹元整
  right = right === '零' ? '整' : right
  // 1.60 --- 壹元陆角整 1.66 --- 壹元陆角陆分
  right = /角$/.test(right) ? right + '整' : right
  n = Math.floor(n)

  for (i = 0; i < unit[0].length && n > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p
      n = Math.floor(n / 10)
    }
    left = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + left
  }

  return (
    head +
    (left.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零') + right).replace(
      /^整$/,
      '零元整',
    )
  )
}

// 12 => S000012  ,  1232131 => S1232131  sid显示,不足6位补足
export const convertNumber2Sid = (id) => {
  if (/^\d+$/.test(id)) {
    id = parseInt(id, 10)
    if (id > 1000000) {
      return 'S' + id
    } else {
      return 'S' + (1000000 + id + '').slice(1)
    }
  } else {
    return id
  }
}

export const price = (n) => {
  const result = Big(n || 0).toFixed(2)
  return result === '0.00' ? '' : result
}

export function combineType(type) {
  switch (type) {
    case 2:
      return '二级组合商品'
    case 3:
      return '三级组合商品'
    default:
      return '暂无该组合商品类型'
  }
}

export const weekMap = {
  1: t('星期一'),
  2: t('星期二'),
  3: t('星期三'),
  4: t('星期四'),
  5: t('星期五'),
  6: t('星期六'),
  7: t('星期天'),
}
