import globalStore from '../stores/global'
import _ from 'lodash'

const canShow = (obj) => {
  // eitherAuth array 有其一权限则显示
  // bothAuth  array  必须有所有权限才显示
  const { auth, globalField, eitherAuth, bothAuth } = obj

  let result = true

  if (auth !== undefined && !globalStore.user.permission.includes(auth)) {
    result = false
  }

  if (
    eitherAuth &&
    !_.find(eitherAuth, (a) => !!globalStore.user.permission.includes(a))
  ) {
    result = false
  }

  if (
    bothAuth &&
    _.find(bothAuth, (a) => !globalStore.user.permission.includes(a))
  ) {
    result = false
  }

  if (globalField !== undefined && !globalField) {
    result = false
  }

  return result
}

function processNavConfig(navConfig) {
  return _.filter(navConfig, (oneNav) => {
    if ((oneNav.display && !!oneNav.display) || oneNav.display === undefined) {
      if (oneNav && oneNav.sub) {
        oneNav.sub = _.filter(oneNav.sub, (twoNav) => {
          if (
            (twoNav.display && !!twoNav.display) ||
            twoNav.display === undefined
          ) {
            if (twoNav && twoNav.sub) {
              twoNav.sub = _.filter(twoNav.sub, (value) => {
                return value.display === undefined || value.display
              })
              return twoNav.sub.length
            }
          }
          return false
        })
        return oneNav.sub.length
      }
    }
    return false
  })
}

export { canShow, processNavConfig }
