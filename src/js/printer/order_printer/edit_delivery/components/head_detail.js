import React, { useContext } from 'react'
import { Flex } from '@gmfe/react'
import _ from 'lodash'
import classNames from 'classnames'
import PropTypes from 'prop-types'

/*
totalData 数据格式： [{ text, value, bottom }]   bottom -- 标记总和关系数据，展示于上下排列
HeaderInfo 数据格式：[ { label, item }, ... ]
HeaderAction 数据格式：<Component/>
ContentInfo 数据格式：[ { label: 'your label', item: <Component/> }, ...]
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

const MyContent = ({ content, customeContentColWidth }) => {
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
              key={`content-info-${index}`}
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
  customeContentColWidth: PropTypes.array,
}

const Content = ({ ContentInfo, customeContentColWidth }) => {
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
      </Block>
    </Flex>
  )
}

Content.propTypes = {
  ContentInfo: PropTypes.array,
  customeContentColWidth: PropTypes.array,
}

const Summary = ({ totalData }) => {
  let TopTotalData = []
  let BottomTotalData = []
  if (totalData) {
    TopTotalData = _.filter(totalData, (info) => !info.bottom)
    BottomTotalData = _.filter(totalData, (info) => info.bottom)
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
        wrap
        column
        justifyEnd
        className='b-receipt-header-detail-summary gm-padding-tb-10 gm-padding-lr-20'
      >
        <Flex>{TopTotalData.length !== 0 && renderData(TopTotalData)}</Flex>
        {TopTotalData.length !== 0 && BottomTotalData.length !== 0 && (
          <div className='gm-gap-20' />
        )}
        <Flex>{renderData(BottomTotalData)}</Flex>
      </Flex>
    </Flex>
  ) : null
}

Summary.propTypes = {
  totalData: PropTypes.array,
}

const HeaderDetail = (props) => {
  const {
    totalData,
    HeaderInfo,
    HeaderAction,
    ContentInfo,
    contentLabelWidth,
    contentBlockWidth,
    contentCol,
    className,
    customeContentColWidth,
  } = props

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
          }}
        >
          <Content
            ContentInfo={ContentInfo}
            customeContentColWidth={customeContentColWidth}
          />
        </ReceiptHeaderDetailContext.Provider>
      </Flex>
    </Flex>
  )
}

HeaderDetail.propTypes = {
  className: PropTypes.string,
  totalData: PropTypes.array,
  HeaderInfo: PropTypes.array,
  HeaderAction: PropTypes.element,
  ContentInfo: PropTypes.array,
  contentLabelWidth: PropTypes.number, // 内容区label的宽度
  contentBlockWidth: PropTypes.number, // 内容区每一项的宽度
  contentCol: PropTypes.number, // 内容区几列
  customeContentColWidth: PropTypes.array, // 自定义列宽
}

HeaderDetail.defaultProps = {
  contentCol: 4,
  contentBlockWidth: 230,
}

export default HeaderDetail
