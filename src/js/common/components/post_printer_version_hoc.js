import React, { Component } from 'react'
import { Request } from '@gm-common/request'

const postPrinterVersion = (version) => (WrappedComponent) =>
  class extends Component {
    postPrinterVersion() {
      let config
      switch (version) {
        case 'old':
          config = 1
          break
        case 'new':
          config = 2
          break
        default:
          throw new Error('版本设置不正确')
      }

      return Request('/station/distribute_config/old_or_new/set')
        .data({ config })
        .post()
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          postPrinterVersion={this.postPrinterVersion}
        />
      )
    }
  }

export default postPrinterVersion
