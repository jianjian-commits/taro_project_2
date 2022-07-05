import React from 'react'
import _ from 'lodash'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

const CouponDesc = (props) => {
  const { description, category_name_list } = props.data
  let typeText = ''

  if (category_name_list?.length > 0) {
    let text = ''
    _.each(category_name_list, (item, index) => {
      text += item.text
      if (index !== category_name_list.length - 1) {
        text += '、'
      }
    })
    typeText = t('coupon_list_category_limit', { name: text })
  } else {
    typeText = t('所有商品均可使用；')
  }

  return (
    <Flex column>
      <div>{typeText}</div>
      {description && <div>{description}</div>}
    </Flex>
  )
}

CouponDesc.propTypes = {
  data: PropTypes.object.isRequired,
}

export default CouponDesc
