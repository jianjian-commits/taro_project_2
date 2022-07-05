import React, { useCallback, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Button, Flex, Modal } from '@gmfe/react'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import {
  TableXVirtualized,
  TableXUtil,
  editTableXHOC,
  fixedColumnsTableXHOC,
} from '@gmfe/table-x'

import TableTotalText from 'common/components/table_total_text'
import Position from 'common/components/position'

const { TABLE_X } = TableXUtil

const TableKeyBoardEditVirtual = keyboardTableXHOC(
  editTableXHOC(fixedColumnsTableXHOC(TableXVirtualized)),
)

function PositionList(props) {
  const {
    columns = [],
    data = [],
    placeholder = '',
    filterText = [],
    isEdit,
    addText = t('批量添加'),
    id,
    modalTitle = t('批量添加'),
    ModalChild,
    modalSize = 'md',
    totalTextLabel = '',
  } = props

  const { onAddRow = () => {} } = props

  const [highLightIndex, setHighlightIndex] = useState()
  const tableRef = useRef()

  const virtualizedHeight =
    TABLE_X.HEIGHT_HEAD_TR + Math.min(10, data.length) * TABLE_X.HEIGHT_TR

  const judgeIsTrHighlight = useCallback(
    (_, index) => index === highLightIndex,
    [highLightIndex],
  )

  const handleHighlight = useCallback((index) => {
    setHighlightIndex(index)
  }, [])

  const handleOpenAddModal = useCallback(() => {
    Modal.render({
      title: modalTitle,
      children: <ModalChild />,
      onHide: Modal.hide,
      size: modalSize,
    })
  }, [modalTitle, modalSize])

  return (
    <div className='gm-margin-lr-10' style={{ flex: 1 }}>
      <Flex className='gm-padding-tb-10'>
        <TableTotalText
          data={[{ label: totalTextLabel, content: data.length }]}
        />
        {isEdit && (
          <>
            <Button
              type='primary'
              className='gm-margin-left-10'
              onClick={handleOpenAddModal}
            >
              {t(addText)}
            </Button>

            <Position
              tableRef={tableRef}
              onHighlight={handleHighlight}
              list={data.slice()}
              placeholder={t(placeholder)}
              style={{ width: '200px' }}
              filterText={filterText}
              className='gm-margin-left-15'
            />
          </>
        )}
      </Flex>
      <TableKeyBoardEditVirtual
        refVirtualized={tableRef}
        columns={columns}
        virtualizedHeight={virtualizedHeight}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        data={data.slice()}
        id={id}
        isTrHighlight={judgeIsTrHighlight}
        onAddRow={onAddRow}
      />
    </div>
  )
}
PositionList.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  filterText: PropTypes.array.isRequired,
  isEdit: PropTypes.bool,
  addText: PropTypes.string,
  onAddRow: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  modalTitle: PropTypes.string,
  ModalChild: PropTypes.elementType,
  modalSize: PropTypes.string,
  totalTextLabel: PropTypes.string,
}
export default PositionList
