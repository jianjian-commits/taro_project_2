import { i18next } from 'gm-i18n'
import React from 'react'
import { LoadingFullScreen } from '@gmfe/react'
import { Request } from '@gm-common/request'
import { setTitle } from '@gm-common/tool'
import formatData from '../config/data_to_key'
import { doBatchPrint } from 'gm-printer'
import _ from 'lodash'

setTitle(i18next.t('打印'))

class BoxLabelPrinter extends React.Component {
  async componentDidMount() {
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const list = await this.getPrintInfo()

    LoadingFullScreen.hide()
    doBatchPrint(list)
    const box_ids = _.map(list, (item) => {
      return item.data._origin.box_id
    })
    this.doAddPrintTimes(box_ids)
  }

  doAddPrintTimes = (box_ids) => {
    Request('/box/print_times/add')
      .data({
        box_ids: JSON.stringify(box_ids),
      })
      .post()
  }

  getPrintInfo = () => {
    const { tpl_id, ...print_info_query } = this.props.location.query

    const reqList = [
      Request('/box/print')
        .data({
          ...print_info_query,
        })
        .post()
        .then((json) => json.data),
      !!tpl_id &&
        Request('/box_template/detail')
          .data({
            id: tpl_id,
          })
          .get()
          .then((json) => json.data),
      !tpl_id &&
        Request('/box_template/list')
          .data()
          .get()
          .then((json) => json.data),
    ]

    return Promise.all(reqList)
      .then((res) => {
        const [list, selectedConfig, allConfig] = res

        return list.map((item) => {
          const config = this.getPrintConfig(item, selectedConfig, allConfig)
          return {
            data: formatData(item),
            config,
          }
        })
      })
      .catch(() => {
        window.alert(i18next.t('模板配置发生变化，请返回上一页'))
      })
  }

  getPrintConfig = (data, selectedConfig, allConfig) => {
    let config = { ...selectedConfig }
    if (!selectedConfig && allConfig) {
      const cfg = _.find(allConfig, (cfg) => {
        const address_ids = _.map(cfg.address_list, 'address_id')
        return !cfg.is_default && address_ids.includes(data.address_id)
      })
      if (cfg) {
        config = cfg
      } else {
        config = _.find(allConfig, (cfg) => cfg.is_default)
      }
    }

    const { content, address_list } = config
    const address = address_list.find(
      (address) => address.address_id === data.address_id
    )
    return {
      ...content,
      page: {
        ...content.page,
        pageStyle: {
          backgroundColor: address && address.color_code,
          WebkitPrintColorAdjust: 'exact',
        },
      },
    }
  }

  render() {
    return null
  }
}

export default BoxLabelPrinter
