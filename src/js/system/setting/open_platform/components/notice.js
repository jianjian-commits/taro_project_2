import React from 'react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import { observer } from 'mobx-react'
import store from '../store'
import globalStore from '../../../../stores/global'

@observer
class Component extends React.Component {
  render() {
    const { app } = this.props
    const {
      youzanInfo: { shop_name, auth_status },
      youzanId,
    } = store
    const isExpiryTime = moment(app.expiry_time) < moment()
    const textClass = classNames('gm-padding-bottom-5', {
      'b-warning-tips': isExpiryTime || auth_status === i18next.t('已过期'),
      'b-color-active': !isExpiryTime || auth_status === i18next.t('已授权'),
    })
    if (
      globalStore.hasPermission('open_app_youzan') &&
      app.appid === youzanId &&
      shop_name
    ) {
      return (
        <div className={textClass}>
          {`${i18next.t('店铺名称')}：${shop_name} ${i18next.t('授权状态')}：`}
          <span className='gm-margin-right-15'>{auth_status}</span>
        </div>
      )
    }
    return app.status !== 1 ? (
      <div className={textClass}>
        {i18next.t('open_platform_tip', {
          VAR1: moment(app.expiry_time).format('YYYY-MM-DD HH:mm'),
        })}
      </div>
    ) : null
  }
}

Component.propTypes = {
  app: PropTypes.object,
}

export default Component
