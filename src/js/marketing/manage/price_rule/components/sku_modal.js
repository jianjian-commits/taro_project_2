import React from 'react'
import { RightSideModal, Price, Flex } from '@gmfe/react'
import { Table } from '@gmfe/table'
import { money } from 'common/filter'
import { apiFetchSkuSalemenu } from '../api_request'
import { getRuleType } from '../filter'
import { i18next } from 'gm-i18n'
import Big from 'big.js'

class ModalChildren extends React.Component {
  state = {
    list: [],
    isLoading: true,
  }

  async componentDidMount() {
    const { data } = this.props
    const { salemenu_id } = data.salemenuInfo
    const { category_2_id } = data.categoryItem

    const req = {
      salemenu_id,
      category2_ids: JSON.stringify([category_2_id]),
      limit: 9999,
    }

    const list = await apiFetchSkuSalemenu(req).then((json) => json.data)
    this.setState({ list, isLoading: false })
  }

  render() {
    const { salemenu_name } = this.props.data.salemenuInfo
    const {
      category_2_name,
      category_2_id,
      rule_type,
      yx_price,
    } = this.props.data.categoryItem
    const { list, isLoading } = this.state

    const rule =
      `${yx_price >= 0 ? getRuleType(rule_type).operator : ''}` + yx_price
    const unit = (sale_unit_name, fee_type) =>
      rule_type === 2 ? '' : `${Price.getUnit(fee_type)}/${sale_unit_name}`

    const getPrice = (n = 0) => {
      let result
      const sale_price = Big(n).div(100)
      if (+rule_type === 1) {
        result = sale_price.plus(yx_price).toFixed(2)
      } else {
        result = sale_price.times(yx_price).toFixed(2)
      }
      return result
    }

    const getRulePrice = (price, sale_unit_name, fee_type) => {
      return price + Price.getUnit(fee_type) + '/' + sale_unit_name
    }

    return (
      <Flex column style={{ height: '100%' }}>
        <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
          <div>
            <strong
              className='gm-padding-left-5'
              style={{ borderLeft: '3px solid rgb(54, 173, 58)' }}
            >
              {i18next.t('已锁价商品列表')}（{list.length}）
            </strong>
          </div>
          <Flex wrap className='gm-padding-top-15'>
            <span className='gm-margin-right-15'>
              {i18next.t('分类名/ID')}: {category_2_name}
              {category_2_id}
            </span>
            <span className='gm-margin-right-15'>
              {i18next.t('报价单名称')}: {salemenu_name}
            </span>
          </Flex>
        </div>

        <div style={{ overflowY: 'auto' }}>
          <Table
            data={list}
            loading={isLoading}
            className='gm-padding-tb-10 gm-padding-lr-20'
            getTrProps={(state, row = {}) => {
              const { sale_price } = row.original || {}
              // 分类中是否存在商品小于等于0, 存在标红
              return getPrice(sale_price) <= 0
                ? { className: 'gm-bg-invalid' }
                : {}
            }}
            columns={[
              {
                Header: i18next.t('商品名/商品ID'),
                id: 'sku',
                accessor: (d) => (
                  <div>
                    <div>{d.sku_name}</div>
                    <div>{d.sku_id}</div>
                  </div>
                ),
              },
              {
                Header: i18next.t('规格'),
                id: 'spec',
                accessor: (d) => (
                  <div>
                    {d.sale_ratio}
                    {d.std_unit_name_forsale}/{d.sale_unit_name}
                  </div>
                ),
              },
              {
                Header: i18next.t('原价'),
                id: 'sale_price',
                accessor: (d) => (
                  <div>
                    <div>
                      {money(d.sale_price) + Price.getUnit(d.fee_type)}/
                      {d.sale_unit_name}
                    </div>
                  </div>
                ),
              },
              {
                Header: i18next.t('计算规则'),
                id: 'rule',
                accessor: (d) => (
                  <div>
                    <div>
                      {rule}
                      {unit(d.sale_unit_name, d.fee_type)}
                    </div>
                  </div>
                ),
              },
              {
                Header: i18next.t('规则价'),
                id: 'rule_price',
                accessor: (d) => (
                  <div>
                    <div>
                      {getRulePrice(
                        getPrice(d.sale_price),
                        d.sale_unit_name,
                        d.fee_type
                      )}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Flex>
    )
  }
}

export default (data) => {
  RightSideModal.render({
    children: <ModalChildren data={data} />,
    onHide: RightSideModal.hide,
    style: {
      width: '900px',
    },
  })
}
