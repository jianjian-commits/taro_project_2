import React from 'react'
import { Request } from '@gm-common/request'
import { Popover, Flex, ToolTip } from '@gmfe/react'
import { saleReferencePrice } from '../../common/enum'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import classNames from 'classnames'
import PropTypes from 'prop-types'

/**
 * 参考价格
 * @param where {number} 功能模块（1商品，2采购任务，3订单）
 * @param refPriceTypeSet {function} 选择类型事件
 */
const refPriceTypeHOC = (where, refPriceTypeSet = null) => (Com) => {
  return class WrapCom extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        /**
         * @type {number}
         * 类型（1供应商最近询价, 2供应商最近采购价, 3供应商最近入库价, 4库存均价, 5最近询价, 6最近入库价, 7最近采购价, 9供应商周期报价）
         */
        refPriceType: 1,
      }
    }

    componentDidMount() {
      // 拉取参考价
      Request('/station/ref_price_type/get')
        .data({ where })
        .get()
        .then((json) => {
          const { type } = json.data
          refPriceTypeSet && refPriceTypeSet(type)
          this.setState({ refPriceType: type })
        })
    }

    handleSetFefPriceType = (type) => {
      this.setState({ refPriceType: type })
      // 记录当前参考价
      return Request('/station/ref_price_type/set')
        .data({ where, type })
        .post()
        .then((json) => {
          refPriceTypeSet && refPriceTypeSet(type)
          return json
        })
    }

    render() {
      const props = {
        ...this.props,
        refPriceType: this.state.refPriceType,
        postRefPriceType: this.handleSetFefPriceType,
      }
      return <Com {...props} />
    }
  }
}

class RefPriceToolTip extends React.Component {
  render() {
    const { name, isShowTip = true } = this.props
    return (
      <ToolTip
        top
        popup={
          <div
            className='gm-border gm-padding-5 gm-bg gm-text-12'
            style={{
              minWidth: '130px',
              display: isShowTip ? undefined : 'none',
            }}
          >
            {i18next.t('来源')}：{name}
          </div>
        }
      >
        <div>{i18next.t('参考成本')}</div>
      </ToolTip>
    )
  }
}

RefPriceToolTip.propTypes = {
  name: PropTypes.string.isRequired,
  isShowTip: PropTypes.bool,
}

class RefPriceTypeSelect extends React.Component {
  handleChangeReferencePrice(type) {
    this.props.postRefPriceType(type)
  }

  render() {
    // filterType为要不展示的选项
    const { refPriceType, filterType = [] } = this.props
    const { name, type } =
      _.find(saleReferencePrice, (v) => v.type === refPriceType) || {}
    const isShowTip = !filterType.includes(type)
    return (
      <Flex alignCenter>
        <RefPriceToolTip name={name} isShowTip={isShowTip} />
        <Popover
          showArrow
          type='click'
          popup={
            <div className='gm-padding-tb-10 gm-padding-lr-15 b-sale-reference-price'>
              {_.map(saleReferencePrice, (item, i) =>
                filterType.includes(item.type) ? null : (
                  <div
                    key={i}
                    onClick={this.handleChangeReferencePrice.bind(
                      this,
                      item.type,
                    )}
                    className={classNames(
                      'gm-border-bottom gm-margin-bottom-5 gm-padding-bottom-5',
                      {
                        'text-primary': item.type === type,
                      },
                    )}
                  >
                    {item.name}
                  </div>
                ),
              )}
            </div>
          }
        >
          <i
            className='ifont ifont-down-triangle text-primary gm-margin-left-5 gm-text-12'
            style={{ cursor: 'pointer' }}
          />
        </Popover>
      </Flex>
    )
  }
}

RefPriceTypeSelect.propTypes = {
  refPriceType: PropTypes.number.isRequired,
  postRefPriceType: PropTypes.func.isRequired,
  filterType: PropTypes.array,
}

export { refPriceTypeHOC, RefPriceTypeSelect, RefPriceToolTip }
