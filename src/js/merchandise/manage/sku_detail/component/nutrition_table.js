import React from 'react'
import { observer } from 'mobx-react'
import { TableX, editTableXHOC, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { MoreSelect, InputNumberV2, Flex, Tip } from '@gmfe/react'

import skuStore from '../sku_store'
import { CLEAN_FOOD_NUTRITION_INFO } from 'common/enum'

const EditTableX = editTableXHOC(TableX)
const { OperationHeader, TABLE_X, EditOperation } = TableXUtil

const NameCell = observer(({ index, data }) => {
  const { key, name } = data

  const handleSelect = (selected) => {
    const { nutrition_info } = skuStore.skuDetail.clean_food_info

    let isAlreadySelected = false
    nutrition_info.forEach((item) => {
      if (item.key === selected.value) {
        isAlreadySelected = true
      }
    })
    if (isAlreadySelected) {
      Tip.warning(selected.text + t('已在表格中'))
      return
    }
    skuStore.changeNutritionInfo(index, {
      key: selected.value,
      name: selected.text,
      unit: selected.unit,
    })
  }

  let selected

  if (key) {
    selected = { text: name, value: key }
  }

  return (
    <MoreSelect
      data={CLEAN_FOOD_NUTRITION_INFO}
      selected={selected}
      onSelect={handleSelect}
      disabledClose
    />
  )
})

const InputNumberCell = observer(({ index, data, field }) => {
  const { unit } = data

  return (
    <Flex row alignCenter>
      <InputNumberV2
        value={data[field]}
        onChange={(value) =>
          skuStore.changeNutritionInfo(index, { [field]: value })
        }
        style={{ width: TABLE_X.WIDTH_NUMBER }}
        className='gm-margin-right-10'
      />
      {field === 'per_100g' ? unit : '%'}
    </Flex>
  )
})

const NutritionTable = observer((props) => {
  const {
    clean_food_info: { nutrition_info },
  } = skuStore.skuDetail

  const columns = [
    {
      Header: t('项目'),
      accessor: 'name',
      minWidth: 180,
      Cell: (cellProps) => (
        <NameCell index={cellProps.row.index} data={cellProps.row.original} />
      ),
    },
    {
      Header: t('每100g'),
      accessor: 'per_100g',
      minWidth: 120,
      Cell: (cellProps) => (
        <InputNumberCell
          index={cellProps.row.index}
          data={cellProps.row.original}
          field='per_100g'
        />
      ),
    },
    {
      Header: t('NRV%'),
      accessor: 'NRV',
      minWidth: 120,
      Cell: (cellProps) => (
        <InputNumberCell
          index={cellProps.row.index}
          data={cellProps.row.original}
          field='NRV'
        />
      ),
    },
    {
      Header: OperationHeader,
      width: TABLE_X.WIDTH_OPERATION,
      accessor: 'name',
      Cell: (cellProps) => {
        return (
          <EditOperation
            onAddRow={() => skuStore.addNutritionRow()}
            onDeleteRow={
              nutrition_info.length === 1
                ? undefined
                : () => skuStore.delNutritionRow(cellProps.row.index)
            }
          />
        )
      },
    },
  ]
  const maxHeight = TABLE_X.HEIGHT_HEAD_TR + 6 * TABLE_X.HEIGHT_TR
  return (
    <EditTableX
      data={nutrition_info.slice()}
      columns={columns}
      style={{ maxHeight }}
    />
  )
})

export default NutritionTable
