import React, { useState, useMemo } from 'react'
import { Table, selectTableV2HOC } from '@gmfe/table'
import { i18next, t } from 'gm-i18n'
import { SvgSearch } from 'gm-svg'
import PropTypes from 'prop-types'
import { pinYinFilter } from '@gm-common/tool'
import { Flex } from '@gmfe/react'

const SelectTable = selectTableV2HOC(Table)

export default function TransferRight(props) {
  const [inputVal, setInputVal] = useState('')

  const { list, selected, onRightChange } = props

  const tableList = useMemo(
    () =>
      list.filter(
        (v) =>
          pinYinFilter([v], inputVal, (v) => v.sku_name + v.salemenu_name)
            .length > 0
      ),
    [inputVal, list]
  )

  return (
    <Flex
      column
      className='gm-border gm-bg'
      style={{
        width: '380px',
        height: '350px',
        overflowY: 'auto',
      }}
    >
      <section className='gm-padding-5 gm-back-bg text-center gm-border-bottom'>
        {t('已选商品')}:{list.length}
      </section>

      <section className='b-row-search-input'>
        <input
          type='text'
          placeholder={t('输入商品名或报价单名称')}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <SvgSearch className='b-row-search-input-icon' />
      </section>

      <Flex flex column className='gm-overflow-y'>
        <SelectTable
          keyField='id'
          selected={selected}
          columns={[
            {
              Header: t('商品'),
              id: 'id',
              accessor: (d) => (
                <div>
                  <div>{d.name}</div>
                  <div>{d.salemenu_name}</div>
                </div>
              ),
            },
            {
              Header: t('销售状态'),
              id: 'state',
              accessor: (d) =>
                d.state ? (
                  <span className='gm-padding-lr-5 label-primary gm-text-white'>
                    {i18next.t('上架')}
                  </span>
                ) : (
                  <span className='gm-padding-lr-5 label-default gm-text-white'>
                    {i18next.t('下架')}
                  </span>
                ),
            },
            {
              Header: t('报价单'),
              accessor: 'salemenu_name',
            },
          ]}
          onSelectAll={(isAll) => {
            const selected = isAll ? tableList.map((o) => o.id) : []
            onRightChange(selected)
          }}
          onSelect={onRightChange}
          data={tableList}
        />
      </Flex>
    </Flex>
  )
}

TransferRight.propTypes = {
  onRightChange: PropTypes.func,
  list: PropTypes.array.isRequired,
  selected: PropTypes.array.isRequired,
}
