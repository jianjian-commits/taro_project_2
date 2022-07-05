import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Dialog, Tip, FilterSelect } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'
import { Link } from 'react-router-dom'

class CategoryPinLeiSelectDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      one: null,
      two: null,
      pinLei: null,
    }

    this.handleOK = ::this.handleOK
  }

  handleSelect(name, selected) {
    let filter = this.state

    if (name === 'one') {
      filter = Object.assign({}, filter, {
        one: selected,
        two: null,
        pinLei: null,
      })
    } else if (name === 'two') {
      filter = Object.assign({}, filter, {
        two: selected,
        pinLei: null,
      })
    } else if (name === 'pinLei') {
      filter = Object.assign({}, filter, {
        pinLei: selected,
      })
    }

    this.setState(filter)
  }

  doFilter(name, list, query) {
    // 如果query 等于选中项，就不过滤
    if (this.state[name] && this.state[name].name === query) {
      return list
    }
    return pinYinFilter(list, query, (value) => value.name)
  }

  handleOK() {
    const { one, two, pinLei } = this.state
    if (!pinLei) {
      Tip.info(i18next.t('请选择到品类'))
      return false
    }
    this.props.onSelect({
      one,
      two,
      pinLei,
    })
  }

  render() {
    const { categories, show, OKBtnText, onCancel } = this.props
    const { one, two, pinLei } = this.state

    const oneList = categories
    const twoList = one ? one.children : []
    const pinLeiList = two ? two.children : []

    if (!show) {
      return null
    }
    return (
      <Dialog
        show={show}
        title={i18next.t('请选择分类')}
        onOK={this.handleOK}
        OKBtn={OKBtnText || i18next.t('去建商品')}
        onCancel={onCancel}
      >
        <Flex className='b-merchandise-common-select'>
          <FilterSelect
            id='one'
            selected={one}
            list={oneList}
            onSelect={this.handleSelect.bind(this, 'one')}
            withFilter={this.doFilter.bind(this, 'one')}
            placeholder={i18next.t('选择一级分类')}
            className='gm-margin-right-10'
          />
          <FilterSelect
            id={'two' + (one ? one.id : '-')}
            selected={two}
            list={twoList}
            onSelect={this.handleSelect.bind(this, 'two')}
            withFilter={this.doFilter.bind(this, 'two')}
            placeholder={i18next.t('选择二级分类')}
            className='gm-margin-right-10'
          />
          <FilterSelect
            id={'pinLei' + (one ? one.id : '-') + (two ? two.id : '-')}
            selected={pinLei}
            list={pinLeiList}
            onSelect={this.handleSelect.bind(this, 'pinLei')}
            withFilter={this.doFilter.bind(this, 'pinLei')}
            placeholder={i18next.t('选择品类')}
            className='gm-margin-right-10'
          />
        </Flex>
        <div className='gm-text-desc gm-deco gm-text-helper gm-margin-top-15'>
          {i18next.t('无合适分类，去')}&nbsp;
          <u>
            <Link
              to='/merchandise/manage/category_management'
              className='b-merchandise-no-category-link'
            >
              {i18next.t('新建分类')}
            </Link>
          </u>
        </div>
      </Dialog>
    )
  }
}

CategoryPinLeiSelectDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  categories: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default CategoryPinLeiSelectDialog
