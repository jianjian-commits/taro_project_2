import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gmfe/react'
import { doPrint } from 'gm-printer'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import formatData from '../config/data_to_key'
import PropTypes from 'prop-types'
import Template from '../config/template_config/default_config'

setTitle('智能菜单打印')

class Print extends React.Component {
  async componentDidMount() {
    const { id } = this.props.location.query
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const data = await this.getData(id)
    const config = Template

    doPrint({ data: formatData(data), config })
    LoadingFullScreen.hide()
  }

  // 获取打印信息
  getData = (id) => {
    return Request('/station/smart_menu/print')
      .data({ id })
      .get()
      .then((res) => res.data)
  }

  render() {
    return null
  }
}

Print.propTypes = {
  location: PropTypes.object,
}

export default Print
