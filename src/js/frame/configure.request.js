import { NProgress } from '@gmfe/react'
import { Tip } from '@gmfe/react'
import {
  configHeaders,
  configError,
  configProgress,
  // configTrace,
} from '@gm-common/request'

// configTrace({
//   canRequest: (url) => {
//     // 全量请求上报
//     return true
//   },
// })

configProgress(
  () => {
    NProgress.start()
  },
  () => {
    NProgress.done()
  },
)
configError((message) => {
  Tip.warning({
    children: message,
    time: 5000,
  })
})
configHeaders()
