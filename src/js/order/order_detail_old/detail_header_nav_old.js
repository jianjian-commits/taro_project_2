// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import { Flex, Popover } from '@gmfe/react'
import { Link } from 'react-router-dom'
import { Request } from '@gm-common/request'
import qs from 'query-string'
import PropTypes from 'prop-types'

function HeaderNav(props) {
  const { query, viewType, children } = props

  const showNav =
    viewType === 'view' &&
    query &&
    query.offset != null &&
    !isNaN(query.offset) &&
    query.offset >= 0

  const [lastLink, setLastLink] = useState('')
  const [nextLink, setNextLink] = useState('')

  useEffect(() => {
    if (showNav) {
      let { offset, search } = query
      let targetOffset, limit, lastIndex, nextIndex

      const getLink = (item, offset, search) => {
        if (item && item.id && offset >= 0) {
          return `/order_manage/order/list/detail?${qs.stringify({
            id: item.id,
            offset,
            search,
          })}`
        }
      }

      offset = Number(offset)
      if (offset >= 1) {
        targetOffset = offset - 1
        limit = 3
        lastIndex = 0
        nextIndex = 2
      } else {
        targetOffset = offset + 1
        limit = 1
        lastIndex = -1
        nextIndex = 0
      }

      const data = {
        offset: targetOffset,
        limit,
      }
      if (search) Object.assign(data, qs.parse(search))

      Request('/station/orders')
        .data(data)
        .get()
        .then((json) => {
          const list = json.data.list
          setLastLink(getLink(list[lastIndex], offset - 1, search))
          setNextLink(getLink(list[nextIndex], offset + 1, search))
        })
    }
  }, [])

  const renderNav = (link, direction) => {
    return (
      showNav &&
      (link ? (
        <Link
          to={link}
          replace
          className='gm-block gm-text'
          style={{ textDecoration: 'none', flex: 'none' }}
        >
          <Flex
            alignCenter
            none
            className={`gm-padding-${direction}-10`}
            style={{ height: '100%' }}
          >
            <Popover
              popup={
                <div className='gm-padding-5' style={{ width: 80 }}>
                  {direction === 'left'
                    ? i18next.t('查看上一个订单详情')
                    : i18next.t('查看下一个订单详情')}
                </div>
              }
              right={direction === 'right'}
              type='hover'
            >
              <i className={`xfont xfont-${direction}`} />
            </Popover>
          </Flex>
        </Link>
      ) : (
        <Flex
          alignCenter
          none
          className={`gm-padding-${direction}-10 b-order-defail-header-arrow disabled`}
        >
          <i className={`xfont xfont-${direction}`} />
        </Flex>
      ))
    )
  }

  return (
    <React.Fragment>
      {renderNav(lastLink, 'left')}
      {children}
      {renderNav(nextLink, 'right')}
    </React.Fragment>
  )
}

HeaderNav.propTypes = {
  query: PropTypes.object,
  viewType: PropTypes.string,
}

export default HeaderNav
