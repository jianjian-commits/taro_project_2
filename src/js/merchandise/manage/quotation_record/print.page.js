import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { printStore as store } from './store'
import SaleMenuPricePrintTable from './components/salemenu_price_print_table'
import _ from 'lodash'
import { Flex } from '@gmfe/react'
import moment from 'moment'
import { setTitle } from '@gm-common/tool'
import QRCode from 'qrcode.react'

const renderTable = (sku_data) => {
  if (_.isEmpty(sku_data)) {
    return <div className='text-center'>没有数据</div>
  }
  return _.map(sku_data, (category, key) => {
    if (category.length <= 0) {
      return null
    }

    const { leftList, midList, rightList } = _.reduce(
      category,
      (res, item, index) => {
        if (index % 3 === 0) {
          res.leftList.push(item)
        } else if (index % 3 === 1) {
          res.midList.push(item)
        } else {
          res.rightList.push(item)
        }
        return res
      },
      { leftList: [], midList: [], rightList: [] },
    )

    const style = {
      width: '33%',
    }

    return (
      <div key={key}>
        <h1 className='gm-text-14' style={{ fontWeight: 'bold' }}>
          {category[0].category_name_1}
        </h1>
        <Flex justifyBetween style={{ width: '100%' }}>
          <div style={style}>
            <SaleMenuPricePrintTable data={leftList} type={1} />
          </div>
          <div className='gm-margin-lr-10' style={style}>
            {midList.length ? (
              <SaleMenuPricePrintTable data={midList} type={2} />
            ) : null}
          </div>
          <div style={style}>
            {rightList.length ? (
              <SaleMenuPricePrintTable data={rightList} type={3} />
            ) : null}
          </div>
        </Flex>
      </div>
    )
  })
}

const ShareHistoryPrice = observer((props) => {
  useEffect(() => {
    setTitle('历史报价')
    store.initPrintInfo()

    const { end_time, start_time, salemenu_id } = props.location.query

    const params = { end_time, start_time, salemenu_id }
    // 获取分享报价单的url
    store.getShareInfo(params)
    // 获取打印的数据
    store.getPrintInfo(params).then((json) => {
      setTitle(`${json.data.sms_signature}历史报价打印`)
      window.print()
    })
  }, [])

  const { sku_data, logo, phone, share_url } = store
  const { start_time } = props.location.query

  return (
    <div className='gm-margin-lr-20 gm-margin-top-15'>
      <div>
        <Flex justifyBetween>
          <img style={{ width: '64px', height: '64px' }} src={logo} />
          <h1 className='gm-text-16'>历史报价</h1>
          <QRCode id='shareQrcode' size={64} value={share_url} />
        </Flex>
        <div className='gm-margin-top-10' />
        <Flex justifyBetween alignCenter>
          <div className='gm-text-10'>
            历史报价日期：{moment(start_time).format('YYYY-MM-DD')}
          </div>
          <div className='gm-text-10'>订货电话：{phone}</div>
        </Flex>
      </div>
      {renderTable(sku_data)}
    </div>
  )
})

export default ShareHistoryPrice
