import React, { useState, useContext } from 'react'
import { Flex, IconDownUp, Button } from '@gmfe/react'
import _ from 'lodash'
import classNames from 'classnames'
import PropTypes from 'prop-types'

/*
totalData 数据格式： [{ text, value, left }]   left -- 标记总和关系数据，展示于左侧隔开
HeaderInfo 数据格式：[ { label, item }, ... ]
HeaderAction 数据格式：<Component/>
ContentInfo 数据格式：[ { label: 'your label', item: <Component/> }, ...]
More 数据格式：[ [ ...ContentInfo ], [ ...ContentInfo ], ... ]
 */

const ReceiptHeaderDetailContext = React.createContext({
  open: false,
})

const Header = ({
  HeaderInfo,
  HeaderAction,
  contentBlockWidth,
  contentLabelWidth,
  customeContentColWidth,
}) => {
  const getContentBlockWidth = (index) => {
    if (customeContentColWidth && customeContentColWidth.length) {
      return { width: customeContentColWidth[index] }
    }
    return { width: contentBlockWidth }
  }

  const Info = (
    <Flex wrap>
      {HeaderInfo &&
        _.map(HeaderInfo, (info, index) => {
          return (
            <Flex
              key={`header-info-${index}`}
              className='b-receipt-header-detail-header-item'
              style={getContentBlockWidth(index)}
            >
              {info.label && (
                <Flex
                  justifyEnd
                  alignCenter
                  none
                  className='b-receipt-header-detail-header-item-label'
                  style={{ width: contentLabelWidth }}
                >
                  <span>{info.label}</span>:
                </Flex>
              )}
              <Flex flex alignCenter none>
                {info.item}
              </Flex>
            </Flex>
          )
        })}
    </Flex>
  )

  return (
    <Block>
      <Flex row alignCenter className='b-receipt-header-detail-header'>
        {Info}
      </Flex>
      <Flex flex />
      {HeaderAction !== undefined && HeaderAction}
    </Block>
  )
}

Header.propTypes = {
  HeaderInfo: PropTypes.array,
  HeaderAction: PropTypes.element,
  contentBlockWidth: PropTypes.number,
  contentLabelWidth: PropTypes.number,
  customeContentColWidth: PropTypes.array,
}

const Block = (props) => {
  return (
    <Flex className='b-receipt-header-detail-block' alignCenter>
      {props.children}
    </Flex>
  )
}

const MyContent = ({ content, more, customeContentColWidth }) => {
  const { contentCol, contentLabelWidth, contentBlockWidth } = useContext(
    ReceiptHeaderDetailContext
  )

  const contentLabelStyle = {
    width: contentLabelWidth,
    minWidth: contentLabelWidth,
  }

  let totalWidth = null
  if (customeContentColWidth && customeContentColWidth.length) {
    // 暂定
    // totalWidth = _.sum(customeContentColWidth)
    totalWidth = 'auto'
  } else {
    totalWidth = contentCol * contentBlockWidth
  }

  const getContentBlockWidth = (index) => {
    if (customeContentColWidth && customeContentColWidth.length) {
      return { width: customeContentColWidth[index % contentCol] }
    }
    return { width: contentBlockWidth }
  }

  return (
    <Flex
      style={{
        width: totalWidth,
      }}
      wrap
    >
      {content &&
        _.map(content, (info, index) => {
          return (
            <Flex
              key={`content-${more && 'more-'}info-${index}`}
              className='b-receipt-header-detail-content-item'
              style={contentBlockWidth && getContentBlockWidth(index)}
            >
              {info.label && (
                <Flex
                  justifyEnd
                  alignCenter
                  className='b-receipt-header-detail-content-item-label gm-text-desc gm-text'
                  style={contentLabelWidth && contentLabelStyle}
                >
                  <span>{info.label}</span>:
                </Flex>
              )}
              {info.tag && (
                <Flex alignCenter>
                  <div
                    className={classNames('b-receipt-header-tag', {
                      'gm-bg-error': info.tag === 'error',
                      'gm-bg-desc': info.tag === 'finish',
                      'gm-bg-primary': info.tag === 'processing',
                    })}
                  />
                </Flex>
              )}
              <Flex
                flex
                alignCenter
                className='b-receipt-header-detail-content-item-text'
              >
                {info.item}
              </Flex>
            </Flex>
          )
        })}
    </Flex>
  )
}

MyContent.propTypes = {
  content: PropTypes.array,
  more: PropTypes.bool,
  customeContentColWidth: PropTypes.array,
}

const MyContentMore = ({ content }) => {
  return (
    content &&
    _.map(content, (contentBlock, index) => {
      return (
        <Block key={`content-block-${index}`}>
          <MyContent content={contentBlock} more />
        </Block>
      )
    })
  )
}

const Content = ({ ContentInfo, More, customeContentColWidth }) => {
  const { onOpen, open } = useContext(ReceiptHeaderDetailContext)
  return (
    <Flex className='b-receipt-header-detail-content'>
      <Block>
        {ContentInfo && (
          <MyContent
            content={ContentInfo}
            customeContentColWidth={customeContentColWidth}
          />
        )}
        <Flex flex />
        {More && (
          <Button type='link' className='gm-padding-right-0' onClick={onOpen}>
            {open ? '收起' : '展开'}更多信息 <IconDownUp active={open} />
          </Button>
        )}
      </Block>
      {More && open && <MyContentMore content={More} />}
    </Flex>
  )
}

Content.propTypes = {
  ContentInfo: PropTypes.array,
  More: PropTypes.array,
  customeContentColWidth: PropTypes.array,
}

const Summary = ({ totalData }) => {
  let leftTotalData = []
  let rightTotalData = []
  if (totalData) {
    leftTotalData = _.filter(totalData, (info) => info.left)
    rightTotalData = _.filter(totalData, (info) => !info.left)
  }

  const renderData = (data) => {
    return _.map(data, (info, i) => {
      return (
        <Flex
          className='b-receipt-header-detail-summary-item gm-margin-right-10'
          column
          alignCenter
          key={i}
        >
          <span className='b-receipt-header-detail-summary-text'>
            {info.text}
          </span>
          <span className='b-receipt-header-detail-summary-value'>
            {info.value}
          </span>
        </Flex>
      )
    })
  }

  return totalData ? (
    <Flex alignCenter className='gm-padding-tb-5 gm-padding-left-20'>
      <Flex
        alignCenter
        className='b-receipt-header-detail-summary gm-padding-tb-10 gm-padding-lr-20'
      >
        {leftTotalData.length !== 0 && renderData(leftTotalData)}
        {leftTotalData.length !== 0 && rightTotalData.length !== 0 && (
          <div className='gm-gap-20 gm-border-left gm-margin-left-20 gm-margin-right-10' />
        )}
        {renderData(rightTotalData)}
      </Flex>
    </Flex>
  ) : null
}

Summary.propTypes = {
  totalData: PropTypes.array,
}

const ReceiptHeaderDetail = (props) => {
  const {
    totalData,
    HeaderInfo,
    HeaderAction,
    ContentInfo,
    More,
    contentLabelWidth,
    contentBlockWidth,
    contentCol,
    className,
    customeContentColWidth,
  } = props

  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    setOpen(!open)
  }

  return (
    <Flex row className={classNames('b-receipt-header-detail', className)}>
      <Summary totalData={totalData} />
      <Flex
        column
        justifyCenter
        flex
        style={{ width: '100%' }}
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <Header
          HeaderInfo={HeaderInfo}
          HeaderAction={HeaderAction}
          contentBlockWidth={contentBlockWidth}
          contentLabelWidth={contentLabelWidth}
          customeContentColWidth={customeContentColWidth}
        />
        <ReceiptHeaderDetailContext.Provider
          value={{
            contentLabelWidth,
            contentBlockWidth,
            contentCol,
            open,
            onOpen: handleToggle,
          }}
        >
          <Content
            ContentInfo={ContentInfo}
            More={More}
            customeContentColWidth={customeContentColWidth}
          />
        </ReceiptHeaderDetailContext.Provider>
      </Flex>
    </Flex>
  )
}

ReceiptHeaderDetail.propTypes = {
  className: PropTypes.string,
  totalData: PropTypes.array,
  HeaderInfo: PropTypes.array,
  HeaderAction: PropTypes.element,
  ContentInfo: PropTypes.array,
  More: PropTypes.array,
  contentLabelWidth: PropTypes.number, // 内容区label的宽度
  contentBlockWidth: PropTypes.number, // 内容区每一项的宽度
  contentCol: PropTypes.number, // 内容区几列
  customeContentColWidth: PropTypes.array, // 自定义列宽
}

ReceiptHeaderDetail.defaultProps = {
  contentCol: 4,
  contentBlockWidth: 230,
}

export default ReceiptHeaderDetail
