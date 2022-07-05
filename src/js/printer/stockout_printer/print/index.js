import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import formatData from '../config/data_to_key'
import PropTypes from 'prop-types'
import moment from 'moment'
import { recordPrintLog } from '../../../common/print_log'
import globalStore from '../../../stores/global'

setTitle(i18next.t('出库单打印'))

class Print extends React.Component {
  async componentDidMount() {
    const { template_id, request_parameters } = this.props.location.query
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const [dataList, config] = await Promise.all([
      this.getDataList(JSON.parse(request_parameters)),
      this.getConfig(template_id),
    ])

    const list = dataList.out_stock_list.map((data) => {
      return {
        config,
        data: formatData({
          ...data,
          print_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          print_operator: globalStore.user.name,
        }),
      }
    })

    LoadingFullScreen.hide()
    // 正在记录打印
    await doBatchPrint(list)
    recordPrintLog({
      ids: dataList.map((o) => o.id),
      sheet_type: 2,
    })
  }

  getConfig = (id) => {
    return Request('/fe/stock_out_tpl/get')
      .data({ id })
      .get()
      .then(
        (res) => res.data.content,
        () => {
          window.alert(i18next.t('模板配置发生变化，请重试！'))
        },
      )
  }

  getDataList = (request_parameters) => {
    return Request('/stock/out_stock_sheet/list')
      .data({ ...request_parameters, is_for_print: 1 })
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
