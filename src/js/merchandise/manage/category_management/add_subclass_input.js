import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Form, FormItem, Input } from '@gmfe/react'
import { t } from 'gm-i18n'

function AddSubclassInput(props) {
  const [name, changeName] = useState('')
  const inputRef = useRef()
  const { onChange } = props
  useEffect(() => {
    onChange('')
    inputRef.current.focus()
  }, [])

  const handleChange = ({ target: { value } }) => {
    changeName(value)
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <Form inline disabledCol>
      <FormItem label={t('分类名称')} required>
        <Input
          value={name}
          className='form-control'
          style={{ width: '280px' }}
          onChange={handleChange}
          ref={inputRef}
        />
      </FormItem>
    </Form>
  )
}

AddSubclassInput.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default AddSubclassInput
