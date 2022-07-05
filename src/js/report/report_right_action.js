import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { filterByPrivilege, getSelectedColumns, radioSelect } from './util'
import DiySheetSelector from '../common/components/diy_sheet_selector'
import DimSelector from '../common/components/dim_selector'
import { Flex } from '@gmfe/react'

const localStorage = window.localStorage

class ReportRightAction extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filterPopColumn: [],
    }
    this.PopColumnChange = ::this.PopColumnChange
  }

  componentDidMount() {
    const { storageTitle, filterPopColumn } = this.props
    const filterPopColumnItem = Object.assign({}, filterPopColumn[0])
    const storageData = JSON.parse(localStorage.getItem(storageTitle))
    let selectedColumns = []
    if (storageData) {
      selectedColumns = getSelectedColumns(storageData)
      filterPopColumnItem.list = filterByPrivilege(
        filterPopColumnItem.list,
        selectedColumns
      )
    }
    this.setState({ filterPopColumn: [filterPopColumnItem] })
  }

  PopColumnChange(data) {
    const { storageTitle, handlePopColumnChange } = this.props
    this.setState({ filterPopColumn: data })
    localStorage.setItem(storageTitle, JSON.stringify(data))
    handlePopColumnChange(data)
  }

  render() {
    const { filterPopColumn } = this.state
    const { dimension, handlePopDimensionChange } = this.props
    const selectDimensionIndex = radioSelect(dimension)
    return (
      <Flex alignCenter>
        <DimSelector
          name={i18next.t('选择查看方式')}
          data={dimension.list}
          selected={dimension.selectedValue}
          onChange={handlePopDimensionChange}
        />
        <div className='gm-gap-10' />
        {selectDimensionIndex === 0 && (
          <DiySheetSelector
            width={280}
            name={i18next.t('列表自定义')}
            data={filterPopColumn}
            onChange={this.PopColumnChange}
          />
        )}
      </Flex>
    )
  }
}

export default ReportRightAction
