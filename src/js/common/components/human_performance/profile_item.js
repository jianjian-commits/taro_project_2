import React from 'react'
import { Flex } from '@gmfe/react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import SvgEmpty from 'svg/human_empty.svg'

const ProfileBox = styled(Flex)`
  height: 320px;
  width: 320px;
  font-size: 30px;
  font-weight: bold;
  background-size: 100% 100%;
`

const SpanBox = styled.span`
  position: relative;
  bottom: 30px;
`

const ProfileItem = (props) => {
  const { rankInfo } = props
  const { name, count, rank } = rankInfo
  const { isFullScreen } = props

  return (
    <Flex column alignCenter>
      <ProfileBox
        className={
          isFullScreen
            ? `b-performance-rank-full-${rank}`
            : `b-performance-rank-${rank}`
        }
        style={{ color: isFullScreen ? '#070f3d' : '#ffffff' }}
        column
        alignCenter
        justifyCenter
      >
        {!name && !count ? (
          <SvgEmpty
            className={`gm-position-relative b-performance-empty-${rank}`}
          />
        ) : (
          <p
            className='b-ellipsis-desc'
            style={{
              width: '150px',
              textAlign: 'center',
              wordBreak: 'break-all',
            }}
          >
            {name}
          </p>
        )}
      </ProfileBox>
      <SpanBox
        style={{
          color: isFullScreen ? '#ffffff' : '#4f586e',
          fontSize: '22px',
        }}
      >
        {!name && !count ? '（空缺位）' : `${name} ${count}`}
      </SpanBox>
    </Flex>
  )
}

ProfileItem.propTypes = {
  rankInfo: PropTypes.object,
  isFullScreen: PropTypes.bool,
}

export default ProfileItem
