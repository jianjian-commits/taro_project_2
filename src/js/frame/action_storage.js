import store from './store'
import {
  initReduxActionStorage,
  DBActionStorage,
} from 'gm-service/src/action_storage'
import _ from 'lodash'
import globalStore from '../stores/global'

// 添加各种 namespace 的 storage
// 可通过 get{Name}Storage 获取
DBActionStorage.addDefaultStorage({
  name: 'user',
  namespace: globalStore.user.name,
})

// redux 集成
initReduxActionStorage(store)

const isValidTimeId = (timeId, timeList) => {
  return _.some(timeList, (s) => {
    const id = s.id || s._id // 目前接口返回的 id 有两种
    return id === timeId
  })
}

const getDefaultTimeId = (timeList = []) => {
  const firstTime = timeList[0]
  return _.get(firstTime, '_id') || _.get(firstTime, 'id', null)
}
// 1. 只缓存了 time_config_id 的，使用这个来初始化 time_config_id
function initServiceTimeId(curId, localId, timeList, updater) {
  const defaultId = getDefaultTimeId(timeList)
  if (isValidTimeId(localId, timeList)) {
    // curId 不合法 才赋值
    if (!isValidTimeId(curId)) {
      updater(localId)
    }
    // curId 合法 不处理。
  } else {
    updater(defaultId)
  }
}
// 2. 缓存了整个 timeList 的，使用这个来校验 time_config_id
function validateServiceTimeId(curId, timeList, updater) {
  if (isValidTimeId(curId, timeList)) {
    updater(curId)
  } else {
    const defaultId = getDefaultTimeId(timeList)
    updater(defaultId)
  }
}

// 添加helper 运营时间相关
DBActionStorage.addHelper('initServiceTimeId', initServiceTimeId)
DBActionStorage.addHelper('validateServiceTimeId', validateServiceTimeId)
