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
              <th>{i18next.t('计划拣货（基本单位）')}</th>
              <th style={{ width: 100 }}>{i18next.t('实际拣货')}</th>
              <th style={{ width: 200 }}>{i18next.t('备注')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.sku_id}>
                <td>{i + 1}</td>
                <td>{d.sku_name}</td>
                <td>
                  {d.shelf_names.length > 0
                    ? d.shelf_names.map((item) => <div key={item}>{item}</div>)
                    : '-'}
                </td>
                <td>{d.pick_amount_total + d.std_unit_name}</td>
                <td />
                <td />
              </tr>
            ))}
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
