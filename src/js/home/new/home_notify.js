import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { t } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import moment from 'moment'
import { Request } from '@gm-common/request'
import SvgNext from 'svg/next.svg'
import PropTypes from 'prop-types'
import Panel from 'common/components/dashboard/panel'
import { NOTIFY_TYPE } from 'common/enum'
import { notifyNavgation } from './util'
import globalStore from 'stores/global'

const Notify = ({ className }) => {
  const [list, setList] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    return Request('/home_page/new_info/list')
      .data()
      .get()
      .then((json) => setList(json.data))
  }

  const handleClick = (type, key) => {
    window.open(notifyNavgation(type, key).link)
  }

  const { isCStation } = globalStore.otherInfo

  return (
    <Panel
      title={t('消息通知')}
      className={className}
      height='220px'
      right={
        isCStation ? null : (
          <Link
            className='gm-text-12 gm-margin-top-5 text-primary'
            to='/home/old/notify'
          >
            {t('查看全部')}
            <SvgNext />
          </Link>
        )
      }
    >
      {list.length && (
        <div
          className='gm-overflow-y'
          style={{ height: '180px', overflow: 'hidden' }}
        >
          {list.map((v, i) => (
            <Flex
              key={i}
              className='b-home-border-bottom gm-cursor gm-disabled-first-padding gm-padding-top-15 gm-padding-bottom-5 gm-bg-hover-primary gm-text-12'
              onClick={() => handleClick(v.type, v.key)}
            >
              <div style={{ whiteSpace: 'nowrap' }}>
                【{NOTIFY_TYPE[v.type]}】
              </div>
              <div style={{ flex: 1, width: 0 }}>
                <span className='gm-ellipsis'>{v.content}</span>
              </div>
              <div>{moment(v.date_time).format('YYYY-MM-DD')}</div>
            </Flex>
          ))}
        </div>
      )}
    </Panel>
  )
}

Notify.propTypes = {
  className: PropTypes.string,
}
export default Notify
