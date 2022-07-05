import { isSimplifiedChinese } from 'gm-i18n'
import React from 'react'
import { Flex, Storage } from '@gmfe/react'
import { getStaticStorage } from 'gm_static_storage'
import moment from 'moment'
import _ from 'lodash'
import './warning.less'
import globalStore from '../stores/global'
const waringKey = 'warning_key'

class Warning extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      end: '',
      text: '',
    }
  }

  componentDidMount() {
    getStaticStorage(`/common/upgrade_warning.json`).then((json) => {
      const {
        station: { start, end, text_zh, text_en, groups },
      } = json
      const now = moment()
      const withinGroups =
        !groups ||
        !groups.length ||
        (groups && _.includes(groups, `${globalStore.groupId}`))
      const withinTime =
        now.isSameOrAfter(moment(start)) && now.isSameOrBefore(moment(end))

      this.setState({
        end: end,
        show: withinGroups && withinTime,
        text: isSimplifiedChinese() ? text_zh : text_en,
      })
    })
  }

  handleClose = () => {
    const { end } = this.state
    Storage.set(waringKey + end, 1)
    this.setState({
      show: false,
    })
  }

  render() {
    const { show, text, end } = this.state
    if (!show || Storage.get(waringKey + end)) {
      return null
    }

    return (
      <Flex
        justifyCenter
        alignCenter
        className='gm-animated b-fade-in-top-100 gm-position-fixed gm-box-shadow-bottom gm-padding-15 b-warning-box'
      >
        <button
          type='button'
          className='b-warning-close'
          onClick={this.handleClose}
        >
          <span>×</span>
        </button>
        <div className='gm-text-red'>{text}</div>
      </Flex>
    )
  }
}

export default Warning
