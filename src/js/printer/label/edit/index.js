import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { LoadingChunk, Tip } from '@gmfe/react'
import { PrinterEditShadow } from 'gm-printer-label'
import testData from './test_data'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { observer } from 'mobx-react'
import defaultTempList from './default_temp.json'
import defaultConfig from './config.json'
import addFields from './add_fields'
import insertBlocksConfig from './insert_blocks_config'
import { toKey } from './data_to_key'
import { history } from 'common/service'
import globalStore from '../../../stores/global'

setTitle(i18next.t('标签模板设置'))

@observer
class LabelEdit extends React.Component {
  id = ''

  constructor(props) {
    super(props)
    this.state = {
      content: defaultConfig,
      loading: true,
    }
  }

  async componentDidMount() {
    this.id = this.props.location.query.template_id
    await globalStore.fetchCustomizedConfigs()
    if (this.id) {
      Request('/station/print_tag/tag_content')
        .data({ id: this.id })
        .get()
        .then((json) => {
          this.setState({ content: json.data.content, loading: false })
          return json.data
        })
    } else {
      this.setState({ loading: false })
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
      Request('/station/print_tag/edit')
        .data({ ...req, id: this.id })
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功'))
        })
    } else {
      // 新建模板
      Request('/station/print_tag/create')
        .data(req)
        .post()
        .then(() => {
          history.replace('/system/setting/distribute_templete/order_printer')
          Tip.success(i18next.t('保存成功'))
        })
    }
  }

  render() {
    const id = this.id
    // 净菜类添加商品字段
    let newAddFields = globalStore.isCleanFood()
      ? {
          ...addFields,
          [i18next.t('加工信息')]: [
            { key: i18next.t('产地'), value: '{{产地}}' },
            { key: i18next.t('原料说明'), value: '{{原料说明}}' },
            { key: i18next.t('建议使用方法'), value: '{{建议使用方法}}' },
            { key: i18next.t('贮存条件'), value: '{{贮存条件}}' },
            { key: i18next.t('切配规格'), value: '{{切配规格}}' },
            { key: i18next.t('许可证'), value: '{{许可证}}' },
            { key: i18next.t('产品执行标准'), value: '{{产品执行标准}}' },
            {
              key: i18next.t('营养成分表'),
              fieldType: 'table',
              value: '营养成分表',
            },
            { key: i18next.t('计划开始时间'), value: '{{计划开始时间}}' },
            { key: i18next.t('计划完成时间'), value: '{{计划完成时间}}' },
            { key: i18next.t('保质期'), value: '{{保质期}}' },
          ],
        }
      : addFields

    const configs = globalStore.customizedConfigs.filter(
      (v) => v.permission.read_station_sorting,
    )
    if (configs.length) {
      const customizedConfigs = []
      _.forEach(configs, (v) => {
        customizedConfigs.push({
          key: v.field_name,
          value: `{{自定义_${v.id}}}`,
        })
      })
      newAddFields = {
        ...newAddFields,
        [i18next.t('自定义字段')]: customizedConfigs,
      }
    }

    if (this.state.loading) {
      return (
        <LoadingChunk
          text={i18next.t('数据请求中...')}
          loading
          style={{ marginTop: '300px' }}
        />
      )
    } else {
      return (
        <div>
          <PrinterEditShadow
            defaultTempList={defaultTempList}
            initDefaultTemp={!id ? 'default_without_food_security_code' : null}
            data={toKey(testData)}
            config={this.state.content}
            onSave={this.handleSave}
            addFields={newAddFields}
            insertBlocksConfig={insertBlocksConfig}
          />
        </div>
      )
    }
  }
}

export default LabelEdit
