import React from 'react'
import { EditTable, TableUtil } from '@gmfe/table'
import { t } from 'gm-i18n'
import { Observer, observer } from 'mobx-react'
import { MoreSelect, InputNumberV2 } from '@gmfe/react'
import PropTypes from 'prop-types'
import globalStore from '../../../../stores/global'
import { NutritionInfoList, NutritionInfo } from './config'

const { OperationHeader, referOfWidth, EditTableOperation } = TableUtil
@observer
class NutrientTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isNumberEdit: false, // 先选营养素再填
    }
  }

  handleChangeInputValue(index, val, key) {
    this.props.store.handleChangeInputValue(index, val, key)
  }

  handleSelect(selected, index, type) {
    this.props.store.handleSelect(selected, index, type)
  }

  render() {
    const { store } = this.props
    const { tableData } = store
    const handleDetailAdd = () => {
      store.addNutrientItem()
    }
    const handleDetailDel = (index, key) => {
      store.deleteNutrientItem(index, key)
    }
    const hasEditNutrient = globalStore.hasPermission('edit_nutrition_info')

    return (
      <EditTable
        className='gm-border'
        data={tableData.slice()}
        columns={[
          {
            width: 130,
            Header: t('营养素名称'),
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const se = {
                    value: cellProps.original.value,
                    text: cellProps.original.key
                      ? NutritionInfo[cellProps.original.key].text
                      : '',
                  }
                  return hasEditNutrient ? (
                    <MoreSelect
                      data={NutritionInfoList}
                      selected={se}
                      onSelect={(selected) =>
                        this.handleSelect(selected, cellProps.index, 'key')
                      }
                    />
                  ) : (
                    NutritionInfo[cellProps.original.key].text
                  )
                }}
              </Observer>
            ),
          },
          {
            width: 130,
            Header: t('每100克含量'),
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  return hasEditNutrient ? (
                    <InputNumberV2
                      min={0}
                      max={10000000000}
                      value={cellProps.original.value}
                      onChange={(val) => {
                        this.handleChangeInputValue(
                          cellProps.index,
                          val,
                          cellProps.original.key
                        )
                      }}
                    />
                  ) : (
                    cellProps.original.value
                  )
                }}
              </Observer>
            ),
          },
          {
            width: 50,
            Header: t('单位'),
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  return cellProps.original.key
                    ? NutritionInfo[cellProps.original.key].unit
                    : null
                }}
              </Observer>
            ),
          },
          {
            Header: OperationHeader,
            width: referOfWidth.operationCell,
            Cell: (cellProps) => {
              return (
                <EditTableOperation
                  onAddRow={hasEditNutrient ? handleDetailAdd : undefined}
                  onDeleteRow={
                    hasEditNutrient
                      ? () =>
                          handleDetailDel(
                            cellProps.index,
                            cellProps.original.key
                          )
                      : undefined
                  }
                />
              )
            },
          },
        ]}
      />
    )
  }
}

NutrientTable.propTypes = {
  store: PropTypes.object.isRequired,
}

export default NutrientTable
