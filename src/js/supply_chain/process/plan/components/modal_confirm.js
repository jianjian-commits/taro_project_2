import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import React from 'react'
import {
  Sheet,
  SheetColumn,
  SheetSelect,
  Flex,
  Modal,
  Tip,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import _ from 'lodash'
import { history } from 'common/service'

import { planDetailStore } from '../store'

const store = planDetailStore

// sheet 选中某个
const preSheetSelectedListByValue = (list, index, checked = false) => {
  return _.map(list, (item, i) => {
    if (+i === +index) {
      item._gm_select = checked
    }
    return item
  })
}

// 选中所有
const preSheetSelectedListAll = (list, checked) => {
  return _.map(list, (item) => {
    if (item.selectedIndex !== '' && item.selectedIndex !== undefined) {
      item._gm_select = checked
    }
    return item
  })
}

@observer
class ModalDetail extends React.Component {
  constructor() {
    super()
    this.state = {
      selected: [],
      list: [],
      filterList: [],
      flowSyncSelectList: [],
    }

    this.handleConfirm = ::this.handleConfirm
  }

  UNSAVE_componentWillMount() {
    store.setFlowsDoneList()
  }

  handleSelectChange(i, value) {
    const mobxDoneList = toJS(store.mobxDoneList)

    if (value === '') {
      const list = preSheetSelectedListByValue(mobxDoneList, i, false)
      store.setFilterChange('mobxDoneList', list)
    }
    store.setFlowsDoneList(value, i)
  }

  handleSheetSelect(checked, index) {
    const mobxDoneList = toJS(store.mobxDoneList)
    const list = preSheetSelectedListByValue(mobxDoneList, index, checked)

    store.setFilterChange('mobxDoneList', list)
  }

  handleSheetSelectAll(checked) {
    const mobxDoneList = toJS(store.mobxDoneList)
    const list = preSheetSelectedListAll(mobxDoneList, checked)

    store.setFilterChange('mobxDoneList', list)
  }

  handleCancel() {
    Modal.hide()
  }

  handleConfirm() {
    const id = this.props.id

    if (id) {
      store.postUpdate(id).then(() => {
        Tip.success(i18next.t('更新成功!'))
        history.push('/supply_chain/process/plan?active=1')
      })
      Modal.hide()
    } else {
      store.postCreate().then(() => {
        Tip.success(i18next.t('新建成功!'))
        history.push('/supply_chain/process/plan?active=1')
      })
      Modal.hide()
    }
  }

  render() {
    const mobxDoneList = toJS(store.mobxDoneList)
    const selectedIndexList = toJS(store.selectedIndexList)

    return (
      <Flex column>
        <Flex column className='gm-text-desc gm-margin-tb-15'>
          <Flex>
            {i18next.t(
              '以下待完成工艺中，在投料半成品中有相同工艺，请选择是否需同步之前的已加工数据。'
            )}
          </Flex>
          <Flex>
            {i18next.t(
              '选择同步后的工艺无需再进行操作，且不会在加工计划中展现。'
            )}
          </Flex>
        </Flex>

        <Sheet list={mobxDoneList}>
          <SheetSelect
            isDisabled={(data) =>
              data.selectedIndex === '' || data.selectedIndex === undefined
            }
            onSelect={this.handleSheetSelect}
            onSelectAll={this.handleSheetSelectAll}
          />
          <SheetColumn field='name' name={i18next.t('已完成工艺')} />
          <SheetColumn field='worker' name={i18next.t('操作人')} />
          <SheetColumn field='finish_time' name={i18next.t('完成时间')}>
            {(v) => <span>{moment(v).format('YYYY-MM-DD')}</span>}
          </SheetColumn>
          <SheetColumn field='flowList' name={i18next.t('同步的工艺')}>
            {(v, i) => {
              return (
                <Select
                  style={{ minWidth: '120px' }}
                  value={mobxDoneList[i].selectedIndex}
                  onChange={this.handleSelectChange.bind(this, i)}
                >
                  <Option value=''>{i18next.t('未选择')}</Option>
                  {_.map(v, (item) => {
                    return (
                      <Option
                        disabled={_.includes(selectedIndexList, item.index)}
                        key={item.id}
                        value={item.value}
                      >
                        {i18next.t(
                          /* src:`${item.name}（顺序${item.value + 1}）` => tpl:${VAR1}（顺序${VAR2}） */ 'KEY277',
                          { VAR1: item.name, VAR2: item.value + 1 }
                        )}
                      </Option>
                    )
                  })}
                </Select>
              )
            }}
          </SheetColumn>
        </Sheet>

        <Flex justifyCenter className='gm-margin-top-20'>
          <Button className='gm-margin-right-20' onClick={this.handleCancel}>
            {i18next.t('取消')}
          </Button>
          <Button type='primary' onClick={this.handleConfirm}>
            {i18next.t('保存')}
          </Button>
        </Flex>
      </Flex>
    )
  }
}

export default ModalDetail
