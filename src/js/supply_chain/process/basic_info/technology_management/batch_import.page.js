import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { Button, Flex, Tip, BoxTable } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from './store/batch_import_store'
import ErrorTips from './component/error_tips'
import BatchImportTable from './component/batch_import_table'
import { history } from 'common/service'

const OperateButton = observer(() => {
  const { hasError } = store
  const canSubmit = !hasError
  const handleCancel = () => {
    history.go(-1)
  }

  const handleEnsureImport = () => {
    store.postBatchImportTechnologyData().then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('导入成功'))

        history.go(-1)
      }

      // 除了显示错误，还要弹出错误提示
      if (json.code === 1) {
        Tip.warning(json.msg)
      }
    })
  }

  return (
    <Flex className='gm-margin-top-10 gm-margin-left-20'>
      <Button onClick={handleCancel}>{i18next.t('取消')}</Button>
      <div className='gm-gap-10' />
      <Button type='primary' onClick={handleEnsureImport} disabled={!canSubmit}>
        {i18next.t('确定')}
      </Button>
    </Flex>
  )
})

const BatchImportTechnology = observer(() => {
  const { hasIdOrNameNotSameError } = store

  useEffect(() => {
    store.initTechnologyData()
    // 初始化autorun
    store.initAutoRun()

    return () => {
      store.clearData()
    }
  }, [])

  return (
    <BoxTable info={<>{i18next.t('工艺列表')}</>}>
      {hasIdOrNameNotSameError && (
        <ErrorTips
          tips={i18next.t(
            '请确保相同工艺名的工艺编号一致或相同工艺编号的工艺名一致'
          )}
        />
      )}
      <BatchImportTable />
      <OperateButton />
    </BoxTable>
  )
})
export default BatchImportTechnology
