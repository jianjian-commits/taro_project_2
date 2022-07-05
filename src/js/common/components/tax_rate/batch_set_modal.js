import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { Button, Flex, InputNumberV2, Modal } from '@gmfe/react'

const { TABLE_X } = TableXUtil

const BatchSetModal = ({ list, onOk }) => {
  const [data, setData] = useState([])
  useEffect(() => {
    setData(list.map((v) => ({ name: v.category_1_name, id: v.category_1_id })))
  }, [list])

  const handleChange = useCallback(
    (value, index) => {
      Object.assign(data[index], { tax_rate: value })
    },
    [data]
  )

  const handleOk = useCallback(() => {
    onOk && onOk(data)
    Modal.hide()
  }, [data])

  const handleCancel = useCallback(() => {
    Modal.hide()
  }, [])

  return (
    <div>
      <p>{t('提示：快速将一个分类下的已选商品设为同一个税率')}</p>
      <TableX
        data={data}
        style={{
          maxHeight: `${TABLE_X.HEIGHT_HEAD_TR + 6 * TABLE_X.HEIGHT_TR}px`,
        }}
        columns={[
          { Header: t('一级分类'), accessor: 'name' },
          {
            Header: t('税率'),
            id: 'tax_rate',
            Cell: (cellProps) => (
              <Cell {...cellProps.row} onChange={handleChange} />
            ),
          },
        ]}
      />
      <Flex justifyEnd className='gm-margin-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button onClick={handleOk} type='primary' className='gm-margin-left-10'>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

BatchSetModal.propTypes = {
  list: PropTypes.array.isRequired,
  onOk: PropTypes.func,
}

const Cell = ({ original: { tax_rate }, index, onChange }) => {
  const [count, setCount] = useState(tax_rate)
  const handleChange = useCallback((value) => {
    setCount(value)
    onChange(value, index)
  }, [])

  return (
    <Flex alignCenter>
      <InputNumberV2
        onChange={handleChange}
        value={count}
        precision={2}
        max={100}
        min={0}
        className='gm-margin-right-10 form-control'
      />
      %
    </Flex>
  )
}

Cell.propTypes = {
  original: PropTypes.object,
  index: PropTypes.number,
  onChange: PropTypes.func,
}

export default BatchSetModal
