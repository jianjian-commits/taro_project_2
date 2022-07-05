import React, { useState, useEffect } from 'react'
import { Modal, Storage, Flex } from '@gmfe/react'
import { getStaticStorage } from 'gm_static_storage'
import { openNewTab } from 'common/util'
import moment from 'moment'
import _ from 'lodash'

import globalStore from 'stores/global'

const ADKEY = 'ad_key'
const defaultAdInfo = {
  show: false,
  end: '',
  ad_url: '',
  jump_url: '',
}

const AdModal = () => {
  const [adInfo, setAdInfo] = useState(defaultAdInfo)

  const fetchAdInfo = () => {
    getStaticStorage(`/common/home_popup.json`).then((json) => {
      const {
        station: { start, end, ad_url, jump_url, groups },
      } = json
      const now = moment()
      const withinGroups =
        !groups ||
        !groups.length ||
        (groups && _.includes(groups, `${globalStore.groupId}`))
      const withinTime =
        now.isSameOrAfter(moment(start)) && now.isSameOrBefore(moment(end))

      setAdInfo({
        end: end,
        show: withinGroups && withinTime,
        ad_url: ad_url,
        jump_url: jump_url,
      })
    })
  }

  const handleClick = () => {
    openNewTab(adInfo.jump_url)
    setAdInfo({ ...adInfo, show: false })
  }

  const handleHide = () => {
    const { end } = adInfo
    Storage.set(ADKEY + end, 1)
    setAdInfo({ ...adInfo, show: false })
  }

  useEffect(() => {
    fetchAdInfo()
  }, [])

  if (!adInfo.show || Storage.get(ADKEY + adInfo.end)) {
    return null
  }

  return (
    <Modal
      show
      disableMaskClose
      className='gm-modal-clean'
      style={{ width: '920px' }}
    >
      <Flex column alignCenter style={{ paddingTop: '80px' }}>
        <Flex row>
          <div>
            <img
              src={adInfo.ad_url}
              style={{ width: '1000px', height: '500px' }}
              onClick={handleClick}
            />
          </div>
          <div className='b-popup-close text-center' onClick={handleHide}>
            <span style={{ fontSize: '24px', cursor: 'pointer' }}>X</span>
          </div>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default AdModal
