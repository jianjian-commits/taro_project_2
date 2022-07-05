import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Tip,
  Loading,
  Button,
  Flex,
  Form,
  FormItem,
  Select,
  Option,
  RightSideModal,
  Dropper,
  Dialog,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import PropTyps from 'prop-types'
import { history } from '../../common/service'
import styles from './../style.module.less'
import { BlockWithTextBg, BlockLines, BlockTable } from './block'
import FieldGroupAddDialog from './dialog_field_group'
import FieldGroupSettingDialog from './dialog_field_setting'
import CustomerSettingModal from './customer_setting_modal'
import actions from '../../actions'
import '../actions'
import '../reducer'
import { Request } from '@gm-common/request'

function handleHeaderBlockLineColumnAdd(lineNo, columnNo) {
  actions.block_line_column_add('headerBlockLines', lineNo, columnNo)
}

function handleHeaderBlockLineColumnDel(lineNo, columnNo) {
  actions.block_line_column_del('headerBlockLines', lineNo, columnNo)
}

function handleHeaderBlockLineColumnSetting(lineNo, columnNo) {
  actions.block_line_column_setting('headerBlockLines', lineNo, columnNo)
}

function handleTopInfoBlockLineColumnAdd(lineNo, columnNo) {
  actions.block_line_column_add('topInfoBlockLines', lineNo, columnNo)
}

function handleTopInfoBlockLineColumnDel(lineNo, columnNo) {
  actions.block_line_column_del('topInfoBlockLines', lineNo, columnNo)
}

function handleTopInfoBlockLineColumnSetting(lineNo, columnNo) {
  actions.block_line_column_setting('topInfoBlockLines', lineNo, columnNo)
}

function handleProductBlockHeaderColumnAdd(columnNo) {
  actions.block_product_header_add('productBlockHeader', columnNo)
}

function handleProductBlockHeaderColumnDel(headerLength, columnNo) {
  if (headerLength === 1) {
    Tip.warning(i18next.t('不允许全部删除'))
    return
  }

  actions.block_product_header_del(columnNo)
}

function handleProductBlockHeaderColumnSetting(columnNo) {
  actions.block_product_header_setting('productBlockHeader', columnNo)
}

class TemplateComponent extends React.Component {
  constructor(props) {
    super(props)

    this.handleHeaderBlockLineAdd = ::this.handleHeaderBlockLineAdd
    this.handleTopInfoBlockLineAdd = ::this.handleTopInfoBlockLineAdd
    this.handleBottomInfoBlockLineAdd = ::this.handleBottomInfoBlockLineAdd
    this.handleFooterBlockLineAdd = ::this.handleFooterBlockLineAdd
    this.handleConfigSave = ::this.handleConfigSave
    this.handleCustomerSetting = ::this.handleCustomerSetting
  }

  componentDidMount() {
    this.props.didMountFunc()
  }

  componentWillUnmount() {
    actions.template_config_reset()
  }

  handleHeaderBlockLineAdd(direction = 'forward', lineNo) {
    const { headerBlockLines } = this.props.distribute_template.templateConfig
    actions.block_line_add(
      direction,
      'headerBlockLines',
      lineNo || headerBlockLines.length,
      null
    )
  }

  handleTopInfoBlockLineAdd(direction = 'forward', lineNo) {
    const { topInfoBlockLines } = this.props.distribute_template.templateConfig
    actions.block_line_add(
      direction,
      'topInfoBlockLines',
      lineNo || topInfoBlockLines.length,
      null
    )
  }

  handleBottomInfoBlockLineAdd(direction = 'forward', lineNo) {
    const {
      bottomInfoBlockLines,
    } = this.props.distribute_template.templateConfig
    actions.block_line_add(
      direction,
      'bottomInfoBlockLines',
      lineNo || bottomInfoBlockLines.length,
      null
    )
  }

  handleFooterBlockLineAdd(direction = 'forward', lineNo) {
    const { footerBlockLines } = this.props.distribute_template.templateConfig
    actions.block_line_add(
      direction,
      'footerBlockLines',
      lineNo || footerBlockLines.length,
      null
    )
  }

  handleTemplateConfigChange(name, event) {
    actions.template_config_detail_change(name, event.target.value)
  }

  handleCustomerSetting() {
    const { templateConfig } = this.props.distribute_template
    const { canSave } = this.props

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '570px' },
      children: (
        <CustomerSettingModal
          templateId={templateConfig.id}
          selectedIDs={templateConfig.address_ids}
          editPermission={canSave}
        />
      ),
    })
  }

  handleLogoSelect(file, event) {
    event.preventDefault()

    if (file[0].size > 512 * 1024) {
      Tip.warning(i18next.t('图片大小不能超过500Kb'))
      return
    }

    Request('/station/image/upload')
      .data({
        image_file: file[0],
      })
      .post()
      .then((json) => {
        const imgURL = `http://img.guanmai.cn/station_pic/${json.data.img_path_id}`
        actions.template_config_detail_change('logo', imgURL)
      })
  }

  handleConfigSave() {
    const {
      templateConfig: { name },
    } = this.props.distribute_template
    const trimName = name.trim()
    // 发起请求前先去掉前后空格
    actions.template_config_detail_change('name', trimName)
    if (trimName === '') {
      Tip.warning(i18next.t('模板名称不能为空'))
      return
    } else if (trimName.length > 10) {
      Tip.warning(i18next.t('模板名称长度最多10个字'))
      return
    }

    this.props.handleSave()
  }

  handleResetToDefault() {
    actions.template_config_reset()
  }

  handlePageClose() {
    Dialog.confirm({
      children: i18next.t('关闭页面将不保存修改，确定关闭？'),
      title: i18next.t('警告'),
    })
      .then(() => {
        history.replace('/system/setting/distribute_templete')
      })
      .catch(() => {})
  }

  render() {
    const {
      templateConfigLoading,
      templateConfig,
      printSizeList,
    } = this.props.distribute_template

    if (templateConfigLoading) {
      return (
        <div>
          <QuickPanel title={i18next.t('模板自定义')} icon='bill'>
            <Loading />
          </QuickPanel>
        </div>
      )
    } else if (!templateConfigLoading && !templateConfig) {
      return (
        <div>
          <QuickPanel title={i18next.t('模板自定义')} icon='bill'>
            <div className='gm-text-red text-center gm-padding-20'>
              {i18next.t('模板配置发生变化,请返回上一页')}
            </div>
          </QuickPanel>
        </div>
      )
    }

    const {
      headerBlockLines,
      topInfoBlockLines,
      productBlockHeader,
      bottomInfoBlockLines,
      footerBlockLines,
    } = templateConfig
    const { canSave } = this.props

    return (
      <div>
        <QuickPanel title={i18next.t('基本信息')} icon='bill'>
          <Flex justifyCenter className='gm-padding-15'>
            <Form labelWidth='100px' horizontal>
              <FormItem label={i18next.t('模板名称')} required>
                <input
                  type='text'
                  value={templateConfig.name}
                  disabled={!canSave}
                  onChange={this.handleTemplateConfigChange.bind(this, 'name')}
                />
              </FormItem>
              <FormItem label={i18next.t('打印规格')} required>
                <Select
                  value={templateConfig.print_size}
                  disabled={!canSave}
                  onChange={(value) => {
                    actions.template_config_detail_change('print_size', value)
                  }}
                  className={styles.printSizeSelect}
                >
                  {printSizeList.map((size) => (
                    <Option key={size} value={size}>
                      {size}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label={i18next.t('公司logo')}>
                {canSave ? (
                  <Dropper
                    accept='image/*'
                    onDrop={this.handleLogoSelect}
                    className={styles.logoUpload}
                  >
                    {!templateConfig.logo ? (
                      <i className='xfont xfont-plus' />
                    ) : (
                      <img
                        src={templateConfig.logo}
                        className={styles.printLogo}
                      />
                    )}
                  </Dropper>
                ) : (
                  <img src={templateConfig.logo} className={styles.printLogo} />
                )}
                <p className='gm-text-desc gm-text-12'>
                  {i18next.t('logo固定在首行左侧位置，上传图片小于500K')}
                </p>
              </FormItem>
              <FormItem label={i18next.t('商户配置')}>
                <a
                  href='javascript:;'
                  onClick={this.handleCustomerSetting}
                  className={styles.printCustomerSelect}
                >
                  {i18next.t('点击设置')}
                </a>
              </FormItem>
            </Form>
          </Flex>
        </QuickPanel>

        <QuickPanel
          title={i18next.t('模板自定义')}
          right={
            canSave ? (
              <Button type='primary' onClick={this.handleResetToDefault}>
                {i18next.t('恢复默认布局')}
              </Button>
            ) : null
          }
          icon='bill'
        >
          <div className={styles.a4PageWrap}>
            <BlockWithTextBg bgText={i18next.t('页头区域')}>
              <BlockLines
                lines={headerBlockLines}
                onLineAdd={this.handleHeaderBlockLineAdd}
                onColumnAdd={handleHeaderBlockLineColumnAdd}
                onColumnDel={handleHeaderBlockLineColumnDel}
                onFieldSetting={handleHeaderBlockLineColumnSetting}
                disabled={!canSave}
              />
            </BlockWithTextBg>

            <BlockWithTextBg bgText={i18next.t('信息区域')}>
              <BlockLines
                lines={topInfoBlockLines}
                onLineAdd={this.handleTopInfoBlockLineAdd}
                onColumnAdd={handleTopInfoBlockLineColumnAdd}
                onColumnDel={handleTopInfoBlockLineColumnDel}
                onFieldSetting={handleTopInfoBlockLineColumnSetting}
                disabled={!canSave}
              />
            </BlockWithTextBg>

            <BlockWithTextBg
              bgText={i18next.t('商品区域')}
              style={{ height: '150px' }}
            >
              <BlockTable
                header={productBlockHeader.tr}
                onColumnAdd={handleProductBlockHeaderColumnAdd}
                onColumnDel={handleProductBlockHeaderColumnDel.bind(
                  null,
                  productBlockHeader.tr.length
                )}
                onFieldSetting={handleProductBlockHeaderColumnSetting}
                disabled={!canSave}
              />
            </BlockWithTextBg>

            <BlockWithTextBg bgText={i18next.t('信息区域')}>
              <BlockLines
                lines={bottomInfoBlockLines}
                onLineAdd={this.handleBottomInfoBlockLineAdd}
                onColumnAdd={(lineNo, columnNo) => {
                  actions.block_line_column_add(
                    'bottomInfoBlockLines',
                    lineNo,
                    columnNo
                  )
                }}
                onColumnDel={(lineNo, columnNo) => {
                  actions.block_line_column_del(
                    'bottomInfoBlockLines',
                    lineNo,
                    columnNo
                  )
                }}
                onFieldSetting={(lineNo, columnNo) => {
                  actions.block_line_column_setting(
                    'bottomInfoBlockLines',
                    lineNo,
                    columnNo
                  )
                }}
                disabled={!canSave}
              />
            </BlockWithTextBg>

            <BlockWithTextBg bgText={i18next.t('页尾区域')}>
              <BlockLines
                lines={footerBlockLines}
                onLineAdd={this.handleFooterBlockLineAdd}
                onColumnAdd={(lineNo, columnNo) => {
                  actions.block_line_column_add(
                    'footerBlockLines',
                    lineNo,
                    columnNo
                  )
                }}
                onColumnDel={(lineNo, columnNo) => {
                  actions.block_line_column_del(
                    'footerBlockLines',
                    lineNo,
                    columnNo
                  )
                }}
                onFieldSetting={(lineNo, columnNo) => {
                  actions.block_line_column_setting(
                    'footerBlockLines',
                    lineNo,
                    columnNo
                  )
                }}
                disabled={!canSave}
              />
            </BlockWithTextBg>

            <div className={styles.printDesc}>
              <div>{i18next.t('注：当配送单打印换页时')}</div>
              <ul>
                <li>{i18next.t('页头区域、页尾区域内容每页均打印')}</li>
                <li>{i18next.t('信息区域、商品区域内容仅打印一次')}</li>
              </ul>
            </div>
          </div>

          <Flex justifyCenter className='gm-padding-15'>
            <Button onClick={this.handlePageClose}>{i18next.t('取消')}</Button>
            <Button
              type='primary'
              onClick={this.handleConfigSave}
              disabled={!canSave}
              title={!canSave ? i18next.t('无编辑权限') : ''}
              className='gm-margin-left-5'
            >
              {i18next.t('保存')}
            </Button>
          </Flex>
        </QuickPanel>

        <FieldGroupAddDialog />
        <FieldGroupSettingDialog />
      </div>
    )
  }
}

TemplateComponent.propTypes = {
  didMountFunc: PropTyps.func.isRequired,
  handleSave: PropTyps.func.isRequired,
}

export default TemplateComponent
