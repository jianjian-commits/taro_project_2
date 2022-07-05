import React from 'react'
import {
  Form,
  FormItem,
  FormGroup,
  FormPanel,
  Switch,
  Popover,
  Tip,
} from '@gmfe/react'
import store from './stores'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import globalStore from '../../../../stores/global'
import stationOrder from '../../../../../img/short_msg_station_order.jpg'
import bshopOrder from '../../../../../img/short_msg_bshop_order.jpg'
import phoneVerify from '../../../../../img/short_msg_phone_verify.jpg'

@observer
class Setting extends React.Component {
  constructor(props) {
    super(props)

    this.formRefs = React.createRef()
  }

  handleSubmit = () => {
    store.updateSetting().then(() => {
      Tip.success(i18next.t('更新成功!'))
    })
  }

  componentDidMount = () => {
    store.requestSetting()
  }

  handleCancel = () => {
    store.requestSetting()
  }

  handleChange = (field, value) => {
    store.setMsgSetting(field, value)
  }

  renderPopup = (src) => {
    return (
      <div className='gm-padding-5'>
        <img src={src} />
      </div>
    )
  }

  render() {
    const { msgSetting } = store
    const { isCStation } = globalStore.otherInfo

    return (
      <FormGroup
        formRefs={[this.formRefs]}
        onSubmit={this.handleSubmit}
        disabled={!globalStore.hasPermission('edit_sms_setting')}
      >
        <FormPanel title={i18next.t('短信设置')}>
          <Form ref={this.formRefs} labelWidth='142px'>
            <FormItem label={i18next.t('短信签名')}>
              <div style={{ paddingTop: '6px' }}>
                {' '}
                {msgSetting.sms_signature}{' '}
              </div>
              <div className='gm-text-desc'>
                <div>{i18next.t('显示在每一条短信开头，将会占用短信字数')}</div>
              </div>
            </FormItem>
            <FormItem label={i18next.t('商城下单')}>
              <Switch
                type='primary'
                checked={!!msgSetting.is_open_sms_bshop_order}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
                onChange={this.handleChange.bind(
                  this,
                  'is_open_sms_bshop_order'
                )}
              />
              <Popover
                showArrow
                bottom
                left
                type='hover'
                popup={this.renderPopup(bshopOrder)}
              >
                <i
                  className='gm-margin-left-5 ifont ifont-iconfontquestion'
                  style={{
                    fontSize: '18px',
                    color: 'grey',
                    marginRight: '20px',
                  }}
                />
              </Popover>
            </FormItem>
            {!isCStation && (
              <FormItem label={i18next.t('代下订单')}>
                <Switch
                  type='primary'
                  checked={!!msgSetting.is_open_sms_station_order}
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  onChange={this.handleChange.bind(
                    this,
                    'is_open_sms_station_order'
                  )}
                />
                <Popover
                  showArrow
                  bottom
                  left
                  type='hover'
                  popup={this.renderPopup(stationOrder)}
                >
                  <i
                    className='gm-margin-left-5 ifont ifont-iconfontquestion'
                    style={{
                      fontSize: '18px',
                      color: 'grey',
                      marginRight: '20px',
                    }}
                  />
                </Popover>
              </FormItem>
            )}
            {msgSetting.cms_key !== 'xscs' && (
              <FormItem label={i18next.t('手机验证')}>
                <Switch
                  type='primary'
                  checked={!!msgSetting.is_open_sms_telephone_verify}
                  on={i18next.t('开启')}
                  off={i18next.t('关闭')}
                  onChange={this.handleChange.bind(
                    this,
                    'is_open_sms_telephone_verify'
                  )}
                />
                <Popover
                  showArrow
                  bottom
                  left
                  type='hover'
                  popup={this.renderPopup(phoneVerify)}
                >
                  <i
                    className='gm-margin-left-5 ifont ifont-iconfontquestion'
                    style={{
                      fontSize: '18px',
                      color: 'grey',
                      marginRight: '20px',
                    }}
                  />
                </Popover>
                <div className='gm-text-desc gm-margin-top-5'>
                  <div>{i18next.t('开启后，允许发送手机验证码')}</div>
                  {!isCStation && (
                    <div>
                      {i18next.t(
                        '关闭后，自动关闭“商城自主修改密码”和“注册时验证手机”'
                      )}
                    </div>
                  )}
                </div>
              </FormItem>
            )}
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}
export default Setting
