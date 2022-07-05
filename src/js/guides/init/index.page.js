import React, { useState } from 'react'
import Steps from './components/steps'
import One from './one'
import Two from './two'
import Three from './three'
import Four from './four'
import { Storage } from '@gmfe/react'
import globalStore from 'stores/global'

const Init = () => {
  const [step, setStep] = useState(Storage.get('INIT_STEP') || 0)

  const handleSetStep = (step) => {
    Storage.set('INIT_STEP', step)
    setStep(step)
  }

  return (
    <div className='gm-framework-content-full gm-padding-10 gm-back-bg'>
      <div className='gm-padding-20 gm-bg'>
        {globalStore.isCleanFood() && (
          <div className='gm-margin-bottom-10'>
            新手引导第一步「建立商品库资料」仅适用于毛菜版本
          </div>
        )}
        {globalStore.otherInfo.isCStation && (
          <div className='gm-margin-bottom-10'>
            新手引导第三步「建立基础信息」仅适用于B端配送业务
          </div>
        )}
        <Steps
          step={step}
          onChange={handleSetStep}
          data={[
            {
              title: '建立商品库资料',
              desc: '系统为你提供多种建立商品库的方式',
            },
            {
              title: '完善商品库图片',
              desc: '云图库智能推荐商品图片',
            },
            {
              title: '建立基础信息',
              desc: '为今后的业务打下坚实基础',
            },
            {
              title: '系统设置',
              desc: '配置基础的系统设置',
            },
          ]}
        />
        <div className='gm-gap-10' />
        {step === 0 && <One />}
        {step === 1 && <Two />}
        {step === 2 && <Three />}
        {step === 3 && <Four />}
      </div>
    </div>
  )
}

export default Init
