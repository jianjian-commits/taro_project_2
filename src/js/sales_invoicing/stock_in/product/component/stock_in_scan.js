import { i18next } from 'gm-i18n'
import React from 'react'
import { Form, Tip, Input, Button } from '@gmfe/react'
import { isNumberCombination } from '../../../../common/util'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'

// 未理逻辑，照搬之前的
@observer
class StockInScan extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      barcode: '',
      inSearch: false,
    }
    this.tip = null
  }

  handleSearchByBarcode = () => {
    const { barcode } = this.state
    const { settle_supplier_id } = store.stockInReceiptDetail

    if (!barcode || barcode.length > 13 || !isNumberCombination(barcode)) {
      return Tip.warning(i18next.t('规格条码仅支持限13位数字组成'))
    }

    this.setState({ inSearch: true })

    Request('/stock/in_stock_sku/scan')
      .data({ settle_supplier_id, barcode })
      .code([0, 4])
      .get()
      .then((json) => {
        if (json.code === 0) {
          this.props.onSearchByBarcode(json.data)
        } else if (json.code === 4) {
          Tip.warning(i18next.t('未找到相应的规格商品'))
        }

        this.setState({ inSearch: false, barcode: '' }, () => {
          this.tip = null
        })
      })
  }

  handleChangeBarcode = (val) => {
    const value = val.target ? val.target.value : val
    if (this.tip) {
      // 因为扫码枪是一个个字符返回的，所以这里只需要提醒一次就好
      return
    }

    if (this.state.inSearch) {
      this.tip = Tip.warning(i18next.t('当前入库任务执行中，请稍后再试'))
      return
    }

    this.setState({
      barcode: value,
    })
  }

  render() {
    return (
      <Form
        inline
        onSubmit={this.handleSearchByBarcode}
        className='gm-padding-5'
      >
        <Input
          maxLength={13}
          value={this.state.barcode}
          className='form-control input-sm'
          name='barcode'
          autoFocus
          autoComplete='off'
          style={{ width: '200px' }}
          placeholder={i18next.t('请扫描规格条码搜索')}
          onChange={this.handleChangeBarcode}
        />

        <Button type='primary' htmlType='submit'>
          {i18next.t('搜索')}
        </Button>
      </Form>
    )
  }
}

StockInScan.propTypes = {
  onSearchByBarcode: PropTypes.func.isRequired,
}

export default StockInScan
