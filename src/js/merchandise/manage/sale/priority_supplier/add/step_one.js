import React from 'react'
import { i18next } from 'gm-i18n'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { FormPanel, TransferGroup, Flex, Button } from '@gmfe/react'

import store from './store'

@observer
class Component extends React.Component {
  componentDidMount() {
    const { salemenu_id } = this.props.location.query
    store.getCustomers(salemenu_id)
  }

  handleSelect = (selected) => {
    store.setSelectedCustomers(selected)
  }

  handleNextStep = () => {
    store.setStep(1)
  }

  render() {
    const { name } = this.props.location.query
    const { customersGroupByRoute, selectedCustomers } = store
    const selected = selectedCustomers.slice()
    return (
      <FormPanel title={`${i18next.t('设置商户')}(${name})`}>
        <Flex column>
          <Flex justifyCenter>
            <TransferGroup
              listStyle={{ width: '300px', height: '450px' }}
              list={toJS(customersGroupByRoute)}
              selectedValues={selected}
              onSelect={this.handleSelect}
              leftTitle={i18next.t('选择商户')}
              rightTitle={i18next.t('已选商户')}
              leftPlaceHolder={i18next.t('输入商户名/ID，线路名称')}
              rightPlaceHolder={i18next.t('输入商户名/ID')}
            />
          </Flex>
          <div style={{ height: '60px' }} />
          <Flex justifyCenter>
            <Button
              type='primary'
              disabled={!selected.length}
              onClick={this.handleNextStep}
            >
              {i18next.t('下一步')}
            </Button>
          </Flex>
        </Flex>
      </FormPanel>
    )
  }
}

Component.propTypes = {
  location: PropTypes.object,
}

export default Component
