import React from 'react'
import { LabelEditorPreSort } from 'gm-printer-label'
import { LoadingChunk, Tip } from '@gmfe/react'
import defaultConfig from '../config/template_config/default_config'
import mockData from '../config/mock_data'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'
import { history } from 'common/service'
import toKey from '../config/data_to_key'
import addFields from '../config/add_fields'
import insertBlocksConfig from '../config/add_fields/insert_blocks_config'
import PropTypes from 'prop-types'
import TEM_LIST, {
  PRE_SORT_TEM_DEFAULT,
} from '../config/template_config/template_config_list'

setTitle(i18next.t('预分拣模板设置'))

class TemEditor extends React.Component {
  id = ''

  constructor(props) {
    super(props)
    this.state = {
      key: 0,
      content: defaultConfig,
      loading: false,
    }
  }

  componentDidMount() {
    this.id = this.props.location.query.template_id

    if (this.id) {
      this.setState({ loading: true })
      this.get().then(() => {
        this.setState({ loading: false })
      })
    }
  }

  get = () => {
    return Request('/fe/pre_sort_tpl/get')
      .data({ id: this.id })
      .get()
      .then((json) => {
        this.setState({ content: json.data.content, key: Math.random })
        return json.data
      })
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
      config.page.type === '-1' &&
      (!config.page.customizeWidth || !config.page.customizeHeight)
    ) {
      Tip.info(i18next.t('自定义尺寸不能为空'))
      return
    }

    const req = {
      content: JSON.stringify(config),
    }
    if (this.id && !isSaveAs) {
      // 编辑模板 isSaveAs 表示另存为
      Request('/fe/pre_sort_tpl/edit')
        .data({ ...req, id: this.id })
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功'))
        })
    } else {
      // 新建模板
      Request('/fe/pre_sort_tpl/create')
        .data(req)
        .post()
        .then(() => {
          history.replace('/system/setting/distribute_templete/order_printer')
          Tip.success(i18next.t('保存成功'))
        })
    }
  }

  render() {
    const { isLoading, content, key } = this.state

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
      <LabelEditorPreSort
        key={key} // 强制刷新
        config={content}
        data={toKey(mockData)}
        onSave={this.handleSave}
        initDefaultTemp={this.id ? null : PRE_SORT_TEM_DEFAULT}
        defaultTempList={TEM_LIST}
        addFields={addFields}
        insertBlocksConfig={insertBlocksConfig}
      />
    )
  }
}

TemEditor.propTypes = {
  location: PropTypes.object,
}

export default TemEditor
