import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen, Tip } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer-label'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { toKey } from '../edit/data_to_key'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import globalStore from '../../../stores/global'

setTitle('分拣标签打印')

@connect((state) => ({ global: state.global }))
class Print extends React.Component {
  async componentDidMount() {
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    await globalStore.fetchCustomizedConfigs()
    const list = await this.getPrintInfo()

    // 打印
    doBatchPrint(list, false, {}, true)

    LoadingFullScreen.hide()
  }

  printNotice = (skus) => {
    // source_order_id 可为空
    // order_id 做下兼容，方便，不用转来转去
    const newSkus = skus.map((v) => ({
      order_id: v.order_id || v.id,
      detail_id: v.detail_id,
      sku_id: v.id,
      source_order_id: v.source_order_id,
      source_sku_id: v.source_sku_id,
      source_detail_id: v.source_detail_id,
    }))

    return Request(`/weight/sku/print`)
      .data({
        skus: JSON.stringify(newSkus),
      })
      .post()
      .catch((reason) => {
        Tip.warn({
          children: i18next.t('KEY7', {
            VAR1: reason,
          }),
          time: 0,
        })
      })
  }

  getPrintInfo = () => {
    const { isAllPageSelect, print } = this.props.location.query
    const printObj = JSON.parse(print)
    printObj.client = 'station'
    for (const key in printObj) {
      if (typeof printObj[key] === 'object') {
        printObj[key] = JSON.stringify(printObj[key])
      }
    }
    const listDataReq = isAllPageSelect
      ? printObj
      : { skus: print, client: 'station' }
    const reqList = [
      // 模板配置
      Request('/station/print_tag/list')
        .data()
        .get()
        .then((json) => json.data),
      // 请求打印数据
      Request('/weight/sku/print/infos')
        .data(listDataReq)
        .post()
        .then((json) => json.data),
    ]
    return Promise.all(reqList)
      .then((res) => {
        const [config, dataList] = res

        this.printNotice(dataList)
        // 找出默认模板
        const defaultTemplate = _.filter(
          config.result_list,
          (item) => item.is_default,
        )
        const _time = moment(Date.now()).format('YYYY-MM-DD')
        const datas = _.map(dataList, (data) => {
          return {
            ...data,
            time: _time,
            sort_id: data.sort_id || '-',
            std_sale_price: `${Big(data.std_sale_price || 0)
              .div(100)
              .toFixed(2)}${data.fee_unit}/${data.std_unit_name_forsale}`,
            sale_unit_price: `${Big(data.sale_unit_price || 0)
              .div(100)
              .toFixed(2)}${data.fee_unit}/${data.sale_unit_name}`,
            page_number: '1/1' || '',
            order: {
              ...data.order,
              sort_id: data.order.sort_id || '-',
              order_remark: data.order.remark,
            },
            outbound_amount: Big(data.out_stock_price || 0)
              .div(100)
              .toFixed(2),
            order_amount: Big(data.std_sale_price)
              .times(data.sale_ratio)
              .times(data.quantity)
              .div(100)
              .toFixed(2),
          }
        })

        return datas.map((item) => {
          return {
            data: toKey(item),
            config: defaultTemplate[0].content,
          }
        })
      })
      .catch((e) => {
        console.log('e', e)
        window.alert(i18next.t('模板配置发生变化，请返回上一页'))
      })
  }

  render() {
    return null
  }
}

Print.propTypes = {
  location: PropTypes.object,
}

export default Print
