import React from 'react'
import { observer } from 'mobx-react'
import store from './store'
import PropTypes from 'prop-types'

import Recognition from './recognize'
import Container from './container'
import orderStoreOld from '../order_detail_old/detail_store_old'

@observer
class SkuRecognition extends React.Component {
  componentDidMount() {
    store.clear()
    store.clearText()
  }

  handleAdd = (skus) => {
    orderStoreOld.skusAdd(skus)
  }

  render() {
    const { serviceTime, customer, canRecognizeText } = this.props
    const { tabKey, textRecognition } = store

    return (
      <Container>
        <Recognition
          serviceTime={serviceTime}
          customer={customer}
          textRecognition={textRecognition}
          tabKey={tabKey}
          canRecognizeText={canRecognizeText}
          onAdd={this.handleAdd}
        />
      </Container>
    )
  }
}

SkuRecognition.propTypes = {
  serviceTime: PropTypes.object,
  customer: PropTypes.object,
  recognitionData: PropTypes.object,
  canRecognizeImg: PropTypes.bool,
  canRecognizeText: PropTypes.bool,
}

export default SkuRecognition
