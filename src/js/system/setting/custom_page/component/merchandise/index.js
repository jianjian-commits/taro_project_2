import { t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  FilterSelect,
  RadioGroup,
  Radio,
  InputNumberV2,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import moment from 'moment'
import _ from 'lodash'

import MerchandiseDisplay from './merchandise_dispaly'
import store from '../../store/diy_store'
import SelectBox from '../select_module/select_box'
import SelectModuleList from '../select_module'
import { skuLayoutType } from '../enum'
import { isCStationAndC } from 'common/service'

let flag = true
@observer
class DiyMerchandise extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedIndex: -1,
      selectedName: '',
      invalidName: '',
    }
  }

  componentDidMount() {
    const { sortIndex } = this.props
    store.getPromotionList().then((data) => {
      const merchandise = store.modules[sortIndex]
      const selectedIndex = _.findIndex(
        data,
        (d) => d.id === merchandise.promotion_id,
      )
      if (selectedIndex !== -1) {
        this.setState({ selectedIndex, selectedName: data[selectedIndex].name })
      } else {
        // promotion 可能被删除
        const promotion =
          _.find(
            store.promotionList,
            (d) => d.id === merchandise.promotion_id,
          ) || {}
        this.setState({ invalidName: promotion.name })
      }
    })
  }

  handleClick(type) {
    const { sortIndex } = this.props
    store.setModules(sortIndex, 'show_type', type)
    return store.sortSkip + sortIndex
  }

  // 间接输入，如输入法输入
  // 拼音直接键入，中文由输入法间接键入
  handleCompositionStart = (e) => {
    flag = false
  }

  handleCompositionEnd = (e) => {
    flag = true
    const { sortIndex } = this.props
    const value = e.target.value
    store.setModules(sortIndex, 'title', value.slice(0, 10))
    store.setModulesError(sortIndex, { name: '' })
  }

  // 用于间接输入前的缓存，无限制
  handleInput = (e) => {
    if (flag) return
    store.setModules(this.props.sortIndex, 'title', e.target.value)
  }

  // 直接键盘输入
  handleChange = (e) => {
    if (!flag) return
    const { sortIndex } = this.props
    store.setModules(sortIndex, 'title', e.target.value.slice(0, 10))
    store.setModulesError(sortIndex, { name: '' })
  }

  handleSelect = (value) => {
    const { sortIndex } = this.props
    store.getPromotionDetail(value.id).then((data) => {
      const selectedIndex = _.findIndex(
        store.promotionListSelect,
        (v) => v.id === value.id,
      )
      this.setState({ selectedIndex, invalidName: '' }, () => {
        store.setModulesError(sortIndex, { sku: '' })
        store.setModules(sortIndex, 'skus', data.skus)
        store.setModules(sortIndex, 'promotion_id', value.id)
        SelectModuleList.externalSetGap(sortIndex + store.sortSkip)
      })
    })
  }

  handleWithFilter = (list, query) => {
    return _.filter(list, (v) => {
      return v.name.indexOf(query) > -1
    })
  }

  handleShowFilterSelect = () => {
    this.setState({ showFilterSelect: true })
  }

  handleDisplayNumChange = (value) => {
    store.setModules(this.props.sortIndex, 'sku_display_num', value)
    store.setModulesError(this.props.sortIndex, { sku: '' })
  }

  render() {
    const { selectedIndex, invalidName } = this.state
    const { sortIndex, disabled } = this.props
    const { title, show_type, error, sku_display_num } = store.modules[
      sortIndex
    ]
    const promotionListSelect = store.promotionListSelect
    const skuDisplayNum =
      ~~sku_display_num > 0 || sku_display_num === null ? null : 0 // null代表自定义商品数，0代表选择全部商品
    return (
      <div>
        <div className='gm-text-desc gm-margin-bottom-20 gm-padding-top-5'>
          {t(
            '商城首页仅展示已添加营销活动的商品组，未添加营销活动的商品组不展示在商城首页',
          )}
        </div>
        <Flex alignCenter>
          <Flex none className='b-diy-setting-title'>
            {t('商品组标题') + '：'}
          </Flex>
          <input
            disabled={disabled}
            type='text'
            className='form-control'
            placeholder={t('请输入商品组标题（10个字以内）')}
            value={title}
            style={{
              width: '364px',
              borderColor: error && error.title && 'red',
              marginLeft: 5,
              paddingRight: 0,
            }}
            onChange={this.handleChange}
            onCompositionEnd={this.handleCompositionEnd}
            onCompositionStart={this.handleCompositionStart}
            onInput={this.handleInput}
          />
        </Flex>
        {error && error.title && (
          <div style={{ color: 'red', marginLeft: 88 }}>{error.title}</div>
        )}
        <div style={{ height: 10 }} />
        <Flex>
          <Flex none className='b-diy-setting-title'>
            {t('商品组样式') + '：'}
          </Flex>
          <SelectBox
            disabled={disabled}
            style={{ margin: '5px 27px 5px 5px' }}
            onClick={this.handleClick.bind(this, skuLayoutType.across)}
            selected={show_type === skuLayoutType.across}
          >
            <MerchandiseDisplay type={skuLayoutType.across} />
            <div className='b-select-box-desc'>平铺式</div>
          </SelectBox>
          <SelectBox
            disabled={disabled}
            style={{ margin: 5 }}
            onClick={this.handleClick.bind(this, skuLayoutType.list)}
            selected={show_type === skuLayoutType.list}
          >
            <MerchandiseDisplay type={skuLayoutType.list} />
            <div className='b-select-box-desc'>列表式</div>
          </SelectBox>
        </Flex>
        <Flex row alignCenter className='gm-margin-top-10'>
          <div className='b-diy-setting-title' style={{ marginRight: 5 }}>
            {t('选择商品组') + '：'}
          </div>
          <FilterSelect
            disabled={disabled}
            id='promotionList'
            list={promotionListSelect.slice()}
            placeholder={invalidName || t('从营销活动中选择')}
            withFilter={this.handleWithFilter}
            selected={promotionListSelect[selectedIndex]}
            onSelect={this.handleSelect}
            renderItemName={(d) =>
              `${d.name}（上架商品数：${d.valid_sku_nums}；创建时间：${moment(
                d.create_time,
              ).format('YYYY-MM-DD')}）`
            }
          />
        </Flex>
        {!isCStationAndC() && (
          <Flex row alignCenter className='gm-margin-top-10'>
            <div className='b-diy-setting-title' style={{ marginRight: 5 }}>
              {t('展示商品数') + '：'}
            </div>
            <RadioGroup
              inline
              name='sku_display_num'
              value={skuDisplayNum}
              onChange={this.handleDisplayNumChange}
            >
              <Radio value={0}>
                {t('全部商品')}&nbsp;{t('当前商品数')}
                {promotionListSelect[selectedIndex]?.valid_sku_nums}
              </Radio>

              <Radio value={null} className='gm-margin-top-5'>
                {t('自定义商品数')}
                <InputNumberV2
                  className='form-control gm-inline-block gm-margin-left-5 b-width-100'
                  disabled={skuDisplayNum !== null}
                  value={sku_display_num || ''}
                  precision={0}
                  min={1}
                  max={promotionListSelect[selectedIndex]?.valid_sku_nums}
                  onChange={this.handleDisplayNumChange}
                />
              </Radio>
            </RadioGroup>
          </Flex>
        )}
        {error && error.sku && (
          <div style={{ color: 'red', marginLeft: 88 }}>{error.sku}</div>
        )}
      </div>
    )
  }
}

export default DiyMerchandise
