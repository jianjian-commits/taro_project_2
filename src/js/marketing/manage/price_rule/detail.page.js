import { i18next } from 'gm-i18n'
import React from 'react'
import { Dialog, Tip, Flex } from '@gmfe/react'
import { is } from '@gm-common/tool'
import DetailHeader from './detail_header'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { priceRuleTarget } from './filter'
import { history } from 'common/service'
import { refPriceTypeHOC } from 'common/components/ref_price_type_hoc'
import ImportLead from './components/import'
import Category2List from './detail_category_2_list'
import { connect } from 'react-redux'
import { apiDownloadPriceRule } from './api_request'
import actions from '../../../actions'
import './actions'
import './reducer'
import { PRICE_RULE_TYPE } from 'common/enum'

import SkuList from './detail_sku_list'
import ObjectList from './detail_object_list'

const objectColumns = (targetType) => {
  // 面向站点的锁价
  if (targetType === 'station') {
    return [
      {
        accessor: 'id',
        Header: i18next.t('站点ID'),
      },
      {
        accessor: 'name',
        Header: i18next.t('站点名'),
      },
    ]
  }

  return [
    {
      accessor: 'id',
      Header: i18next.t('商户ID'),
    },
    {
      accessor: 'name',
      Header: i18next.t('商户名'),
    },
  ]
}

@refPriceTypeHOC(1)
class PriceRuleDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      upload_modal_show: false,
      upload_type: null,
      uploading: false,
    }
  }

  componentDidMount() {
    if (
      this.props.location.action !== 'POP' ||
      (this.props.location.action === 'POP' &&
        this.props.price_rule.ruleDetail.notUpdate)
    )
      return
    const { id, viewType } = this.props.location.query
    // id和viewType存在, 显示编辑、copy、查看
    if (id && viewType) {
      actions.price_rule_detail_get(id, viewType)
    } else if (!this.props.price_rule.ruleDetail.salemenu_id) {
      // 在add页面刷新，则跳转列表页
      history.replace('/marketing/manage/price_rule')
    }

    // 清除数据
    actions.price_rule_object_input_clear()
    actions.price_rule_sku_input_clear()
    actions.price_rule_sku_pagination_clear()
  }

  componentWillUnmount() {
    if (!this.props.price_rule.ruleDetail.notUpdate) {
      actions.price_rule_detail_clear()
    }
  }

  handleUpload(type) {
    this.setState({
      upload_type: type,
      upload_modal_show: true,
      uploading: false,
    })
  }

  handleDownload(type) {
    const { ruleDetail } = this.props.price_rule

    if (!ruleDetail._id) return

    apiDownloadPriceRule(ruleDetail._id, type)
  }

  handleOpenDetailUpload = () => {
    const { salemenu_id, type, fee_type } = this.props.price_rule.ruleDetail
    actions.price_rule_detail_not_update(true)
    console.log(this.props.price_rule.ruleDetail)

    this.setState({
      upload_type: 'sku',
      upload_modal_show: false,
    })
    history.push({
      pathname: '/marketing/manage/price_rule/sku_upload',
      query: {
        salemenu_id,
        type,
        fee_type,
        refPriceType: this.props.refPriceType,
      },
    })
  }

  handleExcelDrop = (file) => {
    const { ruleDetail } = this.props.price_rule
    const postData = {
      upload_type: this.state.upload_type,
      upload_file: file,
      salemenu_id: ruleDetail.salemenu_id,
      rule_type: ruleDetail.type,
      uploading: true,
    }

    actions.price_rule_upload(postData)
  }

  handleUploadCancel = () => {
    this.setState({
      upload_type: null,
      upload_modal_show: false,
      uploading: false,
    })
    actions.price_rule_upload_clear()
  }

  handleUploadSubmit = () => {
    const { list, tips } = this.props.price_rule.upload

    if (!list || !list.length) {
      Tip.warning(i18next.t('请选择文件上传~'))
      return false
    }
    if (tips.length) {
      Tip.warning(i18next.t('存在无效数据，请修改excel后重新上传'))
      return false
    }

    actions.price_rule_update_detail_list(list, this.state.upload_type)
    this.setState({
      upload_modal_show: false,
    })
  }

  render() {
    const { upload, ruleDetail } = this.props.price_rule
    const targetType = priceRuleTarget(PRICE_RULE_TYPE, ruleDetail.type) || {}
    const cls = classNames({
      cursor: is.phone(),
      'price-rule': true,
    })

    return (
      <div className={cls}>
        <DetailHeader {...this.props} />

        <Flex alignStart>
          {/* 商户数 */}
          <div
            className='gm-margin-20'
            style={{
              flex: 2,
              border: '1px solid #eceff3',
              borderBottom: 'none',
            }}
          >
            <ObjectList
              {...this.props}
              onUpload={this.handleUpload.bind(this, 'customer')}
              onDownload={this.handleDownload.bind(this, 'customer')}
            />
          </div>
          {/* 商品数/分类数 */}
          <div
            className='gm-margin-right-20 gm-margin-top-20'
            style={{ flex: 3, border: '1px solid #eceff3' }}
          >
            {ruleDetail.rule_object_type === 1 ? (
              <SkuList
                {...this.props}
                onUpload={this.handleOpenDetailUpload}
                onDownload={this.handleDownload.bind(this, 'sku')}
              />
            ) : (
              <Category2List {...this.props.price_rule} />
            )}
          </div>
        </Flex>

        <Dialog
          show={this.state.upload_modal_show}
          size='lg'
          title={
            i18next.t('KEY143', {
              VAR1: targetType.name,
            }) /* src:`批量上传${this.state.upload_type === 'sku' ? '商品' : targetType.name}` => tpl:批量上传${VAR1} */
          }
          onOK={this.handleUploadSubmit}
          onCancel={this.handleUploadCancel}
        >
          <ImportLead
            data={{
              columns: objectColumns(ruleDetail.type),
              list: upload.list,
            }}
            tips={upload.tips}
            onUpload={this.handleExcelDrop}
            fileTempUrl={
              targetType.id === 'customer'
                ? '/station/price_rule/upload/template?upload_type=customer'
                : '/station/price_rule/upload/template?upload_type=station'
            }
          />
          {this.state.uploading ? (
            <i className='ifont ifont-loading ifont-spin' />
          ) : null}
        </Dialog>
      </div>
    )
  }
}

PriceRuleDetail.propTypes = {
  price_rule: PropTypes.object,
  refPriceType: PropTypes.object,
}

export default connect((state) => ({
  price_rule: state.price_rule,
}))(PriceRuleDetail)
