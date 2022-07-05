import { i18next } from 'gm-i18n'
import Clipboard from 'clipboard'
import ReactDOM from 'react-dom'
import React from 'react'
import PropTypes from 'prop-types'
import { Tip } from '@gmfe/react'
import { is } from '@gm-common/tool'

class Copy extends React.Component {
  componentDidMount() {
    this.clipboard = new Clipboard(ReactDOM.findDOMNode(this), {
      text: () => this.props.text,
    })

    this.clipboard.on('success', () => {
      if (is.phone()) {
        window.alert(i18next.t('复制成功'))
      } else {
        Tip.success(i18next.t('复制成功'))
      }
    })

    this.clipboard.on('error', () => {
      if (is.phone()) {
        window.alert(i18next.t('复制失败，请使用手机复制功能进行复制'))
      } else {
        Tip.success(i18next.t('复制失败，请手动复制'))
      }
    })
  }

  componentWillUnmount() {
    this.clipboard.destroy()
  }

  render() {
    return this.props.children
  }
}

Copy.propTypes = {
  text: PropTypes.string,
}

export default Copy
