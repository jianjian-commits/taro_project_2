import React from 'react'
import { Editor } from 'gm-printer'
import { Tip, LoadingChunk } from '@gmfe/react'
import { defaultConfig } from '../config/template_config'
import mockData from '../config/mock_data/default_data'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'
import { history } from 'common/service'
import _ from 'lodash'
import { order as formatOrder } from '../config/data_to_key'
import addFields, { customizeConfigFields } from '../config/add_fields'
import globalStore from 'stores/global'
import { observer } from 'mobx-react'

setTitle(i18next.t('打印模板设置'))

// 判定是无效的长度
const isInvalidLength = (string) => {
  const number = parseFloat(string)
  return _.isNaN(number) || number <= 0
}

@observer
class TemEditor extends React.Component {
  constructor() {
    super()
    this.state = {
      content: defaultConfig,
      isLoading: true,
    }
  }

  componentDidMount() {
    const { template_id } = this.props.location.query

    globalStore.fetchCustomizedConfigs()
    // 有id => 编辑模板, 没有id => 新建模板,用本地默认的config
    if (template_id) {
      Request('/station/distribute_config/get_new')
        .data({ id: template_id })
        .get()
        .then((json) => {
          const { content } = json.data
          if (!content?.specialConfig) {
            content.specialConfig = 'noSpecail'
          }
          this.setState({ content, isLoading: false })
        })
    } else {
      this.setState({ isLoading: false })
    }
  }

  handleSave = (config, isSaveAs) => {
    // 校验数据
    if (config.name === '') {
      Tip.info(i18next.t('模板名称不能为空'))
      return
    } else if (config.name.length > 10) {
      Tip.info(i18next.t('模板名称不能超过10个汉字'))
      return
    } else if (
      isInvalidLength(config.page.size.width) ||
      isInvalidLength(config.page.size.height)
    ) {
      Tip.info(i18next.t('请填入有效的纸张尺寸'))
      return
    }

    const { template_id } = this.props.location.query
    // 编辑模板
    if (template_id && !isSaveAs) {
      const req = {
        content: JSON.stringify(config),
        id: template_id,
        category: 0,
      }
      Request('/station/distribute_config/edit_new')
        .data(req)
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功'))
        })
      // 新建模板
    } else {
      const req = JSON.stringify(config)
      Request('/station/distribute_config/create')
        .data({ content: req, category: 0 })
        .post()
        .then(() => {
          history.replace('/system/setting/distribute_templete/order_printer')
          Tip.success(i18next.t('保存成功'))
        })
    }
  }

  render() {
    const { isLoading, content } = this.state
    const canEdit = globalStore.hasPermission('edit_print_template_new')
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) => v.permission.read_station_delivery,
    )
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) => v.permission.read_station_delivery,
    )
    customizeConfigFields(infoConfigs, detailConfigs)
    if (isLoading) {
      return (
        <LoadingChunk
          text={i18next.t('数据请求中...')}
          loading={isLoading}
          style={{ marginTop: '300px' }}
        />
      )
    }
    return (
      <Editor
        config={content}
        mockData={formatOrder(mockData, false, '1', content.specialConfig)}
        onSave={this.handleSave}
        showEditor={canEdit}
        addFields={addFields}
        showNewDate
      />
    )
  }
}

export default TemEditor
