import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Sheet, SheetColumn, SheetAction, Tip } from '@gmfe/react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import { sortFilter } from '../utils'

import { tagDetailStore } from '../stores'

const stores = tagDetailStore

@observer
class RightSide extends React.Component {
  handleInputChange(index, e) {
    const { name, value } = e.target
    if (name === 'sort') {
      const temp = value
      if (temp && !sortFilter(temp)) {
        return
      }
    }
    if (name === 'name') {
      const temp = value && value.trim()
      if (temp.length > 20) {
        Tip.warning(i18next.t('二级标签名字不能超过20个字符!'))
        return
      }
    }
    stores.setSecondTagInputChange(index, name, value)
  }

  handleSecondTagAdd = () => {
    const list = toJS(stores.label_2_backup)
    let isEmpty = false
    _.forEach(list, (item) => {
      if (!item.name) {
        isEmpty = true
      }
    })
    if (isEmpty) {
      Tip.warning(i18next.t('二级标签名称不能为空!'))
      return
    }
    stores.addItemToSecondTagList({
      id: Math.random().toString().substring(3),
      name: '',
      sort: '',
    })
  }

  handleSecondTagDelete = (index) => {
    const list = toJS(stores.label_2_backup)
    if (list.length > 1) {
      stores.deleteItemInSecondTagList(index)
    } else {
      stores.clearItemInSecondTagList()
    }
  }

  render() {
    let list = toJS(stores.label_2_backup)

    return (
      <Flex column>
        <Sheet list={list}>
          <SheetColumn field='id' name={i18next.t('序号')}>
            {(v, i) => <span style={{ fontSize: '12px' }}>{i + 1}</span>}
          </SheetColumn>
          <SheetColumn field='name' name={i18next.t('二级标签名称')}>
            {(v, i) => (
              <input
                name='name'
                value={v}
                onChange={this.handleInputChange.bind(this, i)}
                className='form-control'
                style={{ width: '200px', fontSize: '12px' }}
                type='text'
              />
            )}
          </SheetColumn>
          <SheetColumn field='sort' name={i18next.t('排序')}>
            {(v, i) => (
              <input
                name='sort'
                value={v}
                onChange={this.handleInputChange.bind(this, i)}
                className='form-control'
                style={{ width: '80px', fontSize: '12px' }}
                type='text'
              />
            )}
          </SheetColumn>
          <SheetAction>
            {(row, index) => {
              return (
                <div>
                  <span
                    className='glyphicon glyphicon-plus gm-cursor gm-margin-right-5'
                    onClick={this.handleSecondTagAdd}
                  />
                  <span
                    className='glyphicon glyphicon-trash gm-cursor'
                    onClick={this.handleSecondTagDelete.bind(this, index)}
                  />
                </div>
              )
            }}
          </SheetAction>
        </Sheet>
      </Flex>
    )
  }
}

export default RightSide
