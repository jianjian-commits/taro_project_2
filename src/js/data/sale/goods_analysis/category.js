import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'common/components/grid'
import Filter from './components/category/filter'
import HotCategory from './components/category/hot_category'
import Table from './components/category/table'

const Category = () => {
  return (
    <div>
      <Filter />
      <Grid column={1}>
        {/* 目前不需要 */}
        {/* <Overall className='b-grid-span-1' /> */}
        <HotCategory className='b-grid-span-1' />
        <Table className='b-grid-span-1' />
      </Grid>
    </div>
  )
}

Category.propTypes = {
  xxxx: PropTypes.bool,
}
export default Category
