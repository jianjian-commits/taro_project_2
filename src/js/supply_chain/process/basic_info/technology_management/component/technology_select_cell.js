import React from 'react'
import { observer } from 'mobx-react'
import { Select, Popover, Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import styled from 'styled-components'
import store from '../store/batch_import_store'
import { PARAM_TYPE_ENUM } from 'common/enum'
import { SvgWarningCircle } from 'gm-svg'

const FlexStyled = styled(Flex)`
  width: 100%;
`

const SelectStyled = styled(Select)`
  min-width: 100px;
`

const SelectCell = observer(({ index }) => {
  const { col_type, colTypeError } = store.sortedTechnologySheetList[index]

  const handleChangeSelect = (selected) => {
    store.changeTechnologyItem(index, { col_type: selected })
  }

  return (
    <FlexStyled alignCenter>
      <SelectStyled
        data={PARAM_TYPE_ENUM}
        value={col_type}
        onChange={handleChangeSelect}
      />
      {colTypeError && (
        <Popover
          showArrow
          component={<div />}
          type='hover'
          popup={
            <div className='gm-border gm-padding-5 gm-bg gm-text-12'>
              <div>{t('字段属性设置只能为0/1，请重新选择')}</div>
            </div>
          }
        >
          <span>
            <SvgWarningCircle style={{ color: 'red' }} />
          </span>
        </Popover>
      )}
    </FlexStyled>
  )
})

export default SelectCell
