import React, { useState, useEffect, useRef, useMemo } from 'react'
import { PropTypes } from 'prop-types'
import { Flex, Popover } from '@gmfe/react'
import { SvgMore, SvgDoubleRight } from 'gm-svg'
import { is } from '@gm-common/tool'
import classNames from 'classnames'
import _ from 'lodash'

const ITEM_WIDTH = 310 + 'px'
const ITEM_WRAPPER_WIDTH = 326 // item的宽度310px + border + padding + margin，有变动的时候手动计算吧
const ITEM_CONTENT_WIDTH = 250

// 规格
const Item = ({
  title,
  info,
  group,
  index,
  active,
  onMore,
  onClick,
  more,
  popup,
  ...rest
}) => {
  const handleMore = (e) => {
    // e.stopPropagation()
    onMore && onMore()
  }

  const handleClick = () => {
    onClick && onClick()
  }

  return (
    <Flex
      alignCenter
      justifyCenter
      column
      width={ITEM_WIDTH}
      className={classNames('gm-padding-10 gm-cursor gm-margin-tb-5 group', {
        active,
      })}
      style={{ position: 'relative' }}
      onClick={handleClick}
      data-id='initSaleCheckDetailItem'
      {...rest}
    >
      {/* ... */}
      <Popover showArrow type='click' popup={popup(group, index)}>
        <span style={{ position: 'absolute', right: '9px', top: '3px' }}>
          <SvgMore
            style={{ display: 'inline-block' }}
            className='gm-text-16'
            onClick={() => handleMore(group, index)}
          />
        </span>
      </Popover>
      <div
        style={{ width: ITEM_CONTENT_WIDTH + 'px' }}
        className='gm-text-ellipsis text-center'
      >
        {title}
      </div>
      <div
        style={{ width: ITEM_CONTENT_WIDTH + 'px' }}
        className='gm-padding-top-10 gm-text-desc gm-text-ellipsis text-center'
      >
        {info}
      </div>
    </Flex>
  )
}
Item.propTypes = {
  title: PropTypes.string,
  info: PropTypes.string,
  group: PropTypes.object,
  active: PropTypes.bool,
  onMore: PropTypes.func,
  onClick: PropTypes.func,
  more: PropTypes.any,
  index: PropTypes.number,
  popup: PropTypes.func,
}
Item.defaultProps = {
  popup: _.noop,
}

// 规格容器
const Group = ({
  active,
  children,
  group,
  popup,
  onMore,
  onChange,
  className,
  ...rest
}) => {
  const containerDom = useRef()
  const [activeIndex, setActiveIndex] = useState(active)
  const [innerGroup, setInnerGroup] = useState(group)
  const [column, setColumn] = useState(0) // 列数
  const [row, setRow] = useState(0) // 行数
  const [isOpen, setIsOpen] = useState(true) // 是否展开

  const handleResize = () => {
    const containerWidth = containerDom.current.clientWidth
    const column = Math.floor(containerWidth / ITEM_WRAPPER_WIDTH)
    const row = Math.ceil(group.length / column)
    setColumn(column)
    setRow(row)
  }

  // activeIndex可由外界控，有可能超出group长度，默认回到第一个
  const availIndex = useMemo(() => {
    const { length } = group
    if (!active || active > length - 1) return 0
    return active
  }, [group])

  useEffect(() => {
    // 初始化 - 设置容器宽度
    handleResize()
    // 切换的时候默认选择第一个
    setActiveIndex(availIndex)
    setInnerGroup(group)
    setIsOpen(true)
  }, [group])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [group])

  useEffect(() => {
    let newTaps = group
    if (!isOpen) {
      newTaps = group.slice(0, column)
    }
    setInnerGroup(newTaps)
  }, [isOpen, column])

  const handleClick = (group, index) => {
    if (onChange) {
      const result = onChange(group, index)
      if (is.promise(result)) {
        result.then((i) => {
          const index = i === null || i === undefined ? index : i // i可能为0
          setActiveIndex(index)
        })
      } else {
        setActiveIndex(index)
      }
    }
  }

  const handleMore = (group, index) => {
    onMore && onMore(group, index)
  }

  const handleToggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <Flex
      className={classNames(
        'b-sepc-group gm-padding-tb-5 gm-padding-left-20',
        className
      )}
      style={{ position: 'relative', paddingRight: '40px' }}
      {...rest}
    >
      {/* 添加 */}
      {children && (
        <Flex className='left' style={{ minWidth: '170px' }}>
          {children}
        </Flex>
      )}
      {/* 规格 */}
      <div
        className='gm-flex-flex gm-flex gm-flex-wrap right'
        ref={containerDom}
      >
        {_.map(innerGroup, (group, index) => (
          <Item
            key={index}
            title={group.title}
            info={group.info}
            group={group}
            index={index}
            popup={popup}
            active={index === activeIndex}
            onClick={() => handleClick(group, index)}
            onMore={() => handleMore(group, index)}
          />
        ))}
      </div>
      {/* 展开 */}
      <Flex
        className={classNames(
          { 'gm-flex-align-center': isOpen },
          { 'gm-flex-align-end': !isOpen },
          'gm-cursor'
        )}
        onClick={handleToggleOpen}
        style={{ position: 'absolute', right: '20px', top: 0, height: '100%' }}
      >
        {row > 1 && (
          <SvgDoubleRight
            className='gm-text-primary gm-text-16 gm-margin-bottom-5'
            style={{ transform: isOpen ? 'rotate(-90deg)' : 'rotate(90deg)' }}
          />
        )}
      </Flex>
    </Flex>
  )
}
Group.propTypes = {
  className: PropTypes.string,
  active: PropTypes.number,
  group: PropTypes.array,
  popup: PropTypes.func,
  onMore: PropTypes.func,
  onChange: PropTypes.func,
}

export default Group
