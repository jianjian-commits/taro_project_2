import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Flex,
  Form,
  FormButton,
  FormItem,
  Input,
  RightSideModal,
  Tip,
  LevelSelect,
  InputNumberV2,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableV2HOC, Table } from '@gmfe/table'
import { t } from 'gm-i18n'
import {
  findParent,
  getProductDetailsData,
  handleOkCheckCascade,
  rebuildArray,
  rollOutMenu,
} from '../../../utils'
import { store } from '../../../store'
import _ from 'lodash'
import { observer } from 'mobx-react'
import SupplierDel from 'common/components/supplier_del_sign'
import { Select } from '@gmfe/react'

const SelectTable = selectTableV2HOC(Table)

@observer
class MoveStockModal extends Component {
  pagination

  currentCargoLocationMenu = rebuildArray([store.searchItem]) // 当前及其子级的货位

  cargoLocationMenu = rebuildArray(store.cargoLocationMenu) // 所有货位

  columns = [
    {
      Header: t('移出货位'),
      accessor: 'shelf_name',
      width: 120,
      Cell: ({ value: shelf_name }) => shelf_name || t('未分配'),
    },
    { Header: t('移出批次号'), accessor: 'batch_number', width: 150 },
    {
      Header: t('供应商'),
      accessor: 'supplier_name',
      width: 130,
      Cell: (cellProps) => {
        const { supplier_name, supplier_status } = cellProps.original

        return (
          <Flex>
            {supplier_status === 0 && <SupplierDel />}
            {supplier_name}
          </Flex>
        )
      },
    },
    {
      Header: t('剩余库存（基本单位）'),
      accessor: 'remain',
      Cell: ({ original: { remain, std_unit_name } }) => (
        <>
          {remain}
          {std_unit_name}
        </>
      ),
    },
    {
      Header: t('移入货位'),
      accessor: 'in_shelf_id',
      Cell: ({ original }) => {
        const { selected } = this.state
        return (
          <LevelSelect
            selected={original.in_shelf_id || []}
            right
            data={this.cargoLocationMenu}
            onSelect={(event) => {
              original.in_shelf_id = event
              this.setState(({ data }) => data)
            }}
            disabled={_.every(
              selected,
              (item) => item !== original.batch_number,
            )}
          />
        )
      },
    },
    {
      Header: t('移库数'),
      accessor: 'out_amount',
      Cell: ({ original }) => {
        const { selected } = this.state
        return (
          <InputNumberV2
            className='form-control'
            value={_.isNumber(original.out_amount) ? original.out_amount : null}
            min={0}
            onChange={(value) => {
              original.out_amount = value
              this.setState(({ data }) => data)
            }}
            disabled={_.every(
              selected,
              (item) => item !== original.batch_number,
            )}
          />
        )
      },
    },
    {
      Header: t('新批次状态'),
      accessor: 'in_batch_status',
      Cell: ({ original }) => {
        const { in_batch_status } = original

        const onChange = (v) => {
          original.in_batch_status = +v
          this.setState(({ data }) => data)
        }

        // 默认为 2 正常
        if (!in_batch_status) {
          onChange(2)
          return '-'
        }

        // status: 1  // M, int,-1，删除；1，待提交（净菜）；2，正常；3，损坏；4，临期；5，过期
        if ([-1, 1].includes(in_batch_status)) return '-'
        const map = {
          2: '正常',
          3: '损坏',
          4: '临期',
          5: '过期',
        }
        // eslint-disable-next-line no-prototype-builtins
        // if (!map.hasOwnProperty(in_batch_status_)) return '-'

        const array = Object.entries(map).map(([key, value]) => ({
          value: key,
          text: value,
        }))

        return (
          <Select
            value={in_batch_status.toString()}
            data={array}
            onChange={onChange}
          />
        )
      },
    },
  ]

  state = {
    data: [],
    loading: false,
    allSelected: false,
    selected: [], // selectTable的data
    shelf_id: [],
    q: '',
    spu_id: undefined,
  }

  selectedMap = new Map() // 通过selected获取data中被勾选的

  constructor(props) {
    super(props)
    this.handleOk = ::this.handleOk
    this.handleGetTableData = ::this.handleGetTableData
    this.handleSelectAll = ::this.handleSelectAll
    this.handleSelect = ::this.handleSelect
    this.cargoLocationMenu.shift()
  }

  componentDidMount() {
    const {
      value: { spu_id },
    } = this.props
    this.setState({ spu_id })
    this.pagination.doFirstRequest()
    this.initCascader()
  }

  /**
   * 初始化级联选项
   */
  initCascader() {
    const { searchItem } = store
    const menu = []
    rollOutMenu([searchItem], menu) // 平铺货位级联货位
    const shelf_id = findParent(menu, searchItem)
    this.setState({ shelf_id })
  }

  /**
   * 获取表格数据
   * @param pagination
   * @returns {Q.Promise<any> | Promise<void>}
   */
  handleGetTableData(pagination) {
    const { spu_id, q } = this.state
    let { shelf_id } = this.state
    shelf_id = shelf_id[shelf_id.length - 1]
    const option = {
      ...pagination,
      spu_id,
      shelf_id,
      q,
      remain_positive: 1,
      view_shelf: 1,
    }
    this.setState({ loading: true })
    return getProductDetailsData(option)
      .then((result) => {
        const { data } = result
        _.forEach(data, (item, index) => {
          this.selectedMap.forEach((value, key) => {
            if (item.batch_number === key) {
              data.splice(index, 1, value)
            }
          })
        })
        this.setState({ data })
        return result
      })
      .finally(() => this.setState({ loading: false }))
  }

  handleSelect(selected) {
    this.setState({ selected })
    this.getSelectedList(selected)
  }

  handleSelectAll() {
    const { allSelected, data } = this.state
    const selected = allSelected ? [] : _.map(data, (item) => item.batch_number)
    const option = {
      allSelected: !allSelected,
      selected,
      data,
    }
    this.setState(option)
    this.getSelectedList(selected)
  }

  /**
   * 勾选获取选中的data，装填到Map
   * @param selected
   */
  getSelectedList(selected) {
    const { data } = this.state
    const selectedList = _.filter(data, (item) =>
      _.includes(selected, item.batch_number),
    )
    _.forEach(selectedList, (item) => {
      this.selectedMap.set(item.batch_number, item)
    })
  }

  handleOk() {
    const { value } = this.props
    const { spu_id, spu_name } = value
    const { selected } = this.state
    const selectedList = []
    this.selectedMap.forEach((val, key) => {
      if (_.includes(selected, key)) {
        selectedList.push({ ...val, spu_name, spu_id })
      }
    })
    if (!selectedList.length) {
      Tip.warning(t('请勾选至少一个货位！'))
      return
    }
    if (
      _.some(
        selectedList,
        (item) => !(item.in_shelf_id && item.in_shelf_id.length),
      )
    ) {
      Tip.warning(t('请选择移入货位！'))
      return
    }
    if (_.some(selectedList, (item) => !item.out_amount)) {
      Tip.warning(t('请输入移库数！'))
      return
    }
    if (
      _.some(
        selectedList,
        (item) => Number(item.out_amount) > Number(item.remain),
      )
    ) {
      Tip.warning(t('请输入少于剩余库存的移库数！'))
      return
    }
    if (handleOkCheckCascade(selectedList)) {
      Tip.warning(t('移入货位不能与移出货位一致'))
      return
    }
    _.forEach(selectedList, (item) => {
      item.shelf_id = item.shelf_id || -1 // -1代表未分配货位
    })
    value.toMoveNum = (value.toMoveNum || 0) + selectedList.length
    store.setSpuList(store.spuList)
    store.setToMoveList([...store.toMoveList, ...selectedList])
    RightSideModal.hide()
  }

  handleCancel(e) {
    e.preventDefault()
    RightSideModal.hide()
  }

  changeSearchOption(value, key) {
    this.setState({
      [key]: value,
    })
  }

  render() {
    const {
      value: { spu_name, spu_id },
    } = this.props
    const { data, loading, allSelected, selected, shelf_id, q } = this.state

    return (
      <Flex column className='modal-container'>
        <header className='modal-head gm-padding-bottom-10'>
          <h3 className='gm-margin-bottom-10'>
            {spu_name}
            <span className='gm-gap-15' />
            {spu_id}
          </h3>
          <Form inline onSubmit={() => this.pagination.doFirstRequest()}>
            <FormItem label={t('货位筛选')}>
              <LevelSelect
                right
                selected={shelf_id}
                data={this.currentCargoLocationMenu}
                onSelect={(event) => this.changeSearchOption(event, 'shelf_id')}
              />
            </FormItem>
            <FormItem label={t('搜索')}>
              <Input
                className='form-control'
                value={q}
                placeholder={t('请输入批次号、供应商信息')}
                onChange={(event) =>
                  this.changeSearchOption(event.target.value, 'q')
                }
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </header>
        <Flex flex={1}>
          <div className='width-100-percent'>
            <ManagePaginationV2
              id='pagination_in_product_cargo_location_management_move_stock_modal_list'
              onRequest={this.handleGetTableData}
              ref={(ref) => (this.pagination = ref)}
            >
              <SelectTable
                selectAll={allSelected}
                data={data}
                columns={this.columns}
                loading={loading}
                keyField='batch_number'
                selected={selected}
                onSelect={this.handleSelect}
                onSelectAll={this.handleSelectAll}
                className='gm-margin-bottom-20'
              />
            </ManagePaginationV2>
          </div>
        </Flex>

        <Flex justifyCenter className='modal-foot gm-padding-top-10'>
          <Button onClick={this.handleCancel}>{t('取消')}</Button>
          <Button type='primary' onClick={this.handleOk}>
            {t('加入移库列表')}
          </Button>
        </Flex>
      </Flex>
    )
  }
}

export default MoveStockModal

MoveStockModal.propTypes = {
  value: PropTypes.object.isRequired,
}
