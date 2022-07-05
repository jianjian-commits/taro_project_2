import React from 'react'
import { observer } from 'mobx-react'

import StepOne from './step_one'
import StepTwo from './step_two'
import store from './store'

@observer
class Component extends React.Component {
  componentWillUnmount() {
    store.clear()
  }

  render() {
    const { step } = store
    return step > 0 ? <StepTwo {...this.props} /> : <StepOne {...this.props} />
  }
}

export default Component
