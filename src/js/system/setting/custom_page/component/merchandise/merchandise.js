import { i18next } from 'gm-i18n'
import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { skuLayoutType } from '../enum'
import { productDefaultImg } from '../../../../../common/service'
class Merchandise extends React.Component {
  render() {
    const { type, skus, old } = this.props
    const isList = type === skuLayoutType.list
    const isAcross = type === skuLayoutType.across
    return (
      <Flex justifyBetween column={isList}>
        {skus &&
          skus.map((sku, i) => {
            return (
              <div
                className={classNames('b-daily-recommend-item-wrap', {
                  'b-daily-recommend-list': isList,
                  'gm-bg-white': old,
                })}
                key={i}
              >
                <Flex
                  column={isAcross}
                  justifyCenter
                  className='b-daily-recommend-item'
                >
                  <div className='square'>
                    <div className='square-inner'>
                      <img
                        src={sku.img_url || productDefaultImg}
                        className='b-daily-recommend-item-img'
                      />
                    </div>
                  </div>
                  <Flex
                    justifyCenter
                    column
                    className='b-daily-recommend-item-text'
                  >
                    <div
                      className={`b-daily-recommend-item-name b-ellipsis${
                        isList ? '-list' : ''
                      }`}
                    >
                      {sku.name}
                    </div>
                    <div
                      className={`b-daily-recommend-item-desc b-ellipsis${
                        isList ? '-list' : ''
                      }`}
                    >
                      {sku.desc || i18next.t('暂无描述')}
                    </div>
                    <div className='b-daily-recommend-item-price-text'>
                      <span style={{ color: 'red' }}>
                        <span className='currency'>¥</span>
                        ******
                      </span>
                    </div>
                    <span className='b-daily-recommend-item-price-icon'>
                      <i className='xfont xfont-plus-circle' />
                    </span>
                  </Flex>
                </Flex>
              </div>
            )
          })}
      </Flex>
    )
  }
}

Merchandise.propTypes = {
  type: PropTypes.oneOf([skuLayoutType.list, skuLayoutType.across]),
  skus: PropTypes.array,
  // 暂时添加旧ui样式，全量时全部删除
  old: PropTypes.bool,
}

Merchandise.defaultProps = {
  type: skuLayoutType.list,
  skus: [],
}

export default Merchandise
