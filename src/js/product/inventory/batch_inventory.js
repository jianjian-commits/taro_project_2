import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Button,
  Uploader,
  Dialog,
  Tip,
  Price,
  RightSideModal,
  InputNumberV2,
  Box,
  Form,
  FormItem,
  BoxTable,
  Flex,
  Input,
  FormGroup,
} from '@gmfe/react'
import {
  TableXVirtualized,
  selectTableXHOC,
  diyTableXHOC,
  TableXUtil,
} from '@gmfe/table-x'
import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import { Request } from '@gm-common/request'
import globalStore from '../../stores/global'
import './actions'
import './reducer'
import CategoryFilterHoc from '../../common/components/category_filter_hoc/single'

import actions from '../../actions'
import { history } from '../../common/service'
import TaskList from '../../task/task_list'
import BatchDialog from './batch_dialog'
import PropTypes from 'prop-types'

const { TABLE_X } = TableXUtil

const { stock_method } = globalStore.user
const SelectDiyTable =
  stock_method === 2
    ? selectTableXHOC(diyTableXHOC(TableXVirtualized))
    : selectTableXHOC(TableXVirtualized)

class BatchInventory extends React.Component {
  isEndProduct = this.props.location.query.batchType === 'product' // 是否是成品盘点，product=>成品，material=>原料

  columns = [
    {
      Header: i18next.t('商品ID'),
      accessor: 'spu_id',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('商品名'),
      accessor: 'name',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('采购规格'),
      show: false,
      diyEnable: true,
      diyGroupName: i18next.t('基础字段'),
      accessor: 'sku_id',
    },
    {
      Header: i18next.t('商品分类'),
      accessor: 'category_name_2',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
    },
    {
      Header: i18next.t('库存均价'),
      accessor: 'avg_price',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({
        row: {
          original: { std_unit_name, avg_price },
        },
      }) =>
        `${parseFloat(
          Big(avg_price || 0)
            .div(100)
            .toFixed(2),
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: i18next.t('抄盘数'),
      accessor: 'old_stock',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({
        row: {
          original: { std_unit_name, old_stock, sale_unit_name },
        },
      }) =>
        `${parseFloat(Big(old_stock || 0).toFixed(2))}${
          this.isEndProduct ? sale_unit_name : std_unit_name
        }`,
    },
    {
      Header: i18next.t('抄盘货值'),
      show: false,
      diyEnable: true,
      diyGroupName: i18next.t('基础字段'),
      accessor: 'batch_value',
      Cell: ({
        row: {
          original: { old_stock, avg_price },
        },
      }) =>
        _.isNumber(avg_price)
          ? parseFloat(
              Big(old_stock || 0)
                .times(avg_price)
                .div(100)
                .toFixed(4),
            )
          : '-',
    },
    {
      Header: i18next.t('实盘数'),
      accessor: 'new_stock',
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      Cell: ({
        row: {
          index,
          original: { new_stock, std_unit_name, sale_unit_name },
        },
      }) => (
        <Flex alignCenter>
          <InputNumberV2
            value={new_stock}
            onChange={this.handleContentChange.bind(this, index, 'new_stock')}
            min={0}
            style={{ width: '120px' }}
            max={999999999}
            placeholder={i18next.t('请输入实盘数')}
            className='form-control input-sm gm-inline-block'
          />
          <span>{this.isEndProduct ? sale_unit_name : std_unit_name}</span>
        </Flex>
      ),
    },
    {
      Header: i18next.t('实盘货值'),
      show: false,
      diyEnable: true,
      diyGroupName: i18next.t('基础字段'),
      accessor: 'new_stock_product', // diy 列表需要唯一key，仅用于区分
      Cell: ({
        row: {
          original: { new_stock, avg_price },
        },
      }) =>
        _.isNumber(avg_price)
          ? parseFloat(
              Big(new_stock || 0)
                .times(avg_price)
                .div(100)
                .toFixed(4),
            )
          : '-',
    },
    {
      Header: i18next.t('库存差异'),
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      accessor: 'difference',
      Cell: ({
        row: {
          original: { std_unit_name, new_stock, old_stock, sale_unit_name },
        },
      }) =>
        `${parseFloat(
          Big(new_stock || 0)
            .minus(old_stock)
            .toFixed(2),
        )}${this.isEndProduct ? sale_unit_name : std_unit_name}`,
    },
    {
      Header: i18next.t('差异货值'),
      show: false,
      diyEnable: true,
      diyGroupName: i18next.t('基础字段'),
      accessor: 'difference_product', // diy 列表需要唯一key，仅用于区分
      Cell: ({
        row: {
          original: { new_stock, old_stock, avg_price },
        },
      }) =>
        _.isNumber(avg_price)
          ? parseFloat(
              Big(new_stock || 0)
                .minus(old_stock)
                .times(avg_price)
                .div(100)
                .toFixed(4),
            )
          : '-',
    },
    {
      Header: i18next.t('备注'),
      diyEnable: false,
      diyGroupName: i18next.t('基础字段'),
      accessor: 'remark',
      Cell: ({
        row: {
          original: { remark },
          index,
        },
      }) => (
        <Input
          className='form-control'
          value={remark}
          onChange={this.handleSheetRemarkChange.bind(this, index, 'remark')}
          placeholder={i18next.t('备注')}
        />
      ),
    },
  ]

  constructor(props) {
    super(props)
    this.state = {
      level1: 0,
      level2: 0,
      level: {},
      selected: [],
    }
    const { stock_method } = globalStore.user
    if (stock_method === 2) {
      this.columns.unshift({
        Header: i18next.t('批次号'),
        accessor: 'batch_number',
        diyEnable: false,
        diyGroupName: i18next.t('基础字段'),
      })
    }
  }

  componentDidMount() {
    actions.product_inventory_sku_categories()
  }

  componentWillUnmount() {
    actions.product_inventory_batch_list_modify([])
  }

  handleChangeLevel = (e) => {
    const { category1, category2 } = e
    const option = {
      level: e,
    }
    option.level1 = category1 ? category1.id : undefined
    option.level2 = category2 ? category2.id : undefined
    this.setState(option)
  }

  handleCancel = () => {
    Dialog.confirm({
      children: i18next.t('确定要离开此页面吗?'),
    }).then(
      () => {
        history.go(-1)
      },
      () => {},
    )
  }

  handleSave = () => {
    const { list } = this.props.inventory.inventoryBatchList
    const { batchType } = this.props.location.query
    // let selectList = []
    const { stock_method } = globalStore.user

    const clean_food = batchType === 'product' ? 1 : 0

    const selectList = list
      .filter((item) => item._gm_select)
      .map((item) =>
        stock_method === 2
          ? {
              new_stock: item.new_stock,
              remark: item.remark,
              batch_number: item.batch_number,
            }
          : {
              spu_id: item.spu_id,
              new_stock: item.new_stock,
              remark: item.remark,
            },
      )

    if (selectList.length === 0) {
      Tip.warning(i18next.t('没有选择记录'))
      return false
    }
    actions
      .product_inventory_batch_save({
        stock_details: JSON.stringify(selectList),
        clean_food,
      })
      .then(() => {
        actions.product_inventory_batch_list_modify(
          _.filter(list, (v) => !v._gm_select),
        )
        this.setState({ selected: [] })
        this.renderTask()
      })
  }

  handleSelect = (selected) => {
    const {
      inventoryBatchList: { list },
    } = this.props.inventory

    this.setState({ selected })
    _.forEach(list, (item, index) => {
      item._gm_select = _.includes(selected, index)
    })

    actions.product_inventory_batch_select(list)
  }

  handleDownloadSync = (params = null) => {
    Request('/stock/check/template')
      .data(params)
      .get()
      .then(() => {
        this.renderTask(0)
      })
  }

  handleTemplateExport = () => {
    const { stock_method } = globalStore.user
    // 净菜默认为先进先出
    if (stock_method === 2) {
      Dialog.dialog({
        children: <BatchDialog />,
        size: 'md',
        title: i18next.t('模板导出'),
        OKBtn: i18next.t('下载模板'),
        onOK: () => {
          const {
            inventory: {
              batchFilter: {
                begin,
                end,
                categoryFilter: { category1_ids, category2_ids, pinlei_ids },
                exportType: export_type,
                remaningType: remaning_type,
              },
            },
          } = this.props

          const beginTime = moment(begin)
          const endTime = moment(end)
          const params = {
            begin_time: beginTime.format('YYYY-MM-DD'),
            end_time: endTime.format('YYYY-MM-DD'),
            category_id_1: JSON.stringify(category1_ids.map((d) => d.id)),
            category_id_2: JSON.stringify(category2_ids.map((d) => d.id)),
            pinlei_ids: JSON.stringify(pinlei_ids.map((d) => d.id)),
            export_type,
            remaning_type,
            clean_food:
              this.props.location.query.batchType === 'product' ? 1 : 0, // product-成品，material-原料
          }
          this.handleDownloadSync(params)
        },
      })
    } else {
      this.handleDownloadSync()
    }
  }

  handleImport = (file) => {
    const isCleanFood =
      this.props.location.query.batchType === 'product' ? 1 : 0
    actions.product_inventory_batch_import(file[0], isCleanFood)
    this.setState({ selected: [] })
  }

  handleContentChange = (index, key, value) => {
    const { inventoryBatchList } = this.props.inventory
    const { list } = inventoryBatchList
    const data = list.slice()
    data[index][key] = value
    actions.product_inventory_batch_list_modify(data)
  }

  handleSheetRemarkChange = (index, key, e) => {
    this.handleContentChange(index, key, e.target.value)
  }

  renderTask = (tabKey = 1) => {
    RightSideModal.render({
      children: <TaskList tabKey={tabKey} />,
      onHide: RightSideModal.hide,
      style: {
        width: '300px',
      },
    })
  }

  render() {
    const { inventoryBatchList } = this.props.inventory
    const { list, loading } = inventoryBatchList
    const { level1, level2, level, selected } = this.state

    let filterList = _.map(list, (item, index) => ({ ...item, index }))
    if (level1) {
      filterList = _.filter(filterList, (l) => l.category_id_1 === level1)
    }

    if (level2) {
      filterList = _.filter(filterList, (l) => l.category_id_2 === level2)
    }

    const limit = 11
    const tableHeight =
      TABLE_X.HEIGHT_HEAD_TR +
      Math.min(limit, filterList.length) * TABLE_X.HEIGHT_TR

    return (
      <FormGroup onCancel={this.handleCancel} onSubmit={this.handleSave}>
        <Box hasGap>
          <Form disabledCol inline>
            <FormItem label={i18next.t('商品筛选')}>
              <CategoryFilterHoc
                disablePinLei
                selected={level}
                onChange={this.handleChangeLevel}
              />
            </FormItem>
          </Form>
        </Box>
        <BoxTable
          action={
            <>
              <Button type='primary' plain onClick={this.handleTemplateExport}>
                {i18next.t('模板导出')}
              </Button>
              <div className='gm-gap-10' />
              <Uploader
                className='gm-dropper-wrap'
                onUpload={this.handleImport}
                accept='.xlsx'
              >
                <Button type='primary'>{i18next.t('模版导入')}</Button>
              </Uploader>
            </>
          }
        >
          <SelectDiyTable
            data={filterList}
            loading={loading}
            columns={this.columns}
            keyField='index'
            id='batch_inventory'
            selected={selected}
            diyGroupSorting={[i18next.t('基础字段')]}
            onSelect={this.handleSelect}
            virtualizedHeight={tableHeight}
            virtualizedItemSize={TABLE_X.HEIGHT_TR}
            fixedSelect
          />
        </BoxTable>
      </FormGroup>
    )
  }
}

BatchInventory.propTypes = {
  inventory: PropTypes.object,
}

export default BatchInventory
