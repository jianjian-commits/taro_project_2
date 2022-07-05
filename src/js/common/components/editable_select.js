import React, { useState } from 'react'
import { i18next } from 'gm-i18n'
import { MoreSelect, Flex, Button } from '@gmfe/react'
import PropTypes from 'prop-types'

const EditableSelect = ({ list, selected, onSave, closePopup, ...rest }) => {
  const [_selected, setSelected] = useState(selected || null)
  return (
    <Flex alignCenter className='gm-padding-tb-10 gm-padding-lr-10'>
      <Flex alignCenter>
        <MoreSelect
          {...rest}
          style={{ minWidth: 150 }}
          isInPopup
          data={list}
          selected={_selected}
          onSelect={(s) => {
            setSelected(s)
          }}
        />
      </Flex>
      <Button
        type='primary'
        onClick={() => {
          onSave(_selected)
          closePopup()
        }}
        className='gm-margin-left-10'
      >
        {i18next.t('保存')}
      </Button>
    </Flex>
  )
}

EditableSelect.propTypes = {
  list: PropTypes.array,
  selected: PropTypes.object,
  onSave: PropTypes.func,
  closePopup: PropTypes.func,
}

export default EditableSelect
