import { i18next } from 'gm-i18n'
import React from 'react'
import {
  BoxTable,
  Flex,
  Price,
  InputNumber,
  MoreSelect,
  Tip,
  Pagination,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import { Table } from '@gmfe/table'
import { observer, Observer } from 'mobx-react'
import { history, System } from '../../../../common/service'
import _ from 'lodash'
import store from './store'
import { getOptionalMeasurementUnitList } from '../../../util'
import listStore from '../list_store'
import globalStore from 'stores/global'
import TableListTips from 'common/components/table_list_tips'
import TableTotalText from 'common/components/table_total_text'

// Todo 供港未定报价单定不了币种

@observer
class BatchUpdate extends React.Component {
  checkSelectSpu = () => {
    const { selectAll, selectAllType, selectedList } = listStore
    let isSelect = false
    if (selectAll && selectAllType === 2) {
      isSelect = true
    } else if (selectedList.length) {
      isSelect = true
    }
    return isSelect
  }

  componentDidMount() {
    globalStore.setBreadcrumbs([i18next.t('批量修改商品规格')])
    if (!this.checkSelectSpu()) {
      return Tip.warning(i18next.t('请先返回上一级选择要修改的商品'))
    }

    store.getSpuList(listStore)
  }

  componentWillUnmount() {
    store.init()
    globalStore.setBreadcrumbs([])
  }

  handleChange = (index, field, value) => {
    if (field === 'sale_unit_name') value = value.target.value
    store.changeSpuValue(index, field, value)
  }

  handleSupplierChange = (index, value) => {
    store.changeSupplier(index, value)
  }

  handleChangeSelect = (index, selected) => {
    store.changeSpuValue(index, 'std_unit_name_forsale', selected)
  }

  handleSubmit = () => {
    try {
      store.save().then(() => {
        Tip.success(i18next.t('批量修改成功'))
        history.push(System.getUrl('/merchandise/manage/list'))
      })
    } catch ({ message }) {
      Tip.warning(message)
    }
  }

  handlePageChange = (page) => {
    store.getSpuList(listStore, page)
  }

  render() {
    const { spus, pagination } = store
    return (
      <>
        <TableListTips
          tips={[
            `${i18next.t('录入相应修改字段即可，为空则表示不做修改')}
            ${
              globalStore.isCleanFood()
                ? '；对供应商和采购规格的修改仅对未开启加工商品生效'
                : ''
            }`,
          ]}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('商品数'),
                    content: pagination.count || 0,
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={
            <Button type='primary' onClick={this.handleSubmit}>
              {i18next.t('确定修改')}
            </Button>
          }
        >
          <Table
            data={spus.slice()}
            columns={[
              {
                Header: i18next.t('商品名(SPUID)'),
                accessor: 'spu_id',
                Cell: ({ original }) => (
                  <Flex column>
                    <div>{original.spu_name}</div>
                    <div>{original.spu_id}</div>
                  </Flex>
                ),
              },
              {
                Header: i18next.t('已选sku数'),
                id: 'sku_ids',
                accessor: (d) => (d.sku_ids ? d.sku_ids.length : '-'),
              },
              {
                Header: i18next.t('销售计量单位'),
                id: 'std_unit_name_forsale',
                show: globalStore.hasPermission('edit_measurement'),
                Cell: ({ original, index }) => {
                  return (
                    <Observer>
                      {() =>
                        getOptionalMeasurementUnitList(original.std_unit_name)
                          .length ? (
                          <Select
                            style={{ width: '80px' }}
                            value={original.std_unit_name_forsale}
                            onChange={this.handleChangeSelect.bind(this, index)}
                          >
                            {_.map(
                              getOptionalMeasurementUnitList(
                                original.std_unit_name
                              ),
                              (s) => (
                                <Option key={s.value} value={s.value}>
                                  {s.text}
                                </Option>
                              )
                            )}
                          </Select>
                        ) : (
                          original.std_unit_name_forsale || '-'
                        )
                      }
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('销售单价(基本单位)'),
                accessor: 'std_sale_price_forsale',
                Cell: ({ original, index }) => {
                  return (
                    <Observer>
                      {() => (
                        <Flex alignCenter>
                          <InputNumber
                            className='form-control'
                            style={{ width: '100px' }}
                            min={0}
                            precision={2}
                            value={original.std_sale_price_forsale}
                            onChange={this.handleChange.bind(
                              this,
                              index,
                              'std_sale_price_forsale'
                            )}
                          />
                          <span className='gm-margin-left-5'>
                            {Price.getUnit(original.fee_type)}/
                            {original.std_unit_name_forsale ||
                              original.std_unit_name}
                          </span>
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('规格'),
                accessor: 'sale_ratio',
                Cell: ({ original, index }) => {
                  return (
                    <Observer>
                      {() => (
                        <Flex alignCenter>
                          <InputNumber
                            className='form-control'
                            style={{ width: '50px' }}
                            min={0}
                            precision={2}
                            value={original.sale_ratio}
                            onChange={this.handleChange.bind(
                              this,
                              index,
                              'sale_ratio'
                            )}
                          />
                          <Flex
                            alignCenter
                            justifyCenter
                            className='gm-padding-lr-10'
                            style={{
                              backgroundColor: '#eee',
                              border: '1px solid #ccc',
                              height: '30px',
                              width: '55px',
                            }}
                          >
                            {original.std_unit_name_forsale ||
                              original.std_unit_name}
                            /
                          </Flex>
                          <input
                            className='form-control'
                            type='text'
                            style={{ width: '70px' }}
                            value={original.sale_unit_name}
                            onChange={this.handleChange.bind(
                              this,
                              index,
                              'sale_unit_name'
                            )}
                          />
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('供应商'),
                accessor: 'supplier_id',
                Cell: ({ original, index }) => {
                  return (
                    <Observer>
                      {() => (
                        <div style={{ width: '90%' }}>
                          <MoreSelect
                            data={original.supplierList.slice()}
                            selected={original.supplier}
                            onSelect={this.handleSupplierChange.bind(
                              this,
                              index
                            )}
                            placeholder={i18next.t('选择供应商')}
                          />
                        </div>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('采购规格'),
                accessor: 'purchase_spec_id',
                Cell: ({ original, index }) => {
                  return (
                    <Observer>
                      {() => (
                        <div style={{ width: '90%' }}>
                          <MoreSelect
                            data={original.purchaseSpecList.slice()}
                            selected={original.purchaseSpec}
                            onSelect={this.handleChange.bind(
                              this,
                              index,
                              'purchaseSpec'
                            )}
                            placeholder={i18next.t('选择采购规格')}
                          />
                        </div>
                      )}
                    </Observer>
                  )
                },
              },
            ]}
          />
          {pagination.limit && (
            <Flex justifyEnd alignCenter className='gm-padding-20'>
              <Pagination data={pagination} toPage={this.handlePageChange} />
            </Flex>
          )}
        </BoxTable>
      </>
    )
  }
}

export default BatchUpdate
