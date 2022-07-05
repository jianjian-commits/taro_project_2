import { i18next } from 'gm-i18n'
import React from 'react'
import {
  BoxTable,
  Box,
  Dialog,
  Tip,
  Form,
  FormItem,
  FormButton,
  Button,
  Flex,
  Pagination,
  Popover,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import './actions.js'
import './reducer.js'
import actions from '../../actions'
import _ from 'lodash'
import styles from './style.module.less'
import Modify from './components/modify'
import globalStore from '../../stores/global'
import PropTypes from 'prop-types'
import TableTotalText from '../../common/components/table_total_text'
import PurchaseSourcerAction from './purchase_sourcer_action'
import InitUserPurchase from '../../guides/init/guide/init_user_purchase'

class PurchaseSourcer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      id: null, // 仅编辑状态有id
      settle_suppliers: [],
      suppliers: [],
      pagination: {
        offset: 0,
        limit: 10,
      },
      count: 0,
      more: true,
    }

    this.handleSearch = ::this.handleSearch
  }

  UNSAFE_componentWillMount() {
    actions.purchase_sourcer_init()
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleSearch(e, isSearch) {
    e && e.preventDefault()
    const defaultPagination = { offset: 0, limit: 10 }
    const nowPagination = this.state.pagination
    actions
      .purchase_sourcer_search(
        this.searchKeyword.value,
        isSearch ? defaultPagination : nowPagination,
      )
      .then((json) => {
        this.setState({
          count: json.pagination.count,
          more: json.pagination.more,
          pagination: isSearch ? defaultPagination : nowPagination,
        })
        if (!json.code) {
          actions.supplier_list_get().then((result) => {
            this.setState({
              suppliers: result,
            })
          })
        }
      })
  }

  onHandlePageChange = (page) => {
    this.setState({ pagination: page }, () => {
      this.handleSearch()
    })
  }

  handleEidtSuppliers = (id, suppliers) => {
    return Dialog.confirm({
      children: (
        <div>
          <span>
            {i18next.t(
              '变更绑定关系后，新的采购任务将根据新的绑定关系确定。是否确定变更？',
            )}
          </span>
          <span className='b-warning-tips gm-inline-block'>
            {i18next.t(
              '注：历史的采购任务不做变更，建议将采购任务完成后在更改。',
            )}
          </span>
        </div>
      ),
    }).then(() => {
      return actions
        .purchase_sourcer_edit_supplier(id, JSON.stringify(suppliers))
        .then((json) => {
          if (!json.code) {
            this.handleSearch()
          }
          return json
        })
    })
  }

  handleDetail = (id) => {
    window.open(`#/supply_chain/purchase/information/buyer/${id}`)
  }

  handleCreate() {
    window.open(`#/supply_chain/purchase/information/buyer/create`)
  }

  handleSourcerDel = (id) => {
    return actions.purchase_sourcer_del(id).then(() => {
      Tip.success(i18next.t('删除成功'))
      this.handleSearch()
    })
  }

  handleModify = (index, key, value) => {
    actions.purchase_sourcer_modify(index, key, value)
  }

  render() {
    const { suppliers } = this.state
    const list = this.props.purchase_task.purchaseSourcer
    const can_add_purchaser = globalStore.hasPermission('add_purchaser')
    return (
      <div>
        <Box hasGap>
          <Form
            inline
            className='form-inline'
            onSubmit={() => this.handleSearch(undefined, true)}
          >
            <FormItem label={i18next.t('搜索')} inline>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('采购员姓名或账号')}
                ref={(ref) => {
                  this.searchKeyword = ref
                }}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>

        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('采购员数'),
                    content: this.state.count,
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={
            can_add_purchaser && (
              <Button
                data-id='initUserPurchase'
                type='primary'
                onClick={this.handleCreate}
              >
                {i18next.t('新建采购员')}
              </Button>
            )
          }
        >
          <Table
            data={list}
            columns={[
              {
                Header: i18next.t('编号'),
                accessor: 'index',
                Cell: ({ index }) => {
                  return index + this.state.pagination.offset + 1
                },
              },
              {
                Header: i18next.t('账号'),
                accessor: 'username',
                Cell: ({ original, value }) => {
                  return (
                    <span
                      className={
                        !original.status
                          ? styles.purchaseSourcerTextDisable
                          : ''
                      }
                    >
                      {value || '-'}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('负责供应商'),
                accessor: 'settle_suppliers',
                Cell: ({ original, value: settle_suppliers, index }) => {
                  return (
                    <Modify
                      isEditing={original.isEditing}
                      key={original.id}
                      list={suppliers}
                      selected={settle_suppliers}
                      onSelect={(selected) =>
                        this.handleModify(index, 'settle_suppliers', selected)
                      }
                      displayText={
                        settle_suppliers?.length ? (
                          <Popover
                            type='hover'
                            showArrow
                            className={styles.PopverStyles}
                            center
                            offset={5}
                            popup={
                              <>
                                {_.map(
                                  settle_suppliers,
                                  (supplier) => supplier.text,
                                ).join('，')}
                              </>
                            }
                          >
                            <span
                              className={
                                (!original.status
                                  ? styles.purchaseSourcerTextDisable
                                  : '',
                                styles.purchaseDetailOverflow)
                              }
                            >
                              {_.map(
                                settle_suppliers,
                                (supplier) => supplier.text,
                              ).join('，')}
                            </span>
                          </Popover>
                        ) : (
                          <span
                            className={
                              !original.status
                                ? styles.purchaseSourcerTextDisable
                                : ''
                            }
                          >
                            -
                          </span>
                        )
                      }
                    />
                  )
                },
              },
              {
                Header: i18next.t('姓名'),
                accessor: 'name',
                Cell: ({ original, value: name }) => {
                  return (
                    <span
                      className={
                        !original.status
                          ? styles.purchaseSourcerTextDisable
                          : ''
                      }
                    >
                      {name}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('手机'),
                accessor: 'phone',
                Cell: ({ original, value: phone }) => {
                  return (
                    <span
                      className={
                        !original.status
                          ? styles.purchaseSourcerTextDisable
                          : ''
                      }
                    >
                      {phone || '-'}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('账号状态'),
                accessor: 'status',
                Cell: ({ value: status }) => {
                  return (
                    <span
                      className={
                        !status ? styles.purchaseSourcerTextDisable : ''
                      }
                    >
                      {status === 1 ? i18next.t('有效') : i18next.t('无效')}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('登录采购APP'),
                accessor: 'is_allow_login',
                Cell: ({ original, value: is_allow_login }) => {
                  return (
                    <span
                      className={
                        !original.status
                          ? styles.purchaseSourcerTextDisable
                          : ''
                      }
                    >
                      {is_allow_login === 1
                        ? i18next.t('开启')
                        : i18next.t('关闭')}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('登录状态'),
                accessor: 'is_online',
                Cell: ({ original, value: is_online }) => {
                  return (
                    <span
                      className={
                        is_online && original.status
                          ? 'text-primary'
                          : styles.purchaseSourcerTextDisable
                      }
                    >
                      {is_online ? i18next.t('在线') : i18next.t('离线')}
                    </span>
                  )
                },
              },
              {
                Header: TableUtil.OperationHeader,
                width: 100,
                Cell: ({ index, original }) => (
                  <PurchaseSourcerAction
                    index={index}
                    original={original}
                    onModify={this.handleModify}
                    onSave={this.handleEidtSuppliers}
                    onDetail={this.handleDetail}
                    onDelete={this.handleSourcerDel}
                  />
                ),
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination
              data={this.state.pagination}
              toPage={this.onHandlePageChange}
              nextDisabled={!this.state.more}
            />
          </Flex>
        </BoxTable>
        <InitUserPurchase ready />
      </div>
    )
  }
}

PurchaseSourcer.propTypes = {
  purchase_task: PropTypes.object,
}

export default PurchaseSourcer
