import { i18next } from 'gm-i18n'
import React from 'react'
import TemplateComponent from './components/template_component'
import actions from '../actions'
import './actions'
import './reducer'
import { Tip } from '@gmfe/react'
import globalStore from '../stores/global'

// 编辑模板
class EditTemplateDetail extends React.Component {
  loadData() {
    const { template_id } = this.props.history.location.query
    actions.template_config_detail_fetch(template_id)
  }

  handleSave() {
    const { templateConfig } = this.props.distribute_template
    const { template_id } = this.props.history.location.query

    return actions.template_config_update(templateConfig).then(() => {
      Tip.success(i18next.t('保存成功'))

      return actions.template_config_detail_fetch(template_id)
    })
  }

  render() {
    const canEditDistributeConfig = globalStore.hasPermission(
      'edit_distribute_config'
    )
    return (
      <TemplateComponent
        didMountFunc={this.loadData.bind(this)}
        canSave={canEditDistributeConfig}
        handleSave={this.handleSave.bind(this)}
        {...this.props}
      />
    )
  }
}

export default EditTemplateDetail
