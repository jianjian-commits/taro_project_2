import React from 'react'
import { getStaticStorage } from 'gm_static_storage'
import globalStore from '../stores/global'

class KF extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
    }
  }

  componentDidMount() {
    getStaticStorage('/common/kf.json').then((json) => {
      if (!json.hide.includes(globalStore.groupId)) {
        this.setState({
          show: true,
        })
      }
    })
  }

  handleClick() {
    if (window.qimoChatClick) {
      window.qimoChatClick()
    }
  }

  render() {
    if (!this.state.show) {
      return null
    }
    // i18n-scan-disable
    return (
      <div className='b-kefu gm-padding-5' onClick={this.handleClick}>
        <img
          style={{ width: '1em', height: '1em' }}
          src='//webchat.yuntongxun.com/images/1.png?1221'
        />
        <br />观<br />麦<br />服<br />务
      </div>
    )
    // i18n-scan-enable
  }
}

export default KF
