import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import Big from 'big.js'
import PropTypes from 'prop-types'
import {
  Flex,
  Pagination,
  Box,
  BoxTable,
  MultipleFilterSelect,
  Form,
  FormItem,
  FormButton,
  Modal,
  Tip,
  Popover,
  Price,
  RightSideModal,
  Button,
  InputNumberV2,
  LevelSelect,
  Select,
  Option,
} from '@gmfe/react'
import { Table, TableUtil, selectTableV2HOC } from '@gmfe/table'
import QuotationModal from '../quotation_modal/index'
import PurchaseSpecificationAdd from './add'
import '../actions'
import '../reducer'
import actions from '../../../actions'
import { pinYinFilter, is } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { isPrice, TransformCategoty1Group } from '../../../common/util'
import { renderPurchaseSpec } from '../../../common/filter'
import styles from '../style.module.less'
import { purchaseProgressUnit } from '../../../common/enum'
import classNames from 'classnames'
import importModal from '../import_quotation/import_quotation_modal'
import PurchasingSpecAnalysis from '../purchasing_spec_analysis/index'
import PurchaseSpecificationAction from './action'
import globalStore from '../../../stores/global'
import TaskList, { showTaskPanel } from '../../../task/task_list'
import PurchaseSpecBtachModifyModal from '../spec_batch_modify'
import BatchDefaultShelfModal from './batch_default_shelf_modal'
import InitPurchaseSpec from '../../../guides/init/guide/init_purchase_spec'

const isNotSet = (data) => data === null || data === undefined || data === ''
const renderQuotation = (data, quotationUnit) => {
  const { purchase_price = '-', std_unit, price = '-', purchase_unit } = data

  const currency = Price.getUnit()
  switch (quotationUnit.id) {
    case 0: // 最近询价(基本单位)
      return price !== '-'
        ? `${Big(price || 0)
            .div(100)
            .toFixed(2)}${currency}/${std_unit}`
        : '-'
    case 1: // 最近询价(采购单位)
      return purchase_price !== '-'
        ? `${Big(purchase_price || 0)
            .div(100)
            .toFixed(2)}${currency}/${purchase_unit}`
        : '-'
  }
}

const editColumns = [
  'name',
  'barcode',
  'max_stock_unit_price',
  'ratio',
  'description',
  'shelf_selected',
]

const SelectTable = selectTableV2HOC(Table)

class PurchaseSpecificationList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectValue: 0,
      search_text: '',
      category1List: [],
      category2List: [],
      pinleiList: [],
      category1Selected: [],
      category2Selected: [],
      pinleiSelected: [],
      pagination: {
        offset: 0,
        limit: 10,
      },
      editInfo: {
        isEditing: [],
        name: [],
        ratio: [],
        barcode: [],
        unit_name: [],
        max_stock_unit_price: [],
        description: [],
        shelf_selected: [],
      },
      focusFlag: {
        ratio: false,
        unit_name: false,
      },
      quotationUnit: purchaseProgressUnit[0],
    }
  }

  init = async () => {
    actions.supplier_get_category1().then((data) => {
      this.setState({ category1List: data })
    })
    actions.supplier_get_category2().then((data) => {
      this.setState({ category2List: data })
    })
    actions.supplier_get_pinlei().then((data) => {
      this.setState({ pinleiList: data })
    })

    // 获取货位信息
    if (globalStore.hasPermission('get_shelf')) {
      await actions.purchase_shelf_list()
    }

    this.handleSearchBase({ offset: 0, limit: 10 })
  }

  componentDidMount() {
    this.init()
  }

  handleChangeValue = (e) => {
    this.setState({ search_text: e.target.value })
  }

  handleSearchBase = (params) => {
    // 清空表格选择
    actions.purchase_table_select([])
    return actions
      .supplier_get_purchase_specification_list(params)
      .then((json) => {
        this.handleClear()
        return json
      })
  }

  handleSearch = () => {
    this.handleSearchBase(
      Object.assign(this.checkData(), {
        offset: 0,
        limit: 10,
      }),
    ).then(() => {
      this.setState({ pagination: { offset: 0, limit: 10 } })
    })
  }

  handleExport = () => {
    return actions
      .supplier_export_purchase_specification_list(this.checkData())
      .then(showTaskPanel)
  }

  checkData() {
    const {
      category1Selected,
      category2Selected,
      pinleiSelected,
      search_text,
      selectValue,
    } = this.state

    const req = {}
    if (category1Selected.length > 0) {
      req.category_id_1 = JSON.stringify(
        _.map(category1Selected, (category1) => category1.value),
      )
    }

    if (category2Selected.length > 0) {
      req.category_id_2 = JSON.stringify(
        _.map(category2Selected, (category2) => category2.value),
      )
    }

    if (pinleiSelected.length > 0) {
      req.pinlei_id = JSON.stringify(
        _.map(pinleiSelected, (pinlei) => pinlei.value),
      )
    }

    if (search_text) {
      req.search_text = search_text
    }

    if (selectValue) {
      req.p_type = selectValue - 1
    }
    return req
  }

  handleGetImportTemplate = (data) => {
    // 查询采购规格列表,不分页,返回所有数据, 带上选择的供应商信息
    const req = {
      ...this.checkData(),
      ...data,
      export: 1,
    }
    return actions.get_import_template(req)
  }

  handleOpenImportModal = () => {
    importModal(this.handleGetImportTemplate)
  }

  handleCreatePurchaseSpecification = () => {
    Modal.render({
      title: i18next.t('增加采购规格'),
      style: { width: '700px' },
      onHide: Modal.hide,
      children: (
        <PurchaseSpecificationAdd
          onCreateSuccessed={this.handleCreateSuccessed}
          onCancel={this.handleModalHide}
        />
      ),
    })
  }

  handleModalHide = () => {
    Modal.hide()
  }

  onHandlePageChange = (page) => {
    this.handleSearchBase(Object.assign(this.checkData(), page)).then(() => {
      this.setState({ pagination: page })
    })
  }

  onHandleFilter = (list, query) => {
    // 判断list是否是group
    if (_.has(_.head(list), 'label')) {
      list = _.flattenDeep(_.map(list, (v) => v.children || v))
    }
    return pinYinFilter(list, query, (value) => value.name)
  }

  handleSelect(value, selected) {
    this.setState({ [value]: selected })
    // 一级分类全部删除时 二三级分类置空
    if (this.state.category1Selected.length === 1 && selected.length === 0) {
      this.setState({ category2Selected: [] })
      this.setState({ pinleiSelected: [] })
    }
    // 二级分类全部删除时 三级分类置空
    if (this.state.category2Selected.length === 1 && selected.length === 0) {
      this.setState({ pinleiSelected: [] })
    }
  }

  handleDelete = (data) => {
    const { id } = data
    const { pagination } = this.state
    return Request('/purchase_spec/delete')
      .data({ id })
      .code([0, 771])
      .post()
      .then((json) => {
        // 771为删除后台报错，需要持久显示
        if (json.code === 771) {
          Tip.warning({
            children: json.msg,
            time: 0,
          })
          return null
        }
        this.handleSearchBase(Object.assign(this.checkData(), pagination))
        Tip.success(i18next.t('删除成功'))
      })
  }

  handleSearchInCurrentPage = () => {
    const req = Object.assign(this.checkData(), this.state.pagination)
    this.handleSearchBase(req)
  }

  handleQuotationModal = (purchase_spec) => {
    QuotationModal(purchase_spec, this.handleSearchInCurrentPage)
  }

  handleClear = () => {
    this.setState({
      editInfo: {
        isEditing: [],
        name: [],
        ratio: [],
        barcode: [],
        unit_name: [],
        max_stock_unit_price: [],
        description: [],
        shelf_selected: [],
      },
    })
  }

  // 初始化编辑数据
  editDataInit = (index, info) => {
    const { purchaseSpecList } = this.props.supplier
    const item = purchaseSpecList[index]
    _.forEach(editColumns, (column) => {
      info[column][index] = item[column]
    })
    info.unit_name[index] = item.purchase_unit
  }

  handleChangeEditValue = (field, index, e) => {
    const value = e && e.target ? e.target.value : e
    const editInfo = Object.assign({}, this.state.editInfo)
    editInfo[field][index] = value

    if (field === 'isEditing' && value) {
      this.editDataInit(index, editInfo)
    }

    this.setState({ editInfo })
  }

  // 选择货位
  handleChangeShelfSelected = (index, selected) => {
    const editInfo = Object.assign({}, this.state.editInfo)
    editInfo.shelf_selected[index] = selected
    this.setState({
      editInfo: editInfo,
    })
  }

  saveChange(req) {
    return actions.supplier_purchase_specification_update(req).then(() => {
      Tip.success(i18next.t('修改成功'))
      const { offset, limit } = this.state.pagination
      return this.handleSearchBase(
        Object.assign(this.checkData(), { offset, limit }),
      )
    })
  }

  handleCreateSuccessed = () => {
    Modal.hide()
    this.handleSearchBase(
      Object.assign(this.checkData(), {
        offset: 0,
        limit: 10,
      }),
    ).then(() => {
      this.setState({ pagination: { offset: 0, limit: 10 } })
    })
  }

  handleQuotationUnitChange(item) {
    this.setState({
      quotationUnit: item,
    })
  }

  handlePrint = (item) => {
    if (item.barcode) {
      window.open(
        `#/sales_invoicing/base/supplier/purchase_specification_print?id=${item.id}`,
      )
    }
  }

  getParams(editInfo, index) {
    const { purchaseSpecList } = this.props.supplier
    const item = purchaseSpecList[index]

    const shelf_selected = editInfo.shelf_selected[index]
    const params = {
      name: editInfo.name[index],
      barcode: editInfo.barcode[index],
      ratio: editInfo.ratio[index],
      unit_name: editInfo.unit_name[index],
      max_stock_unit_price: editInfo.max_stock_unit_price[index] || null,
      description: editInfo.description[index] || null,
      default_shelf_id: shelf_selected[shelf_selected.length - 1] || 0, // 传0为取消默认货位
    }
    if (!_.trim(params.name)) {
      return Promise.reject(new Error(i18next.t('请输入正确的规格名称')))
    }

    if (!_.trim(params.unit_name) || !params.ratio || !isPrice(params.ratio)) {
      return Promise.reject(new Error(i18next.t('请输入正确的规格格式')))
    }

    if (
      params.ratio === item.ratio &&
      params.unit_name === item.purchase_unit
    ) {
      delete params.ratio
      delete params.unit_name
    }

    return Promise.resolve(params)
  }

  handleSave = async (id, index) => {
    const { editInfo } = this.state
    const params = await this.getParams(editInfo, index).catch((err) => {
      Tip.warning(err.message)
      return Promise.reject(err)
    })
    this.saveChange({
      id,
      ...params,
    })
  }

  handleBatchModifyPurchaseSpec = () => {
    Modal.render({
      title: i18next.t('批量修改采购规格'),
      style: { width: '700px' },
      onHide: Modal.hide,
      children: (
        <PurchaseSpecBtachModifyModal onExportTemp={this.handleExport} />
      ),
    })
  }

  // 确认设置默认货位
  handleEnsureSetDefaultShelf = (shelf_selected) => {
    const reqData = {}
    if (this.props.supplier.isSelectAllPage) {
      Object.assign(reqData, { ...this.checkData() })
    } else {
      reqData.ids = JSON.stringify(this.props.supplier.tableSelected)
    }
    // 0就是不设置货位
    reqData.default_shelf_id = shelf_selected[shelf_selected.length - 1] || 0

    actions.purchase_set_batch_default_shelf(reqData).then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })

      const { offset, limit } = this.state.pagination
      return this.handleSearchBase(
        Object.assign(this.checkData(), { offset, limit }),
      )
    })
    this.handleModalHide()
  }

  handleModalHide = () => {
    Modal.hide()
  }

  // 批量设置默认货位
  handleBatchSetDefaultShelf = () => {
    Modal.render({
      children: (
        <BatchDefaultShelfModal
          onEnsure={this.handleEnsureSetDefaultShelf}
          onCancel={this.handleModalHide}
        />
      ),
      title: `${i18next.t('提示')}`,
      onHide: Modal.hide,
      size: 'sm',
    })
  }

  // 表格选择
  handleSelectTable = (selected) => {
    actions.purchase_table_select(selected)
    if (selected.length < this.props.supplier.purchaseSpecList.length) {
      actions.purchase_table_all_page_select(false)
    }
  }

  // 全选表格
  handleSelectTableAll = (isSelectTableAll) => {
    actions.purchase_table_all_select(isSelectTableAll)
  }

  // 全选所有页
  onSelectAllPage = (isSelectAllPage) => {
    actions.purchase_table_all_page_select(isSelectAllPage)
    // 若选择了全部页，则将全部当前页数据都selected
    if (isSelectAllPage) {
      actions.purchase_table_all_select(true)
    }
  }

  renderQuickPanelRight = () => {
    return (
      <div>
        {globalStore.hasPermission('add_pur_spec') && (
          <Button
            type='primary'
            onClick={this.handleCreatePurchaseSpecification}
            className='gm-margin-right-10'
            data-id='initPurchaseSpec'
          >
            {i18next.t('新建规格')}
          </Button>
        )}
        {globalStore.hasPermission('import_quote_price') && (
          <Button
            type='primary'
            plain
            onClick={this.handleOpenImportModal}
            className='gm-margin-right-10'
          >
            {i18next.t('导入询价')}
          </Button>
        )}
        {globalStore.hasPermission('edit_pur_spec_batch') && (
          <Button
            type='primary'
            plain
            className='gm-margin-right-5'
            onClick={this.handleBatchModifyPurchaseSpec}
          >
            {i18next.t('批量修改采购规格')}
          </Button>
        )}
      </div>
    )
  }

  // 采购规格数据分析
  handleToPurchasingSpecAnalysis = (purchaseSpec, quotationUnit) => {
    const recentInquiries =
      '（' +
      quotationUnit.name +
      '）：' +
      renderQuotation(purchaseSpec, quotationUnit)
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: (
        <PurchasingSpecAnalysis
          data={purchaseSpec}
          recentInquiries={recentInquiries}
        />
      ),
    })
  }

  // 商品类型下拉
  handleSelecType = (val) => {
    this.setState({
      selectValue: val,
    })
  }

  render() {
    const {
      purchaseSpecList,
      shelfList,
      tableSelected,
      isSelectAllPage,
    } = this.props.supplier
    const {
      search_text,
      category1List,
      category2List,
      pinleiList,
      pagination,
      category1Selected,
      category2Selected,
      pinleiSelected,
      editInfo,
      quotationUnit,
    } = this.state
    const canExport = globalStore.hasPermission('export_pur_spec')

    // 一级分类
    const c1List = _.map(category1List, (category1) => {
      return {
        value: category1.id,
        name: category1.name,
        station_id: category1.station_id,
      }
    })

    const c1Selected = _.filter(c1List, (c1) => {
      const selected = _.find(category1Selected, (s) => {
        return s.value === c1.value
      })
      return !_.isEmpty(selected)
    })

    // 二级分类
    const c1C2List = _.filter(category2List, (category2) => {
      const c2 = _.find(c1Selected, (s) => {
        return s.value === category2.upstream_id
      })

      return !_.isEmpty(c2)
    })

    const c2List = _.map(c1C2List, (category2) => {
      return { value: category2.id, name: category2.name }
    })
    const c2Selected = _.filter(c2List, (c2) => {
      const selected = _.find(category2Selected, (s) => {
        return s.value === c2.value
      })
      return !_.isEmpty(selected)
    })

    // 品类
    const c1C2PList = _.filter(pinleiList, (pinlei) => {
      const p = _.find(c2Selected, (s) => {
        return s.value === pinlei.upstream_id
      })

      return !_.isEmpty(p)
    })

    const pList = _.map(c1C2PList, (pinlei) => {
      return { value: pinlei.id, name: pinlei.name }
    })
    const pSelected = _.filter(pList, (p) => {
      const selected = _.find(pinleiSelected, (s) => {
        return s.value === p.value
      })
      return !_.isEmpty(selected)
    })

    return (
      <div>
        <Box hasGap>
          <Form onSubmit={this.handleSearch} inline>
            <FormItem
              className={styles.SelectMarginBottm}
              col={2}
              label={i18next.t('商品筛选')}
            >
              <Flex className='b-merchandise-common-filter'>
                <MultipleFilterSelect
                  id='_category1_'
                  list={TransformCategoty1Group(c1List)}
                  isGroupList
                  selected={c1Selected}
                  withFilter={this.onHandleFilter}
                  onSelect={this.handleSelect.bind(this, 'category1Selected')}
                  placeholder={i18next.t('全部一级分类')}
                />
                <MultipleFilterSelect
                  id='_category2_'
                  list={c2List}
                  selected={c2Selected}
                  withFilter={this.onHandleFilter}
                  onSelect={this.handleSelect.bind(this, 'category2Selected')}
                  placeholder={i18next.t('全部二级分类')}
                  className='gm-margin-left-10'
                />
                <MultipleFilterSelect
                  id='_pinlei_'
                  list={pList}
                  selected={pSelected}
                  withFilter={this.onHandleFilter}
                  onSelect={this.handleSelect.bind(this, 'pinleiSelected')}
                  placeholder={i18next.t('全部品类')}
                  className='gm-margin-left-10'
                />
              </Flex>
            </FormItem>

            <FormItem label={i18next.t('商品类型')} colWidth='150px'>
              <Select
                value={this.state.selectValue}
                onChange={this.handleSelecType}
              >
                <Option value={0}>{i18next.t('全部')}</Option>
                <Option value={1}>{i18next.t('通用')}</Option>
                <Option value={2}>{i18next.t('本站')}</Option>
              </Select>
            </FormItem>
            <FormItem label='搜索'>
              <input
                value={search_text}
                onChange={this.handleChangeValue}
                name='search_text'
                type='text'
                placeholder={i18next.t('输入采购规格ID、规格名、规格条码搜索')}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
              <span className='gm-gap-5' />
              {canExport && (
                <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
              )}
            </FormButton>
          </Form>
        </Box>
        <BoxTable action={this.renderQuickPanelRight()}>
          <SelectTable
            data={purchaseSpecList}
            keyField='id'
            selected={tableSelected}
            onSelect={this.handleSelectTable}
            onSelectAll={this.handleSelectTableAll}
            batchActionBar={
              tableSelected.length ? (
                <TableUtil.BatchActionBar
                  onClose={() => this.handleSelectTableAll(false)}
                  isSelectAll={isSelectAllPage}
                  toggleSelectAll={this.onSelectAllPage}
                  count={isSelectAllPage ? null : tableSelected.length}
                  batchActions={[
                    {
                      name: i18next.t('批量设置默认货位'),
                      onClick: this.handleBatchSetDefaultShelf,
                      type: 'edit',
                    },
                  ]}
                />
              ) : null
            }
            columns={[
              {
                Header: i18next.t('采购规格ID'),
                minWidth: 100,
                accessor: 'id',
              },
              {
                Header: i18next.t('规格名称'),
                minWidth: 150,
                accessor: 'name',
                Cell: ({ original, value: name, index }) => {
                  return (
                    <Flex alignCenter className={styles.specName}>
                      {editInfo.isEditing[index] ? (
                        <input
                          className='form-control'
                          type='text'
                          value={editInfo.name[index]}
                          onChange={this.handleChangeEditValue.bind(
                            this,
                            'name',
                            index,
                          )}
                        />
                      ) : globalStore.hasPermission(
                          'get_reference_information',
                        ) ? (
                        <a
                          onClick={this.handleToPurchasingSpecAnalysis.bind(
                            this,
                            original,
                            quotationUnit,
                          )}
                        >
                          {name}
                        </a>
                      ) : (
                        name
                      )}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('规格条码'),
                accessor: 'barcode',
                minWidth: 120,
                Cell: ({ original, value: barcode, index }) => {
                  return (
                    <div>
                      {editInfo.isEditing[index] ? (
                        <input
                          className='form-control'
                          type='text'
                          value={editInfo.barcode[index]}
                          onChange={this.handleChangeEditValue.bind(
                            this,
                            'barcode',
                            index,
                          )}
                        />
                      ) : (
                        barcode
                      )}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('所属分类'),
                accessor: 'category_1_name',
                minWidth: 200,
                Cell: ({ original, value: category_1_name }) => {
                  return (
                    <div style={{ paddingTop: '3px', paddingBottom: '3px' }}>
                      {category_1_name +
                        '/' +
                        original.category_2_name +
                        '/' +
                        original.spu_name}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('商品类型'),
                id: 'supply-type',
                accessor: ({ p_type }) => {
                  return (
                    <div style={{ paddingTop: '3px', paddingBottom: '3px' }}>
                      {p_type === 0 ? i18next.t('通用') : i18next.t('本站')}
                    </div>
                  )
                },
                minWidth: 100,
              },
              {
                Header: i18next.t('采购规格'),
                accessor: 'ratio',
                minWidth: 150,
                Cell: ({ original, value: ratio, index }) => {
                  return (
                    <Flex alignCenter className={styles.specName}>
                      {editInfo.isEditing[index] ? (
                        <div className='gm-inline-block'>
                          <input
                            className='form-control gm-inline-block'
                            style={{ width: 60 }}
                            type='text'
                            value={editInfo.ratio[index]}
                            onChange={this.handleChangeEditValue.bind(
                              this,
                              'ratio',
                              index,
                            )}
                          />
                          {original.std_unit + '/'}
                          <input
                            className='form-control gm-inline-block'
                            type='text'
                            style={{ width: 60 }}
                            value={editInfo.unit_name[index]}
                            onChange={this.handleChangeEditValue.bind(
                              this,
                              'unit_name',
                              index,
                            )}
                          />
                        </div>
                      ) : (
                        renderPurchaseSpec(original)
                      )}
                    </Flex>
                  )
                },
              },
              {
                Header: (
                  <Flex alignCenter>
                    {i18next.t('最近询价')}({quotationUnit.name})
                    <Popover
                      showArrow
                      type='click'
                      popup={
                        <div className='gm-padding-tb-10 gm-padding-lr-15 b-sale-reference-price'>
                          {_.map(purchaseProgressUnit, (item, i) => (
                            <div
                              key={i}
                              onClick={this.handleQuotationUnitChange.bind(
                                this,
                                item,
                              )}
                              className={classNames(
                                'gm-border-bottom gm-margin-bottom-5 gm-padding-bottom-5',
                              )}
                            >
                              {item.name}
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <i
                        className='xfont xfont-down-triangle text-primary gm-margin-left-5'
                        style={{ cursor: 'pointer' }}
                      />
                    </Popover>
                  </Flex>
                ),
                accessor: 'price',
                minWidth: 150,
                Cell: ({ original }) =>
                  renderQuotation(original, quotationUnit),
              },
              {
                Header: i18next.t('最高入库单价'),
                accessor: 'max_stock_unit_price',
                minWidth: 100,
                Cell: ({ original, value: max_stock_unit_price, index }) => {
                  return (
                    <div className='gm-inline-block'>
                      {editInfo.isEditing[index] ? (
                        <InputNumberV2
                          className='form-control'
                          value={editInfo.max_stock_unit_price[index]}
                          max={9999}
                          onChange={this.handleChangeEditValue.bind(
                            this,
                            'max_stock_unit_price',
                            index,
                          )}
                        />
                      ) : (
                        <span>
                          {isNotSet(max_stock_unit_price)
                            ? i18next.t('未设置')
                            : Big(max_stock_unit_price).toFixed(2) +
                              Price.getUnit() +
                              '/' +
                              original.purchase_unit}
                        </span>
                      )}
                    </div>
                  )
                },
              },
              {
                Header: i18next.t('默认货位'),
                accessor: 'default_shelf_id',
                minWidth: 120,
                Cell: (cellProps) => {
                  const {
                    index,
                    original: { default_shelf_name },
                  } = cellProps
                  return editInfo.isEditing[index] ? (
                    <LevelSelect
                      data={shelfList}
                      selected={editInfo.shelf_selected[index]}
                      onSelect={this.handleChangeShelfSelected.bind(
                        this,
                        index,
                      )}
                    />
                  ) : (
                    default_shelf_name || '-'
                  )
                },
              },
              {
                Header: i18next.t('采购描述'),
                accessor: 'description',
                minWidth: 120,
                Cell: ({ original, index }) => {
                  return (
                    <div>
                      {editInfo.isEditing[index] ? (
                        <input
                          type='text'
                          className='form-control'
                          value={editInfo.description[index]}
                          onChange={this.handleChangeEditValue.bind(
                            this,
                            'description',
                            index,
                          )}
                        />
                      ) : (
                        original.description || '-'
                      )}
                    </div>
                  )
                },
              },
              {
                Header: TableUtil.OperationHeader,
                width: 140,
                Cell: ({ original, index }) => (
                  <PurchaseSpecificationAction
                    original={original}
                    isEditing={editInfo.isEditing[index]}
                    index={index}
                    onModify={this.handleChangeEditValue}
                    onCancel={this.handleClear}
                    onSave={this.handleSave}
                    onDetail={this.handleQuotationModal}
                    onDelete={this.handleDelete}
                    onPrint={this.handlePrint}
                  />
                ),
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination
              data={pagination}
              toPage={this.onHandlePageChange}
              nextDisabled={purchaseSpecList.length < 10}
            />
          </Flex>
        </BoxTable>
        <InitPurchaseSpec ready />
      </div>
    )
  }
}

PurchaseSpecificationList.propTypes = {
  supplier: PropTypes.object,
}

export default connect((state) => ({
  supplier: state.supplier,
}))(PurchaseSpecificationList)
