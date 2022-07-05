import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gmfe/react'
import { doPrint } from 'gm-printer'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import formatData from '../config/data_to_key'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'

setTitle('结款单打印')

@connect((state) => ({ global: state.global }))
class Print extends React.Component {
  async componentDidMount() {
    const { template_id, data_id } = this.props.location.query
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const data = await this.getData(data_id)

    const config = await this.getConfig(template_id)
    // 添加打单人 和  打印时间
    data.print_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    data.print_operator = global.g_user.name

    doPrint({ data: formatData(data), config }, false, true)

    LoadingFullScreen.hide()
  }

  getConfig = (id) => {
    return Request('/fe/settle_tpl/get')
      .data({ id })
      .get()
      .then(
        (res) => res.data.content,
        () => {
          window.alert(i18next.t('模板配置发生变化，请重试！'))
        },
      )
  }

  getData = (id) => {
    return Request('/stock/settle_sheet/deal')
      .data({ sheet_no: id })
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
