import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'

class Template extends React.Component {
  componentDidUpdate(newProps) {
    if (newProps.data.length) {
      setTimeout(() => window.print(), 0)
    }
  }

  render() {
    const data = this.props.data
    return (
      <>
        {data.map((order) => (
          <div
            key={order.order_id}
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
            <Flex style={{ justifyContent: 'space-between', marginTop: '5mm' }}>
              <div>
                <span className='gm-margin-right-20'>
                  {i18next.t('订单号')}：{order.order_id}
                </span>
                <span className='gm-margin-right-20'>
                  {i18next.t('商户')}：{order.address_name}
                </span>
                <span>
                  {i18next.t('线路')}：{order.route_name}
                </span>
              </div>
              <span>
                {i18next.t('打印时间')}：
                {moment().format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </Flex>
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
                  <th>{i18next.t('拣货数')}</th>
                  <th>{i18next.t('订单商品备注')}</th>
                </tr>
              </thead>
              <tbody>
                {order.details.map((d, i) => (
                  <tr key={d.sku_id}>
                    <td>{i + 1}</td>
                    <td>{d.sku_name}</td>
                    <td>
                      {d.shelf_names.length > 0
                        ? d.shelf_names.map((item) => (
                            <div key={item}>{item}</div>
                          ))
                        : '-'}
                    </td>
                    <td>{d.remain + d.std_unit_name}</td>
                    <td>{d.picking_amount + d.std_unit_name}</td>
                    <td>{d.sku_remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Flex style={{ justifyContent: 'space-between', marginTop: '5mm' }}>
              <span>{i18next.t('拣货员')}：</span>
              <span style={{ marginRight: '30mm' }}>
                {i18next.t('复核员')}：
              </span>
            </Flex>
          </div>
        ))}
      </>
    )
  }
}

Template.propTypes = {
  data: PropTypes.array.isRequired,
}

export default Template
