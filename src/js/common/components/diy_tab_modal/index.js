import React from 'react'
import { Flex, Modal, Storage, Button } from '@gmfe/react'
import { QuickTab } from '@gmfe/react-deprecated'
import DiyModal from './diy_modal'
import _ from 'lodash'
import PropTypes from 'prop-types'

const generateDiyColumns = (
  initColumns,
  removedField = null,
  isCStation = false,
  hash = '',
) => {
  const list = _.each(initColumns, (item, key) => {
    // 暂时以此区分 b，c 站点
    const _key = isCStation ? `C${key}` : key + hash
    _.map(item, (sub) => {
      // localstorage中储存的数据
      const localItem = _.find(
        Storage.get(_key) || [],
        (v) => v.key === sub.key,
      )
      if (localItem) {
        sub.show = localItem.show
      }
      return { ...sub }
    })
  })

  let data = null
  if (removedField) {
    _.each(list, (item, key) => {
      item = _.filter(
        item,
        (s) =>
          _.findIndex(removedField[key], (field) => field === s.key) === -1,
      )
      data = {
        ...data,
        [key]: item,
      }
    })
    return data
  }
  return list
}

class DiyTabModal extends React.Component {
  constructor(props) {
    super(props)
    const { exportInfo, removedField, isCStation, hash = '' } = props

    this.initColumns = {}
    _.each(exportInfo, (item, key) => {
      this.initColumns[key] = item.export_key
    })

    this.state = {
      selectCol: generateDiyColumns(
        this.initColumns,
        removedField,
        isCStation,
        hash,
      ),
    }
  }

  handleChange = (newColumn, key) => {
    // 选择的覆盖初始化
    this.initColumns[key] = newColumn
    this.setState({
      selectCol: this.initColumns,
    })
  }

  handleSave = () => {
    const { onSave } = this.props
    const { selectCol } = this.state
    onSave(selectCol)
    Modal.hide()
    this.props.onHandleExportPurchaseTemExcel()
  }

  render() {
    const { exportInfo, tabTitle } = this.props
    const { selectCol } = this.state

    return (
      <>
        <QuickTab tabs={tabTitle}>
          {_.map(exportInfo, (item, key) => {
            return (
              <DiyModal
                key={key}
                columns={selectCol[key]}
                diyGroupSorting={item.group_name}
                onChange={(val) => {
                  return this.handleChange(val, key)
                }}
              />
            )
          })}
        </QuickTab>
        <Flex justifyEnd className='gm-padding-10'>
          <Button
            onClick={() => {
              Modal.hide()
              this.props.onHandleExportPurchaseTemExcel()
            }}
          >
            取消
          </Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleSave}>
            保存
          </Button>
        </Flex>
      </>
    )
  }
}

DiyTabModal.propTypes = {
  exportInfo: PropTypes.object.isRequired,
  tabTitle: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  removedField: PropTypes.object,
  isCStation: PropTypes.bool,
  hash: PropTypes.string,
  onHandleExportPurchaseTemExcel: PropTypes.func,
}

export default DiyTabModal
