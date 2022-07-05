import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
// eslint-disable-next-line import/no-unresolved
import store from './store'
import { Flex } from '@gmfe/react'
import { AccountItem } from './account_item'
import DeleteIcon from './delete_icon'
import RelatedAccountModal from './account_switch_modal'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'

const AccountList = observer((props) => {
  const { popref } = props

  // 先请求账号列表
  const { list } = store

  useEffect(() => {
    store.getMultiAccountList()
  }, [])

  return (
    <div
      style={{ width: '200px', backgroundColor: 'rgba(239, 242, 246, 0.5)' }}
    >
      {_.map(list, (c, i) => (
        <AccountItem
          {...c}
          isSwitched
          key={i}
          popref={popref}
          icon={<DeleteIcon popref={popref} user_id={c.user_id} />}
          style={{ width: '198px' }}
        />
      ))}
      <Flex
        alignCenter
        justifyCenter
        className='gm-cursor gm-text-third gm-text-14'
        style={{
          height: '34px',
        }}
        onClick={() => {
          // popref.current.apiDoSetActive(false)
          RelatedAccountModal({ popref })
        }}
      >
        {i18next.t('+ 添加账号信息')}
      </Flex>
    </div>
  )
})

AccountList.propTypes = {
  popref: PropTypes.object,
}

export { AccountList }
