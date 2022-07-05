import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Affix, Flex, Button } from '@gmfe/react'
import { history } from 'common/service'
import store from '../store'

const AffixAction = observer(() => {
  const handleBack = () => {
    history.replace('/merchandise/manage/list')
  }

  const handleSave = () => {
    store.submit()
  }

  return (
    <Affix bottom={0}>
      <div className='gm-form-group-sticky-box'>
        <Flex justifyCenter>
          <Button onClick={handleBack}>{t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={handleSave}>
            {t('保存')}
          </Button>
        </Flex>
      </div>
    </Affix>
  )
})

export default AffixAction
