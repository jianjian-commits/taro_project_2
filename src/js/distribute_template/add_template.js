import { i18next } from 'gm-i18n'
import React from 'react'
import TemplateComponent from './components/template_component'
import actions from '../actions'
import { history } from '../common/service'
import './actions'
import './reducer'
import { Tip } from '@gmfe/react'
import globalStore from '../stores/global'

// 新建模板
class AddTemplateDetail extends React.Component {
  loadData() {
    actions.template_config_loading_set(false)
  }

  handleSave() {
    const { templateConfig } = this.props.distribute_template

    return actions.template_config_save(templateConfig).then(() => {
      Tip.success(i18next.t('保存成功'))

      history.replace('/system/setting/distribute_templete')
    })
  }

  render() {
    const canAddDistributeConfig = globalStore.hasPermission(
      'add_distribute_config'
    )
    return (
      <TemplateComponent
        didMountFunc={this.loadData.bind(this)}
        canSave={canAddDistributeConfig}
        handleSave={this.handleSave.bind(this)}
        {...this.props}
      />
    )
  }
}

export default AddTemplateDetail
