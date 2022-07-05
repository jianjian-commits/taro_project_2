import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, LoadingChunk } from '@gmfe/react'
import { renderDistribute } from './util'
import actions from '../actions'
import './actions'
import './reducer'
import requirePdfMake from 'gm-service/src/require_module/require_pdfmake'

// 模拟的数据,用来显示模板
const templateOrder = [
  {
    resname: ' ',
    address_sign_id: '30200200000',
    receiver_name: ' ',
    sort_id: '',
    abnormal_money: 0,
    address: ' ',
    source_origin_id: '',
    child_sort_id: '',
    abnormals: [],
    refund_money: 0,
    details: [
      {
        real_weight: 0,
        name: ' ',
        purchase_station_id: 'T248',
        specs: '-',
        total_item_price: 0,
        union_dispatch: true,
        remark: null,
        std_sale_price: 0,
        sale_ratio: 1,
        sale_unit_name: ' ',
        salemenu_id: 'S1006',
        std_unit_name: ' ',
        sale_price: 0,
        id: 'D1475920',
        quantity: 0,
        category_title_1: ' ',
        category_title_2: ' ',
        pinlei_title: '',
        real_item_price: 0,
        outer_id: '',
        area_sign: '',
        is_weigh: false,
        real_is_weight: false,
        desc: '',
        real_weight_sale: '',
        real_weight_std: '',
        real_item_price_without_tax: '',
        tax: '',
        sale_price_without_tax: '',
        tax_rate: '',
      },
    ],
    sid: '32904',
    address_sign: ' ',
    date_time: ' ',
    receive_end_time: ' ',
    sales_name: i18next.t('超级管理员'),
    total_price: 0,
    freight: 0,
    refunds: [],
    origin_customer: {},
    total_pay: 0,
    real_price: 0,
    receive_begin_time: ' ',
    id: 'PL836475',
    receiver_phone: ' ',
    carrier: '',
    area_l2: '',
    area_l1: '',
    city: '',
    cname: '',
    driver_phone: '',
    driver_name: '',
    area_sign: '',
  },
]

class DistributePrinter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
    }
  }

  componentDidMount() {
    const { template_id } = this.props.history.location.query
    const orders = templateOrder

    actions.template_config_detail_fetch(template_id).then((templateConfig) => {
      let docPdf = renderDistribute(orders, templateConfig)
      docPdf[0].pageMargins = [10, 10, 10, 0]

      requirePdfMake((pdfMake) => {
        const pdfDocGenerator = pdfMake.createPdf(docPdf)
        pdfDocGenerator.getDataUrl((dataUrl) => {
          const iframe = this.iframe
          iframe.src = dataUrl
        })
        this.setState({ isLoading: false })
      })
    })
  }

  render() {
    return (
      <Flex column alignCenter>
        {this.state.isLoading ? (
          <LoadingChunk
            text={i18next.t('数据请求中...')}
            loading={this.state.isLoading}
            style={{ marginTop: '300px' }}
          />
        ) : (
          <iframe
            ref={(ref) => {
              this.iframe = ref
            }}
            style={{
              width: '670px',
              height: '600px',
              border: 'none',
            }}
          />
        )}
      </Flex>
    )
  }
}

export default DistributePrinter
