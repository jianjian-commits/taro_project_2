import React from 'react'
import {
  Flex,
  Form,
  FormItem,
  FormButton,
  FormBlock,
  Modal,
  Cascader,
  Button,
  Select,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { t } from 'gm-i18n'
import store from '../store'
import { Table, selectTableV2HOC } from '@gmfe/table'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import FixedButton from '../../../common/components/fixed_button'
import Big from 'big.js'
import PropTypes from 'prop-types'

const SelectTable = selectTableV2HOC(Table)

const typeList = [
  { value: '', text: t('全部类型') },
  { value: 1, text: t('原料') },
  { value: 2, text: t('成品') },
]

@observer
class BatchSelectModal extends React.Component {
  componentDidMount() {
    store.setSpuId(this.props.spuId)

    if (this.props.currentBatchSelected) {
      store.changeBatchSelected([this.props.currentBatchSelected])
    }

    this.pagination.apiDoFirstRequest()
    store.fetchShelfList()
  }

  componentWillUnmount() {
    store.clearSelected()
    store.clearBatchFilter()
  }

  handleInputFilterChange = (e) => {
    store.changeBatchFilter('q', e.target.value)
  }

  handleSelectBatch = (selected) => {
    store.changeBatchSelected(selected)
  }

  handleSearch = () => {
    this.pagination.apiDoFirstRequest()
  }

  handleSaveBatch = () => {
    const { saveSelectedBatchFunc } = this.props
    const { batchList, batchSelected } = store

    let selectedData = {}

    _.forEach(batchList, (v) => {
      if (v.batch_number === batchSelected[0]) {
        selectedData = v
      }
    })

    saveSelectedBatchFunc(selectedData, this.handleHideModal)
  }

  handleHideModal = () => {
    Modal.hide()
  }

  handleSelectShelf = (selected) => {
    store.changeShelfSelected(selected)
  }

  handleRenderFilter = () => {
    const {
      batchFilter: { shelfSelected, q, type },
      shelfList,
    } = store

    return (
      <Form inline onSubmit={this.handleSearch} className='gm-margin-tb-10'>
        <FormBlock>
          <FormItem label={t('存放货位')}>
            <Cascader
              onChange={this.handleSelectShelf}
              value={shelfSelected.slice()}
              data={toJS(shelfList)}
            />
          </FormItem>
          <FormItem label={t('类型')}>
            <Select
              data={typeList}
              onChange={(value) => store.changeBatchFilter('type', value)}
              value={type}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              value={q}
              onChange={this.handleInputFilterChange}
              name='q'
              type='text'
              className='form-control'
              placeholder={t('请输入供应商或批次号搜索')}
            />
          </FormItem>

          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
          </FormButton>
        </FormBlock>
      </Form>
    )
  }

  render() {
    const { batchSelected, batchList } = store

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Flex
          column
          className='gm-padding-left-20 gm-padding-right-20'
          style={{ marginBottom: '42px' }}
        >
          {this.handleRenderFilter()}

          <ManagePaginationV2
            id='pagination_in_product_warehouse_batch_select_modal_list'
            onRequest={store.fetchBatchList}
            ref={(ref) => (this.pagination = ref)}
          >
            <SelectTable
              style={{ marginBottom: '10px' }}
              data={batchList.slice()}
              keyField='batch_number'
              selected={batchSelected.slice()}
              selectType='radio'
              onSelect={this.handleSelectBatch}
              columns={[
                {
                  id: 'type',
                  Header: t('类型'),
                  accessor: (d) => {
                    return d.type === 1 ? t('原料') : t('成品')
                  },
                },
                {
                  id: 'shelf_name',
                  Header: t('存放货位'),
                  accessor: (d) => {
                    return d.shelf_name || t('未分配')
                  },
                },
                {
                  Header: t('批次号'),
                  accessor: 'batch_number',
                },
                {
                  Header: t('供应商信息'),
                  accessor: 'supplier_name',
                },

                {
                  id: 'remain',
                  Header: t('剩余库存'),
                  accessor: (d) => {
                    return <span>{Big(d.remain || 0).toFixed(2)}</span>
                  },
                },
                {
                  id: 'production_time',
                  Header: t('生产日期'),
                  accessor: (d) => {
                    return d.production_time
                      ? moment(d.production_time).format('YYYY-MM-DD')
                      : '-'
                  },
                },
                {
                  id: 'life_time',
                  Header: t('保质期'),
                  accessor: (d) => {
                    return d.life_time
                      ? moment(d.life_time).format('YYYY-MM-DD')
                      : '-'
                  },
                },
              ]}
            />
          </ManagePaginationV2>
        </Flex>
        <FixedButton
          onCancel={this.handleHideModal}
          onSubmit={this.handleSaveBatch}
          disabled={batchSelected.length === 0}
        />
      </div>
    )
  }
}

BatchSelectModal.propTypes = {
  spuId: PropTypes.string.isRequired,
  currentBatchSelected: PropTypes.array.isRequired,
  saveSelectedBatchFunc: PropTypes.func.isRequired,
}

export default BatchSelectModal
