import React from 'react'
import { Flex, Tip } from '@gmfe/react'
import { Avatar } from '../component'
import RelatedAccountModal from './account_switch_modal'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'

const AccountItem = (props) => {
  const {
    icon,
    isSwitched,
    user_id,
    username,
    station_id,
    station_name,
    account_bounding,
    logo,
    popref,
    style,
  } = props

  const one = `${station_id} ${station_name}`
  const two = `${username}`

  const swtichAccount = async () => {
    // 如果不是切换则不能点击
    if (!isSwitched) {
      return
    }

    // 请求...
    // 如果失败
    const res = await Request('/station/login')
      .data({
        user_id,
        account_bounding,
      })
      .post()

    const { code } = res

    if (code !== 0) {
      Tip.danger('切换失败, 请重新输入账号密码!')
      RelatedAccountModal({
        isEdit: true,
        popref,
        original_username: username,
      })
    } else {
      window.location.reload()
    }
  }

  return (
    <Flex
      style={{
        lineHeight: 1,
        height: '30px',
        borderRadius: '30px',
        backgroundColor: 'rgba(239, 242, 246, 0.5)',
        marginRight: '20px',
        padding: '0 15px 0 0',
        width: '200px',
        ...style,
      }}
      onClick={swtichAccount}
    >
      <Avatar name={two} url={logo} />
      <div className='gm-padding-5' />
      <Flex flex column justifyCenter className='gm-cursor'>
        <div
          className='gm-text-12 gm-line-height-1 gm-text-ellipsis'
          style={{ width: '120px' }}
        >
          {one}
        </div>
        <div
          className='gm-text-12 gm-line-height-1 gm-text-ellipsis gm-text-third'
          style={{ width: '120px' }}
        >
          {two}
        </div>
      </Flex>
      {icon}
    </Flex>
  )
}

AccountItem.propTypes = {
  icon: PropTypes.element,
  isSwitched: PropTypes.bool,
  user_id: PropTypes.number,
  username: PropTypes.string,
  account_bounding: PropTypes.number,
  station_id: PropTypes.string,
  station_name: PropTypes.string,
  name: PropTypes.string,
  logo: PropTypes.string,
  popref: PropTypes.object,
  style: PropTypes.object,
}

export { AccountItem }
