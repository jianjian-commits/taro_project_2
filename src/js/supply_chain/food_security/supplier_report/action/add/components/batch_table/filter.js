import React from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  Form,
  FormBlock,
  FormItem,
  DateRangePicker,
  Input,
  DropDown,
  DropDownItems,
  DropDownItem,
  IconDownUp,
  Flex,
  Button,
  Dialog,
} from '@gmfe/react'
// import batch from './store'
import { Request } from '@gm-common/request'
import moment from 'moment'

import {
  TableX,
  selectTableXHOC,
  editTableXHOC,
  TableXUtil,
} from '@gmfe/table-x'
import { observable } from 'mobx'

const { TABLE_X } = TableXUtil
const SelectTableX = selectTableXHOC(TableX)
const EditTableX = editTableXHOC(SelectTableX)

const store = observable({
  list: [],
  selected: [],
  set(key, value) {
    this[key] = value
  },
})

@observer
class BatchFilter extends React.Component {
  state = {
    begin: null,
    end: null,
    timeType: 1,
    openDropDown: false,
    searchVal: '',
  }

  columns = [
    {
      Header: '序号',
      accessor: 'index',
      fixed: 'left',
      width: TABLE_X.WIDTH_NO,
      maxWidth: TABLE_X.WIDTH_NO,
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: '入库时间',
      id: 'in_stock_time',
      accessor: (v) => {
        return v.in_stock_time
          ? moment(v.in_stock_time).format('YYYY-MM-DD HH:mm')
          : ''
      },
    },
    {
      Header: '批次号',
      accessor: 'batch_number',
    },
    {
      Header: '供应商',
      accessor: 'supplier_name',
    },
    {
      Header: '商品分类',
      accessor: 'category',
    },
    {
      Header: '入库规格名',
      accessor: 'spu_name',
    },
  ]

  handleSearch() {
    return Request('/stock/batch/search/food_security_food')
      .data({
        query_type: 1,
        time_type: this.state.timeType,
        begin: moment(this.state.begin).format('YYYY-MM-DD'),
        end: moment(this.state.end).format('YYYY-MM-DD'),
        q: this.state.searchVal,
      })
      .get()
      .then(({ data }) => {
        store.set('list', data)
        return data
      })
  }

  render() {
    const state = this.state
    const menus = [
      {
        text: '按入库日期',
        value: 1,
      },
      {
        text: '按建单日期',
        value: 2,
      },
    ]
    const dropLabel = menus.find((menu) => menu.value === this.state.timeType)
      .text
    return (
      <>
        <Box hasGap>
          <Form onSubmit={() => console.log('onSubmit')}>
            <FormBlock col={3}>
              <FormItem labelWidth='0'>
                <Flex alignCenter>
                  <Flex className='gm-margin-right-10'>
                    <DropDown
                      popup={
                        <DropDownItems>
                          {menus.map((menu, i) => {
                            return (
                              <DropDownItem
                                key={i}
                                onClick={() =>
                                  this.setState({
                                    ...state,
                                    timeType: menu.value,
                                    openDropDown: false,
                                  })
                                }
                              >
                                {menu.text}
                              </DropDownItem>
                            )
                          })}
                        </DropDownItems>
                      }
                    >
                      <Flex
                        alignCenter
                        onClick={() =>
                          this.setState({
                            ...state,
                            openDropDown: !state.openDropDown,
                          })
                        }
                      >
                        <span className='gm-margin-right-5'>{dropLabel}</span>
                        <IconDownUp active={state.openDropDown} />
                      </Flex>
                    </DropDown>
                  </Flex>
                  <Flex flex={2}>
                    <DateRangePicker
                      style={{ width: '100%' }}
                      begin={this.state.begin}
                      end={this.state.end}
                      placeholder='选择时间'
                      onChange={(begin, end) =>
                        this.setState({ ...state, begin, end })
                      }
                    />
                  </Flex>
                </Flex>
              </FormItem>
              <FormItem label='搜索' labelWidth='50px'>
                <Input
                  className='form-control'
                  placeholder='请输入入库单号、批次供应商信息'
                  value={state.searchVal}
                  onChange={(e) =>
                    this.setState({ ...state, searchVal: e.target.value })
                  }
                />
              </FormItem>
              <FormItem>
                <Button type='primary' onClick={this.handleSearch.bind(this)}>
                  搜索
                </Button>
              </FormItem>
            </FormBlock>
          </Form>

          <EditTableX
            keyField='batch_number'
            style={{ maxHeight: '60vh' }}
            columns={this.columns}
            data={store.list.slice()}
            selected={store.selected.slice()}
            onSelect={(selected) => {
              store.set('selected', selected)
            }}
          />
        </Box>
      </>
    )
  }
}

BatchFilter.popup = (options = { title: '批量添加' }) => {
  return new Promise((resolve, reject) => {
    Dialog.confirm({
      title: options.title,
      size: 'lg',
      children: <BatchFilter />,
    }).then(() => {
      resolve(
        store.selected
          .map((batch_number) =>
            store.list.find((item) => item.batch_number === batch_number),
          )
          .slice(),
      )
    }, reject)
  })
}

export default BatchFilter
