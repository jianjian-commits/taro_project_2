import React from 'react'
import { observer } from 'mobx-react'
import { Form, FormItem, Validator, Button, Tip } from '@gmfe/react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { handleValidateName, handleValidatorPhone } from '../../../util'
import LevelSelectDetail from '../../../common/level_select_detail'

const BasicInfos = React.forwardRef((props, ref) => {
  const {
    detail: { username, wx_name, community_name, level_id, history_sale_money },
    setDetailFields,
    setUnbindWeChat,
    type
  } = props.store

  const handleUnbindWeChat = async () => {
    const { id } = props
    await setUnbindWeChat(id)
    setDetailFields(null, 'wx_name')
    Tip.success(t('成功解除绑定'))
  }

  return (
    <Form ref={ref} colWidth='400px'>
      <FormItem
        label={t('团长账号')}
        labelWidth='120px'
        required
        validate={Validator.create(
          [Validator.TYPE.number],
          username,
          username => handleValidatorPhone(username)
        )}
      >
        <input
          value={username}
          onChange={e => setDetailFields(e.target.value, 'username')}
          placeholder={t('输入手机号')}
        />
      </FormItem>
      <FormItem label={t('微信绑定')} labelWidth='120px'>
        {wx_name ? (
          <div>
            <span className='gm-margin-right-5'>{wx_name}</span>
            <Button type='primary' onClick={handleUnbindWeChat}>
              {t('解除绑定')}
            </Button>
          </div>
        ) : (
          <div />
        )}
      </FormItem>

      <FormItem
        label={t('社区店')}
        labelWidth='120px'
        required
        validate={Validator.create([], community_name, community_name =>
          handleValidateName(community_name)
        )}
      >
        <input
          value={community_name}
          onChange={e => setDetailFields(e.target.value, 'community_name')}
          placeholder={t('输入社区店名称')}
        />
      </FormItem>
      {type === 'edit' && (
        <FormItem label={t('团长等级')} labelWidth='120px'>
          <LevelSelectDetail
            value={level_id}
            onChange={value => setDetailFields(value, 'level_id')}
            saleMoney={history_sale_money}
          />
        </FormItem>
      )}
    </Form>
  )
})

BasicInfos.propTypes = {
  store: PropTypes.object,
  id: PropTypes.string
}

export default observer(BasicInfos)
