import React, { Component } from 'react'
import { Button, Form, FormButton, FormItem, Input, Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { store } from '../../store'
import CargoMenu from './cargo_menu'
import _ from 'lodash'
import { recursiveCloseItem, searchByCargoLocation } from '../../utils'
import { observer } from 'mobx-react'

@observer
class CargoLocationFilter extends Component {
  constructor(props) {
    super(props)
    this.handleFindCargoLocation = ::this.handleFindCargoLocation
  }

  /**
   * 点击定位定位
   */
  handleFindCargoLocation() {
    const { cargoLocationMenu, cargoLocationName } = store
    if (!cargoLocationName) {
      Tip.warning(i18next.t('请输入货位名'))
      return
    }
    this.searchedItem = null
    recursiveCloseItem(cargoLocationMenu)
    const result = this._recursiveFindCargoLocation(
      cargoLocationName,
      cargoLocationMenu
    )
    if (!result) {
      Tip.warning(i18next.t('没有找到该货位'))
      return
    }
    searchByCargoLocation(this.searchedItem)
    store.setCargoLocationMenu(store.cargoLocationMenu)
    setTimeout(() => {
      document.getElementById('stock-menu-container').scrollTop =
        this.searchedItem.ref.offsetTop - 2
    })
  }

  /**
   * 递归查找货位算法
   * @param word
   * @param list
   * @returns {{flag: *}}
   * @private
   */
  _recursiveFindCargoLocation(word, list) {
    let flag = false
    if (_.some(list, (item) => item.name === word)) {
      const selected = _.find(list, (item) => item.name === word)
      if (!this.searchedItem) {
        this.searchedItem = selected
      }
      flag = true
      return flag
    } else {
      _.forEach(list, (item) => {
        if (item.children && item.children.length) {
          item.expand = this._recursiveFindCargoLocation(word, item.children)
          flag = flag || item.expand
        }
      })
    }
    return flag
  }

  render() {
    const { cargoLocationName } = store
    return (
      <>
        <Form disabledCol inline onSubmit={this.handleFindCargoLocation}>
          <FormItem>
            <Input
              placeholder={i18next.t('请输入货位名定位')}
              className='form-control'
              value={cargoLocationName}
              onChange={(event) =>
                store.setCargoLocationName(event.target.value)
              }
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('定位')}
            </Button>
          </FormButton>
        </Form>
        <CargoMenu />
      </>
    )
  }
}

export default CargoLocationFilter
