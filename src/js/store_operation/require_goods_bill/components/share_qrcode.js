import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Flex, Select, Option } from '@gmfe/react'
import _ from 'lodash'
import QRCode from 'qrcode.react'
import queryString from 'query-string'

// 要货单据分享
const REQUIREGOODSSHARE = [
  { value: 1, name: i18next.t('要货单据总表') },
  { value: 2, name: i18next.t('要货单据明细') },
]

class RequireShareQrcode extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // 分享总的or明细---（0:总的，1：明细）
      shareTotalOrDetail: 1,
    }

    this.handleFilterChange = ::this.handleFilterChange
  }

  handleFilterChange(value) {
    this.setState({
      shareTotalOrDetail: +value,
    })
  }

  render() {
    const { shareUrlParam } = this.props

    const urlParams = Object.assign(
      { isDetail: this.state.shareTotalOrDetail },
      shareUrlParam
    )

    const shareList = REQUIREGOODSSHARE

    let url = `${window.location.origin}/more/?__trace_group_id=${shareUrlParam.group_id}/#/require_goods?`

    const shareUrl = url + queryString.stringify(urlParams)

    return (
      <Flex justifyCenter alignCenter>
        <Flex column>
          <Flex className='gm-margin-10'>
            <Flex alignCenter>{i18next.t('请选择分享内容')}：</Flex>
            <Flex>
              <Select
                name='shareQrcode'
                value={this.state.shareTotalOrDetail}
                onChange={this.handleFilterChange}
              >
                {_.map(shareList, (sl) => (
                  <Option value={sl.value} key={sl.value}>
                    {sl.name}
                  </Option>
                ))}
              </Select>
            </Flex>
          </Flex>
          <Flex column justifyCenter alignCenter>
            <div
              className='gm-padding-10 gm-bg gm-margin-left-10'
              style={{ width: '270px' }}
            >
              <QRCode id='shareQrcode' size={250} value={shareUrl} />
            </div>
          </Flex>
        </Flex>
      </Flex>
    )
  }
}

RequireShareQrcode.propTypes = {
  shareUrlParam: PropTypes.object.isRequired, // url参数
}

export default RequireShareQrcode
