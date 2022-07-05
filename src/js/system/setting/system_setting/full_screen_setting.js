import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Switch,
  CheckboxGroup,
  Checkbox,
  InputNumberV2,
  Flex,
  FormButton,
  Button,
  Validator,
  Tip,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from './store'
import { fullScreenList } from './util'
import globalStore from 'stores/global'

const FullScreenSetting = observer(() => {
  const {
    is_set_carousel,
    carousel_interface,
    stay_time,
  } = store.fullScreenData

  const { fullScreenInfo } = globalStore
  useEffect(() => {
    store.initData('fullScreen', {
      is_set_carousel: globalStore.fullScreenInfo.is_set_carousel,
      carousel_interface: globalStore.fullScreenInfo.carousel_interface || [],
      stay_time: globalStore.fullScreenInfo.stay_time,
    })
  }, [fullScreenInfo])

  const handleChangeValue = (value, key) => {
    store.changeDataItem('fullScreen', key, value)
  }

  const handleSave = () => {
    const { carousel_interface, is_set_carousel } = store.fullScreenData
    if (
      !!is_set_carousel &&
      carousel_interface &&
      carousel_interface.length < 2
    ) {
      Tip.warning(t('请至少选择两个轮播页面，以保证正常轮换展示'))
      return false
    }
    if (stay_time < 5) {
      Tip.warning(t('请输入不小于5的停留时长'))
      return false
    }
    store.postSetting('fullScreen').then(() => {
      Tip.success(t('保存成功'))
      window.location.reload()
    })
  }

  // 站点1135的国外客户因为地图组件不支持国外，所以不支持首页投屏
  const newFullScreenList = globalStore.isForeign()
    ? fullScreenList.slice(1)
    : fullScreenList
  console.log('newFullScreenList',newFullScreenList)
  const canEditCarousel = globalStore.hasPermission('edit_cast_carousel')
  return (
    <FormPanel title={t('投屏设置')}>
      <Form colWidth='800px' labelWidth='130px' onSubmitValidated={handleSave}>
        <FormItem label={t('投屏轮播')}>
          <Switch
            on={t('开启')}
            off={t('关闭')}
            checked={!!is_set_carousel}
            onChange={(value) => handleChangeValue(value, 'is_set_carousel')}
            disabled={!canEditCarousel}
          />
          <div className='gm-text-desc gm-margin-top-5'>
            {t('开启后，进入任一投屏模式，将进行多屏循环切换展示')}
          </div>
        </FormItem>
        {!!is_set_carousel && (
          <FormItem label={t('选择轮播界面')} required>
            <CheckboxGroup
              name='fullScreenPage'
              inline
              value={carousel_interface.slice()}
              onChange={(value) =>
                handleChangeValue(value, 'carousel_interface')
              }
            >
              {newFullScreenList.map((v) => (
                <Checkbox key={v.value} value={v.value}>
                  {v.text}
                </Checkbox>
              ))}
            </CheckboxGroup>
            <div className='gm-text-desc gm-margin-top-5'>
              {t(
                '从任意投屏按钮进入投屏模式，仅循环播放选中的投屏界面（请至少选择两个轮播页面，以保证正常轮换展示）',
              )}
            </div>
          </FormItem>
        )}
        {!!is_set_carousel && (
          <FormItem
            label={t('停留时长')}
            required
            validate={Validator.create([], stay_time)}
          >
            <Flex alignCenter>
              <InputNumberV2
                className='form-control'
                style={{ width: '100px' }}
                value={stay_time}
                precision={-1}
                max={300}
                onChange={(value) => handleChangeValue(value, 'stay_time')}
              />
              <span className='gm-margin-lr-5'>{t('秒')}</span>
              <span className='gm-text-desc'>
                {t('（请设置5～300秒内的停留时长）')}
              </span>
            </Flex>
            <div className='gm-text-desc gm-margin-top-5'>
              {t(
                '可设置每个投屏界面的停留时长。如8秒，则每8秒系统自动更换下一个轮播界面',
              )}
            </div>
          </FormItem>
        )}
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('保存')}
          </Button>
        </FormButton>
      </Form>
    </FormPanel>
  )
})

export default FullScreenSetting
