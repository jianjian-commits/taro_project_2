import { hot } from 'react-hot-loader/root'
// 各种语言初始化,一定要确保首先被执行
import './js/frame/i18next'
import ReactDOM from 'react-dom'
import React from 'react'
import Root from './js'
import './js/frame/network'

import './js/frame/action_storage'
import './js/frame/configure.request.js'
import './js/frame/configure.currency'
// import './js/frame/configure.fundebug'

import './css/index.less'

if (process.env.NODE_ENV !== 'production') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React)
}

const HotRoot = hot(Root)

ReactDOM.render(<HotRoot />, document.getElementById('appContainer'))
