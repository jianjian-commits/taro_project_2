import React from 'react'
import { observer } from 'mobx-react'
import store from './menu/store'
import SalemenuPrintTable from './menu/salemenu_print_table'
import _ from 'lodash'
import { Flex } from '@gmfe/react'
import { changeDomainName } from '../../../common/service'
import moment from 'moment'
import { setTitle } from '@gm-common/tool'
import QRCode from 'qrcode.react'

@observer
class ShareSalemenu extends React.Component {
  componentDidMount() {
    // store.init()
    const param = this.props.location.query
    const { salemenu_id } = param
    store.getSalemenuShareInfo(salemenu_id).then((data) => {
      setTitle(`${data.sms_signature}报价单打印`)
      window.print()
    })
  }

  // 分割左中右三张表来显示
  groupData = (category) => {
    const left = []
    const middle = []
    const right = []
    category.forEach((item, i) => {
      i += 1
      switch (i % 3) {
        case 1:
          left.push(item)
          break
        case 2:
          middle.push(item)
          break
        case 0:
          right.push(item)
          break
      }
    })
    return {
      leftTableData: left,
      middleTableData: middle,
      rightTableData: right,
    }
  }

  renderTable = (sku_data) => {
    if (_.isEmpty(sku_data)) {
      return <div className='text-center'>没有数据</div>
    }
    return _.map(sku_data, (category, key) => {
      if (category.length <= 0) {
        return null
      }
      const { leftTableData, middleTableData, rightTableData } = this.groupData(
        category
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
              <SalemenuPrintTable data={leftTableData} type={1} />
            </div>
            <div className='gm-margin-lr-10' style={style}>
              {middleTableData.length ? (
                <SalemenuPrintTable data={middleTableData} type={2} />
              ) : null}
            </div>
            <div style={style}>
              {rightTableData.length ? (
                <SalemenuPrintTable data={rightTableData} type={3} />
              ) : null}
            </div>
          </Flex>
        </div>
      )
    })
  }

  render() {
    const { salemenuInfo } = store
    const { sku_data } = salemenuInfo

    return (
      <div className='gm-margin-lr-20 gm-margin-top-15'>
        <div>
          <Flex justifyBetween>
            <img
              style={{ width: '64px', height: '64px' }}
              src={salemenuInfo.logo}
            />
            <h1 className='gm-text-16'>{salemenuInfo.sms_signature}</h1>
            <QRCode
              id='shareQrcode'
              size={64}
              value={`${changeDomainName('station', 'bshop')}?cms_key=${
                salemenuInfo.address_url
              }`}
            />
          </Flex>
          <div className='gm-margin-top-10' />
          <Flex justifyBetween alignCenter>
            <div className='gm-text-10'>
              报价日期：{moment().format('YYYY-MM-DD HH:mm')}
            </div>
            <div className='gm-text-10'>订货电话：{salemenuInfo.phone}</div>
          </Flex>
        </div>
        {this.renderTable(sku_data)}
      </div>
    )
  }
}

export default ShareSalemenu
