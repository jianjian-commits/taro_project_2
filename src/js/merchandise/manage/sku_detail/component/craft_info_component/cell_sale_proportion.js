import React from 'react'
import { observer } from 'mobx-react'
import skuStore from '../../sku_store'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import { Flex } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import Big from 'big.js'

const { TABLE_X } = TableXUtil

const CellSaleProportion = observer((props) => {
  const { data, index } = props
  const { id, sale_proportion, sale_unit_name, ratio } = data

  const handleChangeSaleProportion = (value) => {
    skuStore.changeIngredients(index, {
      sale_proportion: value,
      proportion: parseFloat(
        Big(ratio)
          .times(value || 0)
          .toFixed(2)
      ),
    })
  }

  return id ? (
    <Flex alignCenter>
      <KCInputNumberV2
        style={{ width: TABLE_X.WIDTH_NUMBER }}
        min={0}
        max={10000000}
        precision={2}
        className='form-control'
        value={sale_proportion}
        onChange={handleChangeSaleProportion}
      />
      {sale_unit_name}
    </Flex>
  ) : (
    '-'
  )
})

CellSaleProportion.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object,
}

export default memoComponentWithDataHoc(CellSaleProportion)
