import React, { useEffect, useState } from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import {
  FormPanel,
  Tip,
  Flex,
  Button,
  Popover,
  Loading,
  Checkbox,
} from '@gmfe/react'
import store from './store'
import globalStore from 'stores/global'
import { componentAppId, MP as MPENUM } from './util'
import Steps from './components/steps'
import SVGCompleted from 'svg/completed.svg'
import SVGFailure from 'svg/failure.svg'
import SVGNext from 'svg/next.svg'
import SVGQr from 'svg/qr.svg'
import { history } from 'common/service'

const MP = () => {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // 小程序插件list
    store.getPlugins()
    // 获取第三方授权信息
    store.getInfo().then(
      (data) => {
        // 未解绑
        if (data && !data.is_deleted && data.audit_id) {
          store.getLatestAuditStatus(data.authorizer_app_id)
          // store.getAuditStatus(data.authorizer_app_id, data.audit_id)
        }
        store.getPayInfo().then(() => setLoading(false))
      },
      () => {
        setLoading(false)
      },
    )
  }, [])

  const handelAdult = () => {
    // 调取第三方上传代码
    store.codeUpload().then(() => {
      // 提交审核
      store.submitAudit().then(() => {
        Tip.info('成功向微信提交审核')
        window.location.reload()
      })
    })
  }
  // 去授权小程序
  const handleAuth = () => {
    if (!globalStore.hasPermission('edit_toc_mp')) {
      Tip.info('没有小程序权限')
      return
    }
    window.open(
      `/mp_third_party/auth?component_app_id=${componentAppId}&type=${mpType}`,
    )
  }

  const handleSavePlugin = () => {
    store.updatePlugins().then(() => {
      Tip.success(i18next.t('保存成功'))
      store.getPlugins()
    })
  }

  const handleChangePlugins = (key) => {
    console.log(key)
    store.setPlugins(key, !store.plugins[key])
  }

  const handlePayInfo = () => {
    history.push('/system/setting/mp/pay_info')
  }

  if (loading) {
    return <Loading style={{ marginTop: '100px' }} />
  }

  const { info, audit, mpType, payInfoList, plugins } = store
  const { c_is_open_wechat_miniprogram_live } = plugins
  const target = _.find(payInfoList, (v) => MPENUM[v.type] === mpType)
  const canSubmit =
    target &&
    info &&
    target.appid === info.authorizer_app_id &&
    !info.is_deleted

  return (
    <FormPanel title={i18next.t('微信小程序')}>
      <Steps
        className='b-mp-steps'
        data={[
          {
            title: (
              <span className='gm-text-14 '>
                {i18next.t('已注册微信小程序，立即授权发布')}
              </span>
            ),
            completed: () => info && !info.is_deleted,
            description: (
              <Flex column>
                <Flex column>
                  <p>
                    {i18next.t(
                      '使用微信小程序管理员帐号扫码进行授权，授权过程中请勾选所有权限以确保小程序功能完整性。如未注册小程序，可以从公众号后台免微信认证创建小程序或直接前往“微信公众平台”注册企业主体的小程序帐号',
                    )}
                    <span className='gm-padding-left-10'>
                      <a
                        target='_black'
                        rel='noopener noreferrer'
                        href='https://mp.weixin.qq.com'
                      >
                        {i18next.t('官方注册小程序')}
                        <SVGNext style={{ fontSize: 11 }} />
                      </a>
                    </span>
                  </p>
                </Flex>
                <Flex flex className='gm-margin-top-10'>
                  <Flex>
                    {!info || info.is_deleted ? (
                      <Button type='primary' onClick={handleAuth}>
                        {i18next.t('立即授权')}
                      </Button>
                    ) : (
                      <p className='gm-text-black gm-margin-0'>
                        <span className='text-primary'>
                          <SVGCompleted className='gm-margin-right-5' />
                          {i18next.t('授权成功')}
                          {info?.mp_info
                            ? `【${info.mp_info.nick_name}】`
                            : null}
                          <span className='gm-padding-lr-10'>
                            <Button type='primary' onClick={handleAuth}>
                              {i18next.t('重新授权')}
                            </Button>
                          </span>
                        </span>
                      </p>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            ),
          },
          {
            title: (
              <span className='gm-text-14'>
                {i18next.t('设置小程序支付方式')}
              </span>
            ),
            completed: () => canSubmit,
            description: (
              <Flex column>
                <Flex>
                  <p>
                    {i18next.t(
                      '设置此项前，请提前在“微信商户平台”完成小程序支付配置',
                    )}
                  </p>
                </Flex>
                <Flex flex className='gm-margin-top-10'>
                  {canSubmit && (
                    <Flex
                      alignCenter
                      className='gm-margin-right-10 text-primary'
                    >
                      <SVGCompleted className='gm-margin-right-5' />
                      {i18next.t('设置完成')}
                    </Flex>
                  )}
                  <Button
                    type='primary'
                    disabled={!info || info.is_deleted}
                    onClick={handlePayInfo}
                  >
                    {canSubmit ? i18next.t('重新设置') : i18next.t('支付设置')}
                  </Button>
                </Flex>
              </Flex>
            ),
          },
          {
            title: (
              <span className='gm-text-14 '>
                {i18next.t('设置小程序的插件')}
              </span>
            ),
            completed: () => canSubmit,
            description: (
              <Flex column>
                <Flex column>
                  <p>
                    {i18next.t(
                      '请自行申请插件后，再勾选，否则会导致小程序异常无法打开。需要点击下方重新申请审核',
                    )}
                  </p>
                </Flex>
                <div className='gm-margin-top-10'>
                  <Checkbox
                    disabled={!canSubmit}
                    checked={c_is_open_wechat_miniprogram_live}
                    onChange={handleChangePlugins.bind(
                      this,
                      'c_is_open_wechat_miniprogram_live',
                    )}
                  >
                    {i18next.t('直播')}
                  </Checkbox>
                  <Button
                    mini
                    disabled={!canSubmit}
                    type='primary'
                    className='gm-margin-top-10'
                    onClick={handleSavePlugin}
                  >
                    {i18next.t('保存')}
                  </Button>
                </div>
              </Flex>
            ),
          },
          {
            title: (
              <span className='gm-text-14 '>
                {i18next.t('完成所有准备，提交审核并发布小程序')}
              </span>
            ),
            completed: () => audit && audit.status === 0,
            description: (
              <Flex column>
                <Flex column>
                  <p>
                    {i18next.t(
                      '提交微信审核（最长14个工作日），审核通过后即可立即发布版本',
                    )}
                    {info &&
                      !info.is_deleted &&
                      info.authorizer_app_id &&
                      info.audit_id && (
                        <Popover
                          type='hover'
                          showArrow
                          left
                          popup={
                            <div>
                              <img
                                width={300}
                                height={300}
                                src={`/mp_third_party/code/qrcode?authorizer_app_id=${info.authorizer_app_id}`}
                              />
                            </div>
                          }
                        >
                          <span className='gm-padding-left-10'>
                            <a href='javascript:;'>
                              {i18next.t('小程序预览二维码')}
                              <SVGQr className='gm-margin-left-5' />
                            </a>
                          </span>
                        </Popover>
                      )}
                  </p>
                </Flex>
                <Flex flex className='gm-margin-top-10'>
                  {audit && audit.status === 0 && (
                    <Flex
                      alignCenter
                      className='gm-margin-right-10 text-primary'
                    >
                      <SVGCompleted className='gm-margin-right-5' />
                      {i18next.t('审核成功已发布小程序')}
                    </Flex>
                  )}
                  {audit && audit.status === 1 && (
                    <Flex alignCenter className='gm-margin-right-10'>
                      <span className='gm-text-red'>
                        <SVGFailure className='gm-margin-right-5' />
                        {i18next.t('审核不通过，')}
                      </span>
                      <Popover
                        type='click'
                        showArrow
                        left
                        popup={
                          <div className='gm-padding-5' style={{ width: 300 }}>
                            {audit.reason?.replace(/<br>/g, '')}
                          </div>
                        }
                      >
                        <a href='javascript:;'>
                          {i18next.t('查看原因')}
                          <SVGNext style={{ fontSize: 11 }} />
                        </a>
                      </Popover>
                    </Flex>
                  )}
                  {audit && audit.status === 2 ? (
                    <Flex alignCenter>
                      <span>
                        {i18next.t('提交成功！微信审核中，请耐心等待...')}
                      </span>
                    </Flex>
                  ) : (
                    <Button
                      type='primary'
                      className='gm-margin-right-10'
                      disabled={!info || info.is_deleted || !canSubmit}
                      onClick={handelAdult}
                    >
                      {audit && audit.status === 0
                        ? i18next.t('重新审核')
                        : i18next.t('提交审核')}
                    </Button>
                  )}
                </Flex>
              </Flex>
            ),
          },
        ]}
      />
    </FormPanel>
  )
}

MP.displayName = 'MP'
export default observer(MP)
