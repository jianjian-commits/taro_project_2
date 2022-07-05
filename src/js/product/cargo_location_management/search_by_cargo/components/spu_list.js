import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Button, Flex, Form, FormButton, FormItem, Input } from '@gmfe/react'
import SpuListCard from './spu_list_card'
import { i18next } from 'gm-i18n'
import { createRightModal, scrollToLoad } from '../../utils'
import MoveStockListModal from './modals/move_stock_list_modal'
import { store } from '../../store'
import _ from 'lodash'
import global from 'stores/global'

@observer
class SpuList extends Component {
  spuListContainer // 滚动容器

  constructor(props) {
    super(props)
    this.scroll = ::this.scroll
  }

  moveCargo() {
    store.setIsMoving(true)
  }

  handleSearch() {
    store.resetSpuListPageObj()
    store.setSpuList([])
    store.getSpuList()
  }

  scroll() {
    const { spuListMore } = store
    const event = () => {
      store.getSpuList()
    }
    scrollToLoad(this.spuListContainer, event, spuListMore)
  }

  render() {
    const {
      isMoving,
      spuList,
      cargoLocationSearchOption: { q },
    } = store
    const permission = global.hasPermission('get_inner_transfer_sheet')
    return (
      <>
        <Flex row justifyBetween className='spu-list-head'>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem>
              <Input
                className='form-control'
                placeholder='请输入商品名或ID搜索'
                value={q}
                onChange={(event) =>
                  store.setCargoLocationSearchOption('q', event.target.value)
                }
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </Form>
          {permission && (
            <Button
              type='primary'
              plain
              className='gm-padding-left-20 gm-padding-right-20'
              onClick={() =>
                isMoving
                  ? createRightModal(
                      i18next.t('移库商品列表'),
                      <MoveStockListModal />
                    )
                  : this.moveCargo()
              }
            >
              {isMoving ? i18next.t('待移库列表') : i18next.t('移库')}
            </Button>
          )}
          {isMoving && (
            <p className='spu-list-head-tips'>
              {i18next.t('请点击商品卡片中的“移库”进行移库操作！')}
            </p>
          )}
        </Flex>
        <div
          style={{ maxHeight: '400px', overflow: 'auto', minHeight: '200px' }}
          ref={(ref) => (this.spuListContainer = ref)}
          onScroll={_.throttle(this.scroll, 500)}
        >
          <Flex row wrap justifyBetween className='gm-padding-5'>
            {spuList.length
              ? _.map(spuList, (item, index) => (
                  <SpuListCard key={index} data={item} canMove />
                ))
              : '没有数据'}
          </Flex>
        </div>
      </>
    )
  }
}

export default SpuList
