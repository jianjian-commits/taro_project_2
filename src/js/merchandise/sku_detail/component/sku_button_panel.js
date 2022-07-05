import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Flex, Dialog, Button } from '@gmfe/react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'
import classNames from 'classnames'
import _ from 'lodash'

import emptyImg from '../../../../img/empty.png'

// onClickBtn(skuId)
class SkuButton extends Component {
  constructor(props) {
    super(props)
    this.handleClick = ::this.handleClick
  }

  handleClick() {
    this.props.skuId && this.props.onClickBtn(this.props.skuId)
  }

  render() {
    const { skuName, isActive, state, ratio, orderBelongs } = this.props
    const moduleStyle = classNames(
      'sku-button-module gm-padding-10 gm-border gm-margin-bottom-10',
      {
        'sku-button-off': !state,
        'sku-button-active': isActive || false,
      }
    )
    return (
      <Flex
        className={moduleStyle}
        column
        alignCenter
        onClick={this.handleClick}
      >
        <Flex justifyCenter>
          <Flex className='sku-button-detail'>{skuName}&nbsp;&nbsp;</Flex>
          <Flex none>{ratio}</Flex>
        </Flex>
        <Flex className='sku-button-order-belong'>({orderBelongs})</Flex>
      </Flex>
    )
  }
}
// onClickBtn(skuId)
class SkuButtonGroup extends Component {
  constructor(props) {
    super(props)
    this.handleClickBtn = ::this.handleClickBtn
    this.state = {
      newActive: props.skuDetail.isNew,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.skuSelected === '') {
      this.setState({
        newActive: true,
      })
    } else {
      this.setState({
        newActive: false,
      })
    }
  }

  handleClickBtn(skuId) {
    if (this.state.newActive) {
      Dialog.confirm({
        children: i18next.t('当前页面所填内容尚未保存，确认离开当前页面？'),
        title: i18next.t('提示'),
      }).then(() => {
        this.setState(
          {
            newActive: false,
          },
          () => {
            this.props.onClickBtn(skuId)
          }
        )
      })
    } else {
      this.setState(
        {
          newActive: false,
        },
        () => {
          this.props.onClickBtn(skuId)
        }
      )
    }
  }

  render() {
    const {
      className,
      saleList,
      skuDetail: {
        isNew,
        sku_name,
        state,
        sale_ratio,
        std_unit_name_forsale,
        sale_unit_name,
        salemenu_id,
      },
      skuList,
      skuSelected,
    } = this.props
    let newAkuSalemenu = {}
    if (isNew && saleList.length)
      newAkuSalemenu = _.find(saleList, (sale) => sale.id === salemenu_id) || {}

    const skuBtns = _.map(skuList, (sku, i) => {
      const isActive = sku.sku_id === skuSelected && !this.state.newActive
      return (
        <div className='col-md-4' key={i}>
          <SkuButton
            skuId={sku.sku_id}
            isActive={isActive}
            skuName={sku.sku_name}
            onClickBtn={this.handleClickBtn}
            orderBelongs={sku.salemenu_name}
            state={sku.state}
            ratio={
              sku.sale_ratio +
              sku.std_unit_name_forsale +
              '/' +
              sku.sale_unit_name
            }
          />
        </div>
      )
    })
    return (
      <div
        className={classNames('sku-button-group-module clearfix', className)}
      >
        <div className='col-md-12'>
          {skuBtns}
          {isNew && (
            <div className='col-md-4' key={'isNew'}>
              <SkuButton
                skuId={''}
                isActive={isNew}
                skuName={sku_name}
                orderBelongs={newAkuSalemenu.name || '-'}
                state={state}
                ratio={
                  sale_ratio + std_unit_name_forsale + '/' + sale_unit_name
                }
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

class SkuGroupEmpty extends Component {
  render() {
    const { canAddNew } = this.props
    return (
      <Flex alignCenter justifyCenter column style={{ height: '100vh' }}>
        <img
          src={emptyImg}
          alt={i18next.t('您好，暂未建立销售规格')}
          width={320}
        />
        <p className='gm-padding-top-20 gm-padding-bottom-10 gm-text-desc'>
          {i18next.t('您好，暂未建立销售规格')}
        </p>
        {canAddNew && (
          <div className='sku-button-group-module'>
            <Button
              type='primary'
              plain
              className='sku-button-active'
              onClick={this.props.onAddNew}
            >
              {i18next.t('新建销售规格')}&nbsp;
              <i className='ifont ifont-plus' />
            </Button>
          </div>
        )}
      </Flex>
    )
  }
}

class SkuGroupPanel extends Component {
  renderCollapseFilter = () => {
    const { skuSelected, skuDetail, skuList, saleList } = this.props
    return (
      <SkuButtonGroup
        className='gm-padding-top-15'
        skuList={skuList}
        saleList={saleList}
        skuSelected={skuSelected}
        skuDetail={skuDetail}
        onClickBtn={this.props.onClickBtn}
      />
    )
  }

  render() {
    const {
      canAddNew,
      skuDetail,
      skuList,
      skuSelected,
      skuId,
      saleList,
    } = this.props
    const hasExpand =
      _.findIndex(skuList, (v) => v.sku_id === skuId) > 5 ||
      (skuDetail.isNew && skuList.length > 5)

    return (
      <QuickPanel
        icon='whole'
        iconColor='#6381d4'
        title={i18next.t('请选择销售规格')}
        right={
          canAddNew && skuList.length ? (
            <div className='sku-button-group-module'>
              <Button
                type='primary'
                plain
                className={classNames({
                  'sku-button-active': skuDetail.isNew,
                })}
                onClick={this.props.onAddNew}
              >
                {i18next.t('新建销售规格')}&nbsp;
                <i className='ifont ifont-plus' />
              </Button>
            </div>
          ) : null
        }
      >
        {skuList.length || skuDetail.isNew ? (
          <QuickFilter
            className='b-quick-filter-in-panel'
            expand={hasExpand}
            collapseRender={
              skuList.length > 6 ? this.renderCollapseFilter : null
            }
          >
            <SkuButtonGroup
              className='gm-padding-top-15'
              skuList={skuList.slice(0, 6)}
              skuSelected={skuSelected}
              saleList={saleList}
              skuDetail={skuDetail}
              onClickBtn={this.props.onClickBtn}
            />
          </QuickFilter>
        ) : (
          <SkuGroupEmpty canAddNew={canAddNew} onAddNew={this.props.onAddNew} />
        )}
      </QuickPanel>
    )
  }
}

SkuGroupPanel.propTypes = {
  className: PropTypes.string,
  skuList: PropTypes.array,
  saleList: PropTypes.array,
  skuDetail: PropTypes.object,
  skuId: PropTypes.string,
  onClickBtn: PropTypes.func,
  skuSelected: PropTypes.string,
  canAddNew: PropTypes.bool,
  onAddNew: PropTypes.func,
}
SkuGroupPanel.defaultProps = {
  className: '',
  skuList: [],
  saleList: [],
  skuDetail: {},
  skuId: null,
  onClickBtn: () => {},
  skuSelected: null,
  canAddNew: false,
  onAddNew: () => {},
}

SkuGroupEmpty.propTypes = {
  canAddNew: PropTypes.bool,
  onAddNew: PropTypes.func,
}

SkuButtonGroup.propTypes = {
  className: PropTypes.string,
  skuDetail: PropTypes.object,
  skuSelected: PropTypes.string,
  onClickBtn: PropTypes.func,
  saleList: PropTypes.array,
  skuList: PropTypes.array,
}

SkuButton.propTypes = {
  skuId: PropTypes.string,
  onClickBtn: PropTypes.func,
  isActive: PropTypes.bool,
}

export default SkuGroupPanel
