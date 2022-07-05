import React from 'react'
import { observer } from 'mobx-react'
import { KCInput } from '@gmfe/keyboard'
import store from '../store'
import planMemoComponentWithDataHoc from './plan_memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import styled from 'styled-components'

import { t } from 'gm-i18n'
import _ from 'lodash'
import ValidateCom from 'common/components/validate_com'

const InputStyled = styled(KCInput)`
  width: 140px;
`

const CustomIdCell = observer((props) => {
  const { data, index } = props
  const { custom_id, customIdSameError, emptyError, idCharacterError } = data
  const { errorCustomIds, startCheck } = store

  const handleChange = (e) => {
    store.changeProcessPlanListItem(index, { custom_id: e.target.value })
  }

  const hasBackIdError = _.includes(errorCustomIds, data.custom_id)

  let errorTip
  // 只显示一个error tip
  if (customIdSameError || hasBackIdError) {
    errorTip = t('计划编号不能重复')
  } else if (emptyError.custom_id) {
    errorTip = t('计划编号不能为空')
  } else if (idCharacterError) {
    errorTip = t('计划编号只能为数字、字母、中划线')
  }
  return (
    <Flex alignCenter>
      <ValidateCom
        warningText={errorTip}
        isInvalid={
          startCheck &&
          (customIdSameError ||
            hasBackIdError ||
            emptyError.custom_id ||
            idCharacterError)
        }
      >
        <InputStyled
          value={custom_id || ''}
          type='text'
          className='form-control input-sm'
          onChange={handleChange}
        />
      </ValidateCom>
    </Flex>
  )
})

CustomIdCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default planMemoComponentWithDataHoc(CustomIdCell)
