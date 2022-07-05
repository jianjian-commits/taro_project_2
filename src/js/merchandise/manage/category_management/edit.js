import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { SvgEditOrder } from 'gm-svg'
import { Popover } from '@gmfe/react'
import Edit from 'common/components/tree_list/edit'
import { TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'

const Edits = ({ icons, value, onHighlight, onOk }) => {
  const editRef = useRef()

  const handleHighlight = (highlight) => {
    value.highlight = highlight
    onHighlight()
  }

  return (
    <Popover
      popup={
        <Edit
          icons={icons}
          value={value}
          container={editRef}
          onOk={onOk}
          onHighlight={handleHighlight}
        />
      }
      ref={editRef}
      top={false}
    >
      <span>
        <TableXUtil.OperationIconTip tip={t('编辑')}>
          <span>
            <SvgEditOrder className='station-tree-icon station-tree-edit gm-text-hover-primary' />
          </span>
        </TableXUtil.OperationIconTip>
      </span>
    </Popover>
  )
}

Edits.propTypes = {
  icons: PropTypes.array,
  value: PropTypes.object,
  onOk: PropTypes.func,
  onHighlight: PropTypes.func,
}

export default Edits
