import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Flex, Select, Option } from '@gmfe/react'
import _ from 'lodash'
import QRCode from 'qrcode.react'
import queryString from 'query-string'
import { Request } from '@gm-common/request'

class ShareQrcode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tpl_id: 0,
      tpl_list: [],
    }
  }

  componentDidMount() {
    Request(`/fe/purchase_tpl/list`)
      .get()
      .then((json) => {
        const list = json.data.map((o) => ({ id: o.id, name: o.content.name }))
        this.setState({
          tpl_list: list,
          tpl_id: list[0].id,
        })
      })
  }

  render() {
    const { shareType, shareName, shareUrlParam } = this.props
    const { tpl_list, tpl_id } = this.state

    // 后台有用,用来灰度啥的
    const __trace = `?__trace_group_id=${shareUrlParam.group_id}`

    const shareUrl = `${
      window.location.origin
    }/more/${__trace}/#/purchase_share?${queryString.stringify({
      ...shareUrlParam,
      tpl_id,
      print_what: shareType,
    })}`

    return (
      <Flex justifyCenter alignCenter>
        <Flex column>
          <Flex className='gm-margin-10'>
            <Flex alignCenter>{i18next.t('请选择分享内容')}：</Flex>
            <Flex>
              <Select
                name='shareQrcode'
                value={tpl_id}
                onChange={(tpl_id) => this.setState({ tpl_id })}
              >
                {_.map(tpl_list, (v) => (
                  <Option value={v.id} key={v.id}>
                    {v.name}
                  </Option>
                ))}
              </Select>
            </Flex>
          </Flex>
          <Flex className='gm-margin-10'>
            <div>{i18next.t('二维码展示')}：</div>
            <div>{shareName}</div>
          </Flex>
          <Flex column justifyCenter alignCenter>
            <div
              className='gm-padding-10 gm-bg gm-margin-left-10'
              style={{ width: '270px' }}
            >
              <QRCode
                id='shareQrcode'
                size={250}
                value={shareUrl}
                onClick={() => window.open(shareUrl)}
              />
            </div>
          </Flex>
        </Flex>
      </Flex>
    )
  }
}

ShareQrcode.propTypes = {
  shareType: PropTypes.oneOf(['order', 'task']).isRequired,
  shareName: PropTypes.string.isRequired,
  shareUrlParam: PropTypes.shape({
    station_id: PropTypes.string.isRequired,
    group_id: PropTypes.string.isRequired,
    sheet_no: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
  }).isRequired, // url参数
}

export default ShareQrcode
