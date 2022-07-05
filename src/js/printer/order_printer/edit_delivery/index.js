import React, { Component } from 'react'
import { Loading } from '@gmfe/react'
import { observer, Provider } from 'mobx-react'
import StepOne from './step_one'
import StepTwo from './step_two'
import deliveryStore from './store'
import { setTitle } from '@gm-common/tool'
import { i18next } from 'gm-i18n'

@observer
class EditDelivery extends Component {
  componentDidMount() {
    const { order_id } = this.props.history.location.query

    deliveryStore.saveId(order_id)
    deliveryStore.fetchData()
  }

  componentDidUpdate() {
    setTitle(i18next.t('编辑配送单'))
  }

  render() {
    if (deliveryStore.isLoading) {
      return <Loading />
    }

    return (
      <Provider store={deliveryStore}>
        {deliveryStore.step === 1 ? <StepOne /> : <StepTwo />}
      </Provider>
    )
  }
}

export default EditDelivery
