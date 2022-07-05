import React from 'react'
import { observer } from 'mobx-react'
import { Progress, Flex, LoadingChunk } from '@gmfe/react'
import store from '../../store'
import { t } from 'gm-i18n'

const RecommendLoading = observer(() => {
  const { recommendLoading, loadingProgress } = store

  return (
    <>
      <div className='gm-modal-mask' />

      <Flex justifyCenter alignCenter column className='gm-modal'>
        <LoadingChunk text={t('运算方案执行中')} loading={recommendLoading} />
        <div style={{ width: '400px', marginTop: '20px', marginLeft: '50px' }}>
          <Progress
            percentage={loadingProgress}
            showText
            textInside
            strokeWidth={18}
            textColor='#333'
            textInsideFix='center'
          />
        </div>
      </Flex>
    </>
  )
})

export default RecommendLoading
