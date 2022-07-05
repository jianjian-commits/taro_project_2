import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  FormItem,
  Form,
  Validator,
  Flex,
  InputNumberV2,
  FormButton,
  Button,
  Modal,
  Tip,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../store'
import { getStrByte } from 'common/util'

const CreateLevelContent = () => {
  useEffect(() => {
    store.initLevel()
  }, [])

  const { newLevel } = store

  const handleOK = async () => {
    if (getStrByte(newLevel.level_name) > 30) {
      Tip.warning(t('团长等级限制30个汉字或60个英文'))
      return false
    }
    if (!newLevel.level_name || !newLevel.boundary || !newLevel.scale) {
      Tip.warning(t('请填写完整'))
      return
    }
    await store.createLevel()
    Tip.success('创建团长等级成功')
    Modal.hide()
    store.apiDoFirstRequest()
  }

  const handleCancel = () => {
    Modal.hide()
  }

  return (
    <Form labelWidth='110px' onSubmitValidated={handleOK}>
      <FormItem
        label={t('团长等级')}
        required
        validator={Validator.create([], newLevel.level_name)}
      >
        <input
          value={newLevel.level_name}
          onChange={(e) => store.setNewLevelValue('level_name', e.target.value)}
        />
      </FormItem>
      <FormItem
        label={t('升级条件')}
        colWidth='500px'
        required
        validator={Validator.create([], newLevel.boundary)}
      >
        <Flex alignCenter>
          <span>{t('销售额累计达到')}&nbsp;</span>
          <InputNumberV2
            style={{ width: '160px' }}
            className='form-control'
            value={newLevel.boundary}
            min={0}
            max={999999999}
            precision={0}
            placeholder={t('请输入整数')}
            onChange={(value) => store.setNewLevelValue('boundary', value)}
          />
          <span>&nbsp;{t('元自动升级')}</span>
        </Flex>
      </FormItem>
      <FormItem
        label={t('佣金比例')}
        required
        validator={Validator.create([], newLevel.scale)}
      >
        <Flex alignCenter>
          <InputNumberV2
            className='form-control'
            value={newLevel.scale}
            precision={2}
            min={0}
            max={100}
            onChange={(value) => store.setNewLevelValue('scale', value)}
          />
          <span className='gm-margin-left-5'>%</span>
        </Flex>
      </FormItem>
      <FormButton>
        <div className='text-right'>
          <Button className='gm-margin-right-15' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' htmlType='submit'>
            {t('确认新建')}
          </Button>
        </div>
      </FormButton>
    </Form>
  )
}

export default observer(CreateLevelContent)
