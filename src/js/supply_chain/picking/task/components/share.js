import React from 'react'
import { Flex, Select } from '@gmfe/react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'
import QRCode from 'qrcode.react'
import globalStore from 'stores/global'

class Share extends React.Component {
  templates = {
    order: [
      // {
      //   type: 1,
      //   name: i18next.t('按订单打印（一个订单打印一张拣货单）')
      // },
      {
        type: 2,
        name: i18next.t('按订单汇总'),
      },
    ],
    spu: [
      {
        type: 2,
        name: i18next.t('商品汇总-明细'),
      },
      {
        type: 1,
        name: i18next.t('商品汇总'),
      },
    ],
  }

  state = {
    template: 2,
  }

  handleChange = (template) => {
    this.setState({
      template,
    })
  }

  render() {
    const { view, url } = this.props
    const { template } = this.state
    const shareUrl = `${url}&template=${view}_${template}&station_id=${globalStore.stationId}`
    return (
      <div>
        <Flex justifyCenter alignCenter className='gm-margin-bottom-20'>
          <span>{i18next.t('请选择分享模板')}：</span>
          <Select
            value={template}
            data={this.templates[view].map((v) => ({
              value: v.type,
              text: v.name,
            }))}
            onChange={this.handleChange}
          />
        </Flex>
        <QRCode
          id='shareQrcode'
          size={250}
          value={shareUrl}
          style={{ margin: '0 auto', display: 'block' }}
          onClick={() => window.open(shareUrl)}
        />
      </div>
    )
  }
}
Share.propTypes = {
  view: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
}
export default Share
