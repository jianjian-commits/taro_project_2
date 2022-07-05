import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import store from './menu/store'
import SalemenuPrintTable from './menu/salemenu_print_table'
import { LoadingFullScreen } from '@gmfe/react'
import _ from 'lodash'
import { Flex, Button } from '@gmfe/react'
import { changeDomainName } from '../../../common/service'
import moment from 'moment'
import { setTitle } from '@gm-common/tool'
import QRCode from 'qrcode.react'
import html2canvas from 'html2canvas'

@observer
class SalemenuToImage extends React.Component {
  constructor(props) {
    super(props)
    this.refImage = React.createRef()
  }

  componentDidMount() {
    const param = this.props.location.query
    const { salemenu_id } = param
    store.getSalemenuShareInfo(salemenu_id).then((data) => {
      setTitle(`${data.sms_signature}报价单图片`)
    })
  }

  // 分割左右两张表来显示
  groupData = (category) => {
    const left = []
    const right = []
    category.forEach((item, i) => {
      i += 1
      switch (i % 2) {
        case 1:
          left.push(item)
          break
        case 0:
          right.push(item)
          break
      }
    })
    return {
      leftTableData: left,
      rightTableData: right,
    }
  }

  handleCreateImage = () => {
    LoadingFullScreen.render({
      size: 100,
      text: t('正在生成图片，请耐心等待!'),
    })
    html2canvas(this.refImage.current, {
      // //   scale: 3,
      useCORS: true,
    }).then((canvas) => {
      const base64Url = canvas.toDataURL()
      // 生成图片
      const a = document.createElement('a')
      a.download = '商品报价'
      a.href = base64Url
      // 就是生成失败html2canvas返回了一个data:; 长度为6的字符串 提示一下
      if (base64Url.length === 6) {
        window.alert('商品数量过多，图片生成失败')
      } else {
        a.click()
      }
      LoadingFullScreen.hide()
    })
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
      const style = {
        width: '100%',
      }

      return (
        <div key={key}>
          <h1 className='gm-text-14' style={{ fontWeight: 'bold' }}>
            {category[0].category_name_1}
          </h1>
          <Flex>
            <div style={style}>
              <SalemenuPrintTable
                data={leftTableData}
                type={1}
                columnSize={2}
              />
            </div>
            <div className='gm-margin-left-10' style={style}>
              {rightTableData.length ? (
                <SalemenuPrintTable
                  data={rightTableData}
                  type={2}
                  columnSize={2}
                />
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
      <Flex justifyCenter>
        <div
          style={{ width: '70%' }}
          className='gm-padding-lr-20 gm-padding-top-15'
          ref={this.refImage}
        >
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
        <Button className='gm-margin-top-20' onClick={this.handleCreateImage}>
          生成图片
        </Button>
      </Flex>
    )
  }
}

export default SalemenuToImage
