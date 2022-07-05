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
import { connect } from 'react-redux'
import actions from '../../actions'
import '../actions'
import '../reducer'
import _ from 'lodash'
import { getTemplateDetail } from '../util'

class CustomerSettingModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      list: [],
      selectedValues: [],
    }

    this.handleSelect = ::this.handleSelect
    this.handleSave = ::this.handleSave
  }

  componentDidMount() {
    actions
      .template_customer_search(this.props.templateId, this.props.selectedIDs)
      .then((result) => {
        this.setState({
          list: result.options,
          selectedValues: result.selected,
          loading: false,
        })
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  handleSelect(selectedValues) {
    this.setState({ selectedValues })
  }

  handleSave() {
    // 只是先保存在reducer中,不发请求
    if (!this.props.canSave) {
      actions.template_config_detail_change(
        'address_ids',
        this.state.selectedValues
      )
      RightSideModal.hide()
      return
    }

    this.setState({ loading: true })

    // TODO 这里应该改为 只保存需要保存的字段，而不是保存所有
    getTemplateDetail(this.props.templateId).then((config) => {
      // 模板有可能被其他人删除
      if (!config) {
        Tip.warning(i18next.t('此模板已发生改动，请刷新页面 '))
        this.setState({ loading: false })
        return
      }

      actions
        .template_config_update({
          ...config,
          address_ids: this.state.selectedValues,
        })
        .then(() => {
          this.props.onSave()
          this.setState({ loading: false })
          RightSideModal.hide()
          Tip.success(i18next.t('保存成功'))
        })
        .catch(() => {
          this.setState({ loading: false })
        })
    })
  }

  render() {
    const { editPermission } = this.props

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
              disabled={!editPermission}
              title={editPermission ? '' : i18next.t('无编辑权限')}
              onClick={this.handleSave}
            >
              {i18next.t('确定')}
            </Button>
          </Flex>
          <hr />
          <Transfer
            list={this.state.list}
            selectedValues={this.state.selectedValues}
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
  canSave: PropTypes.bool,
  selectedIDs: PropTypes.array.isRequired, // 已选商户ids
  onSave: PropTypes.func, // 已选商户ids,
  editPermission: PropTypes.bool.isRequired,
}

CustomerSettingModal.defaultPropTypes = {
  canSave: false,
  selectedIDs: [],
  onSave: _.noop,
  editPermission: false,
}

export default connect((state) => ({
  templateConfigList: state.distribute_template.templateConfigList,
}))(CustomerSettingModal)
