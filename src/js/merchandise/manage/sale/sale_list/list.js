import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import store from './store'
import globalStore from 'stores/global'
import {
  BoxTable,
  Price,
  Flex,
  ToolTip,
  Switch,
  Tip,
  RightSideModal,
  Popover,
  PopupContentConfirm,
} from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { Table, selectTableV2HOC, TableUtil } from '@gmfe/table'
import SaleListAction from './component/list_action'
import BatchActionBar from './component/batch_action_bar'
import ListImg from '../../component/list_img'
import WarningPrice from '../../component/warning_price'
import { EditFormulaSettingContent } from '../../component/edit_content'
import {
  RefPriceTypeSelect,
  refPriceTypeHOC,
} from 'common/components/ref_price_type_hoc'
import SVGReport from 'svg/report.svg'
import SVGTieredPrice from 'svg/tiered_price.svg'
import { getRefParams } from '../../util'
import _ from 'lodash'
import Big from 'big.js'
import { deleteSku } from '../../api'
import TableTotalText from 'common/components/table_total_text'
import renderFormulaText from 'common/components/calculator/render_formula_text'
import FloatTip from 'common/components/float_tip'
import qs from 'query-string'
import { is } from '@gm-common/tool'
import PriceModal from './component/price_modal'
import TieredPriceTable from './component/tiered_price_table'

const SelectTable = selectTableV2HOC(Table)
const {
  EditButton,
  OperationDelete,
  OperationDetail,
  OperationCell,
  OperationHeader,
  SortHeader,
  EditContentInput,
} = TableUtil

// const PriceAndName = (props) => {
//   const { price, name } = props

//   return _.isNil(price)
//     ? '-'
//     : Big(price || 0).toFixed(2) + Price.getUnit() + '/' + (name || '-')
// }
@refPriceTypeHOC(1)
@observer
class SaleList extends React.Component {
  constructor(props) {
    super(props)
    this.refPagination = React.createRef()
  }

  componentDidMount() {
    store.setDoFirstRequest(this.refPagination.current.apiDoFirstRequest)
    this.refPagination.current.apiDoFirstRequest()
  }

  initStepPriceInterval = (key, step_price_table) => {
    const table = step_price_table.map((e) => e[key]).sort((a, b) => a - b)
    return `${Big(table[0] || 0)
      .div(100)
      .toFixed(2)}~${Big(table[table.length - 1] || 0)
      .div(100)
      .toFixed(2)}`
  }

  handleSort = (name) => {
    Promise.resolve(store.sort(name)).then(() => {
      this.refPagination.current.apiDoFirstRequest()
    })
  }

  handleChangeState = (sku_id, value) => {
    store.updateSku('state', value ? 1 : 0, sku_id, value ? 'put_shelf' : '')
  }

  handleDetail = (spu_id, sku_id, fee_type) => {
    const { id, name, salemenuType, guide_type } = this.props.location.query
    // 新开页面

    window.open(
      `#/merchandise/manage/sale/sku_detail?${qs.stringify({
        spu_id,
        sku_id,
        salemenuId: id,
        salemenuType,
        salemenuName: name,
        guide_type: guide_type === 'InitSaleCheck' ? 'InitSaleCheckDetail' : '',
        fee_type,
      })}`,
    )
  }

  handlePriceChart = (data) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: <PriceModal data={data} />,
    })
  }

  handleDelete = (sku_id) => {
    deleteSku(sku_id).then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('删除成功'))
        // 产品说 就停留在那一页，不管是否最后一页，是否这一页已经没有数据了
        this.handlePage(store.pagination)
      }
    })
  }

  handlePage = (page) => {
    return store.getSaleList(this.props.location.query.id, page)
  }

  handleSaveFormula = (sku, close, info) => {
    // 如果是净菜，则提示
    if (sku.clean_food) {
      return Tip.warning(
        i18next.t(
          '开启加工商品暂不支持定价设置，请至少选择一个未开启加工商品规格进行定价设置',
        ),
      )
    }

    store.saveFormulaSetting(sku.sku_id, info).then(() => {
      close()
      Tip.success(i18next.t('修改定价公式成功'))
      this.handlePage(store.pagination)
    })
  }

  showPopover = (original, price, purchaseNewest, purchaseEarlier) => {
    return purchaseEarlier.length > 0 || _.isNumber(price) ? (
      <Popover
        showArrow
        type='hover'
        popup={
          <div className='gm-padding-tb-10 gm-padding-lr-15'>
            <div className='gm-margin-bottom-5'>
              <strong>{i18next.t('当前供应商')}</strong>
              <Flex justifyBetween>
                <div className='gm-padding-right-15'>
                  {purchaseNewest?.purchase_supplier_name || '-'}
                </div>
                <div className='gm-padding-left-15'>
                  {_.isNumber(price)
                    ? Big(price).div(100).toFixed(2) +
                      Price.getUnit(original.fee_type) +
                      '/' +
                      original.std_unit_name_forsale
                    : '-'}
                </div>
              </Flex>
            </div>
            {purchaseEarlier.length > 0 ? (
              <div className='gm-margin-bottom-5 gm-padding-bottom-5'>
                <strong>{i18next.t('其他供应商')}</strong>
                {_.map(purchaseEarlier, (item, i) => (
                  <Flex justifyBetween key={i}>
                    <div className='gm-padding-right-15'>
                      {item?.purchase_supplier_name || '-'}
                    </div>
                    <div className='gm-padding-left-15'>
                      {_.isNumber(item.price)
                        ? Big(item.price).div(100).toFixed(2) +
                          Price.getUnit(original.fee_type) +
                          '/' +
                          original.std_unit_name_forsale
                        : '-'}
                    </div>
                  </Flex>
                ))}
              </div>
            ) : null}
          </div>
        }
      >
        <div>
          {_.isNumber(price)
            ? Big(price).div(100).toFixed(2) +
              Price.getUnit(original.fee_type) +
              '/' +
              original.std_unit_name_forsale
            : '-'}
        </div>
      </Popover>
    ) : (
      '-'
    )
  }

  render() {
    const {
      list,
      pagination,
      filter: { sort_by, sort_direction },
      selectedList,
    } = store
    const { refPriceType, postRefPriceType } = this.props
    const { referencePriceFlag } = getRefParams(refPriceType)
    const p_editSku = globalStore.hasPermission('edit_sku')
    const p_deleteSku = globalStore.hasPermission('delete_sale_sku')

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('商品总数'),
                  content: pagination.count || 0,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={<SaleListAction {...this.props.location} />}
      >
        <ManagePagination
          onRequest={this.handlePage}
          ref={this.refPagination}
          id='pagination_in_merchandise_manage_sale_list'
        >
          <SelectTable
            data={list.slice()}
            columns={[
              {
                Header: (
                  <Flex>
                    {i18next.t('商品图片')}
                    <ToolTip
                      popup={
                        <div
                          className='gm-padding-5'
                          style={{ width: '150px' }}
                        >
                          {i18next.t(
                            '规格图片未设置则显示商品图片，规格和商品都无图时不显示图片',
                          )}
                        </div>
                      }
                    />
                  </Flex>
                ),
                accessor: 'image',
                Cell: ({ original }) => (
                  <ListImg imgSrc={original.sku_image || original.spu_image} />
                ),
              },
              {
                Header: (
                  <SortHeader
                    onClick={this.handleSort.bind(this, 'spu')}
                    type={sort_by === 'spu' ? sort_direction : null}
                  >
                    {i18next.t('商品名')}
                  </SortHeader>
                ),
                accessor: 'spu_id',
                Cell: ({ original }) => (
                  <Observer>
                    {() => (
                      <Flex column>
                        <Flex>
                          <span style={{ marginRight: '2px' }}>
                            {original.spu_name}
                          </span>
                          <EditButton
                            popupRender={(closePopup) => (
                              <EditContentInput
                                closePopup={closePopup}
                                initialVal={original.spu_name}
                                onSave={(value) => {
                                  if (!value)
                                    return Tip.warning(
                                      i18next.t('商品名不能为空'),
                                    )
                                  store.updateSpu(
                                    'spu_name',
                                    original.spu_id,
                                    value,
                                  )
                                }}
                              />
                            )}
                          />
                        </Flex>
                        <span>{original.spu_id}</span>
                      </Flex>
                    )}
                  </Observer>
                ),
              },
              {
                Header: (
                  <SortHeader
                    onClick={this.handleSort.bind(this, 'sku')}
                    type={sort_by === 'sku' ? sort_direction : null}
                  >
                    {i18next.t('规格名')}
                  </SortHeader>
                ),
                id: 'sku_id',
                Cell: ({ original, index }) => (
                  <Observer>
                    {() => (
                      <Flex column>
                        <Flex>
                          <span style={{ marginRight: '2px' }}>
                            {original.sku_name}
                          </span>
                          <EditButton
                            popupRender={(closePopup) => (
                              <EditContentInput
                                closePopup={closePopup}
                                initialVal={original.sku_name}
                                onSave={(value) =>
                                  store.updateSku(
                                    'sku_name',
                                    value,
                                    original.sku_id,
                                  )
                                }
                              />
                            )}
                          />
                          {original?.is_step_price === 1 && (
                            <span
                              style={{ display: 'inline-block', width: '20px' }}
                            >
                              <ToolTip
                                popup={() => {
                                  store.initStepPriceTable(
                                    original?.step_price_table || [],
                                  )
                                  return (
                                    <div style={{ padding: '8px' }}>
                                      <div style={{ paddingBottom: '8px' }}>
                                        {i18next.t('阶梯定价商品：')}
                                      </div>
                                      <TieredPriceTable
                                        listIndex={index}
                                        priceUnit={Price.getUnit(
                                          original.fee_type,
                                        )}
                                        sale_unit_name={original.sale_unit_name}
                                      />
                                    </div>
                                  )
                                }}
                              >
                                <span>
                                  <SVGTieredPrice className='react-table-edit-button gm-cursor gm-text-14 gm-text-hover-primary' />
                                </span>
                              </ToolTip>
                            </span>
                          )}
                        </Flex>
                        <FloatTip
                          skuId={original.sku_id}
                          tip={original.outer_id}
                          showCustomer={globalStore.otherInfo.showSkuOuterId}
                        />
                      </Flex>
                    )}
                  </Observer>
                ),
              },
              {
                Header: (
                  <SortHeader
                    onClick={this.handleSort.bind(this, 'category1')}
                    type={sort_by === 'category1' ? sort_direction : null}
                  >
                    {i18next.t('分类')}
                  </SortHeader>
                ),
                id: 'category_name_1',
                accessor: (d) =>
                  d.category_name_1 +
                  '/' +
                  d.category_name_2 +
                  '/' +
                  d.pinlei_name,
              },
              {
                Header: i18next.t('销售单价'),
                accessor: 'std_sale_price_forsale',
                Cell: ({ original, index }) => {
                  return original.is_price_timing ? (
                    <span>{i18next.t('时价')}</span>
                  ) : (
                    <Observer>
                      {() => (
                        <Flex>
                          <div style={{ marginRight: '2px' }}>
                            {globalStore.otherInfo.showSuggestPrice ? (
                              <WarningPrice
                                over_suggest_price={original.over_suggest_price}
                                price={original.std_sale_price_forsale}
                                suggest_price_max={original.suggest_price_max}
                                suggest_price_min={original.suggest_price_min}
                                std_unit_name_forsale={
                                  original.std_unit_name_forsale
                                }
                                fee_type={original.fee_type}
                              />
                            ) : original.is_step_price === 1 &&
                              original.step_price_table.length > 0 ? (
                              this.initStepPriceInterval(
                                'step_std_price',
                                original.step_price_table,
                              ) +
                              Price.getUnit(original.fee_type) +
                              '/' +
                              original.std_unit_name_forsale
                            ) : (
                              original.std_sale_price_forsale +
                              Price.getUnit(original.fee_type) +
                              '/' +
                              original.std_unit_name_forsale
                            )}
                          </div>
                          {/* 因为EditButton组件的popupRender内容在页面初始化的时候就渲染了，所以套个标签控制点击事件 */}
                          <span
                            onClick={() => {
                              store.initStepPriceTable(
                                original?.step_price_table || [],
                              )
                            }}
                          >
                            <EditButton
                              popupRender={(closePopup) => {
                                return original?.is_step_price === 1 ? (
                                  <PopupContentConfirm
                                    type='save'
                                    hideClose
                                    onCancel={closePopup}
                                    onSave={() => {
                                      const new_step_price_table = store.transformStepPriceTable()
                                      store
                                        .updateSku(
                                          'step_price_table',
                                          JSON.stringify(new_step_price_table),
                                          original.sku_id,
                                        )
                                        .then(() => closePopup())
                                    }}
                                  >
                                    <TieredPriceTable
                                      isEdit
                                      listIndex={index}
                                      priceUnit={Price.getUnit(
                                        original.fee_type,
                                      )}
                                      std_unit_name_forsale={
                                        original.std_unit_name_forsale
                                      }
                                    />
                                  </PopupContentConfirm>
                                ) : (
                                  <EditContentInput
                                    closePopup={closePopup}
                                    initialVal={original.std_sale_price_forsale}
                                    onSave={(value) =>
                                      store.updateSku(
                                        'std_sale_price_forsale',
                                        value,
                                        original.sku_id,
                                      )
                                    }
                                  />
                                )
                              }}
                            />
                          </span>
                          <span
                            onClick={this.handlePriceChart.bind(this, original)}
                            style={{ display: 'inline-block', width: '20px' }}
                          >
                            <ToolTip
                              showArrow
                              popup={
                                <div style={{ padding: '8px' }}>
                                  {i18next.t('图表')}
                                </div>
                              }
                            >
                              <span>
                                <SVGReport className='react-table-edit-button gm-cursor gm-text-14 gm-text-hover-primary' />
                              </span>
                            </ToolTip>
                          </span>
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: (
                  <Flex>
                    {i18next.t('定价公式')}
                    <ToolTip
                      popup={
                        <div
                          className='gm-padding-5'
                          style={{ width: '150px' }}
                        >
                          {i18next.t(
                            '定价公式开启后，可用此预设公式快速对商品进行智能定价',
                          )}
                        </div>
                      }
                    />
                  </Flex>
                ),
                accessor: 'formula_status',
                Cell: ({ original }) => {
                  return (
                    <Observer>
                      {() => (
                        <Flex>
                          <span style={{ marginRight: '2px' }}>
                            {original.formula_status === 0
                              ? i18next.t('关闭')
                              : renderFormulaText(
                                  original.formula_info.formula_text,
                                )}
                          </span>
                          <EditButton
                            popupRender={(closePopup) => (
                              <EditFormulaSettingContent
                                saveData={this.handleSaveFormula.bind(
                                  this,
                                  original,
                                  closePopup,
                                )}
                                closePopup={closePopup}
                                formula_info={original.formula_info}
                                formula_status={original.formula_status}
                              />
                            )}
                          />
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('销售规格'),
                id: 'sale_ratio',
                accessor: (d) => (
                  <span>
                    {d.sale_ratio +
                      d.std_unit_name_forsale +
                      '/' +
                      d.sale_unit_name}
                  </span>
                ),
              },
              {
                Header: i18next.t('销售价'),
                accessor: 'sale_price',
                Cell: ({ original, index }) => {
                  return original.is_price_timing ? (
                    <span>{i18next.t('时价')}</span>
                  ) : (
                    <Observer>
                      {() => (
                        <Flex>
                          <span style={{ marginRight: '2px' }}>
                            {original.is_step_price === 1
                              ? this.initStepPriceInterval(
                                  'step_sale_price',
                                  original.step_price_table,
                                ) +
                                Price.getUnit(original.fee_type) +
                                '/' +
                                original.sale_unit_name
                              : original.sale_price +
                                Price.getUnit(original.fee_type) +
                                '/' +
                                original.sale_unit_name}
                          </span>
                          <span
                            onClick={() => {
                              store.initStepPriceTable(
                                original?.step_price_table || [],
                              )
                            }}
                          >
                            <EditButton
                              popupRender={(closePopup) => {
                                return original?.is_step_price === 1 ? (
                                  <PopupContentConfirm
                                    type='save'
                                    hideClose
                                    onCancel={closePopup}
                                    onSave={() => {
                                      const new_step_price_table = store.transformStepPriceTable()
                                      store
                                        .updateSku(
                                          'step_price_table',
                                          JSON.stringify(new_step_price_table),
                                          original.sku_id,
                                        )
                                        .then(() => closePopup())
                                    }}
                                  >
                                    <TieredPriceTable
                                      isEdit
                                      listIndex={index}
                                      priceUnit={Price.getUnit(
                                        original.fee_type,
                                      )}
                                      sale_unit_name={original.sale_unit_name}
                                    />
                                  </PopupContentConfirm>
                                ) : (
                                  <EditContentInput
                                    closePopup={closePopup}
                                    initialVal={original.sale_price}
                                    onSave={(value) =>
                                      store.updateSku(
                                        'sale_price',
                                        value,
                                        original.sku_id,
                                      )
                                    }
                                  />
                                )
                              }}
                            />
                          </span>
                        </Flex>
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: (
                  <RefPriceTypeSelect
                    postRefPriceType={postRefPriceType}
                    refPriceType={refPriceType}
                  />
                ),
                accessor: 'std_unit_name_forsale',
                show: !globalStore.otherInfo.cleanFood,
                Cell: ({ original }) => {
                  let price = original[referencePriceFlag]
                  if (referencePriceFlag === 'last_in_stock_price') {
                    const purchaseNewest = original[referencePriceFlag]?.newest
                    const purchaseEarlier =
                      original[referencePriceFlag]?.earlier

                    price = original[referencePriceFlag]?.newest?.price || null
                    return this.showPopover(
                      original,
                      price,
                      purchaseNewest,
                      purchaseEarlier,
                    )
                  }
                  return _.isNumber(price) ? (
                    <div>
                      {Big(price).div(100).toFixed(2) +
                        Price.getUnit(original.fee_type) +
                        '/' +
                        original.std_unit_name_forsale}
                    </div>
                  ) : (
                    '-'
                  )
                },
              },
              {
                Header: i18next.t('销售状态'),
                accessor: 'state',
                Cell: ({ original, index }) => (
                  <Observer>
                    {() => (
                      <Switch
                        type='primary'
                        checked={!!original.state}
                        on={i18next.t('上架')}
                        off={i18next.t('下架')}
                        disabled={!p_editSku}
                        onChange={this.handleChangeState.bind(
                          this,
                          original.sku_id,
                        )}
                      />
                    )}
                  </Observer>
                ),
              },
              {
                Header: i18next.t('加工状态'),
                accessor: 'clean_food',
                show: globalStore.isCleanFood(),
                Cell: ({ original: { clean_food } }) =>
                  clean_food ? i18next.t('开启') : i18next.t('关闭'),
              },
              {
                Header: i18next.t('商品加工标签'),
                accessor: 'process_label_name',
                show: globalStore.isCleanFood(),
                Cell: ({ original: { process_label_name } }) =>
                  process_label_name || '无',
              },
              {
                width: 90,
                Header: OperationHeader,
                Cell: ({ original }) => (
                  <OperationCell>
                    <OperationDetail
                      data-id='InitSaleCheckDetail'
                      onClick={this.handleDetail.bind(
                        this,
                        original.spu_id,
                        original.sku_id,
                        original.fee_type,
                      )}
                    />
                    <OperationDelete
                      disabled={!p_deleteSku}
                      onClick={this.handleDelete.bind(this, original.sku_id)}
                      title={i18next.t('删除商品规格')}
                    >
                      {i18next.t('是否确定要删除该商品规格？')}
                    </OperationDelete>
                  </OperationCell>
                ),
              },
            ]}
            keyField='sku_id'
            selected={selectedList}
            onSelect={(selected) => store.onSelectSku(selected)}
            onSelectAll={(isSelectAll) => store.toggleSelectAllSku(isSelectAll)}
            batchActionBar={
              selectedList.length ? (
                <BatchActionBar {...this.props.location} />
              ) : null
            }
          />
        </ManagePagination>
      </BoxTable>
    )
  }
}

SaleList.propTypes = {
  postRefPriceType: PropTypes.func,
  refPriceType: PropTypes.number,
}

export default SaleList
