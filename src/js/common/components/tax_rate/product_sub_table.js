import React, { forwardRef, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { subTableXHOC, TableXUtil, TableXVirtualized } from '@gmfe/table-x'
import { Button, Flex, InputNumberV2 } from '@gmfe/react'
import { SvgMinus } from 'gm-svg'

const SubTableXVirtualized = subTableXHOC(TableXVirtualized)
const { TABLE_X, OperationCell, OperationHeader } = TableXUtil

const ProductSubTable = forwardRef(
  ({ original, parentIndex, onChange, onDelete, highlightIndex }, ref) => {
    const { children } = original
    const columns = useMemo(
      () => [
        {
          Header: `${t('商品名')}/${t('商品ID')}`,
          id: 'spu',
          Cell: (cellProps) => (
            <>
              {cellProps.row.original.spu_name}
              <br />
              {cellProps.row.original.spu_id}
            </>
          ),
        },
        {
          Header: t('税率'),
          id: 'tax_rate',
          Cell: (cellProps) => (
            <Flex alignCenter>
              <InputNumberV2
                className='form-control gm-margin-right-5'
                min={0}
                max={100}
                precision={2}
                value={cellProps.row.original.tax_rate}
                onChange={(value) => handleChange(value, cellProps.row.index)}
              />
              %
            </Flex>
          ),
        },
        {
          Header: OperationHeader,
          id: 'operation',
          Cell: (cellProps) => (
            <OperationCell>
              <Button
                type='danger'
                style={{ width: '22px', height: '22px' }}
                className='gm-padding-0'
                onClick={() => handleDelete(cellProps.row.index)}
              >
                <SvgMinus />
              </Button>
            </OperationCell>
          ),
        },
      ],
      []
    )

    const handleChange = useCallback((value, index) => {
      onChange && onChange(value, parentIndex, index)
    }, [])

    const handleDelete = useCallback((index) => {
      onDelete && onDelete(parentIndex, index)
    }, [])

    return (
      <SubTableXVirtualized
        refVirtualized={ref}
        columns={columns}
        isTrHighlight={(_, index) => index === highlightIndex}
        data={children}
        virtualizedHeight={
          TABLE_X.HEIGHT_HEAD_TR +
          Math.min(10, children.length) * TABLE_X.HEIGHT_TR
        }
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
      />
    )
  }
)

ProductSubTable.propTypes = {
  original: PropTypes.object,
  highlightIndex: PropTypes.number,
  parentIndex: PropTypes.number,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
}

export default ProductSubTable
