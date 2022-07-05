import React from 'react'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { observer } from 'mobx-react'
import { history, gioTrackEvent } from '../common/service'
import globalStore from '../stores/global'
import { Button, Dialog } from '@gmfe/react'

const TemplateChange = observer(() => {
  const template_type = window.____template_type
  const show_template_change_button = window.____show_template_change_button

  const handleChangeTemplate = () => {
    Dialog.confirm({
      title: t(`确定要切换${template_type ? '旧版' : '新版'}吗`),
      children: (
        <div className='gm-text-red'>
          <span>{t('警告')}</span>
          <br />
          <span>{t('1.切换旧版是为了测试后台代码的兼容性')}</span>
          <br />
          <span>{t('2.仅在测试号下才可以切换')}</span>
          <br />
          <span>{t('3.登录客户账号，在调试过程中，禁止切换旧版UI')}</span>
          <br />
          <span>{t('4.本地点击切换，本地看不到切换效果，但线上已经切换')}</span>
        </div>
      ),
      onOK: () => {
        gioTrackEvent('change_template', 1, {
          stationId: globalStore.stationId,
          page: window.location.hash,
        })
        Request('/station/template/update')
          .data({ template_type: template_type ? 0 : 1 })
          .post()
          .then(() => {
            history.push('/home')
            window.location.reload()
          })
      },
    })
  }

  if (!show_template_change_button) return null

  return (
    <Button
      type='primary'
      className='gm-margin-left-15'
      style={{ borderRadius: '14px', height: '24px', lineHeight: '14px' }}
      onClick={handleChangeTemplate}
    >
      {template_type ? t('切换旧版') : t('切换新版')}
    </Button>
  )
})

export default TemplateChange
