import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import globalStore from '../../../stores/global'
import { history } from '../../../common/service'
import CategoryPinLeiSelectDialog from '../../component/category_pinlei_select_dialog'
import merchandiseStore from '../../store'

@observer
class NoCategory extends React.Component {
  constructor(props) {
    super(props)
    this.handleAddCategory = ::this.handleAddCategory
    this.handleAddSPU = ::this.handleAddSPU
    this.handleSelect = ::this.handleSelect
    this.handlePinleiCancel = ::this.handlePinleiCancel
    this.state = {
      showSelect: false,
    }
  }

  componentDidMount() {
    merchandiseStore.getAllMerchandise()
  }

  handleAddSPU() {
    this.setState({
      showSelect: true,
    })
  }

  handleAddCategory() {
    history.push('/merchandise/manage/category_management')
  }

  handleSelect(selected) {
    history.push({
      pathname: '/merchandise/manage/sale/create',
      search: `?one=${selected.one.id}&two=${selected.two.id}&pinLei=${selected.pinLei.id}&salemenuId=${this.props.location.query.id}`,
    })
    this.setState({ showSelect: false })
  }

  handlePinleiCancel() {
    this.setState({
      showSelect: false,
    })
  }

  render() {
    const { salemenuType } = this.props.location.query
    const { categories } = merchandiseStore
    const { isEmpty } = this.props
    const canAddSku = globalStore.hasPermission('add_sku')

    return (
      <div className='no-category'>
        {isEmpty ? (
          <div>
            {i18next.t('当前站点下没有分类，请先去')}
            <span onClick={this.handleAddCategory}>
              {i18next.t('新建分类')}
            </span>
            {i18next.t('，再新建商品')}
          </div>
        ) : (
          <div>
            {i18next.t('当前报价单未激活或者当前该分类下无商品。')}
            {salemenuType !== 2 && canAddSku ? (
              <span onClick={this.handleAddSPU}>{i18next.t('去新建商品')}</span>
            ) : null}
          </div>
        )}
        <CategoryPinLeiSelectDialog
          show={this.state.showSelect}
          categories={categories}
          onSelect={this.handleSelect}
          onCancel={this.handlePinleiCancel}
        />
      </div>
    )
  }
}

NoCategory.defaultProps = {
  isEmpty: false,
}

NoCategory.propTypes = {
  isEmpty: PropTypes.bool,
}

export default NoCategory
