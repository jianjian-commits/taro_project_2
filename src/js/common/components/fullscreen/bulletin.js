import React from 'react'
import { Flex, FlipNumber } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Bulletin = ({ data }) => {
  const { text, value, preValue, decimal } = data
  return (
    <Wrapper>
      <div className='name'>{text}</div>
      <FlipNumber
        className='data'
        to={String(value)}
        decimal={decimal ?? 2}
        delay={500}
      />
      <Flex className='pre-data' justifyCenter>
        <div>{t('前一周期')}</div>
        <div>{decimal === 0 ? Number(preValue) : preValue}</div>
      </Flex>
    </Wrapper>
  )
}

Bulletin.propTypes = {
  data: PropTypes.object,
}
export default Bulletin

const Wrapper = styled.div`
  flex: 1;
  color: #fff;
  text-align: center;
  font-family: 'Helvetica';
  .name {
    font-size: 16px;
  }
  .data {
    color: #48d5f4;
    font-size: 26px;
    font-weight: bold;
    margin: 10px 0;
  }
  .pre-data {
    text-align: center;
    color: #8283a2;
  }
`
