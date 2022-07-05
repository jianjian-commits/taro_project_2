import React from 'react'
import PropTypes from 'prop-types'
import { Table } from '@gmfe/table'
import _ from 'lodash'

// 请确保
// OneTable 含 selectTableV2HOC(expandTableHOC(Table))
// SubTable 含 selectTableV2HOC(subTableHOC(Table))
function getTableChild(OneTable, SubTable) {
  const TableChild = ({
    data,
    selected,
    onSelect,
    keyField,
    columns,
    subProps,
    batchActionBar,
    ...rest
  }) => {
    const getKey = (item) => {
      return item[keyField || 'value']
    }

    const getSubKey = (item) => {
      return item[subProps.keyField || 'value']
    }

    const afterSelect = (selected) => {
      const selectedTree = {}
      _.each(data, (one) => {
        const oneKey = getKey(one)

        const subKeys = []
        _.each(one.children, (sub) => {
          const subKey = getSubKey(sub)
          if (selected.includes(subKey)) {
            subKeys.push(subKey)
          }
        })
        selectedTree[oneKey] = subKeys
      })

      onSelect(selected, selectedTree)
    }

    const handleSelect = (_oneSelected) => {
      // 带上 sub selected
      let newSelected = _oneSelected.concat(subSelected)

      // 这样获取取消选择的
      const cancelSelected = _.difference(oneSelected, _oneSelected)

      _.each(data, (item) => {
        const key = getKey(item)
        if (_oneSelected.includes(key)) {
          const subs = _.map(item.children, (v) => getSubKey(v))
          newSelected = newSelected.concat(subs)
        } else if (cancelSelected.includes(key)) {
          // 取消选择，子也需要取消
          const subs = _.map(item.children, (v) => getSubKey(v))
          newSelected = _.difference(newSelected, subs)
        }
      })

      // newSelected 会有重复的，去下重
      newSelected = _.uniq(newSelected)

      afterSelect(newSelected)
    }

    // 全选简单
    const handleSelectAll = (selectAll) => {
      if (!selectAll) {
        afterSelect([])
        return
      }

      const newSelected = []
      _.each(data, (one) => {
        newSelected.push(getKey(one))
        _.each(one.children, (sub) => {
          newSelected.push(getSubKey(sub))
        })
      })

      afterSelect(newSelected)
    }

    // 重要 只那属于一层的给一层
    const ones = _.map(data, (item) => getKey(item))
    const oneSelected = _.filter(selected, (v) => ones.includes(v))
    const subSelected = _.difference(selected, oneSelected)

    return (
      <OneTable
        {...rest}
        data={data}
        selected={oneSelected}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        keyField={keyField}
        columns={columns}
        batchActionBar={
          batchActionBar
            ? React.cloneElement(batchActionBar, {
                onSelectAll: handleSelectAll,
              })
            : null
        }
        SubComponent={(row) => {
          const subData = data[row.index].children

          // 只那属于二层的给二层
          // 重要
          const subs = _.map(subData, (item) => getSubKey(item))
          const subSelected = _.filter(selected, (v) => subs.includes(v))

          const handleSubSelect = (subSelected) => {
            // 拿出属于该 sub 的部分
            let newSelected = _.filter(selected, (v) => !subs.includes(v))
            newSelected = newSelected.concat(subSelected)

            // 要更新下父亲的选择项
            const pKey = getKey(data[row.index])
            if (subs.length === subSelected.length) {
              newSelected.push(pKey)
            } else {
              newSelected = _.without(newSelected, pKey)
            }

            // newSelected 可能会有重复，去下重
            newSelected = _.uniq(newSelected)

            afterSelect(newSelected)
          }

          const handleSubSelectAll = (subSelectAll) => {
            // 拿出属于该 sub 的部分
            let newSelected = _.filter(selected, (v) => !subs.includes(v))

            if (subSelectAll) {
              newSelected = newSelected.concat(subs)
            }

            // 要更新下父亲的选择项
            const pKey = getKey(data[row.index])
            if (subSelectAll) {
              newSelected.push(pKey)
            } else {
              newSelected = _.without(newSelected, pKey)
            }

            // newSelected 可能会有重复，去下重
            newSelected = _.uniq(newSelected)

            afterSelect(newSelected)
          }

          const newColumns = _.map(subProps.columns, (v) => {
            let newColumn = v
            if (v.Cell) {
              newColumn = {
                ...v,
                Cell: (subCellProps) => {
                  return v.Cell(subCellProps, row)
                },
              }
            }

            return newColumn
          })

          return (
            <SubTable
              {...subProps}
              columns={newColumns}
              data={subData}
              selected={subSelected}
              onSelect={(selected) => handleSubSelect(selected, subs)}
              onSelectAll={handleSubSelectAll}
            />
          )
        }}
      />
    )
  }

  TableChild.propTypes = {
    ...Table.propTypes,
    // (selected, ones, subs)
    selected: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,

    subProps: PropTypes.shape({
      // Cell: (cellProps, row)
      columns: PropTypes.array.isRequired,
      keyField: PropTypes.string,
    }),
  }

  return TableChild
}

export default getTableChild
