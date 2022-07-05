import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Button } from '@gmfe/react'
import _ from 'lodash'

class RowContent extends React.Component {
  render() {
    const ids = []
    const num = []
    const { data, isLast } = this.props
    const numStyle = { borderLeft: 0 }
    const numTitleStyle = {
      width: '120px',
      padding: '8px',
      borderLeft: 0,
    }
    if (isLast) {
      numStyle.borderBottom = 0
      numTitleStyle.borderBottom = 0
    }
    _.each(data, (row, i) => {
      // 空对象与非空对象分别处理
      if (Object.keys(row).length) {
        ids.push(
          <Flex
            key={i}
            flex={1}
            alignCenter
            justifyCenter
            style={{ borderLeft: 0 }}
            className='gm-border b-freight-tab-border'
          >
            {row.sort_id}
          </Flex>
        )

        num.push(
          <Flex
            key={i}
            flex={1}
            alignCenter
            justifyCenter
            style={numStyle}
            className='gm-border b-freight-tab-border'
          >
            {row.amount + (row.unit === i18next.t('斤') ? '' : row.unit)}
          </Flex>
        )
      } else {
        const air = (
          <Flex key={i} flex={1} style={{ borderRight: '1px solid white' }} />
        )
        ids.push(air)
        num.push(air)
      }
    })

    return (
      <Flex column>
        <Flex>
          <Flex
            style={{ width: '120px', padding: '8px', borderLeft: 0 }}
            className='gm-border b-freight-tab-border'
            justifyCenter
          >
            {i18next.t('分拣序号')}
          </Flex>
          {ids}
        </Flex>
        <Flex>
          <Flex
            style={numTitleStyle}
            className='gm-border b-freight-tab-border'
            justifyCenter
          >
            {i18next.t('数量')}
          </Flex>
          {num}
        </Flex>
      </Flex>
    )
  }
}

class ListItem extends React.Component {
  constructor(props) {
    super(props)
    this.COL_NUM = 8
  }

  beauty(rows) {
    if (rows.length % this.COL_NUM === 0) {
      return rows
    }
    const fix = this.COL_NUM - (rows.length % this.COL_NUM)
    for (let i = 0; i < fix; i++) {
      rows.push({})
    }
    return rows
  }

  render() {
    const { list } = this.props

    let rows = list.rows
    let contents = []
    // 为模拟table的最后一行的内容补充为8个数据列长度, 即rows长度一定为8的倍数
    rows = this.beauty(rows)

    // 从整体上看会有多少行
    let len = Math.ceil(rows.length / this.COL_NUM)
    for (let i = 0; i < len; i++) {
      // 整体意义上的每一行的数据
      let data = rows.slice(i * this.COL_NUM, i * this.COL_NUM + this.COL_NUM)

      contents.push(<RowContent data={data} key={i} isLast={i === len - 1} />)
    }
    const ObRemarks = {}
    const remarks = []
    _.each(rows, (row) => {
      if (row.remark) {
        const key = i18next.t('KEY241', {
          VAR1: row.sort_id,
        }) /* src:'序'+row.sort_id => tpl:序${VAR1} */
        if (!ObRemarks[key]) {
          ObRemarks[key] = row.remark
        }
      }
    })
    for (let remark in ObRemarks) {
      remarks.push(
        <Flex
          key={remark}
          className='gm-padding-5 gm-margin-right-15'
          alignCenter
        >
          {remark},{ObRemarks[remark]}
        </Flex>
      )
    }

    return (
      <div className='list-item-box gm-margin-bottom-10'>
        <Flex row className='gm-border sorting-list-item'>
          <Flex
            style={{ width: '180px' }}
            alignCenter
            justifyCenter
            column
            wrap
            className='gm-border-right'
          >
            <Flex justifyCenter>{list.title.product_name}</Flex>
            <Flex justifyCenter>{list.title.spec}</Flex>
          </Flex>
          <Flex flex={1} column>
            {contents}
            <Flex className='gm-border-top'>
              <Flex
                style={{
                  width: '120px',
                  padding: '8px',
                  borderLeft: 0,
                  borderBottom: 0,
                }}
                className='gm-border b-freight-tab-border'
                justifyCenter
              >
                {i18next.t('备注')}
              </Flex>
              <Flex flex={1} wrap>
                {remarks}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </div>
    )
  }
}

class SortingDetail extends React.Component {
  constructor(props) {
    super(props)
    this.handleClickBack = ::this.handleClickBack
  }

  handleClickBack() {
    const { handleClickBack } = this.props
    handleClickBack()
  }

  handlePrint() {
    window.print()
  }

  render() {
    const { data } = this.props
    let orders = {}
    let lists = []
    // 根据 product_id 对所有的订单进行分类
    data.forEach((order) => {
      if (orders[order.product_id]) {
        orders[order.product_id].push(order)
      } else {
        orders[order.product_id] = [order]
      }
    })

    // 排序并且映射lists
    for (let productId in orders) {
      var ordersSameProductId = orders[productId]
      ordersSameProductId.sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })
      lists.push({
        title: {
          product_name: ordersSameProductId[0].name,
          spec: ordersSameProductId[0].spec,
        },
        rows: ordersSameProductId.map((order) => {
          return {
            sort_id: order.sort_id,
            amount: order.amount,
            unit: order.unit,
            remark: order.spu_remark,
          }
        }),
      })
    }

    // 构建清单详情内容,由多个table组成
    let listContent = lists.map((list, i) => {
      return <ListItem key={i} list={list} />
    })

    return (
      <div className='gm-padding-15 gm-bg gm-border'>
        <Flex row className='hidden-print'>
          <Flex flex={1}>
            <Button onClick={this.handleClickBack}>{i18next.t('返回')}</Button>
          </Flex>
          <Flex>
            <Button onClick={this.handlePrint}>{i18next.t('打印')}</Button>
          </Flex>
        </Flex>
        <div className='gm-padding-15 hidden-print' />
        {/* 渲染详情列表 */}
        <div className='sorting-detial-list-item-content'>{listContent}</div>
      </div>
    )
  }
}

SortingDetail.propTypes = {
  handleClickBack: PropTypes.func,
  data: PropTypes.array,
}

SortingDetail.defaultProps = {
  handleClickBack: () => {
    console.info("it's better to pass the handleClickBack function")
  },
  data: [],
}

export default SortingDetail
