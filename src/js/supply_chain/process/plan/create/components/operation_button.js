import TaskList from '../../../../../task/task_list'
import React from 'react'
import {
  Button,
  Affix,
  Flex,
  Tip,
  RightSideModal,
  Modal,
  Dialog,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { history } from 'common/service'
import { observer } from 'mobx-react'
import store from '../store'

const Operation = observer(() => {
  const { canSubmit } = store
  const handleCancel = () => {
    history.push('/supply_chain/process/plan?active=1')
  }

  const verifyData = () => {
    let legal = true
    const data = store.getValidPlanListData()

    if (data.length === 0 || !canSubmit) {
      Tip.warning(t('请修改并填写完整信息'))
      legal = false
    }

    return legal
  }

  const handleSave = () => {
    // 开启校验
    store.changeStartCheck(true)

    if (verifyData()) {
      return handleBeforeSaveTip(0).then(() => {
        store.postBatchCreatePlan(0).then(() => {
          doFinishSave()
        })
      })
    }
  }

  const handleSaveAndRelease = () => {
    // 开启校验
    store.changeStartCheck(true)

    if (verifyData()) {
      return handleBeforeSaveTip(1).then(() => {
        store.postBatchCreatePlan(1).then(() => {
          doFinishSave()
        })
      })
    }
  }

  const doFinishSave = () => {
    RightSideModal.render({
      children: <TaskList tabKey={1} />,
      onHide: RightSideModal.hide,
      style: {
        width: '300px',
      },
    })

    history.push('/supply_chain/process/plan?active=1')
  }

  const handleBeforeSaveTip = (type) => {
    return Dialog.confirm({
      children: type === 0 ? t('是否保存计划') : t('是否保存并下达计划'),
      title: t('提示'),
      onHide: Modal.hide,
    })
  }

  return (
    <Affix bottom={0}>
      <Flex
        justifyCenter
        alignCenter
        style={{ width: '100%', height: '50px', background: 'white' }}
        className='gm-margin-top-20'
      >
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button
          type='primary'
          plain
          onClick={handleSave}
          className='gm-margin-left-10'
        >
          {t('保存计划')}
        </Button>
        <Button
          type='primary'
          onClick={handleSaveAndRelease}
          className='gm-margin-left-10'
        >
          {t('保存并下达计划')}
        </Button>
      </Flex>
    </Affix>
  )
})

export default Operation
