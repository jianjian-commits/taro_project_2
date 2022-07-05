import { i18next } from 'gm-i18n'
import React from 'react'
import { Loading, Modal } from '@gmfe/react'

import CategoryPinLeiSelect from '../component/category_pinlei_select_dialog'
import SmartPriceModal from '../component/smart_price_modal'
import SpuList from './components/spu_list'
import ListFilter from './components/list_filter'

import { history } from '../../common/service'

import actions from '../../actions'
import '../actions'
import '../reducer'
import './actions'
import './reducer'

class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      noGroupSpu: false,
      showSelect: false,
    }
  }

  componentWillMount() {
    const { list } = this.props.merchandiseList
    if (list.length) {
      this.setState({
        loading: false,
      })
    }
    // 从其他页面进入，清理数据
    if (this.props.location.action === 'REPLACE') {
      actions.merchandise_list_clear()
    }
  }

  componentDidMount() {
    const { list } = this.props.merchandiseList
    actions.merchandise_list_get_sale_menu_list()
    setTimeout(() => {
      // 返回的时list
      if (
        list &&
        (this.props.location.action !== 'POP' ||
          (this.props.location.action === 'POP' && !list.length))
      ) {
        Promise.all([
          actions.merchandise_common_get_all(),
          actions.merchandise_list_search(),
        ])
          .then((datas) => {
            this.setState({
              loading: false,
              noGroupSpu: datas[1].length === 0, // 只第一次的时候会处理 noGroupSpu
            })
          })
          .catch(() => {
            this.setState({
              loading: false,
            })
          })

        actions.merchandise_common_get_reference_price_type(1)
      }
    }, 0)
  }

  componentWillUnmount() {
    // actions.merchandise_list_clear_filter()
  }

  handleAddSPU = () => {
    this.setState({
      showSelect: true,
    })
  }

  handleEditSmartPrice = () => {
    Modal.render({
      title: i18next.t('智能定价'),
      children: (
        <SmartPriceModal
          onCancel={this.handleEditSmartPriceCancel}
          onNext={this.handleEditSmartPriceNext}
        />
      ),
      onHide: this.handleEditSmartPriceCancel,
    })
  }

  handleEditSmartPriceCancel = () => {
    Modal.hide()
  }

  handleEditSmartPriceNext = (info) => {
    actions.merchandise_list_smart_price_next(info).then((json) => {
      const type = 'list'
      if (json.code === 0) {
        Modal.hide()
        history.push(`/merchandise/manage/list/pricing/${type}`)
      }
    })
  }

  handleSelect = (selected) => {
    history.push({
      pathname: '/merchandise/manage/list/sku_detail',
      search: `?one=${selected.one.id}&two=${selected.two.id}&pinLei=${selected.pinLei.id}`,
    })
    this.setState({ showSelect: false })
  }

  handleSelectCancel = () => {
    this.setState({
      showSelect: false,
    })
  }

  render() {
    const { categories } = this.props.merchandiseCommon
    const { loading, noGroupSpu, showSelect } = this.state

    return (
      <div className='b-merchandise-list' style={{ cursor: 'default' }}>
        {loading ? (
          <Loading style={{ marginTop: '50px' }} />
        ) : (
          <>
            {!noGroupSpu && <ListFilter {...this.props} />}
            <SpuList
              {...this.props}
              onCreate={this.handleAddSPU}
              onEditSmartPrice={this.handleEditSmartPrice}
            />
          </>
        )}

        <CategoryPinLeiSelect
          show={showSelect}
          categories={categories}
          onSelect={this.handleSelect}
          onCancel={this.handleSelectCancel}
        />
      </div>
    )
  }
}

export default List
