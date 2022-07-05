import React, { useState, useEffect } from 'react'
import { LoadingChunk, Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { EditorBoxLabel } from 'gm-printer'
import { history } from '../../../common/service'
import defaultConfig from '../config/template_config/box_config'
import globalStore from '../../../stores/global'
import addFields from '../config/add_fields'
import formatData from '../config/data_to_key'
import mockData from '../config/mock_data/default_data'
import _ from 'lodash'

// 判定是无效的长度
const isInvalidLength = (string) => {
  const number = parseFloat(string)
  return _.isNaN(number) || number <= 0
}

setTitle(i18next.t('箱签模板设置'))

const BoxLabelEdit = ({
  location: {
    query: { template_id },
  },
}) => {
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState(defaultConfig)

  useEffect(() => {
    if (template_id) {
      fetchTempDetail()
        .then((json) => {
          const { content } = json.data
          setContent(content)
          setLoading(false)
        })
        .catch(() => {
          window.alert(i18next.t('模板配置发生变化，请重试'))
          window.closeWindow()
        })
    } else {
      setLoading(false)
    }
  }, [])

  const fetchTempDetail = () => {
    return Request('/box_template/detail')
      .data({
        id: template_id,
      })
      .get()
  }

  const handleSave = (config, isSaveAs) => {
    const { name, page } = config
    // 校验数据
    if (!name) {
      Tip.info('模版名称不能为空')
      return
    } else if (name.length > 10) {
      Tip.info(i18next.t('模板名称不能超过10个汉字'))
      return
    } else if (
      isInvalidLength(page.size.width) ||
      isInvalidLength(page.size.height)
    ) {
      Tip.info(i18next.t('请填入有效的纸张尺寸'))
      return
    }

    console.log(config)

    if (template_id && !isSaveAs) {
      // 编辑模板
      const req = {
        content: JSON.stringify(config),
        id: template_id,
      }
      Request('/box_template/update')
        .data(req)
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功'))
        })
    } else {
      // 新建模板
      Request('/box_template/create')
        .data({
          content: JSON.stringify(config),
        })
        .post()
        .then(() => {
          history.replace('/system/setting/distribute_templete/order_printer')
          Tip.success(i18next.t('保存成功'))
        })
    }
  }

  const canEdit = globalStore.hasPermission('edit_box_template')

  if (loading) {
    return (
      <LoadingChunk
        text={i18next.t('数据请求中...')}
        loading
        style={{ marginTop: '300px' }}
      />
    )
  }
  return (
    <EditorBoxLabel
      config={content}
      mockData={formatData(mockData)}
      showEditor={canEdit}
      onSave={handleSave}
      addFields={addFields}
    />
  )
}

export default BoxLabelEdit
