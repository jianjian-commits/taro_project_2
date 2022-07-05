import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Flex, FilterSelect } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { observer } from 'mobx-react'
import _ from 'lodash'

const SupplierSelect = observer(
  ({ onSelect, isEditing, selected, supplier }) => {
    const [supplierList, setSupplierList] = useState([])

    const handleWithFilter = (list, query) => {
      return _.filter(list, (v) => {
        return v.name.indexOf(query) > -1
      })
    }

    const handleSelect = (selected) => {
      onSelect(selected)
    }

    useEffect(() => {
      const { spu_id, id } = supplier
      isEditing &&
        Request('/product/sku_supplier/list')
          .data({ spu_id })
          .get()
          .then((json) => {
            if (id) {
              setSupplierList([
                {
                  name: i18next.t('取消优先供应商'),
                },
                ...json.data,
              ])
            } else {
              setSupplierList(json.data)
            }
          })
    }, [isEditing])

    return (
      <div>
        {isEditing ? (
          <Flex className='gm-inline-block' alignCenter>
            {/* eslint-disable-next-line gmfe/no-deprecated-react-gm */}
            <FilterSelect
              id='id'
              list={supplierList}
              selected={selected}
              withFilter={handleWithFilter}
              onSelect={handleSelect}
              placeholder={i18next.t('选择供应商')}
            />
          </Flex>
        ) : (
          <div>{supplier.supplier_name || '-'}</div>
        )}
      </div>
    )
  }
)

SupplierSelect.propTypes = {
  supplier: PropTypes.object.isRequired,
  selected: PropTypes.object,
  onSelect: PropTypes.func,
  isEditing: PropTypes.bool,
}

export default SupplierSelect
