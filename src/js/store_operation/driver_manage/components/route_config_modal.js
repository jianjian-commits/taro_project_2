import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, TransferGroup, Drawer, Dialog, Button } from '@gmfe/react'
import { connect } from 'react-redux'
import { generateListForTransfer } from '../utils'
import actions from '../../../actions'
import PropTypes from 'prop-types'

import TableListTips from 'common/components/table_list_tips'

class RouteConfigModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      selectedValues: [],
    }
  }

  componentDidMount() {
    const routeId = this.props.routeId
    actions.route_manage_get_route_detail({ id: routeId }).then((result) => {
      const data = generateListForTransfer(result, routeId)
      this.setState({
        list: data.list,
        selectedValues: data.selectedValues,
      })
    })
  }

  handleSelect = (selectedValues) => {
    this.setState({
      selectedValues,
    })
  }

  handleSubmit = () => {
    Dialog.confirm({
      children: i18next.t(
        '如商户已经进入分拣流程，修改商户的线路可能会引起分拣流程出现序号与所属路线不一致的情况，请确定是否修改？'
      ),
      title: i18next.t('提示'),
    }).then(() => {
      actions
        .route_manage_update_route({
          id: this.props.routeId,
          address_ids: JSON.stringify(this.state.selectedValues),
        })
        .then((result) => {
          if (result.code === 0) {
            this.props.onUpdateList()
            Drawer.hide()
          }
        })
    })
  }

  render() {
    const { list, selectedValues } = this.state
    return (
      <div className='gm-padding-lr-15'>
        <div className='gm-text-black gm-text-14 gm-padding-tb-10'>
          {i18next.t('商户配置')}
        </div>
        <Flex justifyBetween alignCenter>
          <TableListTips
            tips={[
              i18next.t('若将商户从此线路移除，该商户将没有线路。'),
              i18next.t('商户信息：商户名-商户标签（线路名）'),
            ]}
          />
          <Button type='primary' onClick={this.handleSubmit}>
            {i18next.t('确定')}
          </Button>
        </Flex>
        <hr />
        <TransferGroup
          list={list}
          leftPlaceHolder={i18next.t('搜索商户名称/商户标签')}
          rightPlaceHolder={i18next.t('搜索商户名称/商户标签')}
          selectedValues={selectedValues}
          onSelect={this.handleSelect}
          leftTitle={i18next.t('全部商户')}
          rightTitle={i18next.t('已选商户')}
        />
      </div>
    )
  }
}

RouteConfigModal.propTypes = {
  routeId: PropTypes.number,
  onUpdateList: PropTypes.func,
}

export default connect((state) => ({
  routeManage: state.routeManage,
}))(RouteConfigModal)
