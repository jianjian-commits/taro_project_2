import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { store } from '../../store'
import classNames from 'classnames'
import _ from 'lodash'
import { searchByProduct } from '../../utils'

const ProductList = observer((props) => {
  const { productMenu } = store

  const { expand } = props

  const menuRef = useRef()

  let lastScrollTop

  const scroll = async () => {
    const {
      productMenuSearchOption: { offset, limit },
      productMenuCount,
      getProductMenuLoading,
    } = store
    if (getProductMenuLoading) {
      return
    }
    if (offset + limit > productMenuCount) {
      return
    }
    const { scrollTop, scrollHeight, offsetHeight } = menuRef.current
    if (scrollTop > lastScrollTop) {
      if (scrollTop + offsetHeight >= scrollHeight - 500) {
        store.setProductMenuSearchOption(offset + limit, 'offset')
        store.setGetProductMenuLoading(true)
        await store.getProductMenu()
        store.setGetProductMenuLoading(false)
      }
    }
    lastScrollTop = scrollTop
  }

  return (
    <>
      <ul
        ref={menuRef}
        className={classNames(
          'product-list',
          expand ? 'product-list-unfold' : 'product-list-fold'
        )}
        onScroll={_.throttle(scroll, 500)}
      >
        {_.map(productMenu, (item, index) => (
          <li
            className={classNames(
              index === 0 && 'gm-margin-top-10',
              'product-list-item gm-margin-bottom-10 gm-padding-lr-20 gm-padding-tb-10',
              item.selected && 'product-list-item-selected'
            )}
            key={index}
            onClick={() => searchByProduct(item)}
          >
            <h3 className='gm-margin-0 gm-margin-bottom-5'>{item.name}</h3>
            <p className='gm-margin-0'>{item.value}</p>
          </li>
        ))}
      </ul>
    </>
  )
})

ProductList.propTypes = {
  expand: PropTypes.bool,
}

export default ProductList
