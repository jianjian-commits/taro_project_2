import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer, Observer } from 'mobx-react'
import store from '../list_store'

import _ from 'lodash'
import { salemenuPop, getSkuPriceRange } from '../util'
import { ENUMFilter, getRefParams } from '../../util'
import { deleteSku, deleteSpu } from '../../api'

import ExpandListAction from './expand_list_action'
import ListImg from '../../component/list_img'
import BatchActionBar from './batch_action_bar'
import { EditFormulaSettingContent } from '../../component/edit_content'
import {
  Flex,
  Popover,
  Price,
  Tip,
  BoxTable,
  Switch,
  ToolTip,
  PopupContentConfirm,
} from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import {
  Table,
  expandTableHOC,
  selectTableV2HOC,
  TableUtil,
  subTableHOC,
} from '@gmfe/table'
import WarningPrice from '../../component/warning_price'
import getTableChild from 'common/table_child'
import TableTotalText from 'common/components/table_total_text'
import { RefPriceToolTip } from 'common/components/ref_price_type_hoc'
import { FEE_LIST } from 'common/enum'
import { stockState } from 'common/filter'
import renderFormulaText from 'common/components/calculator/render_formula_text'
import HeaderTip from 'common/components/header_tip'
import Big from 'big.js'
import manageStore from '../../store'
import globalStore from 'stores/global'
import FloatTip from 'common/components/float_tip'
import { renderRecommendImageModal } from '../../component/recommend_image_modal'
import SvgEditPen from 'svg/edit_pen.svg'
import SVGTieredPrice from 'svg/tiered_price.svg'
import { System } from 'common/service'
import TieredPriceTable from './tiered_price_table'

const SelectExpandTable = selectTableV2HOC(expandTableHOC(Table))

const SelectSubTable = selectTableV2HOC(subTableHOC(Table))
const TableChild = getTableChild(SelectExpandTable, SelectSubTable)
const {
  SortHeader,
  EditButton,
  OperationHeader,
  OperationCell,
  OperationDetail,
  OperationDelete,
  EditContentInput,
} = TableUtil

@observer
class MerchandiseTableList extends React.Component {
  constructor(props) {
    super(props)
    this.refPagination = React.createRef()
  }

  componentDidMount() {
    // 等待拉取c_salemenu
    setTimeout(() => {
      if (System.isC()) {
        store.changeFilter('salemenu_ids', [{ id: globalStore.c_salemenu_id }])
      }

      store.setDoFirstRequest(this.refPagination.current.apiDoFirstRequest)
      store.setDoCurrentRequest(this.refPagination.current.apiDoCurrentRequest)
      this.refPagination.current.apiDoFirstRequest()
    }, 200)
  }

  initStepPriceInterval = (key, step_price_table) => {
    const table = step_price_table.map((e) => e[key]).sort((a, b) => a - b)
    return `${Big(table[0] || 0)
      .div(100)
      .toFixed(2)}~${Big(table[table.length - 1] || 0)
      .div(100)
      .toFixed(2)}`
  }

  handleDetailSpu = (spu_id) => {
    window.open(
      System.getUrl(`#/merchandise/manage/list/sku_detail?spu_id=${spu_id}`),
    )
  }

  handleDeleteSpu = (spu_id) => {
    deleteSpu(spu_id).then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('删除成功'))
        this.refPagination.current.apiDoFirstRequest()
      }
    })
  }

  handlePageChange = (page) => {
    return store.getMerchandiseList(page)
  }

  handleChangeState = (spuIndex, sku_id, checked) => {
    store.changeSku(
      spuIndex,
      sku_id,
      'state',
      checked ? 1 : 0,
      checked ? 'put_shelf' : '',
    )
  }

  handleDeleteSku = (sku_id) => {
    deleteSku(sku_id).then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('删除成功'))
        // 产品说 就停留在那一页，不管是否最后一页，是否这一页已经没有数据了
        this.handlePageChange(store.pagination)
      }
    })
  }

  handleDetailSku = (spu_id, sku_id, fee_type) => {
    window.open(
      System.getUrl(
        `#/merchandise/manage/list/sku_detail?spu_id=${spu_id}&sku_id=${sku_id}&fee_type=${fee_type}`,
      ),
    )
  }

  handleUploadImg = (files) => {
    const res = _.map(files, (item) => manageStore.uploadImg(item))
    return Promise.all(res).then((json) => _.map(json, (i) => i.data))
  }

  handleUpdateImages = (index, imgs) => {
    store.updateSpuImages(index, imgs).then(() => {
      Tip.info(t('更新图片成功'))
      this.refPagination.current.apiDoCurrentRequest()
    })
  }

  handleRecommendImage = (index, info) => {
    renderRecommendImageModal({
      info,
      onSubmit: (imgs) => {
        this.handleUpdateImages(index, imgs)
      },
      onUpload: async (files) => {
        const imgs = await this.handleUploadImg(files)
        this.handleUpdateImages(index, imgs)
      },
    })
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
    store.saveFormulaSetting(info, sku.sku_id).then(() => {
      close()
      Tip.success(i18next.t('修改定价公式成功'))
      this.handlePageChange(store.pagination)
    })
  }

  handleSort = (name) => {
    Promise.resolve(store.sort(name)).then(() => {
      this.refPagination.current.apiDoFirstRequest()
    })
  }

  // 打开Povper
  showPopover = (original, price, purchaseNewest, purchaseEarlier = []) => {
    return purchaseEarlier?.length > 0 || _.isNumber(price) ? (
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
      pagination,
      selectedList,
      list,
      filter: { sort_by, sort_direction },
    } = store
    const { reference_price_type } = manageStore
    const { referencePriceFlag, referencePriceName } = getRefParams(
      reference_price_type,
    )
    const p_editSku = globalStore.hasPermission('edit_sku')

    const columns = [
      {
        Header: (
          <HeaderTip
            title={i18next.t('商品图片')}
            tip={i18next.t(
              '点击图片可以通过云图库智能推荐或上传本地图片快捷修改商品主图',
            )}
          />
        ),
        accessor: 'image',
        Cell: ({ original, index }) => (
          <div className='gm-inline-block gm-cursor'>
            <Flex
              onClick={this.handleRecommendImage.bind(this, index, {
                name: original.spu_name,
                spu_id: original.spu_id,
                defaultImages: original.image
                  ? [{ id: original.image_id, url: original.image }]
                  : [],
              })}
            >
              <ListImg isBBS={original.p_type === 1} imgSrc={original.image} />
              <Flex className='react-table-edit-button gm-text-14 gm-text-hover-primary gm-padding-left-5'>
                <SvgEditPen />
              </Flex>
            </Flex>
          </div>
        ),
      },
      {
        Header: (
          <SortHeader
            onClick={this.handleSort.bind(this, 'spu')}
            type={sort_by === 'spu' ? sort_direction : null}
          >
            {i18next.t('商品')}
          </SortHeader>
        ),
        accessor: 'spu_name',
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
                            return Tip.warning(i18next.t('商品名不能为空'))
                          store.updateSpu('spu_name', original.spu_id, value)
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
            onClick={this.handleSort.bind(this, 'category1')}
            type={sort_by === 'category1' ? sort_direction : null}
          >
            {i18next.t('分类')}
          </SortHeader>
        ),
        id: 'category_name_1',
        accessor: (d) =>
          d.category_name_1 + '/' + d.category_name_2 + '/' + d.pinlei_name,
      },
      {
        Header: (
          <span>
            {i18next.t('销售规格数')}
            <br />
            {i18next.t('(上架/全部)')}
          </span>
        ),
        id: 'spu_id',
        Cell: ({ original }) => {
          const skus = original.children
          return _.filter(skus, (v) => v.state === 1).length + '/' + skus.length
        },
      },
      !!System.isB() && {
        Header: i18next.t('所在报价单数'),
        id: 'spu_id',
        Cell: ({ original }) => {
          const skus = original.children
          return (
            <Popover
              showArrow
              component={<div />}
              type='hover'
              popup={salemenuPop(skus)}
            >
              <div>
                {
                  _.map(
                    _.uniqBy(skus, (v) => v.salemenu_id),
                    (v) => v.salemenu_name,
                  ).length
                }
              </div>
            </Popover>
          )
        },
      },
      {
        Header: i18next.t('基本单位'),
        accessor: 'std_unit_name',
      },
      {
        Header: i18next.t('销售价'),
        id: 'std_sale_price',
        Cell: ({ original }) => {
          const ranges = getSkuPriceRange(original.children)
          const showDetails = ranges.length > 1
          return _.map(ranges, (item) => {
            const fee = _.find(FEE_LIST, (v) => v.value === item.fee_type) || {
              name: i18next.t('未知'),
            }
            return (
              <div>
                {showDetails ? `${fee.name}: ` : ''}
                {`${item.min}~${item.max}${Price.getUnit(item.fee_type)}`}
              </div>
            )
          })
        },
      },
      {
        Header: i18next.t('投框方式'),
        id: 'dispatch_method',
        accessor: (d) => ENUMFilter.dispatchMethod(d.dispatch_method),
      },
      {
        width: 90,
        Header: OperationHeader,
        Cell: ({ original }) => (
          <OperationCell>
            <OperationDetail
              onClick={this.handleDetailSpu.bind(
                this,
                original.spu_id,
                original.fee_type,
              )}
            />
            <OperationDelete
              onClick={this.handleDeleteSpu.bind(this, original.spu_id)}
              title={i18next.t('删除商品规格')}
            >
              {i18next.t('是否确定要删除该商品规格？')}
            </OperationDelete>
          </OperationCell>
        ),
      },
    ].filter((_) => _)
    const subColumns = [
      {
        Header: i18next.t('商品图片'),
        id: 'image',
        accessor: (d) => (
          <ListImg isSelfSale={d.salemenu_type === 4} imgSrc={d.image} />
        ),
      },
      {
        Header: i18next.t('规格名'),
        accessor: 'sku_id',
        Cell: ({ original }, { index }) => (
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
                          store.changeSku(
                            index,
                            original.sku_id,
                            'sku_name',
                            value,
                          )
                        }
                      />
                    )}
                  />

                  {original.is_step_price === 1 && (
                    <ToolTip
                      // showArrow
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
                              priceUnit={Price.getUnit(original.fee_type)}
                              sale_unit_name={original.sale_unit_name}
                            />
                          </div>
                        )
                      }}
                    >
                      <span style={{ marginLeft: '5px' }}>
                        <SVGTieredPrice className='react-table-edit-button gm-cursor gm-text-14 gm-text-hover-primary' />
                      </span>
                    </ToolTip>
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
      !!System.isB() && {
        Header: i18next.t('所在报价单'),
        accessor: 'salemenu_name',
      },
      {
        Header: i18next.t('销售状态'),
        accessor: 'state',
        Cell: ({ original }, { index }) => (
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
                  index,
                  original.sku_id,
                )}
              />
            )}
          </Observer>
        ),
      },
      {
        Header: i18next.t('单价'),
        accessor: 'std_sale_price_forsale',
        Cell: ({ original }, { index }) => {
          return (
            <Observer>
              {() => {
                return original.is_price_timing ? (
                  i18next.t('时价')
                ) : (
                  <Flex>
                    <div style={{ marginRight: '2px' }}>
                      {globalStore.otherInfo.showSuggestPrice ? (
                        <WarningPrice
                          over_suggest_price={original.over_suggest_price}
                          price={original.std_sale_price_forsale}
                          suggest_price_max={original.suggest_price_max}
                          suggest_price_min={original.suggest_price_min}
                          std_unit_name_forsale={original.std_unit_name_forsale}
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
                                  .changeSku(
                                    index,
                                    original.sku_id,
                                    'step_price_table',
                                    JSON.stringify(new_step_price_table),
                                  )
                                  .then(() => closePopup())
                              }}
                            >
                              <TieredPriceTable
                                isEdit
                                listIndex={index}
                                sku_id={original.sku_id}
                                priceUnit={Price.getUnit(original.fee_type)}
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
                                store.changeSku(
                                  index,
                                  original.sku_id,
                                  'std_sale_price_forsale',
                                  value,
                                )
                              }
                            />
                          )
                        }}
                      />
                    </span>
                  </Flex>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: i18next.t('规格'),
        id: 'sale_ratio',
        accessor: (d) =>
          d.sale_ratio + d.std_unit_name_forsale + '/' + d.sale_unit_name,
      },
      {
        Header: i18next.t('销售价'),
        id: 'sale_price',
        Cell: ({ original }, { index }) => (
          <Observer>
            {() =>
              original.is_price_timing ? (
                i18next.t('时价')
              ) : (
                <Flex>
                  <div style={{ marginRight: '2px' }}>
                    {original.is_step_price === 1 &&
                    original.step_price_table.length > 0
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
                  </div>
                  <span
                    onClick={() => {
                      store.initStepPriceTable(original?.step_price_table || [])
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
                                .changeSku(
                                  index,
                                  original.sku_id,
                                  'step_price_table',
                                  JSON.stringify(new_step_price_table),
                                )
                                .then(() => closePopup())
                            }}
                          >
                            <TieredPriceTable
                              isEdit
                              listIndex={index}
                              sku_id={original.sku_id}
                              priceUnit={Price.getUnit(original.fee_type)}
                              sale_unit_name={original.sale_unit_name}
                            />
                          </PopupContentConfirm>
                        ) : (
                          <EditContentInput
                            closePopup={closePopup}
                            initialVal={original.sale_price}
                            onSave={(value) =>
                              store.changeSku(
                                index,
                                original.sku_id,
                                'sale_price',
                                value,
                              )
                            }
                          />
                        )
                      }}
                    />
                  </span>
                </Flex>
              )
            }
          </Observer>
        ),
      },
      {
        Header: <RefPriceToolTip name={referencePriceName} />,
        id: 'sku_id',
        Cell: ({ original }) => {
          let price = original[referencePriceFlag]
          if (referencePriceFlag === 'last_in_stock_price') {
            const purchaseNewest = original[referencePriceFlag]?.newest
            const purchaseEarlier = original[referencePriceFlag]?.earlier

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
        Header: (
          <Flex>
            {i18next.t('定价公式')}
            <ToolTip
              popup={
                <div className='gm-padding-5' style={{ width: '150px' }}>
                  {i18next.t(
                    '定价公式开启后，可用此预设公式快速对商品进行智能定价',
                  )}
                </div>
              }
              showArrow
            />
          </Flex>
        ),
        accessor: 'formula_status',
        Cell: ({ original }) => (
          <Observer>
            {() => (
              <Flex>
                <span style={{ marginRight: '2px' }}>
                  {original.formula_status === 0
                    ? i18next.t('关闭')
                    : renderFormulaText(original.formula_info.formula_text)}
                </span>
                <EditButton
                  right
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
        ),
      },
      {
        Header: i18next.t('库存'),
        id: 'stock_type',
        accessor: (d) => stockState(d.stock_type),
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
        Cell: ({ original }, { original: { spu_id } }) => (
          <OperationCell>
            <OperationDetail
              onClick={this.handleDetailSku.bind(
                this,
                spu_id,
                original.sku_id,
                original.fee_type,
              )}
            />
            <OperationDelete
              onClick={this.handleDeleteSku.bind(this, original.sku_id)}
              title={i18next.t('删除商品规格')}
            >
              {i18next.t('是否确定要删除该商品规格？')}
            </OperationDelete>
          </OperationCell>
        ),
      },
    ].filter((_) => _)
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('商品总数'),
                  content: pagination.count,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={<ExpandListAction retail={!System.isB()} />}
      >
        <ManagePagination
          onRequest={this.handlePageChange}
          ref={this.refPagination}
          id='pagination_in_merchandise_manage_list'
        >
          <TableChild
            data={list.slice()}
            columns={columns}
            keyField='spu_id'
            subProps={{
              keyField: 'sku_id',
              columns: subColumns,
            }}
            selected={selectedList.slice()}
            onSelect={(selected, selectedTree) =>
              store.setSelected(selected, selectedTree)
            }
            batchActionBar={
              selectedList.length ? (
                <BatchActionBar retail={!System.isB()} />
              ) : null
            }
          />
        </ManagePagination>
      </BoxTable>
    )
  }
}

export default MerchandiseTableList
