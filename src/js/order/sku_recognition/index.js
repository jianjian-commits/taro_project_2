import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { QuickTab } from '@gmfe/react-deprecated'
import store from './store'
import moment from 'moment'
import PropTypes from 'prop-types'

import Recognition from './recognize'
import Container from './container'
import orderStore from '../store'

@observer
class SkuRecognition extends React.Component {
  componentDidMount() {
    // 新版本 打开时间与上一次关闭时间相差 > 10s || 商户不同 再清除保存内容
    const { recognitionData } = this.props
    const { hideTime, customerId } = recognitionData
    const { customer } = orderStore.orderDetail

    // 计算两个时间差 || 商户是否相同
    const seconds = moment().diff(hideTime, 'seconds')
    const isSameCustomer = customerId === customer.address_id

    if (seconds > 10 || !isSameCustomer) {
      store.clear()
      store.clearText()
      store.setTabKey(0)
    }
  }

  handleSelectTab = (tabKey) => {
    store.setTabKey(tabKey)
  }

  handleAdd = (skus) => {
    const index = null
    const list = skus.slice()
    const where = 'recognition'
    orderStore.orderSkusChange(index, list, where)
  }

  getQuickTab = () => {
    const quickTab = []
    const { canRecognizeImg, canRecognizeText } = this.props
    canRecognizeText && quickTab.push(i18next.t('文字识别'))
    canRecognizeImg && quickTab.push(i18next.t('图片识别'))
    return quickTab
  }

  renderQuickTab = () => {
    const quickTab = []
    const {
      canRecognizeImg,
      canRecognizeText,
      serviceTime,
      customer,
    } = this.props
    const { textRecognition, imgRecognition, tabKey } = store

    canRecognizeText &&
      quickTab.push(
        <Recognition
          key='text'
          type='text'
          serviceTime={serviceTime}
          customer={customer}
          textRecognition={textRecognition}
          tabKey={tabKey}
          canRecognizeText={canRecognizeText}
          searchCombineGoods
          onAdd={this.handleAdd}
        />,
      )

    canRecognizeImg &&
      quickTab.push(
        <Recognition
          key='img'
          type='img'
          serviceTime={serviceTime}
          customer={customer}
          imgRecognition={imgRecognition}
          tabKey={tabKey}
          canRecognizeImg={canRecognizeText}
          searchCombineGoods
          onAdd={this.handleAdd}
        />,
      )
    return quickTab
  }

  render() {
    const { tabKey } = store

    return (
      <Container>
        <QuickTab
          active={tabKey}
          tabs={this.getQuickTab()}
          onChange={this.handleSelectTab}
        >
          {this.renderQuickTab()}
        </QuickTab>
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
