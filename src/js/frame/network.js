import bridge from '../bridge'
// import { reload } from '../common/util'

function offline() {
  window.alert('请连接网络')
}

if (bridge.isElectron) {
  // window.addEventListener('online', reload)
  window.addEventListener('offline', offline)
}
