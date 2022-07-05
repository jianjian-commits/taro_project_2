import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Cascader } from '@gmfe/react'
import store from './store'
import { getCategory1, getCategory2, getPinlei } from './api'
import { toJS } from 'mobx'

const api = { getCategory1, getCategory2, getPinlei }

export const categoryLevelSelectHoc = (categoryApi) => {
  return observer(
    class CategoryPinLeiFilter extends React.Component {
      static propTypes = {
        selected: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
      }

      static defaultProps = {
        selected: [],
      }

      componentDidMount() {
        store.init(categoryApi)
      }

      handleSelect = (selected) => {
        this.props.onChange(selected, toJS(store.categories))
      }

      render() {
        const { categories } = store
        const { selected } = this.props

        if (!categories.length) return '-'
        return (
          <Cascader
            data={toJS(categories)}
            filtrable
            onChange={this.handleSelect}
            value={selected}
            onlyChildSelectable
          />
        )
      }
    }
  )
}

export default categoryLevelSelectHoc(api)
