import React, { useRef } from 'react'
import { t } from 'gm-i18n'

import StepOne from './components/step_one'
import StepTwo from './components/step_two'
import Steps from 'common/components/steps'
import { addStore as store } from './store'

const AddPage = () => {
  const ref = useRef(null)

  function handleSetSelected(value) {
    if (ref.current) {
      ref.current.setSelected(value)
    }
  }

  const steps = [
    {
      value: '1',
      text: t('第一步：设置赠品'),
      children: <StepOne onNext={handleSetSelected.bind(undefined, '2')} />,
    },
    {
      value: '2',
      text: t('第二步：设置购买商品'),
      children: <StepTwo onPrevious={handleSetSelected.bind(undefined, '1')} />,
    },
  ]

  return <Steps steps={steps} ref={ref} />
}

export default AddPage
