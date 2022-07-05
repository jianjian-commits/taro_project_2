import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  Switch,
  Pagination,
  Loading,
  Tip,
  Dialog,
  Modal,
  Uploader,
  DropDown,
  DropDownItems,
  DropDownItem,
  Price,
  RightSideModal,
  ToolTip,
  Popover,
  Button,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { SelectTable, TableUtil } from '@gmfe/table'
import FloatTip from '../../common/components/float_tip'
import CategoryPinLeiSelectDialog from '../component/category_pinlei_select_dialog'
import WarningPrice from '../component/warning_price'
import Modify from '../component/modify'
import SmartPriceModal from '../component/smart_price_modal'
import FormulaSetting from '../component/formula_setting'
import { BatchImportDialog, NoCategory, SearchFilter } from './components/index'
import {
  RefPriceTypeSelect,
  refPriceTypeHOC,
} from '../../common/components/ref_price_type_hoc'
import globalStore from '../../stores/global'
import TaskList from '../../task/task_list'
import store from './store'
import merchandiseStore from '../store'
import '../reducer'
import classNames from 'classnames'
import _ from 'lodash'
import { saleReferencePrice } from '../../common/enum'
import { isNumber } from '../../common/util'
import { Request } from '@gm-common/request'
import Big from 'big.js'
import { history, productDefaultImg } from '../../common/service'
import { deleteSku } from '../api'
import { ENUMFilter } from '../util'
import { SvgSupplier } from 'gm-svg'

@observer
class List extends React.Component {
  constructor() {
    super()
    this.state = {
      showSelect: false,
      dialogShow: false,
    }
  }

  handleToPage = (pagination) => {
    store.getMerchandiseSaleList(this.props.location.query.id, pagination)
  }

  handleDetail(spu_id, sku_id, e) {
    e.preventDefault()
    const { id, name, salemenuType } = this.props.location.query
    // 新开页面
    window.open(
      `#/merchandise/manage/sale/detail?spu_id=${spu_id}&sku_id=${sku_id}&salemenuId=${id}&salemenuType=${salemenuType}&salemenuName=${name}`
    )
  }

  handleChangeState(sku_id, checked) {
    store
      .updateMerchandiseSaleList(sku_id, 'state', checked ? 1 : 0)
      .then(() => {
        Tip.success(i18next.t('修改状态成功'))
      })
  }

  handleChangePrice(sku_id, field, name, price) {
    if (!isNumber(price)) {
      Tip.info(i18next.t('请输入正确的价格'))
      return false
    }
    const tempPrice = Big(price).times(100).toFixed(0)
    store.updateMerchandiseSaleList(sku_id, field, tempPrice).then(() => {
      Tip.success(
        i18next.t('KEY67', {
          VAR1: name,
        }) /* src:'修改' + name + '成功' => tpl:修改${VAR1}成功 */
      )
    })
  }

  handleChangeSkuName(sku_id, name) {
    if (!name) {
      Tip.info(i18next.t('名字不能为空'))
      return false
    } else {
      store.updateMerchandiseSaleList(sku_id, 'sku_name', name).then(() => {
        Tip.success(i18next.t('修改规格名成功'))
      })
      return true
    }
  }

  handleBtnNew = (e) => {
    e.preventDefault()
    this.setState({
      showSelect: true,
    })
  }

  handlePinleiSelect = (selected) => {
    history.push({
      pathname: '/merchandise/manage/sale/create',
      search: `?one=${selected.one.id}&two=${selected.two.id}&pinLei=${selected.pinLei.id}&salemenuId=${this.props.location.query.id}`,
    })
    this.setState({ showSelect: false })
  }

  handlePinleiCancel = () => {
    this.setState({
      showSelect: false,
    })
  }

  handleSettingServiceBatch = () => {
    window.open(
      '/station/skuproducts/servetype/' + this.props.location.query.id
    )
  }

  handleSettingService = () => {
    window.open('/station/config/sku/' + this.props.location.query.id)
  }

  handleBatchImportSkus = () => {
    this.setState({
      dialogShow: true,
    })
  }

  handleDialogToggle = () => {
    this.setState({
      dialogShow: !this.state.dialogShow,
    })
  }

  handleImportConfirm = (postData) => {
    Request('/product/sku/import', {
      timeout: 30000,
    })
      .data(postData)
      .post()
      .then(() => {
        Tip.success(i18next.t('导入成功！'))
        store.getMerchandiseSaleList(this.props.location.query.id)
      })
    this.setState({
      dialogShow: false,
    })
  }

  handleImportGoods = (files) => {
    const file = files[0]
    const salemenuId = this.props.location.query.id

    Dialog.dialog({
      title: i18next.t('提示'),
      children: (
        <div>
          <div>{i18next.t('是否确定上传') + '：' + file.name}</div>
          <span className='gm-font-12 gm-text-red'>
            {i18next.t(
              '提示：数据量过多会造成导入异常，建议每次最多导入1000条'
            )}
          </span>
        </div>
      ),
      onOK: () => {
        store
          .importSku(file, globalStore.stationId, salemenuId)
          .then((json) => {
            if (json.data && json.data.failed !== 0) {
              Modal.render({
                title: i18next.t('提示'),
                children: (
                  <div>
                    <div>
                      {i18next.t(
                        /* tpl: 成功导入${succeed}条, 存在异常信息${failed}条 */ 'merchandis_success_import_tip',
                        {
                          succeed: json.data.succeed,
                          failed: json.data.failed,
                        }
                      )}
                    </div>
                    <a href={json.data.link}>
                      {i18next.t('点击此处下载失败列表，查看异常原因')}
                    </a>
                    <Flex justifyEnd className='gm-margin-top-5'>
                      <Button
                        className='gm-margin-right-5'
                        onClick={this.handleErrorModal}
                      >
                        {i18next.t('关闭')}
                      </Button>
                    </Flex>
                  </div>
                ),
                onHide: this.handleErrorModal,
                style: { width: '300px' },
              })
            } else {
              store.getMerchandiseSaleList(salemenuId)
              Tip.success(i18next.t('导入成功！'))
            }
          })
      },
    })
  }

  handleErrorModal = () => {
    Modal.hide()
    store.getMerchandiseSaleList(this.props.location.query.id)
  }

  handleSelectAll = () => {
    store.merchandiseSaleListSelectAll()
  }

  handleSelect = (selected) => {
    store.merchandiseSaleListSelect(selected)
  }

  handleEditSmartPriceCancel = () => {
    Modal.hide()
  }

  handleEditSmartPriceNext = (info) => {
    store
      .editSmartPriceNext(this.props.location.query.id, info)
      .then((json) => {
        const type = 'sale'

        if (json.code === 0) {
          Modal.hide()
          history.push(`/merchandise/manage/list/pricing/${type}`)
        }
      })
  }

  jumpToPrioritySupplier = () => {
    const { id, name } = this.props.location.query
    history.push({
      pathname: `/merchandise/manage/sale/priority_supplier`,
      search: `?salemenu_id=${id}&name=${name}`,
    })
  }

  // 智能定价
  handleEditSmartPrice = () => {
    const {
      saleList: { selected, selectAllType },
    } = store

    if (selectAllType !== 2 && !selected.length) {
      return Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行定价设置')
      )
    }

    Modal.render({
      title: i18next.t('智能定价'),
      children: (
        <SmartPriceModal
          onCancel={this.handleEditSmartPriceCancel}
          onNext={this.handleEditSmartPriceNext}
        />
      ),
      onHide: this.handleEditSmartPriceCancel,
    })
  }

  handleSort = (name) => {
    const { sort_direction, sort_by } = store.saleListFilter
    const { id } = this.props.location.query
    if (!sort_direction || (sort_by === name && sort_direction === 'desc')) {
      store.saleListSort(name, 'asc').then(() => {
        store.getMerchandiseSaleList(id)
      })
    } else {
      store.saleListSort(name, 'desc').then(() => {
        store.getMerchandiseSaleList(id)
      })
    }
  }

  renderBatchButton = () => {
    return (
      <div
        className='gm-inline-block gm-position-relative'
        style={{ float: 'left' }}
      >
        <Uploader onUpload={this.handleImportGoods} accept='.xlsx'>
          <Button type='primary' plain>
            {i18next.t('批量修改')} <i className='ifont ifont-upload' />
          </Button>
        </Uploader>
      </div>
    )
  }

  handleSkuDelete = (sku) => {
    const skuId = sku.sku_id
    const {
      saleList: { pagination },
    } = store
    Dialog.confirm({
      children: i18next.t('是否确定要删除该商品规格?'),
      onOK: () => {
        deleteSku(skuId).then(() => {
          store.getMerchandiseSaleList(this.props.location.query.id, pagination)
          Tip.success(i18next.t('删除成功'))
        })
      },
    })
  }

  handleSkuBatchDelete = () => {
    const {
      saleList: { selected, selectAllType },
    } = store
    if (selectAllType !== 2 && !selected.length) {
      return Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行删除操作')
      )
    }

    Dialog.confirm({
      children: i18next.t('确定要删除所选规格吗?'),
      title: i18next.t('批量删除商品规格'),
      onOK: () => {
        store.batchDeleteSku(this.props.location.query.id).then(() => {
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        })
      },
    })
  }

  handleSaveFormula = (sku_id, info) => {
    const { id } = this.props.location.query
    store.setFormula(id, info, sku_id).then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('设置定价公式成功'))
        store.getMerchandiseSaleList(id, store.saleList.pagination)
        Modal.hide()
      }
    })
  }

  handleEditFormula = (type, status, info, sku_id) => {
    const {
      saleList: { selected, selectAllType },
    } = store

    if (type === 2 && selectAllType !== 2 && !selected.length) {
      return Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行定价公式设置')
      )
    }

    Modal.render({
      children: (
        <FormulaSetting
          status={status}
          info={info}
          type={type}
          onSave={this.handleSaveFormula.bind(this, sku_id)}
          onCancel={Modal.hide}
        />
      ),
      title: i18next.t('设置定价公式'),
      style: { width: '480px' },
      onHide: Modal.hide,
    })
  }

  handleChangeSelectAllType = () => {
    store.changeSelectAllType()
  }

  render() {
    const { categories } = merchandiseStore
    const category1 = merchandiseStore.category1 || []
    const {
      saleList: {
        list,
        loading,
        pagination,
        selectAll,
        selected,
        selectAllType,
      },
      saleListFilter: { sort_by, sort_direction },
    } = store
    const { showSelect, dialogShow } = this.state
    const { refPriceType, postRefPriceType } = this.props

    const isError = list === undefined || list === null || false
    const { id, name, salemenuType } = this.props.location.query
    const p_editSku = globalStore.hasPermission('edit_sku')
    const p_addSku = globalStore.hasPermission('add_sku')
    const p_add_import_sale_skus = globalStore.hasPermission(
      'add_import_sale_skus'
    )
    const p_edit_smart_price = globalStore.hasPermission('edit_smart_pricing')
    const p_edit_sku_batch = globalStore.hasPermission('edit_sku_batch')
    const canDeleteSku = globalStore.hasPermission('delete_sale_sku')
    const p_edit_batch_sku_formula = globalStore.hasPermission(
      'edit_batch_sku_formula'
    )
    const p_edit_sku_formula = globalStore.hasPermission('edit_sku_formula')
    const p_delete_sku_batch =
      globalStore.hasPermission('delete_sku_batch') &&
      !globalStore.isCleanFood() // 净菜站点暂时屏蔽
    const editPrioritySupplier = globalStore.hasPermission(
      'edit_priority_supplier'
    )

    const postData = {
      salemenu_id: id,
      group_id: globalStore.groupId,
      station_id: globalStore.stationId,
    }

    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === refPriceType) {
        referencePriceFlag = item.flag
        return true
      }
    })

    return (
      <div
        className='b-merchandise-list gm-margin-top-20'
        style={{
          cursor: 'default',
        }}
      >
        <CategoryPinLeiSelectDialog
          show={showSelect}
          categories={categories.length ? categories.slice() : []}
          onSelect={this.handlePinleiSelect}
          onCancel={this.handlePinleiCancel}
        />
        {loading ? (
          <Loading style={{ marginTop: '50px' }} />
        ) : isError ? (
          <div>{i18next.t('服务器错误，请刷新页面或者联系管理员!')}</div>
        ) : (
          <QuickPanel
            icon='bill'
            title={
              i18next.t('KEY68', {
                VAR1: name || '',
                VAR2: pagination.count || 0,
              }) /* src:`商品列表(${name || breadcrumbs || ''}): ${pagination.count || 0}` => tpl:商品列表(${VAR1}): ${VAR2} */
            }
            right={
              <div>
                {p_edit_sku_batch && (
                  <DropDown
                    split
                    cartClassName='gm-btn-primary gm-btn-plain'
                    className='gm-margin-right-5'
                    popup={
                      <DropDownItems>
                        {p_add_import_sale_skus && (
                          <DropDownItem onClick={this.handleBatchImportSkus}>
                            {i18next.t('批量新建')}
                          </DropDownItem>
                        )}
                        {p_edit_batch_sku_formula && (
                          <DropDownItem
                            onClick={this.handleEditFormula.bind(
                              this,
                              2,
                              0,
                              null,
                              null
                            )}
                          >
                            {i18next.t('批量设置公式')}
                          </DropDownItem>
                        )}
                        {p_delete_sku_batch && (
                          <DropDownItem onClick={this.handleSkuBatchDelete}>
                            {i18next.t('批量删除商品规格')}
                          </DropDownItem>
                        )}
                      </DropDownItems>
                    }
                  >
                    {this.renderBatchButton()}
                  </DropDown>
                )}
                {editPrioritySupplier && (
                  <Button
                    type='primary'
                    plain
                    className='gm-margin-right-5'
                    onClick={this.jumpToPrioritySupplier}
                  >
                    {i18next.t('优先供应商设置')}
                  </Button>
                )}
                {!globalStore.otherInfo.cleanFood && p_edit_smart_price && (
                  <Button
                    type='primary'
                    plain
                    className='gm-margin-right-5'
                    onClick={this.handleEditSmartPrice}
                  >
                    {i18next.t('智能定价')}
                  </Button>
                )}
                {+salemenuType === 2 && (
                  <Button
                    type='primary'
                    plain
                    className='gm-margin-right-5'
                    onClick={this.handleSettingService}
                  >
                    {i18next.t('默认服务设置')}{' '}
                    <i className='glyphicon glyphicon-bell' />
                  </Button>
                )}
                {+salemenuType === 2 && (
                  <Button
                    type='primary'
                    plain
                    className='gm-margin-right-5'
                    onClick={this.handleSettingServiceBatch}
                  >
                    {i18next.t('批量服务设置')}{' '}
                    <i className='ifont ifont-pi-liang' />
                  </Button>
                )}
                <Button
                  type='primary'
                  plain
                  className='gm-margin-right-5'
                  onClick={() => {
                    window.open(
                      `#/merchandise/manage/sale/stock_setting?station_id=${globalStore.stationId}&id=${id}&salemenuType=${salemenuType}`
                    )
                  }}
                >
                  {i18next.t('库存设置')}{' '}
                  <i className='glyphicon glyphicon-inbox' />
                </Button>
                {+salemenuType !== 2 && p_addSku && (
                  <Button type='primary' plain onClick={this.handleBtnNew}>
                    {i18next.t('新建销售商品')}{' '}
                    <i className='ifont ifont-plus' />
                  </Button>
                )}
              </div>
            }
          >
            {!category1.length && <NoCategory isEmpty {...this.props} />}
            {category1.length && !list.length ? (
              <NoCategory {...this.props} />
            ) : (
              <SelectTable
                ref={(ref) => (this.table = ref)}
                data={list.slice()}
                columns={[
                  {
                    Header: i18next.t('商品图片'),
                    id: 'image',
                    accessor: (d) => {
                      const imageSrc = d.sku_image
                        ? d.sku_image
                        : d.spu_image || productDefaultImg
                      return (
                        <Flex
                          alignCenter
                          style={{
                            width: '40px',
                            height: '40px',
                          }}
                          className='gm-border'
                        >
                          <img
                            src={imageSrc}
                            style={{
                              maxWidth: '40px',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </Flex>
                      )
                    },
                  },
                  {
                    Header: (
                      <TableUtil.SortHeader
                        onClick={this.handleSort.bind(this, 'spu')}
                        type={sort_by === 'spu' ? sort_direction : null}
                      >
                        {i18next.t('商品名')}
                      </TableUtil.SortHeader>
                    ),
                    id: 'spu_id',
                    accessor: (d) => (
                      <span>
                        {d.spu_name}
                        <br />
                        {d.spu_id}
                      </span>
                    ),
                  },
                  {
                    Header: (
                      <TableUtil.SortHeader
                        onClick={this.handleSort.bind(this, 'sku')}
                        type={sort_by === 'sku' ? sort_direction : null}
                      >
                        {i18next.t('规格名')}
                      </TableUtil.SortHeader>
                    ),
                    id: 'sku_id',
                    accessor: (d) => (
                      <div>
                        <Modify
                          value={d.sku_name}
                          onChange={this.handleChangeSkuName.bind(
                            this,
                            d.sku_id
                          )}
                          disabled={!p_editSku}
                        >
                          {d.sku_name}
                        </Modify>
                        <FloatTip
                          skuId={d.sku_id}
                          tip={d.outer_id}
                          showCustomer={globalStore.otherInfo.showSkuOuterId}
                        />
                      </div>
                    ),
                  },
                  {
                    Header: i18next.t('分类'),
                    id: 'category_name_1',
                    accessor: (d) => (
                      <span>
                        {d.category_name_1}/{d.category_name_2}/{d.pinlei_name}
                      </span>
                    ),
                  },
                  {
                    Header: i18next.t('销售单价'),
                    id: 'std_sale_price_forsale',
                    accessor: (d) => {
                      const price = Big(d.std_sale_price_forsale || 0)
                        .div(100)
                        .toFixed(2)
                      return d.is_price_timing ? (
                        <span>{i18next.t('时价')}</span>
                      ) : (
                        <Modify
                          value={Big(d.std_sale_price_forsale || 0)
                            .div(100)
                            .toFixed(2)}
                          onChange={this.handleChangePrice.bind(
                            this,
                            d.sku_id,
                            'std_sale_price_forsale',
                            i18next.t('单价')
                          )}
                          disabled={!p_editSku}
                        >
                          {globalStore.otherInfo.showSuggestPrice ? (
                            <WarningPrice
                              over_suggest_price={d.over_suggest_price}
                              price={price}
                              suggest_price_max={d.suggest_price_max}
                              suggest_price_min={d.suggest_price_min}
                              std_unit_name_forsale={d.std_unit_name_forsale}
                              fee_type={d.fee_type}
                            />
                          ) : (
                            price +
                            Price.getUnit(d.fee_type) +
                            '/' +
                            d.std_unit_name_forsale
                          )}
                        </Modify>
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
                                '定价公式开启后，可用此预设公式快速对商品进行智能定价'
                              )}
                            </div>
                          }
                        />
                      </Flex>
                    ),
                    id: 'formula_status',
                    accessor: (d) => {
                      const { formula_info, sku_id, formula_status } = d

                      return (
                        <div
                          className={classNames({
                            'gm-cursor': p_edit_sku_formula,
                          })}
                          style={{ minWidth: '80px' }}
                          onClick={
                            p_edit_sku_formula
                              ? this.handleEditFormula.bind(
                                  this,
                                  1,
                                  formula_status,
                                  formula_info,
                                  sku_id
                                )
                              : null
                          }
                        >
                          <div className='gm-inline-block'>
                            {formula_status === 0
                              ? i18next.t('关闭')
                              : ENUMFilter.priceType(formula_info.price_type) +
                                ENUMFilter.calType(
                                  formula_info.cal_type,
                                  formula_info.cal_num
                                )}
                          </div>
                          {p_edit_sku_formula && (
                            <i className='xfont xfont-pencil text-primary' />
                          )}
                        </div>
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
                    id: 'sale_price',
                    accessor: (d) => {
                      return d.is_price_timing ? (
                        <span>{i18next.t('时价')}</span>
                      ) : (
                        <Modify
                          value={Big(d.sale_price || 0)
                            .div(100)
                            .toFixed(2)}
                          onChange={this.handleChangePrice.bind(
                            this,
                            d.sku_id,
                            'sale_price',
                            i18next.t('销售价')
                          )}
                          disabled={!p_editSku}
                        >
                          {Big(d.sale_price || 0)
                            .div(100)
                            .toFixed(2)}
                          {Price.getUnit(d.fee_type) + '/'}
                          {d.sale_unit_name}
                        </Modify>
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
                    id: 'std_unit_name_forsale',
                    show: !globalStore.otherInfo.cleanFood,
                    accessor: (d) => {
                      const val = d[referencePriceFlag]
                      let isSupplierPrice = false // 是否为供应商报价
                      if (
                        referencePriceFlag === 'latest_quote_price' &&
                        d.latest_quote_from_supplier
                      ) {
                        isSupplierPrice = true
                      } else if (
                        referencePriceFlag === 'last_quote_price' &&
                        d.quoted_from_supplier
                      ) {
                        isSupplierPrice = true
                      }
                      return val === 0 ? (
                        0 +
                          Price.getUnit(d.fee_type) +
                          '/' +
                          d.std_unit_name_forsale
                      ) : val ? (
                        <Flex alignCenter>
                          <span>
                            {Big(val || 0)
                              .div(100)
                              .toFixed(2) +
                              Price.getUnit(d.fee_type) +
                              '/' +
                              d.std_unit_name_forsale}
                          </span>
                          {isSupplierPrice && (
                            <Popover
                              top
                              showArrow
                              type='hover'
                              popup={<div>{i18next.t('供应商报价')}</div>}
                            >
                              <SvgSupplier
                                className='gm-text-14'
                                style={{
                                  color: 'green',
                                  marginLeft: '2px',
                                }}
                              />
                            </Popover>
                          )}
                        </Flex>
                      ) : (
                        '-'
                      )
                    },
                  },
                  {
                    Header: i18next.t('销售状态'),
                    id: 'state',
                    accessor: (d) => (
                      <Switch
                        type='primary'
                        checked={!!d.state}
                        on={i18next.t('上架')}
                        off={i18next.t('下架')}
                        disabled={!p_editSku}
                        onChange={this.handleChangeState.bind(this, d.sku_id)}
                      />
                    ),
                  },
                  {
                    width: 80,
                    Header: TableUtil.OperationHeader,
                    Cell: (row) => (
                      <TableUtil.OperationCell>
                        <a
                          onClick={this.handleDetail.bind(
                            this,
                            row.original.spu_id,
                            row.original.sku_id
                          )}
                        >
                          <i className='xfont xfont-detail' />
                        </a>
                        {canDeleteSku && (
                          <a
                            className='gm-margin-left-5'
                            onClick={this.handleSkuDelete.bind(
                              this,
                              row.original
                            )}
                          >
                            <i className='xfont xfont-delete gm-cursor' />
                          </a>
                        )}
                      </TableUtil.OperationCell>
                    ),
                  },
                ]}
                keyField='_skuId' // select
                selectAll={selectAll}
                onSelectAll={this.handleSelectAll}
                selectAllTip={
                  selectAllType === 1 ? (
                    <div>
                      {i18next.t('已选择当前页内容，')}
                      <a
                        href='javascript:;'
                        onClick={this.handleChangeSelectAllType}
                      >
                        {i18next.t('点此勾选全部页内容')}
                      </a>
                    </div>
                  ) : (
                    <div>
                      {i18next.t('已选择所有页内容，')}
                      <a
                        href='javascript:;'
                        onClick={this.handleChangeSelectAllType}
                      >
                        {i18next.t('点此勾选当前页内容')}
                      </a>
                    </div>
                  )
                }
                selected={selected.slice()}
                onSelect={this.handleSelect}
              />
            )}
            {!(category1.length !== 0 && pagination.count <= 10) && (
              <div className='text-center gm-margin-top-15'>
                <Pagination data={pagination} toPage={this.handleToPage} />
              </div>
            )}
          </QuickPanel>
        )}
        <BatchImportDialog
          show={dialogShow}
          title={i18next.t('销售规格批量导入')}
          type='stockin'
          onHide={this.handleDialogToggle}
          postData={postData}
          onImport={this.handleImportConfirm}
        />
      </div>
    )
  }
}

@refPriceTypeHOC(1)
class Component extends React.Component {
  render() {
    return (
      <div>
        <SearchFilter {...this.props} />
        <List {...this.props} />
      </div>
    )
  }
}

export default Component
