import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Modal, Button, MoreSelect, Tip } from '@gmfe/react'

import _ from 'lodash'
import { Request } from '@gm-common/request'

class BatchSelectItem extends React.Component {
  constructor(props) {
    super(props)

    this.handleSelect = ::this.handleSelect
  }

  handleSelect(selected) {
    if (selected) {
      const { value } = selected
      this.props.handleLevelSelect &&
        this.props.handleLevelSelect(value, this.props.level, selected)
    }
  }

  render() {
    const { itemList, itemSelected, level } = this.props

    return (
      <Flex className='gm-margin-bottom-10' justifyCenter>
        <MoreSelect
          selected={itemSelected}
          style={{ minWidth: '200px' }}
          data={itemList.map((i) => ({
            value: i.shelf_id,
            text: i.name,
            parent: i.parent_id,
          }))}
          onSelect={this.handleSelect}
          placeholder={i18next.t('请选择') + level + i18next.t('级')}
        />
      </Flex>
    )
  }
}

class BatchSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      shelfList: [],
      activeList: [],
      curLevel: 1,
      isNeedClear: false,
      selectList: [],
    }

    this.handleShelfSelectOk = ::this.handleShelfSelectOk
    this.handleShelfSelectCancel = ::this.handleShelfSelectCancel
    this.handleLevelSelect = ::this.handleLevelSelect
    this.handleHide = ::this.handleHide
  }

  componentWillMount() {
    Request('/stock/shelf/get')
      .code(4)
      .get()
      .then(
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

  handleShelfSelectOk() {
    const { selectList } = this.state
    const { listIndex } = this.props

    let name = ''
    _.forEach(selectList[listIndex], (val) => {
      name += val.text
    })
    if (!selectList.length) {
      return Tip.warning(i18next.t('请选择货位'))
    }

    this.props.handleShelfSelectOk(_.last(selectList[listIndex]).value, name)
  }

  handleShelfSelectCancel() {
    this.props.handleShelfSelectCancel()
  }

  handleLevelSelect(shelf_id, level, selected) {
    const { listIndex } = this.props
    const { activeList, selectList, curLevel } = this.state
    const isNeedClear = level < curLevel

    const idList = _.filter(activeList, (activeId, index) => level > index + 1)
    const objList = _.filter(
      selectList[listIndex],
      (value, index) => level > index + 1
    )
    selectList[listIndex] = objList
    idList.push(shelf_id)
    objList.push(selected)

    this.setState({
      activeList: idList,
      curLevel: level,
      selectList: selectList,
      isNeedClear: isNeedClear,
    })
  }

  handleHide() {
    this.props.handleShelfSelectCancel()
  }

  isOrderInvalid(countLevel) {
    const { listIndex } = this.props
    const { selectList } = this.state

    return selectList[listIndex] ? !selectList[listIndex][countLevel - 1] : true
  }

  render() {
    const { show, listIndex } = this.props
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
      <Modal
        style={{ width: '380px' }}
        show={show}
        title={i18next.t('请选择存放货位')}
        onHide={this.handleHide}
        disableMaskClose
      >
        <div>
          {_.map(_.sortBy(filterList, 'level'), (data, index) => {
            let itemSelected = selectList[listIndex]
              ? selectList[listIndex][levelList[index] - 1]
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
                handleLevelSelect={this.handleLevelSelect}
                itemSelected={itemSelected}
                countLevel={levelList.length}
              />
            )
          })}
          {tipsTitle && (
            <span style={{ color: '#FF0000' }}>
              {i18next.t('当前')}
              {tipsTitle}
              {i18next.t('下无可用')}
              {tipsUpperTitle}
              {i18next.t('，请更换')}
              {tipsTitle}
            </span>
          )}
          {!filterList.length && (
            <span style={{ color: '#FF0000' }}>
              {i18next.t('当前无可用存放货位，请先去新建货位')}
            </span>
          )}
        </div>
        <div className='text-right gm-margin-top-10'>
          <Button onClick={this.handleShelfSelectCancel}>
            {i18next.t('取消')}
          </Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleShelfSelectOk}>
            {i18next.t('确定')}
          </Button>
        </div>
      </Modal>
    )
  }
}

BatchSelect.propTypes = {
  handleLevelSelect: PropTypes.func,
  level: PropTypes.string,
  itemList: PropTypes.array,
  itemSelected: PropTypes.object,
  listIndex: PropTypes.number,
  handleShelfSelectOk: PropTypes.func,
  handleShelfSelectCancel: PropTypes.func,
  show: PropTypes.bool,
}

export default BatchSelect
