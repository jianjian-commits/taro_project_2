import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Tip, Uploader, Button, Select, Flex } from '@gmfe/react'
import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import globalStore from 'stores/global'
import { Request } from '@gm-common/request'
import { history } from 'common/service'
import { withRouter } from 'react-router'
@withRouter
class BatchImportModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
      template_id: null, // 模板ID
      list: [], // 模板列表
      system_template_id: '', // 系统模板id
    }
  }

  componentDidMount() {
    // 这里到时候需要用注释的
    const isCleanFoodStation = globalStore.isCleanFood()
    // const isCleanFoodStation = false
    const { isCleanFoodType } = this.props
    if (!isCleanFoodType) {
      Request('/station/salemenu/batch/template/list')
        .get()
        .then((json) => {
          const system_template_id =
            json.data.find((item) => item.type === 1)?.['id'] || ''
          this.setState({
            system_template_id,
            list: [
              {
                text: '选择模板',
                value: '',
              },
              ..._.map(json.data, (item) => {
                return {
                  text: item.name,
                  value: item.id,
                }
              }),
            ],
          })
        })
    }
  }

  handleUploadFileSelect = (files) => {
    this.setState({
      file: files[0],
    })
  }

  handleSelectValue = (value) => {
    this.setState({
      template_id: value || null,
    })
  }

  handleDownload = () => {
    const { isCleanFoodType } = this.props
    const { template_id } = this.state
    if (isCleanFoodType) {
      // 净菜
      window.open(
        `/product/sku/export_sku_excel?is_clean_food=${
          isCleanFoodType ? 1 : 0
        }`,
      )
    } else {
      if (!template_id) {
        Tip.warning(i18next.t('请选择模板'))
        return
      }
      // 毛菜，传模板ID
      window.open(`/station/salemenu/batch/template/download?id=${template_id}`)
    }
  }

  handleCancel = () => {
    this.setState({
      file: null,
    })
    this.props.onCancel()
  }

  handleImport = () => {
    const { file, template_id } = this.state
    const { isCleanFoodType } = this.props

    if (!file) {
      Tip.warning(i18next.t('请选择文件上传！'))
      return
    }

    // 毛菜
    if (!isCleanFoodType && !template_id) {
      Tip.warning(i18next.t('请选择模板！'))
      return
    }

    requireGmXlsx((res) => {
      const { sheetToJson } = res
      sheetToJson(file).then((json) => {
        const sheetData = _.values(json[0])[0]

        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
          return false
        }

        if (!isCleanFoodType && template_id) {
          // 毛菜
          this.props.onSubmit(file, isCleanFoodType, template_id)
        } else {
          // 净菜
          this.props.onSubmit(file, isCleanFoodType)
        }
      })
    })

    this.setState({
      file: null,
    })
  }

  /**
   *
   * @param {*} file
   * @param {*} text
   * @returns 净菜的说明
   */
  clearFoodText = (file, text) => {
    return (
      <div>
        <div>
          {i18next.t('上传需导入的文件')}
          <div className='gm-gap-10' />
          <Uploader onUpload={this.handleUploadFileSelect} accept='.xlsx'>
            <Button>{file ? i18next.t('重新上传') : i18next.t('上传')}</Button>
          </Uploader>
          {file ? <div className='gm-text-desc'>{file.name}</div> : <br />}
          <a style={{ cursor: 'pointer' }} onClick={this.handleDownload}>
            {text}
          </a>
        </div>
        <br />
        <div>
          {i18next.t('填写说明')}：
          <ul className='gm-text-desc' style={{ fontSize: '12px' }}>
            <li>
              <span>{i18next.t('SPUID（必填）')}:</span>
              <span>
                {i18next.t('导入规格的SPUID信息，在分类信息中可导出查看；')}
              </span>
            </li>
            <li>
              <span>{i18next.t('自定义编码（选填）')}:</span>
              <span>{i18next.t('商品的自定义编码信息；')}</span>
            </li>
            <li>
              <span>{i18next.t('商品名（必填）')}：</span>
              <span>{i18next.t('商品名称信息；')}</span>
            </li>
            <li>
              <span>{i18next.t('销售单位/销售规格（必填）')}：</span>
              <span>
                {i18next.t(
                  '表明商品的规格信息，如SPU单位为斤，要添加按斤销售的商品，填写“销售单位”为“斤”，“销售规格”填写为“1”；',
                )}
              </span>
              <span>{i18next.t('如3斤/袋销售，填写“3”；')}</span>
            </li>
            <li>
              <span>{i18next.t('损耗率（必填）')}：</span>
              <span>
                {i18next.t(
                  '必须填写0~100的数值，会在采购任务中额外计算采购量；',
                )}
              </span>
            </li>
            <li>
              <span>{i18next.t('默认供应商编码（必填）')}：</span>
              <span>
                {i18next.t('表明商品的默认供应商，在供应商管理中可查看；')}
              </span>
            </li>
            <li>
              <div>
                <span>{i18next.t('净菜商品说明')}：</span>
                <span>
                  {i18next.t(
                    '若需创建净菜商品则必须填写以下两项，有一项不填写则净菜商品创建不成功，若两项都不填写，则默认创建毛菜商品；',
                  )}
                </span>
              </div>
              <div>
                <span>{i18next.t('物料名称（必填）')}：</span>
                <span>
                  {i18next.t('表明商品的原料信息，不填净菜商品创建不成功；')}
                </span>
              </div>
              <div>
                <span>{i18next.t('单位数量（基本单位）')}：</span>
                <span>
                  {i18next.t('表明商品的配比信息，不填净菜商品创建不成功；')}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  render() {
    const { file, template_id, list, system_template_id } = this.state
    const { isCleanFoodType } = this.props
    // 这里到时候需要用注释的
    const isCleanFoodStation = globalStore.isCleanFood()
    // const isCleanFoodStation = true

    let text = i18next.t('下载xlsx模板')
    if (isCleanFoodStation) {
      text = isCleanFoodType
        ? i18next.t('下载导入净菜商品模版')
        : i18next.t('下载导入毛菜商品模板')
    }
    return (
      <>
        <div>
          {isCleanFoodStation && isCleanFoodType ? (
            <>{this.clearFoodText(file, text)}</>
          ) : (
            <>
              <Flex alignCenter>
                <div>
                  {i18next.t('选择导入模板')}
                  <div className='gm-gap-10' />
                  <Select
                    value={template_id || ''}
                    onChange={(value) => this.handleSelectValue(value)}
                    data={list}
                    style={{ minWidth: 80 }}
                  />
                  <a
                    className='gm-margin-left-10'
                    style={{ cursor: 'pointer' }}
                    onClick={this.handleDownload}
                  >
                    {text}
                  </a>
                </div>
                {template_id !== system_template_id && (
                  <Flex flex justifyEnd>
                    <a
                      onClick={() => {
                        this.handleCancel()
                        history.push(
                          '/system/setting/distribute_templete?activeType=8',
                        )
                      }}
                      className='gm-cursor'
                    >
                      {i18next.t('模板设置')} &gt;
                    </a>
                  </Flex>
                )}
              </Flex>
              <div className='gm-margin-top-15'>
                {i18next.t('上传xlsx文件')}
                <div className='gm-gap-10' />
                <Uploader onUpload={this.handleUploadFileSelect} accept='.xlsx'>
                  <Button>
                    {file ? i18next.t('重新上传') : i18next.t('上传')}
                  </Button>
                </Uploader>
                <div style={{ marginLeft: 80 }}>
                  {file ? (
                    <div className='gm-text-desc'>{file.name}</div>
                  ) : (
                    <div className='gm-margin-bottom-10' />
                  )}
                </div>
              </div>
              <div className='gm-text-desc' style={{ marginLeft: 80 }}>
                {i18next.t('如有模板可直接上传，无需再下载空模板')}
              </div>
            </>
          )}
        </div>
        <div className='text-right gm-margin-top-10'>
          <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleImport}>
            {i18next.t('确定')}
          </Button>
        </div>
      </>
    )
  }
}

BatchImportModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isCleanFoodType: PropTypes.bool.isRequired,
}

export default BatchImportModal
