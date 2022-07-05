import React, { useEffect, useState } from 'react'
import { MoreSelect, Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'
import { history } from 'common/service'

const RedEnvelope = ({ onChange, selected }) => {
  const [data, setData] = useState([])

  useEffect(() => {
    Request('/coupon/share/list')
      .data({ limit: 100 })
      .get()
      .then((json) => {
        const dataList = _.map(json.data, (v) => ({
          value: v.coupon_info_id,
          text: v.name,
        }))
        setData(dataList)
      })
  }, [])

  return (
    <Flex alignCenter>
      <MoreSelect
        style={{ width: '220px' }}
        data={data}
        selected={_.find(data, { value: selected })}
        onSelect={(selected) => onChange(selected && selected.value)}
      />
      <a
        className='gm-margin-left-10'
        onClick={() => history.push('/c_retail/marketing/coupon/detail')}
      >
        {t('新建红包券')}
      </a>
    </Flex>
  )
}

RedEnvelope.propTypes = {
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired,
}

export default RedEnvelope
