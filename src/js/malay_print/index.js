import React from 'react'
import { Select, Option, LayoutRoot, Loading, Flex } from '@gmfe/react'
import { SimpleConfig } from 'gm-printer_malai'
import MalayPrintStore from './store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import printLog from '../common/print_log'

@observer
class MalayPrint extends React.Component {
  componentDidMount() {
    const { order_ids, filter } = this.props.history.location.query
    MalayPrintStore.getOrderData(order_ids, filter).then(() => {
      MalayPrintStore.reRender()
    })
  }

  handlePrint = () => {
    const order_ids = MalayPrintStore.order_ids.slice()
    printLog({
      sheet_type: 1,
      ids: JSON.stringify(_.isArray(order_ids) ? order_ids : [order_ids]),
    })
  }

  handleChangeTable = (printSomething) => {
    MalayPrintStore.toPrintSomething(printSomething)
    MalayPrintStore.reRender()
  }

  handleChangePageSize = (size) => {
    MalayPrintStore.setPageSize(size)
    MalayPrintStore.reRender()
  }

  handleYourRefChange = (i, e) => {
    const val = e.target.value
    MalayPrintStore.setOrderYourRef(i, val)
  }

  render() {
    const {
      printConfig,
      printSomething,
      pageSize,
      orderData,
      tableData,
      isBatch,
      reRenderKey,
    } = MalayPrintStore

    const orderList = isBatch ? orderData.slice() : [orderData]
    let inputList = []
    if (orderList.length) {
      inputList = _.map(orderList, (val, i) => {
        return (
          <div key={i} className='gm-border-top gm-padding-left-10'>
            <div>Invoice {val.tax_number}:</div>
            <input
              type='text'
              value={val.your_ref}
              style={{ width: '168px' }}
              placeholder='Enter your ref.'
              onChange={this.handleYourRefChange.bind(this, i)}
            />
          </div>
        )
      })
    }

    const configSelect = (
      <React.Fragment>
        <Select value={pageSize} onChange={this.handleChangePageSize}>
          <Option value='A4'>A4</Option>
          <Option value='IN9'>9.5" x 11"</Option>
        </Select>
        <Select value={printSomething} onChange={this.handleChangeTable}>
          <Option value='invoice'>invoice</Option>
          <Option value='delivery'>delivery</Option>
        </Select>
      </React.Fragment>
    )

    return (
      <div style={{ height: '100vh' }}>
        {reRenderKey === 0 ? (
          <Flex alignCenter justifyCenter style={{ height: '100%' }}>
            <Loading size={80} />
          </Flex>
        ) : (
          <SimpleConfig
            reRenderKey={reRenderKey}
            data={orderData}
            config={printConfig}
            tableData={tableData}
            configSelect={configSelect}
            isBatch={isBatch}
            content={inputList}
            handlePrint={this.handlePrint}
          />
        )}
        <LayoutRoot />
      </div>
    )
  }
}

MalayPrint.propTypes = {
  history: PropTypes.object.isRequired,
}

export default MalayPrint
