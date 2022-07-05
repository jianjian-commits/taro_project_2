import moment from 'moment'

// 发送请求 时间参数格式
const reqTimeFormat = (time) => {
  return moment(time).format('YYYY-MM-DD')
}

// 页面展示 时间变量格式
const showTimeFormat = (time) => {
  return moment(time).format('YYYY-MM-DD HH:mm:ss')
}

// 生效时间限制
function disabledEffectiveTime(time) {
  return moment(new Date()).format('X') >= moment(time).format('X')
}

export { reqTimeFormat, showTimeFormat, disabledEffectiveTime }
