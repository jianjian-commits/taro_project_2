import React from 'react'
import { Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { history } from 'common/service'
import SvgNext from 'svg/next.svg'
import FourCornerBorder from 'common/components/four_corner_border'
import moment from 'moment'
import store from '../store'
import globalStore from 'stores/global'
@observer
class FullScreenHeader extends React.Component {
  handleExit = () => {
    history.push('/supply_chain/sorting/schedule?activeTab=0')
  }

  render() {
    const {
      user: { station_name },
    } = globalStore
    const canSortingScreen = globalStore.hasPermission('get_sorting_screen')
    const { target_date, time_config_id } = this.props.query
    const { serviceTime } = store
    const targetDate = moment(target_date).format('YYYY-MM-DD')
    const targetServiceTime = _.find(
      serviceTime,
      (s) => s._id === time_config_id,
    )

    return (
      <Flex
        justifyBetween
        alignCenter
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <Flex alignCenter>
          <span className='gm-margin-lr-10 gm-text-24 gm-text-bold gm-text-white'>
            {station_name + i18next.t('分拣进度管理')}
          </span>
          <span
            style={{
              fontSize: '16px',
              color: '#C0C0C0',
            }}
          >
            {targetDate}&nbsp;(
            {targetServiceTime ? targetServiceTime.name : '-'})
          </span>
        </Flex>
        {canSortingScreen ? (
          <Flex onClick={this.handleExit} width='80px' height='30px'>
            <FourCornerBorder>
              <Flex
                style={{
                  width: '80px',
                  height: '30px',
                }}
                className='gm-cursor b-sorting-full-screen-button'
                alignCenter
                justifyCenter
              >
                {i18next.t('退出投屏')}&nbsp;
                <SvgNext />
              </Flex>
            </FourCornerBorder>
          </Flex>
        ) : null}
      </Flex>
    )
  }
}

FullScreenHeader.propTypes = {
  query: PropTypes.object,
}

export default FullScreenHeader
