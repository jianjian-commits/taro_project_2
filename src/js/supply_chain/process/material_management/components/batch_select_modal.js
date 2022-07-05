import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import store from '../store'
import { t } from 'gm-i18n'
import moment from 'moment'
import { InputNumberV2 } from '@gmfe/react'
import { TableX, selectTableXHOC } from '@gmfe/table-x'

const SelectTableX = selectTableXHOC(TableX)

@observer
class BatchSelectModal extends Component {
  async componentDidMount() {
    const { index } = this.props

    await store.getMaterialBatch(index)
  }

  componentWillUnmount() {
    this.handleSelect([])
  }

  handleSelect = (selected) => {
    const { setBatchSelected } = store
    setBatchSelected(selected)
  }

  handleChangeInput = (index, amount) => {
    store.setBatchListItem({ amount }, index)
  }

  handleInputBlur = (index) => {
    const { amount } = store.batchList[index]
    // 失焦时若为0则改变为0.01
    if (amount === 0) {
      store.setBatchListItem({ amount: 0.01 }, index)
    }
  }

  render() {
    const { batchList, batchSelected, batchLoading } = store
    return (
      <>
        <SelectTableX
          loading={batchLoading}
          data={batchList.slice()}
          style={{ maxHeight: '500px' }}
          columns={[
            {
              Header: t('入库时间'),
              accessor: 'create_time',
              Cell: ({
                row: {
                  original: { create_time },
                },
              }) => moment(create_time).format('YYYY-MM-DD'),
            },
            { Header: t('入库批号'), accessor: 'batch_num' },
            { Header: t('存放货位'), accessor: 'shelf_name' },
            { Header: t('剩余数量(基本单位)'), accessor: 'stock_num' },
            {
              Header: t('领取数量'),
              Cell: ({ row: { original, index } }) => {
                return (
                  <Observer>
                    {() => {
                      const { amount, batch_num, stock_num } = original
                      return (
                        <InputNumberV2
                          className='form-control'
                          value={amount}
                          onChange={this.handleChangeInput.bind(this, index)}
                          onBlur={this.handleInputBlur.bind(this, index)}
                          disabled={!batchSelected.includes(batch_num)}
                          max={stock_num}
                        />
                      )
                    }}
                  </Observer>
                )
              },
            },
          ]}
          selected={batchSelected.slice()}
          keyField='batch_num'
          onSelect={this.handleSelect}
        />
      </>
    )
  }
}

BatchSelectModal.propTypes = {
  index: PropTypes.number,
}

export default BatchSelectModal
