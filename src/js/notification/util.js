import { isEnglish } from 'gm-i18n'
import _ from 'lodash'
import moment from 'moment'
/* i18n-scan-disable */
const relativeTime = {
  'a few seconds': '几秒前',
  minutes: '分钟前',
  minute: '分钟前',
  hours: '小时前',
  hour: '小时前',
  days: '天前',
  day: '天前',
  months: '月前',
  month: '月前',
  years: '年前',
  year: '年前',
  an: '1',
  a: '1',
}
/* i18n-scan-enable */
const parseRelativeTime = (time) => {
  // 替换为中文
  const humanizeText = moment.duration({ from: time }).humanize()
  if (isEnglish()) {
    return humanizeText + ' ago'
  }
  let resultText = humanizeText
  _.forEach(relativeTime, (value, key) => {
    resultText = resultText.replace(key, value)
  })
  return resultText
}

export { parseRelativeTime }
