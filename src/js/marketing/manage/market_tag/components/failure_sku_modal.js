import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Table } from '@gmfe/table'
import { tagDetailStore } from '../stores'
import Big from 'big.js'
import { Price, Button } from '@gmfe/react'

@observer
class FailureSkuModal extends React.Component {
  render() {
    const { errorSkus } = tagDetailStore

    return (
      <div className='gm-padding-10'>
        <span className='gm-text-desc'>
          规则：同类型有效限购活动中，不能有重复商品
        </span>
        <Table
          data={errorSkus.slice()}
          columns={[
            {
              Header: i18next.t('商品信息'),
              id: 'sku_id',
              accessor: (d) => (
                <div>
                  {d.sku_name}
                  <br />
                  {d.sku_id}
                </div>
              ),
            },
            {
              Header: i18next.t('活动名称'),
              accessor: 'promotion_name',
            },
            {
              Header: i18next.t('活动内容'),
              id: 'price',
              accessor: (d) =>
                Big(d.price).div(100).toFixed(2) +
                Price.getUnit() +
                '/' +
                d.sale_unit_name +
                ',限购' +
                d.limit_number +
                d.sale_unit_name,
            },
          ]}
        />
        <div className='text-center gm-margin-tb-15'>
          <Button onClick={this.props.onManual}>
            {i18next.t('不，我手动移除')}
          </Button>
          <span className='gm-gap-5' />
          <Button
            htmlType='submit'
            type='primary'
            onClick={this.props.onAutomation}
          >
            {i18next.t('好，一键移除')}
          </Button>
        </div>
      </div>
    )
  }
}

FailureSkuModal.propTypes = {
  onManual: PropTypes.func,
  onAutomation: PropTypes.func,
}

export default FailureSkuModal
