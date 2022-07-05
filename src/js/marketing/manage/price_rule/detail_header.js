import { i18next, t } from 'gm-i18n'
import React from 'react'
import { DateRangePicker, Tip, Select, Button } from '@gmfe/react'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import _ from 'lodash'
import moment from 'moment'
import { priceRuleTarget, isInvalid } from './filter'
import { convertSid2Number } from 'common/filter'
import { history, System } from 'common/service'
import actions from '../../../actions'
import Big from 'big.js'
import editStore from './category_2_components/edit_store'
import globalStore from 'stores/global'
import { PRICE_RULE_STATUS, PRICE_RULE_TYPE } from 'common/enum'
import qs from 'query-string'

import ruleStore from './view_rule/rule_store'

const getSkuOrCategory = (rule_object_type, skuList, categoryList) => {
  switch (rule_object_type) {
    case 1: // 按商品锁价
      if (!skuList.length) {
        Tip.warning(i18next.t('请选择商品！'))
        return { inValid: true }
      }
      let tip = ''
      const inValidSku = _.find(skuList, function (sku) {
        if (sku.yx_price === '') {
          tip = sku.id + i18next.t('此商品计算规则不能为空')
          return true
        } else if (isInvalid(sku)) {
          tip = sku.id + i18next.t('此商品的规则只能输入大于0的数')
          return true
        } else if (
          sku.rule_type === 1 &&
          Big(sku.sale_price).plus(sku.yx_price).lt(0)
        ) {
          tip = sku.id + i18next.t('的规则价小于0,请重新输入!')
          return true
        }
      })

      if (inValidSku) {
        Tip.warning(tip)
        return { inValid: true }
      } else {
        const skus = skuList.map((sku) => ({
          sku_id: sku.id,
          yx_price: Big(sku.yx_price).times(100).valueOf(), // 传分
          rule_type: sku.rule_type,
        }))
        return { skus: JSON.stringify(skus), rule_object_type }
      }

    case 2: // 按分类锁价
      if (!categoryList.length) {
        Tip.warning(i18next.t('请选择分类!'))
        return { inValid: true }
      }

      let text
      const inValidCategory = _.find(categoryList, (item) => {
        if (item.yx_price === '') {
          text = item.category_2_id + i18next.t('此分类计算规则不能为空')
          return true
        } else if (isInvalid(item)) {
          text = item.category_2_id + i18next.t('此分类的规则只能输入大于0的数')
          return true
        }
      })

      if (inValidCategory) {
        Tip.warning(text)
        return { inValid: true }
      } else {
        const category_2_list = categoryList.map((o) => ({
          category_2_id: o.category_2_id,
          rule_type: o.rule_type,
          yx_price: Big(o.yx_price).times(100).valueOf(), // 传分
        }))
        return {
          category_2_list: JSON.stringify(category_2_list),
          rule_object_type,
        }
      }
  }
}

class DetailHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = _.extend({}, props.price_rule.ruleDetail)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(_.extend({}, nextProps.price_rule.ruleDetail))
  }

  handleViewTypeChange(viewType) {
    history.push(
      `/marketing/manage/price_rule/detail?viewType=${viewType}&id=${this.state._id}`
    )
  }

  handleCancel = () => {
    actions.price_rule_detail_not_update(false)
    history.go(-1)
  }

  handleDateChange = (begin, end) => {
    this.setState({
      begin,
      end,
    })
  }

  handleSelectChange = (value) => {
    this.setState({
      status: value,
    })
  }

  handleSave = () => {
    const thisState = this.state
    const thisProps = this.props
    const { ruleDetail } = thisProps.price_rule

    if (!ruleDetail.salemenu_id) {
      Tip.warning(i18next.t('报价单错误！'))
      return
    }
    if (!thisState.addresses.length) {
      Tip.warning(i18next.t('请选择锁价对象！'))
      return
    }

    const { rule_object_type, skus } = ruleDetail
    const obj = getSkuOrCategory(rule_object_type, skus, editStore.resultList)

    // 非法就退出
    if (obj.inValid) {
      return
    }

    const address_ids = ruleDetail.addresses.map(function (address) {
      if (ruleDetail.type === 'station') return address.id
      else return convertSid2Number(address.id + '') + ''
    })

    if (ruleDetail.viewType === 'add' || ruleDetail.viewType === 'copy') {
      const postData = {
        begin: moment(thisState.begin).format('YYYY-MM-DD'),
        end: moment(thisState.end).format('YYYY-MM-DD'),
        name: this.ruleName.value,
        salemenu_id: ruleDetail.salemenu_id,
        address_ids: JSON.stringify(address_ids),
        type: ruleDetail.type,
        ...obj,
      }

      this.setState({
        saving: true,
      })
      actions
        .price_rule_create(postData)
        .then((json) => {
          this.setState({
            saving: false,
          })

          if (json.code === 0) {
            actions.price_rule_detail_not_update(false)
            history.replace(
              `/marketing/manage/price_rule/detail?viewType=view&id=${json.data}`
            )
          }
        })
        .catch(() => {
          this.setState({
            saving: false,
          })
        })
    } else if (ruleDetail.viewType === 'edit') {
      const postData = {
        price_rule_id: thisState._id,
        begin: moment(thisState.begin).format('YYYY-MM-DD'),
        end: moment(thisState.end).format('YYYY-MM-DD'),
        name: this.ruleName.value,
        status: this.state.status,
        address_ids: JSON.stringify(address_ids),
        ...obj,
      }

      this.setState({
        saving: true,
      })
      ruleStore
        .handleEditDataSave(postData)
        .then((json) => {
          this.setState({
            saving: false,
          })

          if (json.code === 0) {
            actions.price_rule_detail_not_update(false)
            history.push(
              `/marketing/manage/price_rule/detail?viewType=view&id=${thisState._id}`
            )
          }
        })
        .catch(() => {
          this.setState({
            saving: false,
          })
        })
    }
  }

  handleExport = () => {
    window.open(
      '/product/sku_salemenu/list?' +
      qs.stringify({
        export: 1,
        salemenu_id: this.props.price_rule.ruleDetail.salemenu_id,
        export_source: 'price_rule',
        is_retail_interface: System.isC() ? 1 : null
      })
    )
  }

  render() {
    const { _id, viewType, name, begin, end, status } = this.state
    const thisProps = this.props
    const thisState = this.state
    const { ruleDetail, statusMap } = thisProps.price_rule
    const ruleTarget = priceRuleTarget(PRICE_RULE_TYPE, ruleDetail.type) || {}
    const isViewOrEdit =
      ruleDetail.viewType === 'view' || ruleDetail.viewType === 'edit'
    const priviledge = globalStore.hasPermission('edit_sjgz')
    const canExport = globalStore.hasPermission('get_sku')
    let buttonDom, statusDom

    if (thisState.viewType === 'view') {
      if (!globalStore.isCenterSaller() && priviledge) {
        if (thisState.status === 0) {
          buttonDom = (
            <Button
              type='primary'
              onClick={this.handleViewTypeChange.bind(this, 'copy')}
            >
              {i18next.t('复制')}
            </Button>
          )
        } else {
          buttonDom = (
            <div>
              <Button
                type='primary'
                onClick={this.handleViewTypeChange.bind(this, 'edit')}
                className='gm-margin-right-10'
              >
                {i18next.t('修改')}
              </Button>
              <Button
                type='primary'
                plain
                onClick={this.handleViewTypeChange.bind(this, 'copy')}
              >
                {i18next.t('复制')}
              </Button>
            </div>
          )
        }
      }
    } else {
      if (thisState.saving) {
        buttonDom = (
          <Button type='primary' disabled>
            <i className='ifont ifont-loading ifont-spin' />
          </Button>
        )
      } else {
        buttonDom = (
          <div>
            <Button onClick={this.handleCancel} className='gm-margin-right-10'>
              {i18next.t('取消')}
            </Button>
            <Button type='primary' onClick={this.handleSave}>
              {i18next.t('保存')}
            </Button>
          </div>
        )
      }
    }

    if (thisState.viewType === 'edit') {
      const statusArr = PRICE_RULE_STATUS.slice(1)
      if (thisState.status === 2) {
        statusArr.splice(1, 1)
      } else {
        statusArr.shift()
      }
      // 如果是总站,无法看到关闭
      if (!globalStore.isCenterSaller()) {
        statusArr.pop()
      }

      statusDom = (
        <Select
          ref={(ref) => {
            this.select_status = ref
          }}
          value={status}
          onChange={this.handleSelectChange}
        >
          {_.map(statusArr, (status) => {
            return (
              <option value={status.id} key={status.id}>
                {status.name}
              </option>
            )
          })}
        </Select>
      )
    } else if (thisState.viewType === 'copy' || thisState.viewType === 'add') {
      statusDom = (
        <div>
          <span>{i18next.t('未创建')}</span>
        </div>
      )
    } else {
      statusDom = <div>{statusMap[thisState.status]}</div>
    }

    return (
      <>
        <ReceiptHeaderDetail
          style={{ width: '900px' }}
          HeaderAction={buttonDom}
          HeaderInfo={[
            {
              label: t('锁价规则名称'),
              item: (
                <>
                  {viewType === 'view' ? (
                    name
                  ) : (
                    <input
                      className='form-control input-sm'
                      defaultValue={name}
                      placeholder={i18next.t('输入规则的名称')}
                      ref={(ref) => {
                        this.ruleName = ref
                      }}
                    />
                  )}
                </>
              ),
            },
            {
              label: t('状态'),
              item: statusDom,
            },
            {
              label: t('锁价规则编号'),
              item: <>{_id}</>,
            },
          ]}
          ContentInfo={[
            {
              label: t('起止时间'),
              item: (
                <>
                  {viewType === 'view' ? (
                    i18next.t('KEY126', {
                      VAR1: moment(begin).format('YYYY-MM-DD'),
                      VAR2: moment(end).format('YYYY-MM-DD'),
                    }) /* src:`${moment(this.state.begin).format("YYYY-MM-DD")}至${moment(this.state.end).format("YYYY-MM-DD")}` => tpl:${VAR1}至${VAR2} */
                  ) : (
                    <DateRangePicker
                      begin={moment(begin)}
                      end={moment(end)}
                      onChange={this.handleDateChange}
                      placeholder={[
                        i18next.t('开始日当天生效'),
                        i18next.t('结束日第二天失效'),
                      ]}
                    />
                  )}
                </>
              ),
            },
            {
              label: t('报价单名称'),
              item: (
                <>
                  {ruleDetail.salemenu_name}&nbsp;{' '}
                  {thisState.viewType === 'view' && canExport ? (
                    <a href='javascript:;' onClick={this.handleExport}>
                      {i18next.t('下载')}
                    </a>
                  ) : null}
                </>
              ),
            },
            {
              label: t('创建人'),
              item: <>{(isViewOrEdit && thisState.creator) || '-'}</>,
            },
            {
              label: t('创建时间'),
              item: (
                <>
                  {' '}
                  {(isViewOrEdit &&
                    thisState.create_time &&
                    moment(thisState.create_time).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )) ||
                    '-'}
                </>
              ),
            },
            { label: t('报价单编号'), item: ruleDetail.salemenu_id },
            {
              label: t('类型'),
              item: (
                <>
                  {' '}
                  {
                    i18next.t('KEY127', {
                      VAR1: ruleTarget.name,
                    }) /* src:`面向${ruleTarget.name}的锁价` => tpl:面向${VAR1}的锁价 */
                  }
                </>
              ),
            },
            {
              label: t('最后修改人'),
              item: <> {(isViewOrEdit && thisState.modifier) || '-'}</>,
            },
            {
              label: t('最后修改时间'),
              item: (
                <>
                  {' '}
                  {(isViewOrEdit &&
                    thisState.modify_time &&
                    moment(thisState.modify_time).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )) ||
                    '-'}
                </>
              ),
            },
          ]}
          customeContentColWidth={[300, 300, 300, 300]}
        />
      </>
    )
  }
}

export default DetailHeader
