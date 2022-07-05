import React, { useEffect, useRef } from 'react'
import { Dialog, RadioGroup, Radio, Flex, Button, Tip } from '@gmfe/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import store from './store'
import { history } from 'common/service'
import { runCloudImagesType, runZipType } from './util'

const MatchImageModal = observer((props) => {
  const refImport = useRef(null)
  useEffect(() => {
    store.getSpuWithoutImage()
  }, [])

  const handleUploadFile = () => {
    const { current } = refImport
    const zipFile = current.files[0]
    current.value = ''
    if (!zipFile.type?.includes('zip')) {
      return Tip.info('当前仅支持zip格式压缩文件')
    }
    if (zipFile.size > 500 * 1024 * 1024) {
      Tip.warning(t('压缩包大小不能超过500M'))
      return
    }
    store.setZipFile(zipFile)
  }

  const handleImport = () => {
    refImport.current.click()
  }

  const { type, withoutImagesLength, fileName } = store
  return (
    <Flex column>
      <p className='gm-text-desc gm-margin-0'>快速为没有主图的商品匹配图片</p>
      <p className='gm-text-desc gm-margin-0'>
        {`商品库中没有主图的商品${withoutImagesLength}件`}
      </p>
      <RadioGroup
        className='gm-padding-tb-5'
        name='way'
        value={type}
        onChange={(v) => store.setType(v)}
      >
        <Radio className='gm-padding-bottom-5' value={runCloudImagesType}>
          {t('使用云图库')}
        </Radio>
        <Radio className='gm-padding-bottom-5' value={runZipType}>
          {t('上传图片包')}
        </Radio>
        <div className='gm-text-desc'>
          {t('图片压缩包中的图片名称需设为对应商品的名称')}
        </div>
      </RadioGroup>
      {type === runZipType && (
        <Flex alignCenter className='gm-padding-top-5'>
          <input
            accept='.zip'
            type='file'
            ref={refImport}
            onChange={handleUploadFile}
            style={{ display: 'none' }}
          />
          <span className='gm-padding-right-5'>{t('选择上传的图片')}</span>
          <Button type='primary' onClick={handleImport}>
            {t('上传压缩包')}
          </Button>
          {fileName ? (
            <span className='gm-text-desc gm-margin-left-5'>{fileName}</span>
          ) : null}
        </Flex>
      )}
    </Flex>
  )
})

export function renderMatchImageModal() {
  return Dialog.dialog({
    title: t('快速匹配商品图片'),
    children: <MatchImageModal />,
    onOK: function () {
      const { type, fileName } = store
      if (type === runZipType && !fileName) {
        Tip.info(t('未上传压缩包'))
        return Promise.reject(new Error(''))
      }
      history.push('/merchandise/manage/list/match_images')
    },
  })
}
