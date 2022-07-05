import React from 'react'
import { Flex, Popover } from '@gmfe/react'
import { AccountList } from './account_list'
import AccountSwitch from 'svg/account_switch.svg'

const SwitchIcon = () => {
  const ref = React.createRef()
  return (
    <Popover
      ref={ref}
      type='click'
      right
      offset={15}
      popup={<AccountList popref={ref} />}
    >
      <Flex alignCenter justifyCenter className='gm-cursor'>
        <AccountSwitch style={{ fontSize: '16px' }} />
      </Flex>
    </Popover>
  )
}

export { SwitchIcon }
