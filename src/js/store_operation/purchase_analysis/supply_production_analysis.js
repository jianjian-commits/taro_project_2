import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  BoxTable,
  Popover,
  ToolTip,
  RightSideModal,
  Price,
  Button,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import PropTypes from 'prop-types'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import globalStore from '../../stores/global'
import Store from './store'
import _ from 'lodash'

import FilterHeader from './components/filter_header'
import TaskList from '../../task/task_list'
import TableListTips from 'common/components/table_list_tips'

const viewTypeList = [
  { value: 1, name: i18next.t('按关联订单') },
  { value: 2, name: i18next.t('按采购商品') },
]

@observer
class SupplyProductionAnalysis extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      viewType: 1,
    }

    this.pagination = React.createRef()
  }

  componentDidMount() {
    const { begin_time, end_time } = this.props
    Store.init()
    Store.setAnalysisFilter({ begin_time: begin_time, end_time: end_time })
    Store.getCategoriesAndPinLei()
    this.pagination.current.apiDoFirstRequest()
  }

  handleSelectViewType = (value) => {
    this.setState(
      {
        viewType: +value,
      },
      () => {
        Store.setAnalysisFilter({ viewType: +value })
        this.pagination.current.apiDoFirstRequest()
      }
    )
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handleExport = () => {
    Store.purchaseAnalyseListExport().then((json) => {
      if (json.data.async === 1) {
        RightSideModal.render({
          children: <TaskList tabKey={0} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      }
    })
  }

  renderTips = (text) => {
    return (
      <ToolTip
        popup={
          <div className='gm-padding-5' style={{ width: '170px' }}>
            {text}
          </div>
        }
      />
    )
  }

  render() {
    const { viewType } = this.state
    return (
      <div>
        <FilterHeader
          isCollapseRender
          placeholder={i18next.t('输入商品名称进行搜索')}
          onSearch={this.handleSearch}
          onHandleExport={this.handleExport}
          exportAuthority={
            !!globalStore.hasPermission('export_supply_and_analysis')
          }
        />
        <TableListTips
          tips={[
            i18next.t(
              '后台新建的采购单据以及采购单据的补货商品，暂时无法计入统计'
            ),
          ]}
        />
        <BoxTable
          action={
            <Popover
              type='click'
              right
              showArrow
              popup={
                <Flex
                  column
                  className='gm-padding-10 gm-bg'
                  style={{ width: 110 }}
                >
                  {_.map(viewTypeList, (vt, i) => {
                    return (
                      <Flex alignCenter key={i}>
                        <i
                          className={classnames(
                            'xfont xfont-success-circle',
                            vt.value === viewType
                              ? 'text-primary'
                              : 'gm-text-desc'
                          )}
                        />
                        <div
                          className={classnames(
                            'gm-padding-tb-5 gm-margin-left-5 gm-cursor',
                            vt.value === viewType && 'text-primary'
                          )}
                          onClick={() => this.handleSelectViewType(vt.value)}
                        >
                          {vt.name}
                        </div>
                      </Flex>
                    )
                  })}
                </Flex>
              }
            >
              <Button type='primary'>{i18next.t('查看方式')}</Button>
            </Popover>
          }
        >
          <ManagePaginationV2
            id='pagination_in_purchase_analysis_supply_product_list'
            onRequest={Store.getPurchaseAnalyseList}
            disablePage
            ref={this.pagination}
          >
            <Table
              ref={(ref) => (this.table = ref)}
              data={Store.purchaseAnalysisList}
              columns={[
                {
                  Header: i18next.t('商品'),
                  id: 'name',
                  accessor: (d) => (
                    <span>
                      {d.name +
                        '(' +
                        d.ratio +
                        d.std_unit_name +
                        '/' +
                        d.unit_name +
                        ')'}
                    </span>
                  ),
                },
                {
                  Header: i18next.t('分类'),
                  id: 'category_1',
                  accessor: (d) => (
                    <span>
                      {d.category_1 + '/' + d.category_2 + '/' + d.pinlei}
                    </span>
                  ),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('参考采购金额')}</span>
                      {viewType === 1
                        ? this.renderTips(
                            i18next.t(
                              '已提交采购单据的商品，通过计划采购数*最近采购价计算而得'
                            )
                          )
                        : this.renderTips(
                            i18next.t(
                              '所有采购任务，通过计划采购数*最近采购价计算而得'
                            )
                          )}
                    </Flex>
                  ),
                  id: 'plan_sum_money',
                  accessor: (d) => (d.plan_sum_money || 0) + Price.getUnit(),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('实际采购金额')}</span>
                      {viewType === 1
                        ? this.renderTips(
                            i18next.t(
                              '已提交采购单据的商品，通过采购数*采购价分摊计算而得'
                            )
                          )
                        : this.renderTips(
                            i18next.t(
                              '已提交采购单据的商品，通过采购数*采购价计算而得'
                            )
                          )}
                    </Flex>
                  ),
                  width: 120,
                  id: 'purchase_sum_money',
                  accessor: (d) =>
                    (d.purchase_sum_money || 0) + Price.getUnit(),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('实际入库金额')}</span>
                      {viewType === 1
                        ? this.renderTips(
                            i18next.t(
                              '已提交采购单据关联的入库单据提交之后，通过入库数*入库价分摊计算而得'
                            )
                          )
                        : this.renderTips(
                            i18next.t('根据入库时间，通过入库数*入库价计算而得')
                          )}
                    </Flex>
                  ),
                  id: 'stock_sum_money',
                  accessor: (d) => (d.stock_sum_money || 0) + Price.getUnit(),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('计划采购数（基本单位）')}</span>
                      {viewType === 1
                        ? this.renderTips(
                            i18next.t('关联采购任务的计划采购数汇总')
                          )
                        : this.renderTips(
                            i18next.t('所有采购任务，计划采购数的汇总')
                          )}
                    </Flex>
                  ),
                  id: 'plan_amount',
                  accessor: (d) => (d.plan_amount || 0) + d.std_unit_name,
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('采购数量（基本单位）')}</span>
                      {viewType === 1
                        ? this.renderTips(
                            i18next.t('提交采购单据的已采购数分摊计算的汇总')
                          )
                        : this.renderTips(i18next.t('已提交单据的采购数汇总'))}
                    </Flex>
                  ),
                  id: 'purchase_amount',
                  accessor: (d) => (d.purchase_amount || 0) + d.std_unit_name,
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('入库数量（基本单位）')}</span>
                      {viewType === 1
                        ? this.renderTips(
                            i18next.t('关联入库单据的已入库数分摊计算的汇总')
                          )
                        : this.renderTips(
                            i18next.t('根据入库时间，已入库数汇总')
                          )}
                    </Flex>
                  ),
                  id: 'stock_amount',
                  accessor: (d) => (d.stock_amount || 0) + d.std_unit_name,
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('采购均价')}</span>
                      {this.renderTips(
                        i18next.t('采购均价=实际采购金额/采购数')
                      )}
                    </Flex>
                  ),
                  id: 'purchase_avg_price',
                  accessor: (d) =>
                    (d.purchase_avg_price || 0) + Price.getUnit(),
                },
                {
                  Header: (
                    <Flex alignCenter>
                      <span>{i18next.t('入库均价')}</span>
                      {this.renderTips(
                        i18next.t('入库均价=实际入库金额/入库数量')
                      )}
                    </Flex>
                  ),
                  id: 'stock_avg_price',
                  accessor: (d) => (d.stock_avg_price || 0) + Price.getUnit(),
                },
                {
                  Header: i18next.t('当前库存'),
                  id: 'current_inventory',
                  accessor: (d) => (d.current_inventory || 0) + d.std_unit_name,
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

SupplyProductionAnalysis.propTypes = {
  begin_time: PropTypes.date,
  end_time: PropTypes.date,
}

export default SupplyProductionAnalysis
