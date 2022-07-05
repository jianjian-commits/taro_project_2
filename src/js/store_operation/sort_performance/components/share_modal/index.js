/*
 * @Description: 绩效工资单分享
 */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import qs from 'query-string'
import { observer } from 'mobx-react'

import { Select, Flex } from '@gmfe/react'
import QRCode from 'qrcode.react'
import { t } from 'gm-i18n'

import store from './store'

function ShareModal(props) {
  const {
    selectLabel = '',
    selectData = [],
    qrcodeId = '',
    user_id,
    start_date,
    end_date,
  } = props

  const { shareDatas } = store

  const [selectValue, setSelectValue] = useState(1)

  useEffect(() => {
    store.createShare({ user_id, start_date, end_date })
  }, [selectValue, user_id, start_date, end_date])

  const query = qs.stringify({
    type: selectValue,
    user_id,
    start_date,
    end_date,
    ...shareDatas,
  })

  return (
    <Flex justifyCenter alignCenter>
      <Flex column>
        <Flex className='gm-margin-10' alignCenter>
          <div>{t(selectLabel)}：</div>
          <Select
            value={selectValue}
            onChange={setSelectValue}
            data={selectData}
          />
        </Flex>
        <Flex column justifyCenter alignCenter>
          <div className='gm-padding-10 gm-bg' style={{ width: '270px' }}>
            <QRCode
              id={qrcodeId}
              size={250}
              value={`${window.location.origin}/more/#/share_performance_print?${query}`}
            />
          </div>
        </Flex>
      </Flex>
    </Flex>
  )
}
ShareModal.propTypes = {
  url: PropTypes.string.isRequired,
  selectData: PropTypes.array.isRequired,
  selectLabel: PropTypes.string,
  qrcodeId: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
  start_date: PropTypes.string.isRequired,
  end_date: PropTypes.string.isRequired,
}
export default observer(ShareModal)
