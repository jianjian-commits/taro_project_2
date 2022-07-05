import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'

class Template extends React.Component {
  getOrderTd = (
    { order_id, address_name, picking_amount, route_name, sku_remark },
    std_unit_name,
  ) => {
    return (
      <>
        <td style={{ padding: '2mm 0' }}>{order_id}</td>
        <td style={{ padding: '2mm 0' }}>{address_name}</td>
        <td style={{ padding: '2mm 0' }}>{picking_amount + std_unit_name}</td>
        <td style={{ padding: '2mm 0' }}>{route_name || '-'}</td>
        <td style={{ padding: '2mm 0' }}>{sku_remark || '-'}</td>
      </>
    )
  }

  componentDidUpdate(newProps) {
    if (newProps.data.length) {
      setTimeout(() => window.print(), 0)
    }
  }

  render() {
    const data = this.props.data
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '5mm',
          width: '200mm',
          margin: '0 auto',
          minHeight: '100vh',
          breakAfter: 'always',
        }}
      >
        <h1>{i18next.t('拣货单')}</h1>
        <p style={{ textAlign: 'left', marginBottom: '5mm' }}>
          {i18next.t('打印时间')}：{moment().format('YYYY-MM-DD HH:mm:ss')}
        </p>
        <table
          border='1'
          style={{
            width: '100%',
            color: '#333',
            marginTop: '5mm',
          }}
        >
          <style jsx>
            {`
              th,
              td {
                padding: 2mm 0;
                text-align: center;
              }
            `}
          </style>
          <thead>
            <tr>
              <th>{i18next.t('序号')}</th>
              <th>{i18next.t('商品名称')}</th>
              <th>{i18next.t('建议取货库位')}</th>
              <th>{i18next.t('库存（基本单位）')}</th>
              <th>{i18next.t('拣货总数（基本单位）')}</th>
              <th>{i18next.t('订单号')}</th>
              <th>{i18next.t('商户名')}</th>
              <th>{i18next.t('拣货数（基本单位）')}</th>
              <th>{i18next.t('线路')}</th>
              <th>{i18next.t('订单商品备注')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const rowSpan = d.orders.length
              const firstOrder = d.orders[0]
              const others = d.orders.slice(1)
              return (
                <React.Fragment key={d.sku_id}>
                  <tr>
                    <td rowSpan={rowSpan}>{i + 1}</td>
                    <td rowSpan={rowSpan}>{d.sku_name}</td>
                    {/* <td rowSpan={rowSpan}>{d.shelf_names[0] || '-'}</td> */}
                    <td rowSpan={rowSpan}>
                      {d.shelf_names.length > 0
                        ? d.shelf_names.map((item) => (
                            <div key={item}>{item}</div>
                          ))
                        : '-'}
                    </td>
                    <td rowSpan={rowSpan}>{d.remain + d.std_unit_name}</td>
                    <td rowSpan={rowSpan}>
                      {d.pick_amount_total + d.std_unit_name}
                    </td>
                    {/* 第一个订单 */}
                    {this.getOrderTd(firstOrder, d.std_unit_name)}
                  </tr>
                  {others.map((o) => (
                    <tr key={o.order_id}>
                      {this.getOrderTd(o, d.std_unit_name)}
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        <Flex style={{ justifyContent: 'space-between', marginTop: '5mm' }}>
          <span>{i18next.t('拣货员')}：</span>
          <span style={{ marginRight: '30mm' }}>{i18next.t('复核员')}：</span>
        </Flex>
      </div>
    )
  }
}

Template.propTypes = {
  data: PropTypes.array.isRequired,
}

export default Template
