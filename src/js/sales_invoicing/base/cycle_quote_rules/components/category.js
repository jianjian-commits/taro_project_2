import React from 'react'
import PropTypes from 'prop-types'

function Category(props) {
  const { categoryName1 = '', categoryName2 = '' } = props

  return (
    <span>
      {categoryName1}
      {categoryName2 ? `/${categoryName2}` : ''}
    </span>
  )
}

Category.propTypes = {
  categoryName1: PropTypes.string,
  categoryName2: PropTypes.string,
}
export default Category
