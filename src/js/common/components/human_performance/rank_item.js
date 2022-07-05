import React from 'react'
import { Flex, Progress } from '@gmfe/react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const SpanBox = styled(Flex)`
  font-size: 22px;
`

const RankItem = (props) => {
  const { rank, name, percentage, count } = props.rankInfo
  const { isFullScreen } = props
  const strokeColor = isFullScreen
    ? 'linear-gradient(to right, #015CFF, #37FBFF)'
    : '#1a7adb'
  const fontColor = isFullScreen ? '#ffffff' : '#4f586e'

  return (
    <Flex
      row
      alignCenter
      className={classNames({
        'gm-margin-bottom-15': +rank !== 10,
      })}
      style={{ paddingLeft: isFullScreen ? '40px' : '0px' }}
    >
      <SpanBox style={{ color: fontColor, width: '240px' }}>
        NO.{rank}
        <span
          className='b-ellipsis-desc'
          style={{
            paddingLeft: +rank !== 10 ? '40px' : '25px',
            wordBreak: 'break-all',
          }}
        >
          {name}
        </span>
      </SpanBox>
      <Progress
        percentage={+percentage}
        strokeWidth={12}
        showText={false}
        strokeColor={strokeColor}
        style={{ width: '700px' }}
      />
      <SpanBox style={{ color: fontColor, width: '160px' }}>{count}</SpanBox>
    </Flex>
  )
}

RankItem.propTypes = {
  rankInfo: PropTypes.object,
  isFullScreen: PropTypes.bool,
}

export default RankItem
