import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import ProductList from './product'
import ProductSortList from './product_sort'
import { observer } from 'mobx-react'
import { Tabs } from '@gmfe/react'
import store from '../store'
import classNames from 'classnames'

const Table = ({ className }) => {
  const { filter } = store
  useEffect(() => {}, [filter])

  return (
    <div className={classNames('gm-bg', className)}>
      <Tabs tabs={[t('商品'), t('商品分类')]}>
        <ProductList />
        <ProductSortList />
      </Tabs>
    </div>
  )
}

Table.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(Table)
