import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { MoreSelect, Flex, Modal, Button } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import store from '../store/clean_food_store'

class BatchSelectItem extends React.Component {
  handleSelect = (selected) => {
    if (selected) {
      const { value } = selected
      this.props.onLevelSelect &&
        this.props.onLevelSelect(value, this.props.level, selected)
    }
  }

  render() {
    const { itemList, level, itemSelected } = this.props

    return (
      <Flex alignCenter className='gm-margin-bottom-10'>
        <MoreSelect
          selected={itemSelected}
          id={_.toString(level)}
          style={{ fontSize: '16px', minWidth: '200px' }}
          data={itemList.map((i) => ({
            value: i.shelf_id,
            text: i.name,
            parent: i.parent_id,
          }))}
          onSelect={this.handleSelect}
          placeholder={t('请选择') + level + t('级')}
        />
      </Flex>
    )
  }
}

BatchSelectItem.propTypes = {
  onLevelSelect: PropTypes.func,
  level: PropTypes.number,
  itemList: PropTypes.array,
  itemSelected: PropTypes.array,
}

@observer
class LocationSelectModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      shelfList: [],
      activeList: [],
      curLevel: 1,
      isNeedClear: false,
      selectList: [],
    }
  }

  componentWillMount() {
    store.getShelfList().then(
      (json) => {
        if (json.code === 4) return false
        this.setState({
          shelfList: json.data,
        })
      },
      (err) => {
        console.log(err)
      }
    )
  }

  handleShelfSelectOk = () => {
    const { selectList } = this.state

    let name = ''
    _.forEach(selectList, (val) => {
      name += val.text
    })
    this.props.onShelfSelectOk(_.last(selectList).value, name)
    Modal.hide()
  }

  handleShelfSelectCancel = () => {
    Modal.hide()
  }

  handleLevelSelect = (shelf_id, level, selected) => {
    const { activeList, selectList, curLevel } = this.state
    const isNeedClear = level < curLevel

    const idList = _.filter(activeList, (activeId, index) => level > index + 1)
    const objList = _.filter(selectList, (value, index) => level > index + 1)
    idList.push(shelf_id)
    objList.push(selected)

    this.setState({
      activeList: idList,
      curLevel: level,
      selectList: objList,
      isNeedClear: isNeedClear,
    })
  }

  isOrderInvalid() {
    const { selectList } = this.state

    return selectList.length === 0
  }

  render() {
    const { className } = this.props
    const {
      shelfList,
      activeList,
      curLevel,
      selectList,
      isNeedClear,
    } = this.state

    let tipsTitle = ''
    let tipsUpperTitle = ''

    const titleList = []
    const levelList = []
    const filterList = _.map(shelfList, (cargoLocation, index) => {
      titleList.push(cargoLocation.classification)
      levelList.push(cargoLocation.level)
      if (curLevel + 1 === cargoLocation.level && activeList.length) {
        const parentId = activeList[activeList.length - 1]
        const data =
          cargoLocation.shelf &&
          cargoLocation.shelf.filter((item) => item.parent_id === parentId)

        if (!cargoLocation.shelf || !data.length) {
          tipsTitle = titleList[index - 1] ? titleList[index - 1] : ''
          tipsUpperTitle = cargoLocation.classification
        }
      }
      return {
        level: cargoLocation.level,
        value: _.filter(cargoLocation.shelf, (shelf) => {
          if (shelf.parent_id) {
            if (_.includes(activeList, shelf.parent_id)) {
              return true
            }
            return false
          }
          return true
        }),
      }
    })

    return (
      <div className='gm-margin-lr-10'>
        <div className={className}>
          {_.map(_.sortBy(filterList, 'level'), (data, index) => {
            let itemSelected = selectList
              ? selectList[levelList[index] - 1]
              : null

            if (isNeedClear && curLevel < levelList[index]) {
              itemSelected = null
            }

            return (
              <BatchSelectItem
                key={index}
                itemList={data.value}
                title={titleList[index]}
                level={levelList[index]}
                onLevelSelect={this.handleLevelSelect}
                itemSelected={itemSelected}
                countLevel={levelList.length}
              />
            )
          })}
          {tipsTitle && (
            <span style={{ color: '#FF0000' }}>
              当前{tipsTitle}下无可用{tipsUpperTitle}，请更换{tipsTitle}
            </span>
          )}
          {!filterList.length && (
            <span style={{ color: '#FF0000' }}>
              当前无可用存放货位，请先去新建货位
            </span>
          )}
        </div>
        <div className='text-right gm-margin-top-10'>
          <Button onClick={this.handleShelfSelectCancel}>取消</Button>
          <div className='gm-gap-10' />
          <Button
            type='primary'
            onClick={this.handleShelfSelectOk}
            disabled={this.isOrderInvalid()}
          >
            确认
          </Button>
        </div>
      </div>
    )
  }
}

LocationSelectModal.propTypes = {
  className: PropTypes.string,
  onShelfSelectOk: PropTypes.func,
}

export default LocationSelectModal
