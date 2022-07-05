import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  keyboardTableXHOC,
  KCInputNumberV2,
  KCMoreSelect,
} from '@gmfe/keyboard'
import { TableX, editTableXHOC, TableXUtil } from '@gmfe/table-x'
import detailsStore from '../store/details.store'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const {
  TABLE_X: { WIDTH_NO, WIDTH_OPERATION },
  EditOperation,
  OperationHeader,
} = TableXUtil

const KeyboardEditTableX = editTableXHOC(keyboardTableXHOC(TableX))

const GainSpus = () => {
  const {
    params: { gain_spus, source_spu },
  } = detailsStore

  const handleAddRow = useCallback(
    (index = gain_spus.length) => {
      if (!source_spu) {
        return
      }
      const { addGainSpu } = detailsStore
      addGainSpu(index)
    },
    [gain_spus, source_spu]
  )

  const handleDeleteRow = useCallback((index) => {
    const { deleteGainSpu } = detailsStore
    deleteGainSpu(index)
  }, [])

  const columns = useMemo(
    () => [
      {
        Header: t('序号'),
        width: WIDTH_NO,
        accessor: 'no',
        Cell: (cellProps) => cellProps.row.index + 1,
      },
      {
        Header: OperationHeader,
        width: WIDTH_OPERATION,
        accessor: 'operation',
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const { index, original } = cellProps.row
                return (
                  <EditOperation
                    onAddRow={source_spu ? () => handleAddRow(index + 1) : null}
                    onDeleteRow={
                      index || original.spu
                        ? () => handleDeleteRow(index)
                        : null
                    }
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('获得品'),
        accessor: 'spu',
        isKeyboard: true,
        Cell: (cellProps) => {
          return <SpuCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('单位'),
        accessor: 'std_unit_name',
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { spu } = cellProps.row.original
              return _.isNil(spu) ? '-' : spu.std_unit_name
            }}
          </Observer>
        ),
      },
      {
        Header: t('分割系数'),
        accessor: 'split_ratio',
        isKeyboard: true,
        Cell: (cellProps) => {
          return <RatioCell index={cellProps.row.index} />
        },
      },
    ],
    [handleAddRow, handleDeleteRow, source_spu]
  )

  return (
    <KeyboardEditTableX
      id='gain_spus'
      columns={columns}
      data={gain_spus.slice()}
      onAddRow={handleAddRow}
    />
  )
}

const SpuCell = observer(({ index }) => {
  const [spus, setSpus] = useState([])

  const {
    params: { gain_spus, source_spu },
  } = detailsStore
  const { spu } = gain_spus[index]

  const handleSelect = (spu) => {
    const { setGainSpu, formRef } = detailsStore
    setGainSpu(index, { spu })
    formRef.current.apiDoValidate()
  }
  const handleSearch = (q) => {
    if (!q) {
      setSpus([])
      return
    }
    return Request('/merchandise/spu/index')
      .data({ limit: 100000, q })
      .get()
      .then(({ data }) => {
        setSpus(
          data
            .map((item) => ({
              value: item.spu_id,
              text: item.spu_name,
              std_unit_name: item.std_unit_name,
            }))
            .filter((item) => item.std_unit_name === source_spu.std_unit_name)
        )
      })
  }
  return (
    <>
      <KCMoreSelect
        selected={spu}
        data={spus}
        disabled={!source_spu}
        onSelect={handleSelect}
        onSearch={handleSearch}
      />
      {spu?.is_deleted && (
        <div className='gm-margin-top-5 gm-text-red'>
          {t('当前商品不可用，请更换其他商品')}
        </div>
      )}
    </>
  )
})

SpuCell.propTypes = {
  index: PropTypes.number.isRequired,
  formRef: PropTypes.object,
}

const RatioCell = observer(({ index }) => {
  const {
    params: { gain_spus },
  } = detailsStore

  const { split_ratio, spu } = gain_spus[index]
  const handleChange = (split_ratio) => {
    const { setGainSpu, formRef } = detailsStore
    setGainSpu(index, { split_ratio })
    formRef.current.apiDoValidate()
  }

  return spu ? (
    <KCInputNumberV2
      onChange={handleChange}
      value={split_ratio}
      min={0}
      max={1}
    />
  ) : (
    '-'
  )
})

RatioCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(GainSpus)
