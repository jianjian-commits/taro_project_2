import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'

class MerchandiseTitle extends React.Component {
  render() {
    const { text, labels, multipleTitle, oldTitle } = this.props

    const renderOld = (
      <div className='b-product-title-wrap gm-padding-tb-10'>
        <div className='b-product-title'>
          <div className='b-product-title-line b-opacity-light' />
          <div className='b-product-title-line b-opacity-deep' />
          <div className='b-product-title-line b-opacity-light b-margin-right-22' />
          <span className='text-primary'>{text || i18next.t('商品组')}</span>
          <div className='b-product-title-line b-opacity-light b-margin-left-22' />
          <div className='b-product-title-line b-opacity-deep' />
          <div className='b-product-title-line b-opacity-light' />
        </div>
      </div>
    )

    const renderNormal = (
      <div className='b-product-title-wrap gm-margin-bottom-10'>
        <div className='b-product-title'>
          <span className='text-primary'>{text || i18next.t('商品组')}</span>
        </div>
      </div>
    )

    const renderMultiple = () => {
      const promotions = _.filter(labels, (i) => !!i.promotion_id)
      // 默认显示4个
      const titles = _.slice(
        _.map(promotions, (i) => i.name),
        0,
        3,
      )

      return (
        <div className='b-product-title-wrap gm-margin-bottom-10'>
          <div className='gm-flex gm-flex-justify-around b-product-title'>
            <span className='text-primary'>{text || i18next.t('商品组')}</span>
            {_.map(titles, (text, index) => (
              <span key={index} className='text-primary'>
                {text}
              </span>
            ))}
          </div>
        </div>
      )
    }

    if (oldTitle) {
      return renderOld
    }

    if (multipleTitle) {
      return renderMultiple()
    }

    return renderNormal
  }
}

MerchandiseTitle.propTypes = {
  text: PropTypes.string.isRequired,
  labels: PropTypes.array,
  multipleTitle: PropTypes.bool,
  // 暂时添加旧ui样式，全量时全部删除
  oldTitle: PropTypes.bool,
}

export default MerchandiseTitle
