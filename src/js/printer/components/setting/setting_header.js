import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'

const Header = (props) => {
  const { infos, actions } = props

  return (
    <Flex
      alignCenter
      justifyBetween
      style={{ backgroundColor: 'rgb(247, 248, 250)' }}
      className='gm-padding-20'
    >
      <Flex className='gm-text-bold gm-text-14'>
        {infos.map((o, i) => (
          <div style={{ marginRight: '40px' }} key={i}>
            {o.label}: {o.value}
          </div>
        ))}
      </Flex>
      <Flex justifyEnd>{actions}</Flex>
    </Flex>
  )
}

Header.propTypes = {
  infos: PropTypes.array.isRequired,
  actions: PropTypes.node.isRequired,
}

export default observer(Header)
