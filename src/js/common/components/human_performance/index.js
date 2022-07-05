import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import './style.less'

import ProfileItem from './profile_item'
import RankItem from './rank_item'

const FlexHeader = styled(Flex)`
  .b-full-screen-title {
    font-size: 28px;
    font-weight: bold;
    color: #ffffff;
    bottom: 50px;
  }

  .b-right-action {
    right: 20px;
  }
`

const HumanPerformance = (props) => {
  const { title, right, isFullScreen, rankData, ...rest } = props

  return (
    <>
      <FlexHeader alignCenter justifyCenter>
        {isFullScreen ? (
          <Flex className='gm-position-relative b-full-screen-title'>
            {title}
          </Flex>
        ) : (
          <Flex
            className='b-performance-header gm-margin-top-20 gm-margin-bottom-10'
            alignCenter
            justifyCenter
          >
            {title}
          </Flex>
        )}
        <Flex className='gm-position-absolute b-right-action'>{right}</Flex>
      </FlexHeader>
      <Flex
        className={classNames(
          { 'b-performance-bg': isFullScreen },
          { 'gm-margin-top-20': isFullScreen },
        )}
        alignCenter
        justifyCenter
      >
        {_.map(rankData.beforeThirdData, (item) => {
          return (
            <ProfileItem
              rankInfo={item}
              isFullScreen={isFullScreen}
              key={item.rank}
            />
          )
        })}
      </Flex>
      {!isFullScreen && (
        <div className='gm-padding-5' style={{ backgroundColor: '#F7F8FA' }} />
      )}
      <Flex alignCenter column>
        <Flex
          column
          alignCenter
          justifyCenter
          width='1200px'
          height='380px'
          className={classNames({ 'b-performance-rank-bg': isFullScreen })}
        >
          {_.isEmpty(rankData.restData) ? (
            <Flex className='gm-text-desc' alignCenter justifyCenter>
              {t('没有更多数据了')}
            </Flex>
          ) : (
            _.map(rankData.restData, (item) => {
              return (
                <RankItem
                  rankInfo={item}
                  isFullScreen={isFullScreen}
                  key={item.rank}
                />
              )
            })
          )}
        </Flex>
      </Flex>
    </>
  )
}

HumanPerformance.propTypes = {
  title: PropTypes.string,
  right: PropTypes.any,
  // rankData = { beforeThirdData: [], restData: [] }
  rankData: PropTypes.object,
  isFullScreen: PropTypes.bool,
}

HumanPerformance.defaultProps = {
  isFullScreen: false,
}

export default HumanPerformance
