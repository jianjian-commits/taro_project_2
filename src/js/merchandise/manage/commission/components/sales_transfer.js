import React from 'react'
import store from '../store'
import { Button, Flex, RightSideModal } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import Transfer from './transfer'

@observer
class SalesTransfer extends React.Component {
  handleSave = () => {
    const { updateEmployeeRule, rightSales } = store
    updateEmployeeRule({
      id: this.props.id,
      employee_ids: JSON.stringify(rightSales.map(({ value }) => value)),
    })
    RightSideModal.hide()
  }

  componentDidMount() {
    store.getSales()
  }

  render() {
    const { ruleName } = store

    return (
      <div className='gm-padding-lr-15'>
        <div className='gm-text-14 gm-padding-tb-10'>
          {i18next.t('销售经理配置')}（{ruleName}）
        </div>
        <Flex justifyBetween alignCenter>
          <span />
          <Button type='primary' onClick={this.handleSave}>
            {i18next.t('确定')}
          </Button>
        </Flex>
        <hr />
        <Transfer />
      </div>
    )
  }
}
SalesTransfer.propTypes = {
  id: PropTypes.number.isRequired,
}

export default SalesTransfer
