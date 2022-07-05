import React from 'react'
import PropTypes from 'prop-types'
import { BoxTable, Price, Button } from '@gmfe/react'
import TableWithPagination from '../components/table_with_pagination'
import { TableUtil } from '@gmfe/table'
import { SvgInfoCircle } from 'gm-svg'
import { i18next } from 'gm-i18n'
import { getRuleType } from '../filter'
import { apiDownloadPriceRule } from '../api_request'
import openSkuModal from '../components/sku_modal'
import Info from '../components/info'
import TextTip from 'common/components/text_tip'
import TableTotalText from 'common/components/table_total_text'
import BoxTableS from 'common/components/box_table_s'

const PanelRight = (props) => {
  return (
    <div>
      <Button onClick={props.handleDownload}>{i18next.t('导出')}</Button>
    </div>
  )
}

PanelRight.propTypes = {
  handleDownload: PropTypes.func,
}

class View extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // 前端分页用
      pagination: {
        limit: 10,
        offset: 0,
      },
    }
  }

  handleDownload = () => {
    const { _id } = this.props
    apiDownloadPriceRule(_id, 'category_2')
  }

  handleToPage = (pageObj) => {
    const newPagination = { ...this.state.pagination, ...pageObj }
    this.setState({
      pagination: newPagination,
    })
  }

  handleOpenSkuModal = (categoryItem) => {
    const { salemenu_id, salemenu_name } = this.props

    openSkuModal({
      categoryItem,
      salemenuInfo: {
        salemenu_id,
        salemenu_name,
      },
    })
  }

  render() {
    const { category_2_list = [], fee_type } = this.props
    const { pagination } = this.state

    const paginationObj = {
      ...pagination,
      count: category_2_list.length,
    }

    return (
      <BoxTableS
        // info={`${i18next.t('分类数')}：${category_2_list.length}`}
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('分类数'),
                  content: category_2_list.length,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={<PanelRight handleDownload={this.handleDownload} />}
      >
        <TableWithPagination
          data={category_2_list}
          loading={!category_2_list.length}
          getTrProps={(state, row = {}) => {
            if (!row.original) return {}
            const { check_status } = row.original
            // 分类中是否存在商品小于等于0(check_status = false), 存在标红
            return check_status ? {} : { className: 'gm-bg-invalid' }
          }}
          pagination={paginationObj}
          handlePagination={this.handleToPage}
          columns={[
            {
              Header: i18next.t('分类名/分类ID'),
              id: 'category',
              accessor: (d) => (
                <a
                  href='javascript:;'
                  onClick={this.handleOpenSkuModal.bind(this, d)}
                >
                  <div>
                    {d.category_1_name}/{d.category_2_name}
                    {d.check_status || (
                      <TextTip
                        content={i18next.t('存在运算价格为负或为零的商品')}
                      >
                        <span>
                          <SvgInfoCircle style={{ color: '#000' }} />
                        </span>
                      </TextTip>
                    )}
                  </div>
                  <div className='gm-text-desc'>{d.category_2_id}</div>
                </a>
              ),
            },
            {
              Header: (
                <span>
                  {i18next.t('计算规则')}
                  <Info />
                </span>
              ),
              id: 'rule',
              accessor: (d) => (
                <span>
                  {d.yx_price >= 0 && getRuleType(d.rule_type).operator}
                  {d.yx_price}
                  {d.rule_type === 1 && Price.getUnit(fee_type)}
                </span>
              ),
            },
            {
              Header: TableUtil.OperationHeader,
              width: 100,
              Cell: () => <TableUtil.OperationCell>-</TableUtil.OperationCell>,
            },
          ]}
        />
      </BoxTableS>
    )
  }
}

View.propTypes = {
  _id: PropTypes.string,
  salemenu_id: PropTypes.string,
  salemenu_name: PropTypes.string,
  category_2_list: PropTypes.array,
}

export default View
