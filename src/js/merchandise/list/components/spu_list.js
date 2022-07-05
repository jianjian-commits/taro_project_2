import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Flex,
  Dialog,
  Popover,
  Tip,
  DropDown,
  DropDownItems,
  DropDownItem,
  Sheet,
  SheetColumn,
  SheetAction,
  SheetSelect,
  Switch,
  Pagination,
  Price,
  Modal,
  RightSideModal,
  Button,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import globalStore from '../../../stores/global'
import Big from 'big.js'
import _ from 'lodash'
import { ENUMFilter } from '../../util'
import { getSkuPriceRange } from '../util'
import { history, productDefaultImg } from '../../../common/service'
import { isNumber } from '../../../common/util'
import { saleReferencePrice, FEE_LIST } from '../../../common/enum'
import { stockState } from '../../../common/filter'
import { RefPriceToolTip } from '../../../common/components/ref_price_type_hoc'

import Modify from '../../component/modify'
import FloatTip from '../../../common/components/float_tip'
import WarningPrice from '../../component/warning_price'
import FormulaSetting from '../../component/formula_setting'

import classNames from 'classnames'
import { deleteSku, deleteSpu } from '../../api'
import actions from '../../../actions'
import '../../actions'
import '../../reducer'
import '../actions'
import '../reducer'
import TaskList from '../../../task/task_list'
import ImportModal from './import_modal'
import { Request } from '@gm-common/request'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { SvgSupplier } from 'gm-svg'

const getSkus = (skus, isShowUnActive) => {
  return _.filter(skus, (v) => isShowUnActive || v.salemenu_is_active)
}

class SpuSheet extends React.Component {
  state = {
    noGroupSpu: false,
    check: false,
  }

  componentDidMount() {
    const { list } = this.props.merchandiseList
    setTimeout(() => {
      // 返回的时list
      if (
        list &&
        (this.props.location.action !== 'POP' ||
          (this.props.location.action === 'POP' && !list.length))
      ) {
        Promise.all([
          actions.merchandise_common_get_all(),
          actions.merchandise_list_search(),
        ]).then((datas) => {
          this.setState({
            noGroupSpu: datas[1].length === 0, // 只第一次的时候会处理 noGroupSpu
          })
        })
      }
    }, 0)
  }

  handleSkuDetail = (spu_id, sku_id, e) => {
    e.preventDefault()
    window.open(
      `#/merchandise/manage/list/detail?spu_id=${spu_id}&sku_id=${sku_id}`,
    )
  }

  handleChangeReferencePrice(type) {
    actions.merchandise_common_set_reference_price_type(type, 1)
  }

  handleChangeSkuName(sku_id, name) {
    if (!name) {
      Tip.info(i18next.t('名字不能为空'))
      return
    }
    actions.merchandise_list_sku_update(sku_id, 'sku_name', name).then(() => {
      Tip.success(i18next.t('修改规格名成功'))
    })
  }

  handleChangeState(sku_id, checked) {
    actions
      .merchandise_list_sku_update(sku_id, 'state', checked ? 1 : 0)
      .then(() => {
        Tip.success(i18next.t('修改销售状态成功'))
      })
  }

  handleChangePrice(sku_id, field, name, price) {
    if (!isNumber(price)) {
      Tip.info(i18next.t('请输入正确的价格'))
      return false
    }
    const tempPrice = Big(price || 0)
      .times(100)
      .toFixed(0)
    actions.merchandise_list_sku_update(sku_id, field, tempPrice).then(() => {
      Tip.success(
        i18next.t(
          /* src:'修改' + name + '成功' => tpl:修改${VAR1}成功 */ 'KEY63',
          { VAR1: name },
        ),
      )
    })
  }

  handleSelectSku(spu_index = -1, checked = false, sku_index = -1) {
    actions.merchandise_list_sku_select(spu_index, checked, sku_index)
  }

  handleSelectAllSku(spu_index = -1, checked = false) {
    actions.merchandise_list_spu_select(checked, spu_index)
  }

  handleSaveFormula = (sku_id, info) => {
    actions.merchandise_list_set_formula(info, sku_id).then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('设置定价公式成功'))
        actions.merchandise_list_search(this.props.merchandiseList.pagination)
        Modal.hide()
      }
    })
  }

  handleEditFormula = (type, status, info, sku_id) => {
    if (type === 2 && !this.checkSelectSku()) {
      return Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行定价公式设置'),
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

  renderExpandedRowRender = (index) => {
    const { reference_price_type } = this.props.merchandiseCommon
    const { list, isShowUnActive } = this.props.merchandiseList
    const skus = getSkus(list[index].skus, isShowUnActive)
    const spuImage = list[index].image

    const p_editSku = !!globalStore.hasPermission('edit_sku')
    const canDeleteSku = globalStore.hasPermission('delete_sale_sku')
    const p_edit_sku_formula = globalStore.hasPermission('edit_sku_formula')

    const theadTrStyle = {}
    if (skus.length === 0) {
      theadTrStyle.borderBottomColor = '#409d39'
    }

    let referencePriceName = ''
    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === reference_price_type) {
        referencePriceName = item.name
        referencePriceFlag = item.flag

        return true
      }
    })

    return (
      <Sheet list={skus}>
        <SheetColumn name={i18next.t('商品图片')} field='image'>
          {(image) => {
            const imgSrc = image || spuImage || productDefaultImg
            return this.renderImage(imgSrc)
          }}
        </SheetColumn>
        <SheetColumn name={i18next.t('规格名')} field='sku_id'>
          {(sku_id, index) => {
            return (
              <Flex>
                <Flex column>
                  <Modify
                    value={skus[index].sku_name}
                    onChange={this.handleChangeSkuName.bind(this, sku_id)}
                    disabled={!p_editSku}
                  >
                    {skus[index].sku_name}
                  </Modify>
                  <FloatTip
                    skuId={sku_id}
                    tip={skus[index].outer_id}
                    showCustomer={this.props.global.show_sku_outer_id}
                  />
                </Flex>
                {skus[index].salemenu_type === 4 && (
                  <div
                    className='label label-primary gm-margin-left-5'
                    style={{
                      alignSelf: 'flex-start',
                    }}
                  >
                    {i18next.t('自售')}
                  </div>
                )}
              </Flex>
            )
          }}
        </SheetColumn>
        <SheetColumn name={i18next.t('所在报价单')} field='salemenu_name' />
        <SheetColumn name={i18next.t('销售状态')} field='state'>
          {(state, index) => {
            return (
              <Switch
                type='primary'
                checked={!!state}
                on={i18next.t('上架')}
                off={i18next.t('下架')}
                disabled={!p_editSku}
                onChange={this.handleChangeState.bind(this, skus[index].sku_id)}
              />
            )
          }}
        </SheetColumn>
        <SheetColumn name={i18next.t('单价')} field='std_sale_price_forsale'>
          {(std_sale_price_forsale, index) => {
            const price = Big(std_sale_price_forsale || 0)
              .div(100)
              .toFixed(2)
            return skus[index].is_price_timing ? (
              i18next.t('时价')
            ) : (
              <Modify
                value={price}
                onChange={this.handleChangePrice.bind(
                  this,
                  skus[index].sku_id,
                  'std_sale_price_forsale',
                  i18next.t('单价'),
                )}
                disabled={!p_editSku}
              >
                {globalStore.otherInfo.showSuggestPrice ? (
                  <WarningPrice
                    over_suggest_price={skus[index].over_suggest_price}
                    price={price}
                    suggest_price_max={skus[index].suggest_price_max}
                    suggest_price_min={skus[index].suggest_price_min}
                    std_unit_name_forsale={skus[index].std_unit_name_forsale}
                    fee_type={skus[index].fee_type}
                  />
                ) : (
                  price +
                  Price.getUnit(skus[index].fee_type) +
                  '/' +
                  skus[index].std_unit_name_forsale
                )}
              </Modify>
            )
          }}
        </SheetColumn>
        <SheetColumn name={i18next.t('规格')} field='sale_ratio'>
          {(sale_ratio, index) => {
            return (
              sale_ratio +
              skus[index].std_unit_name_forsale +
              '/' +
              skus[index].sale_unit_name
            )
          }}
        </SheetColumn>
        <SheetColumn name={i18next.t('销售价')} field='sale_price'>
          {(sale_price, index) => {
            return skus[index].is_price_timing ? (
              i18next.t('时价')
            ) : (
              <Modify
                value={Big(sale_price || 0)
                  .div(100)
                  .toFixed(2)}
                onChange={this.handleChangePrice.bind(
                  this,
                  skus[index].sku_id,
                  'sale_price',
                  i18next.t('销售价'),
                )}
                disabled={!p_editSku}
              >
                {Big(sale_price || 0)
                  .div(100)
                  .toFixed(2)}
                {Price.getUnit(skus[index].fee_type) + '/'}
                {skus[index].sale_unit_name}
              </Modify>
            )
          }}
        </SheetColumn>
        {!window.g_clean_food && (
          <SheetColumn
            name={<RefPriceToolTip name={referencePriceName} />}
            field='sku_id'
          >
            {(value, index) => {
              const val = skus[index][referencePriceFlag]
              let isSupplierPrice = false
              if (
                referencePriceFlag === 'last_quote_price' &&
                skus[index].quoted_from_supplier
              ) {
                isSupplierPrice = true
              } else if (
                referencePriceFlag === 'latest_quote_price' &&
                skus[index].latest_quote_from_supplier
              ) {
                isSupplierPrice = true
              }

              return val === 0 ? (
                0 +
                  Price.getUnit(skus[index].fee_type) +
                  '/' +
                  skus[index].std_unit_name_forsale
              ) : val ? (
                <Flex alignCenter>
                  <span>
                    {Big(val).div(100).toFixed(2) +
                      Price.getUnit(skus[index].fee_type) +
                      '/' +
                      skus[index].std_unit_name_forsale}
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
            }}
          </SheetColumn>
        )}
        <SheetColumn
          name={
            <Flex>
              {i18next.t('定价公式')}
              <Popover
                showArrow
                component={<div />}
                type='hover'
                popup={
                  <div
                    className='gm-border gm-padding-5 gm-bg'
                    style={{ width: '150px' }}
                  >
                    {i18next.t(
                      '定价公式开启后，可用此预设公式快速对商品进行智能定价',
                    )}
                  </div>
                }
              >
                <i className='xfont xfont-warning-circle' />
              </Popover>
            </Flex>
          }
          field='formula_status'
        >
          {(formula_status, index) => {
            const { formula_info, sku_id } = skus[index]
            return (
              <div
                className={classNames({ 'gm-cursor': p_edit_sku_formula })}
                style={{ minWidth: '80px' }}
                onClick={
                  p_edit_sku_formula
                    ? this.handleEditFormula.bind(
                        this,
                        1,
                        formula_status,
                        formula_info,
                        sku_id,
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
                        formula_info.cal_num,
                      )}
                </div>
                {p_edit_sku_formula && (
                  <i className='xfont xfont-pencil text-primary' />
                )}
              </div>
            )
          }}
        </SheetColumn>
        <SheetColumn name={i18next.t('库存')} field='stock_type'>
          {(stock_type) => {
            return stockState(stock_type)
          }}
        </SheetColumn>
        <SheetAction>
          {(sku) => {
            return (
              <div>
                <a
                  onClick={this.handleSkuDetail.bind(
                    this,
                    list[index].spu_id,
                    sku.sku_id,
                  )}
                >
                  <i className='xfont xfont-detail' />
                </a>
                {canDeleteSku && (
                  <a
                    className='gm-margin-left-5'
                    onClick={this.handleSkuDelete.bind(this, sku)}
                  >
                    <i className='xfont xfont-delete gm-cursor' />
                  </a>
                )}
              </div>
            )
          }}
        </SheetAction>
        <SheetSelect
          onSelect={this.handleSelectSku.bind(this, index)}
          onSelectAll={this.handleSelectAllSku.bind(this, index)}
        />
      </Sheet>
    )
  }

  handleExpand = (index) => {
    actions.merchandise_list_open_toggle(index)
  }

  handleExpandAll = () => {
    actions.merchandise_list_open_all_toggle()
  }

  handleToPage = (pagination) => {
    actions.merchandise_list_search(pagination)
  }

  handleDetail(spu_id, e) {
    e.preventDefault()
    window.open('#/merchandise/manage/list/detail?spu_id=' + spu_id)
  }

  renderPopup(skus) {
    return (
      <div className='gm-padding-5'>
        {_.map(
          _.uniqBy(skus, (v) => v.salemenu_id),
          (v, i) => (
            <div
              key={i}
              className={classNames({
                'gm-text-desc': !v.salemenu_is_active,
              })}
            >
              {i + 1}. {v.salemenu_name}
            </div>
          ),
        )}
      </div>
    )
  }

  handleSelect = (checked = false, index = -1) => {
    actions.merchandise_list_spu_select(checked, index)
  }

  handleSelectAll = (checked = false) => {
    actions.merchandise_list_spu_select_all(checked)
  }

  handleChangeSelectAllType = () => {
    const { selectAllType } = this.props.merchandiseList
    actions.merchandise_list_select_all_type(selectAllType === 1 ? 2 : 1)
  }

  checkSelectSku = () => {
    // 如果是全选所有页，交给后台校验
    const { list, selectAllType } = this.props.merchandiseList
    let isSelect = false
    if (selectAllType === 2) {
      isSelect = true
    } else {
      _.find(list, (l) => {
        if (_.find(l.skus, (v) => v._gm_select)) return (isSelect = true)
      })
    }

    return isSelect
  }

  checkSelectSpu = () => {
    const { list, selectAllType } = this.props.merchandiseList
    let isSelect = false

    if (selectAllType === 2) {
      // 全选所有页
      isSelect = true
    } else {
      _.find(list, (l) => {
        if (l._gm_select) return (isSelect = true)
      })
    }

    return isSelect
  }

  handleEditSmartPrice = () => {
    if (!this.checkSelectSku()) {
      return Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行定价设置'),
      )
    }

    this.props.onEditSmartPrice()
  }

  handleBatchUpdate = () => {
    if (!this.checkSelectSku()) {
      return Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行修改操作'),
      )
    }

    history.push('/merchandise/manage/list/batch_update')
  }

  handleImportBatchUpdate = () => {
    this.refImportInput.click()
  }

  handleUploadExcel = (e) => {
    const { target } = e
    const file = target.files[0]

    window.document.body.click()
    Dialog.dialog({
      title: i18next.t('提示'),
      children: (
        <div>
          <div>{i18next.t('是否确定上传') + file.name}</div>
          <span className='gm-text-12 gm-text-red'>
            {i18next.t(
              '提示：数据量过多会造成导入异常，建议每次最多导入1000条',
            )}
          </span>
        </div>
      ),
      onOK: () => {
        actions.merchandise_batch_update_import(file).then((json) => {
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
                      },
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
            actions.merchandise_list_search()
            Tip.success(i18next.t('导入成功！'))
          }
        })
        target.value = ''
      },
    })
  }

  handleErrorModal = () => {
    Modal.hide()
    actions.merchandise_list_search()
  }

  handleSpuDelete = (spu) => {
    const { pagination } = this.props.merchandiseList
    Dialog.dialog({
      title: i18next.t('删除商品'),
      children: i18next.t(
        '删除该商品，该商品下的所有销售规格和采购规格将同时被删除!',
      ),
      onOK: () => {
        deleteSpu(spu.spu_id).then(() => {
          actions.merchandise_list_search(pagination)
          Tip.success(i18next.t('删除成功'))
        })
      },
    })
  }

  handleSkuDelete = (sku) => {
    const skuId = sku.sku_id
    Dialog.confirm({
      children: i18next.t('是否确定要删除该商品规格?'),
      onOK: () => {
        deleteSku(skuId).then(() => {
          actions.merchandise_list_search()
          Tip.success(i18next.t('删除成功'))
        })
      },
    })
  }

  handleSkuBatchDelete = () => {
    if (!this.checkSelectSku()) {
      return Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行删除操作'),
      )
    }

    Dialog.confirm({
      children: i18next.t('确定要删除所选规格吗?'),
      title: i18next.t('批量删除商品规格'),
      onOK: () => {
        actions.merchandise_list_sku_batch_delete().then(() => {
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

  handleSpuBatchDelete = () => {
    const {
      list,
      selectAllType,
      isSelectAll,
      pagination,
    } = this.props.merchandiseList
    let spuSelectedNum = 0

    if (!this.checkSelectSpu()) {
      return Tip.warning(
        i18next.t('无可用商品，请至少选择一个商品进行删除操作'),
      )
    }

    if (selectAllType === 1 || !isSelectAll) {
      // 全选当前页或个别商品
      _.forEach(list, (v) => {
        if (v._gm_select) spuSelectedNum++
      })
    } else if (isSelectAll && selectAllType === 2) {
      // 全选所有页
      spuSelectedNum = pagination.count
    }

    Dialog.confirm({
      children: (
        <div>
          <span>
            {i18next.t('已选择')} {spuSelectedNum}{' '}
            {i18next.t('个商品，确定要删除所选商品吗')}
          </span>
          <br />
          <span style={{ color: '#F00000' }}>
            {i18next.t(
              '1.删除所选商品且删除所选商品下的所有销售规格和采购规格',
            )}
          </span>
          <br />
          <span style={{ color: '#F00000' }}>
            {i18next.t('2.删除后商品相关数据将无法恢复，请谨慎操作')}
          </span>
        </div>
      ),
      title: i18next.t('批量删除商品'),
      onOK: () => {
        actions.merchandise_list_spu_batch_delete().then((json) => {
          if (json.data.async === 1) {
            RightSideModal.render({
              children: <TaskList tabKey={1} />,
              onHide: RightSideModal.hide,
              style: {
                width: '300px',
              },
            })
          }
        })
      },
    })
  }

  renderImage(imageSrc) {
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
  }

  handleImportSpuBatch = () => {
    Modal.render({
      title: i18next.t('批量新建商品'),
      children: <ImportModal onOk={this.handleImportModalOk} />,
      size: 'md',
      onHide: Modal.hide,
    })
  }

  handleImportModalOk = (value) => {
    const { excel } = value
    requireGmXlsx((result) => {
      const { sheetToJson } = result
      sheetToJson(excel).then(async ([file]) => {
        const [content] = Object.values(file)
        if (!content.length) {
          Tip.warning(i18next.t('请导入正确格式的excel'))
          return
        }
        let [title] = content
        if (title.length < 7) {
          const fill = new Array(7 - title.length)
          title = [...title, ...fill]
        }
        let stop = false
        _.forEach(title.slice(0, 7), (item, index) => {
          const enumeration = {
            0: i18next.t('一级分类名称'),
            1: i18next.t('二级分类名称'),
            2: i18next.t('SPU名称'),
            3: i18next.t('单位'),
            4: i18next.t('描述'),
            5: i18next.t('自定义编码'),
            6: i18next.t('图片'),
          }
          const target = enumeration[index]
          const error = this.checkExcelTitleFormat(item, target, index)
          if (error) {
            Tip.warning(error)
            stop = true
          }
        })
        if (stop) {
          return
        }
        try {
          await Request('/task/list')
            .get()
            .then(({ data }) => {
              const { finish, tasks } = data
              if (!finish && tasks.some((i) => i.type === 15)) {
                throw new Error(i18next.t('已有同类任务在进行，请勿重复上传'))
              }
            })
          Request('/merchandise/batch_create/import', { timeout: 1200000 })
            .data(value)
            .post()
            .then(() => {
              RightSideModal.render({
                children: <TaskList tabKey={1} />,
                noCloseBtn: true,
                onHide: RightSideModal.hide,
                opacityMask: true,
                style: {
                  width: '300px',
                },
              })
            })
        } catch (error) {
          Tip.warning(i18next.t('已有同类任务在进行，请勿重复上传'))
        }
      })
    })
  }

  checkExcelTitleFormat(title, target, index) {
    let string
    if (title !== target) {
      string = `${i18next.t('表头第')}${index + 1}${i18next.t(
        '个应该为',
      )}${target}`
    }
    return string
  }

  render() {
    const { reference_price_type } = this.props.merchandiseCommon
    const {
      list,
      pagination,
      isShowUnActive,
      selectAllType,
    } = this.props.merchandiseList
    const { noGroupSpu } = this.state

    // 净菜站点屏蔽智能定价
    const canEditSmartPrice = globalStore.hasPermission('edit_smart_pricing')
    const canBatchUpdate = globalStore.hasPermission('edit_product_sku_batch')
    const canImportBatchUpdate = globalStore.hasPermission(
      'edit_product_sku_batch_import',
    )

    const addSpuBatch = globalStore.hasPermission('add_spu')

    // 通用 spu 权限
    const canDeletePublicSpu = globalStore.hasPermission('delete_public_spu')
    // 本站 spu 权限
    const canDeletePrivateSpu = globalStore.hasPermission('delete_private_spu')
    const canImportSpuByTemplate = globalStore.hasPermission(
      'import_spu_by_template',
    )
    const batchCreateSpu = globalStore.hasPermission('batch_create_spu')
    const p_edit_batch_sku_formula = globalStore.hasPermission(
      'edit_batch_sku_formula',
    )
    const p_delete_sku_batch =
      globalStore.hasPermission('delete_sku_batch') &&
      !globalStore.isCleanFood() // 净菜站点暂时屏蔽
    const p_delete_spu_batch =
      globalStore.hasPermission('delete_spu_batch') &&
      !globalStore.isCleanFood() // 净菜站点暂时屏蔽
    const canViewMenu = globalStore.hasPermission('get_smart_menu')

    return (
      <QuickPanel
        icon='bill'
        title={i18next.t(
          /* src:`商品总数：${pagination.count || 0}` => tpl:商品总数：${VAR1} */ 'KEY65',
          { VAR1: pagination.count || 0 },
        )}
        right={
          <div>
            {canViewMenu && (
              <Button
                type='primary'
                plain
                className='gm-margin-right-5'
                onClick={() => {
                  window.location.href = '#/merchandise/manage/list/smart_menu'
                }}
              >
                {i18next.t('智能菜单')}
              </Button>
            )}
            {canImportSpuByTemplate && (
              <DropDown
                split
                cartClassName='gm-btn-primary gm-btn-plain'
                className='gm-margin-right-5'
                popup={
                  addSpuBatch && (
                    <DropDownItems>
                      {batchCreateSpu && (
                        <DropDownItem onClick={this.handleImportSpuBatch}>
                          {i18next.t('批量新建商品(导入)')}
                        </DropDownItem>
                      )}
                    </DropDownItems>
                  )
                }
              >
                <Button
                  type='primary'
                  plain
                  onClick={() => {
                    window.location.href =
                      '#/merchandise/manage/list/template_import'
                  }}
                >
                  {i18next.t('云商品导入')}
                </Button>
              </DropDown>
            )}
            {canBatchUpdate && (
              <DropDown
                split
                cartClassName='gm-btn-primary gm-btn-plain'
                className='gm-margin-right-5'
                popup={
                  canImportBatchUpdate && (
                    <DropDownItems>
                      <DropDownItem onClick={this.handleImportBatchUpdate}>
                        {i18next.t('批量修改商品(导入)')}
                        <input
                          accept='.xlsx'
                          type='file'
                          ref={(ref) => {
                            this.refImportInput = ref
                          }}
                          onChange={this.handleUploadExcel}
                          style={{ display: 'none' }}
                        />
                      </DropDownItem>
                      {p_edit_batch_sku_formula && (
                        <DropDownItem
                          onClick={this.handleEditFormula.bind(
                            this,
                            2,
                            0,
                            null,
                            null,
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
                      {p_delete_spu_batch && (
                        <DropDownItem onClick={this.handleSpuBatchDelete}>
                          {i18next.t('批量删除商品')}
                        </DropDownItem>
                      )}
                    </DropDownItems>
                  )
                }
              >
                <Button type='primary' plain onClick={this.handleBatchUpdate}>
                  {i18next.t('批量修改销售商品')}
                </Button>
              </DropDown>
            )}
            {!globalStore.otherInfo.cleanFood && canEditSmartPrice && (
              <Button
                type='primary'
                plain
                className='gm-margin-right-5'
                onClick={this.handleEditSmartPrice}
              >
                {i18next.t('智能定价')}
              </Button>
            )}

            <DropDown
              className='gm-margin-right-5'
              popup={
                <DropDownItems className='b-sale-reference-price'>
                  {_.map(saleReferencePrice, (item, i) => (
                    <DropDownItem
                      key={i}
                      active={item.type === reference_price_type}
                      onClick={this.handleChangeReferencePrice.bind(
                        this,
                        item.type,
                      )}
                    >
                      {item.name}
                    </DropDownItem>
                  ))}
                </DropDownItems>
              }
            >
              <Button type='primary' plain>
                {i18next.t('参考成本来源')} <span className='caret' />
              </Button>
            </DropDown>

            <Button
              type='primary'
              plain
              className='gm-margin-right-5'
              onClick={() => {
                window.open('#/merchandise/manage/category_management')
              }}
            >
              {i18next.t('分类管理')}
              <i className='glyphicon glyphicon-th-list' />
            </Button>
            <Button type='primary' plain onClick={this.props.onCreate}>
              {i18next.t('新建销售商品')}
              <i className='glyphicon glyphicon-plus' />
            </Button>
          </div>
        }
      >
        {noGroupSpu ? (
          <div className='gm-margin-15'>
            {i18next.t('没有商品，请点上面的')}
            <span
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={this.props.onCreate}
            >
              {i18next.t('新建商品')}
            </span>{' '}
            {i18next.t('按钮')}
          </div>
        ) : (
          <Sheet
            list={list}
            scrollX
            expandedRowRender={this.renderExpandedRowRender}
            onExpand={this.handleExpand}
            onExpandAll={this.handleExpandAll}
          >
            <SheetColumn name={i18next.t('商品图片')} field='image'>
              {(image) => {
                const imgSrc = image || productDefaultImg
                return this.renderImage(imgSrc)
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('商品')} field='spu_id'>
              {(spu_id, index) => {
                return (
                  <div>
                    <span>
                      {list[index].spu_name}
                      <br />
                      {spu_id}
                    </span>
                    {list[index].p_type === 1 && (
                      <div
                        className='label label-primary gm-margin-left-5'
                        style={{
                          alignSelf: 'flex-start',
                        }}
                      >
                        {i18next.t('本站')}
                      </div>
                    )}
                  </div>
                )
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('分类')} field='category_name_1'>
              {(category_name_1, index) => {
                return (
                  category_name_1 +
                  '/' +
                  list[index].category_name_2 +
                  '/' +
                  list[index].pinlei_name
                )
              }}
            </SheetColumn>
            <SheetColumn
              name={
                <span>
                  {i18next.t('销售规格数')}
                  <br />
                  {i18next.t('(上架/全部)')}
                </span>
              }
              field='spu_id'
            >
              {(value, index) => {
                const skus = getSkus(list[index].skus, isShowUnActive)
                return (
                  _.filter(skus, (v) => v.state === 1).length +
                  '/' +
                  skus.length
                )
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('所在报价单数')} field='spu_id'>
              {(value, index) => {
                const skus = getSkus(list[index].skus, isShowUnActive)

                return (
                  <Popover
                    showArrow
                    component={<div />}
                    type='hover'
                    popup={this.renderPopup(skus)}
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
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('基本单位')} field='std_unit_name' />
            <SheetColumn name={i18next.t('销售价')} field='spu_id'>
              {(value, index) => {
                const skus = getSkus(list[index].skus, isShowUnActive)
                const ranges = getSkuPriceRange(skus)
                const showDetails = ranges.length > 1
                return _.map(ranges, (item) => {
                  const fee = _.find(
                    FEE_LIST,
                    (v) => v.value === item.fee_type,
                  ) || { name: i18next.t('未知') }
                  return (
                    <div>
                      {showDetails ? `${fee.name}: ` : ''}
                      {`${item.min}~${item.max}${Price.getUnit(item.fee_type)}`}
                    </div>
                  )
                })
              }}
            </SheetColumn>
            <SheetColumn name={i18next.t('投框方式')} field='dispatch_method'>
              {(dispatch_method) => {
                return ENUMFilter.dispatchMethod(dispatch_method)
              }}
            </SheetColumn>
            <SheetAction>
              {(spu) => {
                const { p_type } = spu
                const showDeleteSpu =
                  (p_type === 0 && canDeletePublicSpu) ||
                  (p_type === 1 && canDeletePrivateSpu)

                return (
                  <div>
                    <a onClick={this.handleDetail.bind(this, spu.spu_id)}>
                      <i className='xfont xfont-detail' />
                    </a>
                    {showDeleteSpu && (
                      <a
                        className='gm-margin-left-5'
                        onClick={this.handleSpuDelete.bind(this, spu)}
                      >
                        <i className='xfont xfont-delete gm-cursor' />
                      </a>
                    )}
                  </div>
                )
              }}
            </SheetAction>
            <SheetSelect
              onSelect={this.handleSelect}
              onSelectAll={this.handleSelectAll}
              hasSelectTip
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
            />
            {!noGroupSpu && (
              <div className='text-center'>
                <Pagination data={pagination} toPage={this.handleToPage} />
              </div>
            )}
          </Sheet>
        )}
      </QuickPanel>
    )
  }
}

SpuSheet.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onEditSmartPrice: PropTypes.func.isRequired,
  merchandiseList: PropTypes.object,
  merchandiseCommon: PropTypes.object,
}

export default SpuSheet
