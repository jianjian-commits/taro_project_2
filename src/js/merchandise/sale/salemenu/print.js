import React from 'react'
import { observer } from 'mobx-react'
import SalemenuShareStore from '../store'
import SalemenuPrintTable from './salemenu_print_table'
import _ from 'lodash'
import { Flex } from '@gmfe/react'
import { changeDomainName } from '../../../common/service'
import moment from 'moment'
import { setTitle } from '@gm-common/tool'
import QRCode from 'qrcode.react'

@observer
class ShareSalemenu extends React.Component {
  componentDidMount() {
    // SalemenuShareStore.init()
    const param = this.props.location.query
    const { salemenu_id } = param
    SalemenuShareStore.getSalemenuShareInfo(salemenu_id).then((data) => {
      setTitle(`${data.sms_signature}报价单打印`)
      window.print()
    })
  }

  // 分割左右两张表来显示
  groupData = (category) => {
    const midpoint =
      category.length % 2 === 0
        ? category.length / 2
        : ~~(category.length / 2) + 1
    return {
      leftTableData: _.slice(category, 0, midpoint),
      rightTableData: _.slice(category, midpoint),
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
      const { leftTableData, rightTableData } = this.groupData(category)
      return (
        <div key={key}>
          <h1 className='gm-text-14' style={{ fontWeight: 'bold' }}>
            {category[0].category_name_1}
          </h1>
          <Flex justifyBetween>
            <SalemenuPrintTable data={leftTableData} type={1} />
            <div style={{ marginLeft: '10px' }} />
            {rightTableData.length ? (
              <SalemenuPrintTable data={rightTableData} type={2} />
            ) : null}
          </Flex>
        </div>
      )
    })
  }

  render() {
    const { salemenuInfo } = SalemenuShareStore
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
