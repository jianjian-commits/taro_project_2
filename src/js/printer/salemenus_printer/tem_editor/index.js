/**
 * @description 编辑模板
 */
import React from 'react'
import { EditorSaleMenus } from 'gm-printer'
import { Tip, LoadingChunk } from '@gmfe/react'
import defaultConfig from '../config/template_config/default_config'
import mockData from '../config/mock_data/default_data'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'
import { history } from 'common/service'
import _ from 'lodash'
import formatData from '../config/data_to_key'
import addFields from '../config/add_fields'
import PropTypes from 'prop-types'
import globalStore from '../../../stores/global'

setTitle(i18next.t('报价单模板设置'))

// 判定是无效的长度
const isInvalidLength = (string) => {
  const number = parseFloat(string)
  return _.isNaN(number) || number <= 0
}

class TemEditor extends React.Component {
  constructor() {
    super()
    this.state = {
      content: defaultConfig,
      isLoading: true,
    }
  }

  componentDidMount() {
    const { template_id } = this.props.history.location.query
    // 有id => 编辑模板, 没有id => 新建模板,用本地默认的config
    if (template_id) {
      Request('/fe/sale_menu_tpl/get')
        .data({ id: template_id })
        .get()
        .then((json) => {
          const { content } = json.data
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

    console.log(JSON.stringify(config))

    const { template_id } = this.props.history.location.query
    if (template_id && !isSaveAs) {
      // 编辑模板
      const req = {
        content: JSON.stringify(config),
        id: template_id,
      }
      Request('/fe/sale_menu_tpl/edit')
        .data(req)
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功'))
        })
      // 新建模板 和 另存为
    } else {
      const req = JSON.stringify(config)
      Request('/fe/sale_menu_tpl/create')
        .data({ content: req })
        .post()
        .then(() => {
          history.replace('/system/setting/distribute_templete/order_printer')
          Tip.success(i18next.t('保存成功'))
        })
    }
  }

  render() {
    const { isLoading, content } = this.state
    const canEdit = globalStore.hasPermission('edit_salemenu_templates')

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
      <EditorSaleMenus
        config={content}
        mockData={formatData(mockData)}
        onSave={this.handleSave}
        showEditor={canEdit}
        addFields={addFields}
      />
    )
  }
}

TemEditor.propTypes = {
  history: PropTypes.object,
}

export default TemEditor
