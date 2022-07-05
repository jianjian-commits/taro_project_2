import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Modal, Tip, Price, Button } from '@gmfe/react'
import { TableX, selectTableXHOC } from '@gmfe/table-x'
import _ from 'lodash'
import moment from 'moment'
import styles from '../product.module.less'
import refundAddStore from './store'
import { observer } from 'mobx-react'
import Big from 'big.js'

const SelectTableX = selectTableXHOC(TableX)

@observer
class BatchSelect extends React.Component {
  componentDidMount() {
    const {
      data: { id: sku_id, batch_number },
    } = this.props
    let {
      data: { settle_supplier_id, settle_supplier },
    } = refundAddStore
    settle_supplier_id = settle_supplier_id ?? settle_supplier.value
    refundAddStore.fetchBatch({ sku_id, settle_supplier_id }).then(() => {
      const { batchList } = refundAddStore
      if (batch_number) {
        const index = _.findIndex(
          batchList,
          (item) => item.batch_number === batch_number,
        )
        if (index !== -1) {
          refundAddStore.setSelectedBatchNum([batchList[index].batch_number])
        } else {
          refundAddStore.setSelectedBatchNum([])
        }
      }
    })
  }

  handleSelectBatchOk = () => {
    const {
      data: { quantity },
      onSelect,
    } = this.props

    const item = _.find(
      refundAddStore.batchList,
      (item) => item.batch_number === refundAddStore.selectedBatchNum[0],
    )

    if (!item) {
      Tip.warning(i18next.t('请先选择退货批次'))
      return
    } else if (quantity > item.remain) {
      Tip.warning(i18next.t('所选批次剩余库存少于退货数'))
      return
    }
    const avg_price = _.toNumber(Big(item.avg_price).div(100).toFixed(2))
    onSelect(item.batch_number, item.remain, avg_price)
  }

  handleSelectBatchNum = (selected) => {
    refundAddStore.setSelectedBatchNum(selected)
  }

  render() {
    const {
      data: { quantity, std_unit },
      onCancel,
    } = this.props

    return (
      <div className={styles.batchList}>
        <div className='gm-padding-10'>
          {i18next.t('当前退货数')}：{quantity + std_unit}
        </div>
        <SelectTableX
          keyField='batch_number'
          data={refundAddStore.batchList.slice()}
          onSelect={this.handleSelectBatchNum}
          selected={refundAddStore.selectedBatchNum.slice()}
          selectType='radio'
          columns={[
            {
              Header: i18next.t('入库时间'),
              id: 'in_stock_time',
              accessor: ({ in_stock_time }) =>
                moment(in_stock_time).format('YYYY-MM-DD'),
            },
            {
              Header: i18next.t('保质期'),
              accessor: 'life_time',
            },
            {
              Header: i18next.t('批次号'),
              accessor: 'batch_number',
            },
            {
              Header: i18next.t('批次均价'),
              id: 'avg_price',
              accessor: ({ avg_price }) =>
                Big(avg_price).div(100).toFixed(2) +
                Price.getUnit() +
                '/' +
                std_unit,
            },
            {
              Header: i18next.t('货位名'),
              id: 'shelf_name',
              accessor: ({ shelf_name }) => {
                return shelf_name ? (
                  <p title={shelf_name} className={styles.shelf}>
                    {shelf_name}
                  </p>
                ) : (
                  '-'
                )
              },
            },
            {
              Header: i18next.t('剩余库存'),
              id: 'remain',
              accessor: ({ remain }) => remain + std_unit,
            },
          ]}
        />
        <Flex justifyCenter className='gm-padding-15'>
          <Button className='gm-margin-right-5' onClick={onCancel}>
            {i18next.t('取消')}
          </Button>
          <Button type='primary' onClick={this.handleSelectBatchOk}>
            {i18next.t('确定')}
          </Button>
        </Flex>
      </div>
    )
  }
}

BatchSelect.propTypes = {
  data: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

function selectBatch(data) {
  return new Promise((resolve) => {
    Modal.render({
      title: i18next.t('选择退货批次'),
      onHide: Modal.hide,
      size: 'lg',
      children: (
        <BatchSelect
          data={data}
          onSelect={(batch_number, remain, avg_price) => {
            Modal.hide()
            resolve({
              batch_number,
              remain,
              avg_price,
            })
          }}
          onCancel={() => Modal.hide()}
        />
      ),
    })
  })
}

export default selectBatch
