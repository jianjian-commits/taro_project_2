import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Flex,
  Transfer,
  RightSideModal,
  LoadingChunk,
  Tip,
  Button,
} from '@gmfe/react'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import temListStore from '../store'
import globalStore from 'stores/global'

class CustomerSettingModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      list: [],
      selected: [],
    }
  }

  componentDidMount() {
    const { selected } = this.props

    Promise.all([
      Request('/station/distribute_config/list')
        .get()
        .then((json) => json.data),
      Request('/station/order/customer/search')
        .get()
        .then((json) => json.data.list),
    ]).then((res) => {
      const [temList, customerList] = res
      const list = []

      _.each(customerList, (customer) => {
        const template = _.find(temList, (t) =>
          _.includes(t.address_ids, customer.address_id)
        )

        const opt = {
          value: customer.address_id,
          name: template
            ? `${customer.resname}(${template.content.name})`
            : customer.resname,
        }

        list.push(opt)
      })

      this.setState({ list, selected, loading: false })
    })
  }

  handleSelect = (selected) => {
    this.setState({ selected })
  }

  handleSave = () => {
    const { templateId } = this.props

    // 新配置
    const config = {
      id: templateId,
      address_ids: JSON.stringify(this.state.selected),
    }

    Request('/station/distribute_config/edit_new')
      .data(config)
      .post()
      .then(() => {
        // 成功后,刷新列表
        temListStore.getTemList()

        RightSideModal.hide()
        Tip.success(i18next.t('保存成功'))
      })
  }

  render() {
    const canEdit = globalStore.hasPermission('edit_print_template_new')

    return (
      <div className='gm-padding-lr-15'>
        <LoadingChunk
          text={i18next.t('拼命加载中...')}
          loading={this.state.loading}
        >
          <div className='gm-text-14 gm-padding-tb-10'>
            {i18next.t('商户配置')}
          </div>
          <Flex justifyBetween alignCenter>
            <span className='gm-text-12 gm-text-red'>
              {i18next.t('注:若将商户从此模板移除,将自动配置到默认模板')}
            </span>
            <Button
              type='primary'
              disabled={!canEdit}
              title={canEdit ? '' : i18next.t('无编辑权限')}
              onClick={this.handleSave}
            >
              {i18next.t('确定')}
            </Button>
          </Flex>
          <hr />
          <Transfer
            list={this.state.list}
            selectedValues={this.state.selected}
            onSelect={this.handleSelect}
            leftTitle={i18next.t('全部商户')}
            rightTitle={i18next.t('已选商户')}
          />
        </LoadingChunk>
      </div>
    )
  }
}

CustomerSettingModal.propTypes = {
  templateId: PropTypes.number.isRequired,
  selected: PropTypes.array.isRequired,
}

export default CustomerSettingModal
