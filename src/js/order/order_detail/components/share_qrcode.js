import { i18next } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Flex, Select, Option } from '@gmfe/react'
import _ from 'lodash'
import QRCode from 'qrcode.react'
import queryString from 'query-string'
import globalStore from 'stores/global'
import { Request } from '@gm-common/request'

const ShareQrcode = ({ shareName, shareUrlParam }) => {
  // 后台有用,用来灰度啥的
  const __trace = `?__trace_group_id=${shareUrlParam.group_id}`
  const [tpl_id, setTplId] = useState(0)
  const [tpl_list, setTplList] = useState('')

  useEffect(() => {
    Request(`/station/distribute_config/list`)
      .get()
      .then((json) => {
        const list = json.data.map((o) => ({ id: o.id, name: o.content.name }))
        setTplList(list)
        setTplId(list[0].id)
      })
  }, [])
  shareUrlParam.contract_rate_format =
    globalStore?.orderInfo?.contract_rate_format
  const shareUrl = `${
    window.location.origin
  }/more/${__trace}/#/order_printer_share?${queryString.stringify({
    ...shareUrlParam,
    tpl_id,
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
              onChange={(tpl_id) => {
                setTplId(tpl_id)
              }}
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

ShareQrcode.displayName = 'ShareQrcode'
ShareQrcode.propTypes = {
  shareName: PropTypes.string.isRequired,
  shareUrlParam: PropTypes.shape({
    station_id: PropTypes.string.isRequired,
    group_id: PropTypes.string.isRequired,
    order_id: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    user_name: PropTypes.string.isRequired,
  }).isRequired, // url参数
}
export default ShareQrcode
