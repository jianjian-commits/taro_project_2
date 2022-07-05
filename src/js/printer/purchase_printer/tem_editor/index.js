import React from 'react'
import { EditorPurchase } from 'gm-printer'
import { Tip, LoadingChunk } from '@gmfe/react'
import defaultConfig from '../config/template_config/purchase_config'
import mockData from '../config/mock_data/purchase_bill_data'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'
import { history } from '../../../common/service'
import _ from 'lodash'
import { formatBill } from '../config/data_to_key'
import addFields from '../config/add_fields'
import globalStore from '../../../stores/global'

setTitle(i18next.t('采购模板设置'))

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
      Request('/fe/purchase_tpl/get')
        .data({ id: template_id })
        .get()
        .then((json) => {
          const { content } = json.data
          this.setState({ content, isLoading: false })
        })
        .catch(() => {
          window.alert(i18next.t('模板配置发生变化，请重试'))
          window.closeWindow()
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
    // 编辑模板
    if (template_id && !isSaveAs) {
      const req = {
        content: JSON.stringify(config),
        id: template_id,
      }
      Request('/fe/purchase_tpl/edit')
        .data(req)
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功'))
        })
      // 新建模板
    } else {
      const req = JSON.stringify(config)
      Request('/fe/purchase_tpl/create')
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
    const canEdit = globalStore.hasPermission('edit_purchase_print_template')

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
      <EditorPurchase
        config={content}
        mockData={formatBill(mockData)}
        onSave={this.handleSave}
        showEditor={canEdit}
        addFields={addFields}
        isPurchase
      />
    )
  }
}

export default TemEditor
