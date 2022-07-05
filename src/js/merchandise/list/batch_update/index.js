import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Price,
  InputNumber,
  FilterSelect,
  Tip,
  Sheet,
  SheetColumn,
  Pagination,
  PaginationText,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { connect } from 'react-redux'
import { pinYinFilter } from '@gm-common/tool'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import { history } from '../../../common/service'
import { getOptionalMeasurementUnitList } from '../../util'
import store from './store'
import globalStore from '../../../stores/global'

// Todo 供港未定报价单定不了币种

@observer
class BatchUpdate extends React.Component {
  componentDidMount() {
    const listStore = this.props.merchandiseList
    if (!listStore) {
      return Tip.warning(i18next.t('请先返回上一级选择要修改的商品'))
    }

    store.getSpuList(listStore)
  }

  componentWillMount() {
    store.clear()
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

  handleSearchData = (list, query) => {
    return pinYinFilter(list, query, (value) => value.name)
  }

  handleSubmit = () => {
    try {
      store.save().then(() => {
        Tip.success(i18next.t('批量修改成功'))
        history.push('/merchandise/manage/list')
      })
    } catch ({ message }) {
      Tip.warning(message)
    }
  }

  handlePageChange = (page) => {
    store.getSpuList(this.props.merchandiseList, page)
  }

  render() {
    const { spus, pagination } = store
    return (
      <QuickPanel
        icon='bill'
        title={i18next.t('批量修改商品规格')}
        right={
          <Button type='primary' onClick={this.handleSubmit}>
            {i18next.t('确定修改')}
          </Button>
        }
      >
        <div className='gm-text-red gm-padding-bottom-5'>
          <i className='xfont xfont-warning-circle gm-margin-right-5' />
          <span>{i18next.t('录入相应修改字段即可，为空则表示不做修改')}</span>
        </div>
        <Sheet list={spus.slice()} enableEmptyTip>
          <SheetColumn
            style={{ width: '15%' }}
            field='spu_id'
            name={i18next.t('商品名(SPUID)')}
            render={(val, i, d) => {
              return (
                <Flex column>
                  <div>{d.spu_name}</div>
                  <div>{d.spu_id}</div>
                </Flex>
              )
            }}
          />
          <SheetColumn
            style={{ width: '10%' }}
            field='sku_ids'
            name={i18next.t('已选sku数')}
            render={(val) => {
              return val.length
            }}
          />
          {globalStore.hasPermission('edit_measurement') && (
            <SheetColumn
              style={{ width: '10%' }}
              field='std_unit_name_forsale'
              name={i18next.t('销售计量单位')}
              render={(val, index, original) => {
                return (
                  <Observer>
                    {() =>
                      getOptionalMeasurementUnitList(original.std_unit_name)
                        .length ? (
                        <Select
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
              }}
            />
          )}
          <SheetColumn
            style={{ width: '20%' }}
            field='std_sale_price_forsale'
            name={i18next.t('销售单价(基本单位)')}
            render={(val, index, original) => {
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
            }}
          />
          <SheetColumn
            style={{ width: '15%' }}
            field='sale_ratio'
            name={i18next.t('规格')}
            render={(val, index, original) => {
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
                        className='gm-padding-lr-10'
                        style={{
                          backgroundColor: '#eee',
                          border: '1px solid #ccc',
                          height: '30px',
                        }}
                      >
                        {original.std_unit_name_forsale ||
                          original.std_unit_name}
                        /
                      </Flex>
                      <input
                        className='form-control'
                        type='text'
                        style={{ width: '40px' }}
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
            }}
          />
          <SheetColumn
            field='supplier_id'
            name={i18next.t('供应商')}
            render={(val, index, original) => {
              return (
                <Observer>
                  {() => (
                    <div style={{ width: '90%' }}>
                      <FilterSelect
                        id='supplier_filter_select'
                        list={original.supplierList.slice()}
                        selected={original.supplier}
                        withFilter={this.handleSearchData}
                        onSelect={this.handleSupplierChange.bind(this, index)}
                        placeholder={i18next.t('选择供应商')}
                        showClear
                      />
                    </div>
                  )}
                </Observer>
              )
            }}
          />
          <SheetColumn
            field='purchase_spec_id'
            name={i18next.t('采购规格')}
            render={(val, index, original) => {
              return (
                <Observer>
                  {() => (
                    <div style={{ width: '90%' }}>
                      <FilterSelect
                        id='purchase_spec_id_filter_select'
                        list={original.purchaseSpecList.slice()}
                        selected={original.purchaseSpec}
                        withFilter={this.handleSearchData}
                        onSelect={this.handleChange.bind(
                          this,
                          index,
                          'purchaseSpec'
                        )}
                        placeholder={i18next.t('选择采购规格')}
                        showClear
                      />
                    </div>
                  )}
                </Observer>
              )
            }}
          />

          <Pagination
            data={pagination}
            toPage={this.handlePageChange}
            nextDisabled={spus.length < 10}
          />
          <PaginationText data={pagination} />
        </Sheet>
      </QuickPanel>
    )
  }
}

export default connect((state) => ({
  merchandiseList: state.merchandiseList,
}))(BatchUpdate)
