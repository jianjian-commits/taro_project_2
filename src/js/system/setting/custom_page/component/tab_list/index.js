import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import TabList from './tab_list'
import SelectBox from '../select_module/select_box'
import store from '../../store/diy_store'
import { Flex, Modal } from '@gmfe/react'
import { observer } from 'mobx-react'
import { tabSize, LabelName } from '../enum'
import IconSelectModal from './icon_select_modal'

import { isCStationAndC } from 'common/service'

@observer
class DiyTabList extends React.Component {
  handleClick(type) {
    store.setTabSize(type)
  }

  handleIconSelected = (id, iconUrl) => {
    if (id === 'FAV') {
      store.setFavoriteIcon(iconUrl)
    } else if (id === 'COMBINE') {
      store.setCombineIcon(iconUrl)
    }
  }

  handleChangeIcon = (id) => {
    Modal.render({
      title: LabelName[id],
      children: (
        <IconSelectModal onOk={(url) => this.handleIconSelected(id, url)} />
      ),
      onHide: Modal.hide,
    })
  }

  render() {
    const { disabled } = this.props
    return (
      <div>
        <div className='gm-text-desc gm-margin-bottom-20 gm-padding-top-5'>
          {i18next.t('商城首页将根据选择的标签样式大小展示')}
        </div>
        <Flex>
          <Flex none className='b-diy-setting-title'>
            {i18next.t('标签样式')}：
          </Flex>
          <Flex wrap className='gm-padding-top-5'>
            <SelectBox
              style={{ marginBottom: 32 }}
              disabled={disabled}
              selected={store.tabSize === tabSize.small}
              onClick={this.handleClick.bind(this, tabSize.small)}
            >
              <TabList size={tabSize.small} />
              <div className='b-select-box-desc'>{i18next.t('小标签')}</div>
            </SelectBox>
            <SelectBox
              style={{ margin: '0 32px 32px 32px' }}
              disabled={disabled}
              selected={store.tabSize === tabSize.middle}
              onClick={this.handleClick.bind(this, tabSize.middle)}
            >
              <TabList size={tabSize.middle} />
              <div className='b-select-box-desc'>{i18next.t('中标签')}</div>
            </SelectBox>
            <SelectBox
              disabled={disabled}
              selected={store.tabSize === tabSize.big}
              onClick={this.handleClick.bind(this, tabSize.big)}
            >
              <TabList size={tabSize.big} />
              <div className='b-select-box-desc'>{i18next.t('大标签')}</div>
            </SelectBox>
          </Flex>
        </Flex>

        {!isCStationAndC() && (
          <Flex>
            <Flex none className='b-diy-setting-title'>
              {i18next.t('我的收藏')}：
            </Flex>
            <Flex className='gm-padding-top-5'>
              <img
                style={{ width: '40px', height: '40px' }}
                src={store.favorites_icon}
                alt={i18next.t('我的收藏')}
                onClick={() => this.handleChangeIcon('FAV')}
              />
            </Flex>
          </Flex>
        )}

        {store.canEditCombine && !isCStationAndC() && (
          <Flex>
            <Flex none className='b-diy-setting-title'>
              {i18next.t('组合商品')}：
            </Flex>
            <Flex className='gm-padding-top-5'>
              <img
                style={{ width: '40px', height: '40px' }}
                src={store.combine_goods_icon}
                alt={i18next.t('组合商品')}
                onClick={() => this.handleChangeIcon('COMBINE')}
              />
            </Flex>
          </Flex>
        )}
      </div>
    )
  }
}

DiyTabList.propTypes = {
  disabled: PropTypes.bool,
}

export default DiyTabList
