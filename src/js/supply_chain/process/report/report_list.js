import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, RightSideModal, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX, expandTableXHOC, TableXUtil } from '@gmfe/table-x'
import Big from 'big.js'
import _ from 'lodash'

import { remarkType } from 'common/filter'
import { isNumber, urlToParams } from 'common/util'
import {
  renderMaterielPercentageHeader,
  renderProductPercentageHeader,
} from '../util'
import TableTotalText from 'common/components/table_total_text'
import Technics from './report_technics'

import store from './store'
import HeaderTip from '../../../common/components/header_tip'
import Percentage from './components/percentage'

const ExpandTableX = expandTableXHOC(TableX)

@observer
class ReportList extends React.Component {
  componentDidMount() {
    store.setDoFirstRequest(this.pagination.doFirstRequest)
    store.doFirstRequest()
  }

  handleIngredients = (data) => {
    const { begin, end } = store.filterSearchData
    window.open(
      `#/supply_chain/process/report/ingredients?sku_id=${data.original.sku_id}&begin=${begin}&end=${end}`,
    )
  }

  handleExportReport = () => {
    const url = urlToParams(store.filterSearchData)
    window.open(`/stock/process/report/achievement/export?${url}`)
  }

  handleSearchRequest = (pagination) => {
    return store.getList(pagination)
  }

  handleTechnics = async (index, i, e) => {
    e.preventDefault()

    const { filter, list } = store
    const item = list.slice()[index].ingredients[i]
    const res = await store.getTechnic(
      Object.assign(
        {},
        filter,
        { ingredient_id: item.sku_id },
        list.slice()[index],
      ),
    )
    const technologyNames = (list) => _.map(list, (t) => t.technic) || []

    RightSideModal.render({
      title: `${res.name}（${res.ingredient_id}）`,
      children: <Technics techData={res} technologyNames={technologyNames} />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '500px',
      },
    })
  }

  renderExpandedRowRender = (data) => {
    const item = store.list[data.index]
    return (
      <TableX
        data={item.ingredients.slice()}
        columns={[
          {
            Header: t('物料名'),
            accessor: 'name',
            Cell: ({ row: { original, index } }) => (
              <a onClick={this.handleTechnics.bind(this, data.index, index)}>
                {`${original.name}（${original.sku_id}）`}
              </a>
            ),
          },
          {
            Header: t('商品类型'),
            accessor: 'goods_type',
            Cell: ({ row: { original } }) => (
              <span>{remarkType(original.goods_type)}</span>
            ),
          },
          {
            Header: t('基本单位'),
            accessor: 'std_unit_name',
          },
          {
            Header: t('领料数量'),
            accessor: 'recv_amount',
            Cell: ({ row: { original } }) => {
              const num = isNumber(original.recv_amount)
                ? Big(original.recv_amount).toFixed(2)
                : '-'
              return <span>{num}</span>
            },
          },
          {
            Header: t('退料数量'),
            accessor: 'return_amount',
            Cell: ({ row: { original } }) => {
              const num = isNumber(original.return_amount)
                ? Big(original.return_amount).toFixed(2)
                : '-'
              return <span>{num}</span>
            },
          },
          {
            Header: t('实际用料'),
            accessor: 'real_ingredients',
            Cell: ({ row: { original } }) => {
              const { recv_amount, return_amount } = original
              const num =
                isNumber(recv_amount) && isNumber(return_amount)
                  ? Big(recv_amount).minus(return_amount).toFixed(2)
                  : '-'

              return <span>{num}</span>
            },
          },
          {
            Header: t('产出数量（基本单位）'),
            accessor: 'product_amount',
            Cell: ({ row: { original } }) => {
              const num = isNumber(original.product_amount)
                ? Big(original.product_amount).toFixed(2)
                : '-'
              return <span>{num}</span>
            },
          },
          {
            Header: t('损耗数量'),
            accessor: 'waste_amount',
            Cell: ({ row: { original } }) => {
              const num = isNumber(original.waste_amount)
                ? Big(original.waste_amount).toFixed(2)
                : '-'
              return <span>{num}</span>
            },
          },
          {
            Header: t('用料金额'),
            accessor: 'ingredients_money',
            Cell: ({ row: { original } }) => {
              const num = isNumber(original.ingredients_money)
                ? Big(original.ingredients_money).toFixed(2)
                : '-'
              return <span>{num}</span>
            },
          },
          {
            Header: renderMaterielPercentageHeader(-1),
            accessor: 'product_percentage',
            Cell: ({ row: { original } }) => {
              const { product_amount, recv_amount, return_amount } = original
              const num = recv_amount - return_amount
              const percentage =
                isNumber(product_amount) &&
                isNumber(num) &&
                _.toNumber(num) !== 0
                  ? Big(product_amount).div(num).times(100).toFixed(2) + '%'
                  : '-'
              return <span>{percentage}</span>
            },
          },
          {
            Header: (
              <HeaderTip
                title={t('理论出成率')}
                tip={t('商品库设置的最新出成率')}
              />
            ),
            accessor: 'theory_product_percentage',
            Cell: ({ row: { original } }) => {
              const { theory_product_percentage } = original

              return <Percentage value={theory_product_percentage} />
            },
          },
          {
            Header: (
              <HeaderTip
                title={t('出成率差值')}
                tip={t('出成率差值=物料出成率-理论出成率')}
              />
            ),
            accessor: 'success_rate',
            Cell: ({ row: { original } }) => {
              const {
                theory_product_percentage,
                product_amount,
                recv_amount,
                return_amount,
              } = original
              const num = +Big(recv_amount).minus(return_amount)
              // 出成率显示‘-’时，差值也显示‘-’
              if (
                num === 0 ||
                !isNumber(product_amount) ||
                !isNumber(recv_amount)
              ) {
                return '-'
              }

              // 物料出成率
              const pro = Big(product_amount).div(num).times(100).toFixed(2)
              // 出成率差值
              const success_rate = isNumber(theory_product_percentage)
                ? Big(pro).minus(theory_product_percentage).toFixed(2)
                : '-'
              return <Percentage value={success_rate} />
            },
          },

          {
            Header: (
              <HeaderTip
                title={t('理论用量率')}
                tip={t(
                  '理论用量率=理论单位用料数量（基本单位）/理论单位产出数量（基本单位）',
                )}
                right
              />
            ),
            accessor: 'theory_used_amount_percentage',
            Cell: ({ row: { original } }) => {
              const { theory_used_amount_percentage } = original

              return <Percentage value={theory_used_amount_percentage} />
            },
          },
          {
            Header: (
              <HeaderTip
                title={t('实际用量率')}
                tip={t(
                  '实际用量率=实际用料数量（基本单位）/实际产出数量（基本单位）',
                )}
                right
              />
            ),
            accessor: 'theory_used_amount_percentage',
            Cell: ({ row: { original } }) => {
              const { real_used_amount_percentage } = original

              return <Percentage value={real_used_amount_percentage} />
            },
          },
          {
            Header: (
              <HeaderTip
                title={t('用量率差值')}
                tip={t('用量率差值=实际用量率-理论用量率')}
                right
              />
            ),
            accessor: 'theory_used_amount_percentage',
            Cell: ({ row: { original } }) => {
              const {
                real_used_amount_percentage,
                theory_used_amount_percentage,
              } = original

              return isNumber(real_used_amount_percentage) &&
                isNumber(theory_used_amount_percentage) ? (
                <Percentage
                  value={Big(real_used_amount_percentage)
                    .minus(theory_used_amount_percentage)
                    .toFixed(2)}
                />
              ) : (
                '-'
              )
            },
          },
        ]}
      />
    )
  }

  render() {
    const { list } = store
    const tableInfo = [
      {
        label: t('商品列表'),
        content: list.length,
      },
    ]

    return (
      <BoxTable
        title={t('商品列表')}
        info={
          <BoxTable.Info>
            <TableTotalText data={tableInfo} />
          </BoxTable.Info>
        }
        action={
          <Button type='primary' onClick={this.handleExportReport}>
            {t('绩效导出')}
          </Button>
        }
      >
        <ManagePaginationV2
          onRequest={this.handleSearchRequest}
          ref={(ref) => {
            this.pagination = ref
          }}
          disablePage
        >
          <ExpandTableX
            keyField='sku_id'
            SubComponent={this.renderExpandedRowRender}
            columns={[
              {
                Header: t('商品ID'),
                accessor: 'sku_id',
              },
              {
                Header: t('商品名'),
                accessor: 'name',
              },
              {
                Header: t('销售规格'),
                accessor: 'ratio',
                Cell: ({ row: { original } }) => {
                  const { std_unit_name, sale_unit_name } = original
                  return (
                    <span>
                      {`${original.ratio}${std_unit_name}/${sale_unit_name}`}
                    </span>
                  )
                },
              },
              {
                Header: t('基本单位'),
                accessor: 'std_unit_name',
              },
              {
                Header: t('用料金额'),
                accessor: 'ingredients_money',
                Cell: ({ row: { original } }) => {
                  const num = isNumber(original.ingredients_money)
                    ? Big(original.ingredients_money).toFixed(2)
                    : '-'
                  return <span>{num}</span>
                },
              },
              {
                Header: t('产出数量（基本单位）'),
                accessor: 'product_amount',
                Cell: ({ row: { original } }) => {
                  const num = isNumber(original.product_amount)
                    ? Big(original.product_amount).toFixed(2)
                    : '-'
                  return <span>{num}</span>
                },
              },
              {
                Header: t('平均成本'),
                accessor: 'avg_price',
                Cell: ({ row: { original } }) => {
                  const num = isNumber(original.avg_price)
                    ? Big(original.avg_price).toFixed(2)
                    : '-'
                  return <span>{num}</span>
                },
              },
              {
                Header: renderProductPercentageHeader(-1),
                accessor: 'product_percentage',
                Cell: ({ row: { original } }) => {
                  const {
                    product_amount,
                    use_amount,
                    std_unit_name,
                    ingredients,
                    // ratio,
                  } = original

                  const percentage =
                    isNumber(product_amount) &&
                    isNumber(use_amount) &&
                    _.toNumber(use_amount) !== 0
                      ? Big(product_amount)
                          .div(use_amount)
                          .times(100)
                          .toFixed(2) + '%'
                      : '-'
                  const isCombination =
                    ingredients.length === 0
                      ? true
                      : !_.every(ingredients.slice(), {
                          std_unit_name: std_unit_name,
                        })
                  return percentage === '-' || isCombination ? (
                    <span style={{ color: '#f33' }}>-</span>
                  ) : (
                    <span>{percentage}</span>
                  )
                },
              },
              {
                Header: TableXUtil.OperationHeader,
                accessor: 'operation',
                Cell: ({ row: { original } }) => {
                  const { begin, end } = store.filterSearchData
                  return (
                    <TableXUtil.OperationCell>
                      <TableXUtil.OperationDetail
                        href={`#/supply_chain/process/report/ingredients?sku_id=${original.sku_id}&begin=${begin}&end=${end}`}
                        open
                      />
                    </TableXUtil.OperationCell>
                  )
                },
              },
            ]}
            data={list.slice()}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default ReportList
