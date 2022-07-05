import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Popover, Button } from '@gmfe/react'
import { observer } from 'mobx-react'
import store from './store'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { getRecognitionIndex } from './util'
import RecognitionTable from './recognition_table'
import { gioTrackEvent } from '../../common/service'

@observer
class Component extends React.Component {
  refHeader = React.createRef()

  handleRecognition = () => {
    gioTrackEvent('order_intelligent_identification')
    const { serviceTime, customer, searchCombineGoods } = this.props
    store.skusRecognize(
      serviceTime._id,
      customer.address_id,
      searchCombineGoods
    )
  }

  handleTextChange = (e) => {
    store.changeText(e.target.value)
  }

  handleToEdit = () => {
    store.toEdit('text')
  }

  renderTip = () => {
    return (
      <>
        <i className='ifont xfont-warning-circle' />
        <div className='gm-inline-block'>
          <p className='gm-margin-0'>
            {i18next.t('根据指定规则录入文本，例如：卤牛肉 10斤，白菜 1包')}
          </p>
          <p className='gm-margin-0'>
            {i18next.t('系统将根据商品名称（包括别名）与销售单位进行识别匹配')}
          </p>
        </div>
      </>
    )
  }

  getTextHeaderHeight = () => {
    if (this.refHeader && this.refHeader.current) {
      const height = this.refHeader.current.getBoundingClientRect()
      return height.height
    }
    return 0
  }

  render() {
    const { searchText, textRecognition } = store
    const { isEdit, textIndex } = textRecognition

    return (
      <>
        <div ref={this.refHeader}>
          <Flex className='gm-padding-lr-20'>
            <Flex flex className='b-warning-tips gm-padding-top-10'>
              {this.renderTip()}
            </Flex>
            <Flex alignCenter>
              {isEdit && (
                <Button
                  type='primary'
                  disabled={!searchText.length}
                  onClick={this.handleRecognition}
                >
                  {i18next.t('识别')}
                </Button>
              )}
              {!isEdit && (
                <a onClick={this.handleToEdit}>{i18next.t('重新编辑')}</a>
              )}
            </Flex>
          </Flex>
          {isEdit && (
            <div className='gm-padding-tb-10 gm-padding-lr-20'>
              <textarea
                style={{ width: '100%', height: '150px', resize: 'none' }}
                value={searchText}
                placeholder={i18next.t('例如：卤牛肉 10斤，白菜 1包')}
                onChange={this.handleTextChange}
              />
            </div>
          )}
          {!isEdit && (
            <div
              className='gm-padding-lr-20 gm-padding-bottom-10 gm-text-desc'
              style={{ lineHeight: 2 }}
            >
              {i18next.t('识别内容：')}
              {_.map(
                getRecognitionIndex(searchText.length, textIndex.slice()),
                (item, i) => {
                  const s = item[0]
                  const e = item[1]
                  const isInVaild = item[2]
                  if (isInVaild) {
                    return (
                      <Popover
                        key={i}
                        showArrow
                        type='hover'
                        popup={
                          <div className='gm-inline-block gm-padding-10'>
                            {i18next.t(
                              '未识别内容，报价单内不存在此商品或内容格式有误'
                            )}
                          </div>
                        }
                      >
                        <span
                          style={{ background: '#eacece' }}
                          className='gm-padding-5 b-warning-tips'
                        >{`${searchText.slice(s, e)}`}</span>
                      </Popover>
                    )
                  } else {
                    return (
                      <span
                        key={i}
                        className='gm-padding-tb-5'
                      >{`${searchText.slice(s, e)}`}</span>
                    )
                  }
                }
              )}
            </div>
          )}
        </div>
        {!isEdit && (
          <RecognitionTable
            type='text'
            onAdd={this.props.onAdd}
            getHeaderHeight={this.getTextHeaderHeight}
          />
        )}
      </>
    )
  }
}

Component.propTypes = {
  serviceTime: PropTypes.object,
  customer: PropTypes.object,
  renderTip: PropTypes.func,
  searchCombineGoods: PropTypes.bool,
  onAdd: PropTypes.func,
}

export default Component
