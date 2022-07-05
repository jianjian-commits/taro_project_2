import React from 'react'
import { observer } from 'mobx-react'
import skuStore from '../../sku_store'
import memoComponentWithDataHoc from './memo_hoc'
import { Flex, ToolTip } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { i18next } from 'gm-i18n'
import { TableXUtil } from '@gmfe/table-x'
import Big from 'big.js'
import PropTypes from 'prop-types'
import globalStore from 'stores/global'

const { TABLE_X } = TableXUtil

const CellProportion = observer((props) => {
  const { index, data } = props
  const {
    craftRefType,
    skuDetail: {
      clean_food_info: { process_unit_status },
    },
  } = skuStore
  const {
    id,
    proportion,
    std_unit_name,
    ratio,
    ingredientRatioData,
    process_unit_name,
  } = data

  const handleChangeProportion = (value) => {
    const { process_unit_status } = skuStore.skuDetail.clean_food_info

    let sale_proportion = parseFloat(
      Big(value || 0)
        .div(ratio)
        .toFixed(2),
    )

    if (process_unit_status) {
      // 当开启加工单位时，转换sale_proportion需要process_unit
      const ratioData = globalStore.processUnit[std_unit_name]
      let processRatio
      // 计量单位不包含全部基本单位，可能会拿不到
      if (ratioData) {
        ratioData.forEach((ratio) => {
          if (ratio.process_unit_name === process_unit_name) {
            processRatio = ratio.process_ratio
          }
        })
      }

      sale_proportion = parseFloat(
        Big(value || 0)
          .div(ratio)
          .div(processRatio || 1) // 基本单位时会为空，默认换算为1
          .toFixed(2),
      )
    }

    skuStore.changeIngredients(index, {
      proportion: value,
      sale_proportion,
    })
  }

  const refRatio =
    ingredientRatioData && ingredientRatioData[craftRefType]
      ? Big(1)
          .div(ingredientRatioData[craftRefType] || 0)
          .toFixed(2)
      : '-'

  return id ? (
    <Flex alignCenter>
      <KCInputNumberV2
        min={0}
        precision={2}
        max={10000000}
        className='form-control'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
        value={proportion}
        onChange={handleChangeProportion}
      />
      {!process_unit_status && (
        <Flex>
          <span>{std_unit_name}</span>
          <ToolTip
            popup={
              <div className='gm-margin-5'>
                {i18next.t('按当前出成率参考值，建议配比值为') + refRatio}
              </div>
            }
          />
        </Flex>
      )}
    </Flex>
  ) : (
    '-'
  )
})

CellProportion.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object,
}

export default memoComponentWithDataHoc(CellProportion)
