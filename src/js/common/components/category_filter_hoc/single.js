import { t } from 'gm-i18n'
import React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { MoreSelect, Flex } from '@gmfe/react'
import { Store } from './store'
import { sortBy, map } from 'lodash'
import { getCategory1, getCategory2, getPinlei } from './api'
import { toJS } from 'mobx'

import { TransformCategoty1Group } from 'common/util'

const store = new Store()
const api = { getCategory1, getCategory2, getPinlei }

export const categoryFilterSingleHoc = (api) => {
  // 单选
  return observer(
    class CategoryPinLeiFilter extends React.Component {
      static propTypes = {
        disablePinLei: PropTypes.bool,
        selected: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
      }

      static defaultProps = {
        disablePinLei: false,
      }

      componentDidMount() {
        store.init(api)
      }

      componentWillUnmount() {
        store.clear()
      }

      handleSelect(name, selected) {
        // 做个转换，组件如果没有选择则是null
        selected = selected || null

        let filter = this.props.selected
        switch (name) {
          case 'category1':
            filter = Object.assign({}, filter, {
              category1: selected
                ? {
                    id: selected.value,
                    name: selected.text,
                    children: toJS(selected.children),
                  }
                : null,
              category2: null,
              pinlei: null,
            })
            break
          case 'category2':
            filter = Object.assign({}, filter, {
              category2: selected
                ? {
                    id: selected.value,
                    name: selected.text,
                    children: toJS(selected.children),
                  }
                : null,
              pinlei: null,
            })
            break
          case 'pinlei':
            filter = Object.assign({}, filter, {
              pinlei: selected
                ? {
                    id: selected.value,
                    name: selected.text,
                    children: toJS(selected.children),
                  }
                : null,
            })
            break
        }
        this.props.onChange(filter)
      }

      render() {
        const { categories } = store
        const { selected, disablePinLei } = this.props
        let { category1, category2, pinlei } = selected
        category1 = category1
          ? {
              text: category1.name,
              value: category1.id,
              children: category1.children,
            }
          : undefined
        category2 = category2
          ? {
              text: category2.name,
              value: category2.id,
              children: category2.children,
            }
          : undefined
        pinlei = pinlei
          ? { text: pinlei.name, value: pinlei.id, children: pinlei.children }
          : undefined
        const oneList = categories
        let twoList = []
        let pinLeiList = []
        if (category1) {
          twoList = twoList.concat(category1.children.slice())
        }
        if (category2) {
          pinLeiList = pinLeiList.concat(category2.children.slice())
        }

        return (
          <div className='b-merchandise-common-filter'>
            <Flex>
              <MoreSelect
                data={TransformCategoty1Group(
                  map(
                    sortBy(oneList.slice(), (v) => v.rank),
                    (item) => ({
                      value: item.id,
                      text: item.name,
                      children: item.children,
                      station_id: item.station_id,
                    }),
                  ),
                )}
                isGroupList
                selected={category1}
                onSelect={(value) => this.handleSelect('category1', value)}
                placeholder={t('选择一级分类')}
                renderListFilterType='pinyin'
                className='gm-margin-right-10'
                style={{ flex: 1 }}
              />
              <MoreSelect
                data={map(
                  sortBy(twoList.slice(), (v) => v.rank),
                  (item) => ({
                    value: item.id,
                    text: item.name,
                    children: item.children,
                  }),
                )}
                selected={category2}
                onSelect={(value) => this.handleSelect('category2', value)}
                placeholder={t('选择二级分类')}
                renderListFilterType='pinyin'
                className={classNames({
                  'gm-margin-right-10': !disablePinLei,
                })}
                style={{ flex: 1 }}
              />
              {!disablePinLei && (
                <MoreSelect
                  data={map(
                    sortBy(pinLeiList.slice(), (v) => v.rank),
                    (item) => ({
                      value: item.id,
                      text: item.name,
                      children: item.children,
                    }),
                  )}
                  selected={pinlei}
                  onSelect={(value) => this.handleSelect('pinlei', value)}
                  placeholder={t('选择品类')}
                  renderListFilterType='pinyin'
                  className='gm-margin-right-10'
                  style={{ flex: 1 }}
                />
              )}
            </Flex>
          </div>
        )
      }
    },
  )
}

export default categoryFilterSingleHoc(api)
