import React from 'react'
import { observer } from 'mobx-react'
import { Input, Flex, Popover } from '@gmfe/react'
import store from '../store/batch_import_store'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'
import { SvgWarningCircle } from 'gm-svg'
import styled from 'styled-components'

const TextAreaStyled = styled.textarea`
  width: 180px;
  &:disabled {
    cursor: not-allowed;
    color: #8b92a3;
    background: #f5f5f5;
  }
`

const FlexStyled = styled(Flex)`
  width: 100%;
`

const maxLengthMap = {
  name: 8,
  custom_id: 8,
  desc: 50,
  col_name: 20,
}

const TechnologyInputCell = observer((props) => {
  const { index, fieldName } = props
  const inputValue = store.sortedTechnologySheetList[index][fieldName]
  const {
    idNotSameError,
    nameNotSameError,
    nameExitedError,
    idExitedError,
    emptyNameError,
    emptyIdError,
    col_type,
    lengthError,
  } = store.sortedTechnologySheetList[index]

  const handleInputChange = (e) => {
    const changeData = {}
    changeData[fieldName] = e.target.value
    store.changeTechnologyItem(index, changeData)
  }

  const maxLength = maxLengthMap[fieldName]

  const nameError =
    fieldName === 'name' &&
    (nameNotSameError || nameExitedError || emptyNameError)

  const idError =
    fieldName === 'custom_id' &&
    (idExitedError || emptyIdError || idNotSameError)

  const fieldLengthError = lengthError.includes(fieldName)

  const showErrorPoint = nameError || idError || fieldLengthError

  const disabledForTextType = fieldName === 'params' && col_type === 1 // 文本时disable

  return (
    <FlexStyled alignCenter>
      {fieldName === 'params' ? (
        <TextAreaStyled
          name={fieldName}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabledForTextType}
          className='form-control'
        />
      ) : (
        <Input
          type='text'
          name={fieldName}
          value={inputValue}
          className='form-control'
          maxLength={maxLength}
          style={{ width: '180px' }}
          onChange={handleInputChange}
        />
      )}
      {/* 针对name和ID和对应的error显示 */}
      {showErrorPoint && (
        <Popover
          showArrow
          component={<div />}
          type='hover'
          popup={
            <div
              className='gm-border gm-padding-5 gm-bg gm-text-12'
              style={{ width: '100px' }}
            >
              {fieldName === 'name' && (
                <div>
                  {nameNotSameError && (
                    <div>{i18next.t('请确保相同工艺编号的工艺名称一致')}</div>
                  )}
                  {nameExitedError && (
                    <div>{i18next.t('工艺名被使用，请重新更改')}</div>
                  )}
                  {emptyNameError && <div>{i18next.t('工艺名不能为空')}</div>}
                  {lengthError.includes('name') && (
                    <div>{i18next.t('工艺名不能大于8个字符')}</div>
                  )}
                </div>
              )}

              {fieldName === 'custom_id' && (
                <div>
                  {idNotSameError && (
                    <div>{i18next.t('请确保相同工艺名称的工艺编号一致')}</div>
                  )}
                  {idExitedError && (
                    <div>{i18next.t('工艺编号被使用，请重新更改')}</div>
                  )}
                  {emptyIdError && <div>{i18next.t('工艺编号不能为空')}</div>}
                  {lengthError.includes('custom_id') && (
                    <div>{i18next.t('工艺编号不能大于8个字符')}</div>
                  )}
                </div>
              )}

              {fieldName === 'desc' && lengthError.includes('desc') && (
                <div>{i18next.t('工艺描述不能大于50个字符')}</div>
              )}

              {fieldName === 'col_name' && lengthError.includes('col_name') && (
                <div>{i18next.t('自定义字段名称不能大于20个字符')}</div>
              )}
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

TechnologyInputCell.propTypes = {
  index: PropTypes.number.isRequired,
  // 字段名
  fieldName: PropTypes.string.isRequired,
}

export default TechnologyInputCell
