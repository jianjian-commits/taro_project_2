import { i18next } from 'gm-i18n'
import React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { FilterSearchSelect } from '@gmfe/react-deprecated'
import store from './store'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'
import { TransformCategoty1Group } from 'common/util'
import { getCategory1, getCategory2, getPinlei } from './api'

const api = { getCategory1, getCategory2, getPinlei }

const doFilter = (list, query) => {
  // 判断list是否是group
  if (_.has(_.head(list), 'label')) {
    list = _.flattenDeep(_.map(list, (v) => v.children || v))
  }
  return pinYinFilter(list, query, (value) => value.name)
}

const groupDoFilter = (list, query) => {
  // 判断list是否是group

  if (_.has(_.head(list), 'label')) {
    list = _.flattenDeep(_.map(list, (v) => v.children || v))
  }

  return TransformCategoty1Group(
    pinYinFilter(list, query, (value) => value.name),
  )
}

export const categoryFilterHoc = (categoryApi) => {
  return observer(
    class CategoryPinLeiFilter extends React.Component {
      static propTypes = {
        disablePinLei: PropTypes.bool,
        selected: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
      }

      componentDidMount() {
        store.init(categoryApi)
      }

      handleSelect(name, selected) {
        // 做个转换，组件如果没有选择则是null
        selected = selected || []

        let filter = this.props.selected
        if (name === 'category1_ids') {
          filter = Object.assign({}, filter, {
            category1_ids: selected,
            category2_ids: [],
            pinlei_ids: [],
          })
        } else if (name === 'category2_ids') {
          filter = Object.assign({}, filter, {
            category2_ids: selected,
            pinlei_ids: [],
          })
        } else if (name === 'pinlei_ids') {
          filter = Object.assign({}, filter, {
            pinlei_ids: selected,
          })
        }

        this.props.onChange(filter)
      }

      render() {
        const { categories } = store
        const { selected, disablePinLei } = this.props
        let { category1_ids, category2_ids, pinlei_ids } = selected
        category1_ids = category1_ids ? category1_ids.slice() : []
        category2_ids = category2_ids ? category2_ids.slice() : []
        pinlei_ids = pinlei_ids ? pinlei_ids.slice() : []

        const oneList = categories
        let twoList = []
        let pinLeiList = []
        if (category1_ids.length > 0) {
          _.each(category1_ids, (value) => {
            twoList = twoList.concat(value.children.slice())
          })
        }
        if (category2_ids.length > 0) {
          _.each(category2_ids, (value) => {
            pinLeiList = pinLeiList.concat(value.children.slice())
          })
        }

        return (
          <div className='b-merchandise-common-filter'>
            <Flex>
              <FilterSearchSelect
                key='category1_ids'
                selected={category1_ids}
                list={TransformCategoty1Group(
                  _.sortBy(oneList.slice(), (v) => -v.rank),
                )}
                isGroupList
                onSelect={this.handleSelect.bind(this, 'category1_ids')}
                onFilter={groupDoFilter}
                placeholder={
                  (!category1_ids.length && i18next.t('全部一级分类')) || ''
                }
                className='gm-margin-right-10'
                multiple
              />
              <FilterSearchSelect
                key='category2_ids'
                selected={category2_ids}
                list={_.sortBy(twoList.slice(), (v) => -v.rank)}
                onSelect={this.handleSelect.bind(this, 'category2_ids')}
                onFilter={doFilter}
                placeholder={
                  (!category2_ids.length && i18next.t('全部二级分类')) || ''
                }
                className={classNames({
                  'gm-margin-right-10': !disablePinLei,
                })}
                multiple
              />
              {!disablePinLei && (
                <FilterSearchSelect
                  key='pinlei_ids'
                  selected={pinlei_ids}
                  list={pinLeiList.slice()}
                  onSelect={this.handleSelect.bind(this, 'pinlei_ids')}
                  onFilter={doFilter}
                  placeholder={
                    (!pinlei_ids.length && i18next.t('全部品类')) || ''
                  }
                  multiple
                />
              )}
            </Flex>
          </div>
        )
      }
    },
  )
}

export default categoryFilterHoc(api)
