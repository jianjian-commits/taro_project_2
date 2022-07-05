import fundebug from 'fundebug-javascript'
import { version } from '../../../package.json'

// eslint-disable-next-line
const isProduct = __PRODUCTION__

// 后期可以通过配置来制定收集客户端信息
// 比如收集葛洪信息，比如收集 console,比如全量收集

// 配置见 https://docs.fundebug.com/notifier/javascript/customize/
fundebug.init({
  silent: !isProduct,
  sampleRate: 1,
  apikey: 'fd4f95532906efb630ad38d27b8e75df5615faef004e7e69aff9797f05b5bc35',
  appversion: version,
  setHttpBody: true,
  silentWebsocket: true,
  httpTimeout: 30000,
  silentResource: true,
  user: {
    // eslint-disable-next-line
    name: window.g_user && window.g_user.name,
  },
  metaData: {
    // eslint-disable-next-line
    station_id: window.g_user && window.g_user.station_id,
  },
  filters: [
    {
      message: /^Script error\.$/,
    },
    {
      target: {
        tagName: /^IMG$/,
        status: 'inexistence',
      },
    },
    {
      message: /WeixinJSBridge is not defined/,
    },
    {
      type: /^unhandledrejection$/,
    },
    {
      type: /^caught$/,
    },
    {
      type: /^uncaught$/,
    },
    {
      type: /^httpError$/,
    },
  ],
})
// 挂到全局，方便测试
window._fundebug = fundebug

export { fundebug }
