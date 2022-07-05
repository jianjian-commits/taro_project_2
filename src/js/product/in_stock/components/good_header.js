import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Price } from '@gmfe/react'
import PropTypes from 'prop-types'

class GoodHeader extends React.Component {
  getStatusLable = (status, statusMap) => {
    let statusStyle
    switch (status) {
      case -1:
      case 0:
        statusStyle = { background: '#ED6089' }
        break
      case 1:
      case 2:
        statusStyle = { background: '#86B04E' }
        break
      case 3:
      case 4:
        statusStyle = { background: '#43545C' }
        break
      default:
        break
    }
    return { statusName: statusMap[status], statusStyle }
  }

  render() {
    const { origin, settle_supplier_name, statusMap } = this.props
    const {
      unit_price,
      quantity,
      std_unit,
      status,
      money,
      displayName,
    } = origin
    const lable = this.getStatusLable(status, statusMap)
    return (
      <Flex column className='gm-padding-tb-10 gm-back-bg'>
        <Flex>
          <div
            style={{ ...lable.statusStyle, color: '#fff', padding: '0 5px' }}
          >
            {lable.statusName}
          </div>
          <strong className='gm-margin-lr-10'>{displayName}</strong>
        </Flex>
        <Flex row className='gm-padding-top-15 gm-text-12'>
          <Flex className='gm-padding-right-15'>
            {i18next.t('供应商')}：{settle_supplier_name || '-'}
          </Flex>
          <div className='gm-margin-right-15'>
            {i18next.t('入库价')}：
            {`${unit_price}${Price.getUnit() + '/'}${std_unit}`}
          </div>
          <div className='gm-margin-right-15'>
            {i18next.t('入库数')}：{`${quantity}${std_unit}`}
          </div>
          <div className='gm-margin-right-15'>
            {i18next.t('入库金额')}：{`${money}${Price.getUnit()}`}
          </div>
        </Flex>
      </Flex>
    )
  }
}

GoodHeader.propTypes = {
  origin: PropTypes.object.isRequired,
  statusMap: PropTypes.object.isRequired,
  settle_supplier_name: PropTypes.string.isRequired,
}

export default GoodHeader
