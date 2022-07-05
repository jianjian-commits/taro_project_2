/**
 * @description 打印
 */
import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import formatData from '../config/data_to_key'
import PropTypes from 'prop-types'

setTitle(i18next.t('报价单'))

class Print extends React.Component {
  async componentDidMount() {
    const { template_id } = this.props.location.query

    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const [data, config] = await Promise.all([
      this.getDataList(),
      this.getConfig(template_id),
    ])

    const list = [
      {
        config,
        data: formatData(data),
      },
    ]

    LoadingFullScreen.hide()

    doBatchPrint(list)
  }

  getConfig = (id) => {
    return Request('/fe/sale_menu_tpl/get')
      .data({ id })
      .get()
      .then(
        (res) => res.data.content,
        () => {
          window.alert(i18next.t('模板接口发生错误，请重试！'))
        },
      )
  }

  // 获取打印列表
  getDataList = () => {
    const {
      salemenu_id,
      print_type,
      type,
      category_sort,
    } = this.props.location.query
    if (type === 'cycle_price') {
      return this.getCyclePriceList({ rule_id: salemenu_id })
    }
    return this.getSalemenuList({
      salemenu_id,
      print_type,
      category_sort: category_sort === 'true' ? 1 : 0,
    })
  }

  // 请求周期定价接口
  getCyclePriceList = (req) => {
    console.log(req)
    return Request('/salemenu/cycle_pricing/print')
      .data(req)
      .get()
      .then((res) => res.data)
  }

  // 请求报价单接口
  getSalemenuList = (req) => {
    return Request('/station/salemenu/print')
      .data(req)
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
