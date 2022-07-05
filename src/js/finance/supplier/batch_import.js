import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Sheet,
  SheetColumn,
  SheetAction,
  Select,
  Option,
  Tip,
  Button,
  Popover,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import _ from 'lodash'
import classNames from 'classnames'
import { Request } from '@gm-common/request'
import { history } from '../../common/service'
import styles from './style.module.less'
import { SUPPLIER_INVOICE_TYPE } from 'common/enum'
import PropTypes from 'prop-types'

// Popover组件错误tip
function errorPopover(msg) {
  return (
    <div className='gm-padding-10 gm-bg' style={{ width: '200px' }}>
      <div>{msg}</div>
    </div>
  )
}

// 判空
function isEmpty(v) {
  return _.isUndefined(v) || _.isNil(v) || String(v).trim() === ''
}

// 是否数字与字母
function isNumOrLetter(v) {
  return /^[A-Za-z0-9]+$/.test(v)
}
class SupplierImportDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dataList: [],
      errorList: [],
      returnErrorList: [],
      isDisableSubmit: true,
    }
  }

  componentDidMount() {
    if (!_.has(this.props.supplier, 'supplierBatchImportList')) {
      Tip.warning(i18next.t('请先导入文件'))
      return
    }

    const { supplierBatchImportList } = this.props.supplier
    const dataList = []
    const errorList = []

    _.forEach(supplierBatchImportList, (v) => {
      if (v.length === 0) {
        return
      }
      let [
        customer_id,
        name,
        phone,
        company_name,
        company_address,
        finance_manager,
        finance_manager_phone,
        account_name,
        bank,
        card_no,
        business_licence,
        pay_method,
        bill_type,
      ] = v
      const payMethodEnum = ['1', '2', '3', '4']

      if (isEmpty(pay_method) || !payMethodEnum.includes(pay_method)) {
        pay_method = 1
      }
      if (
        isEmpty(bill_type) ||
        !Object.keys(SUPPLIER_INVOICE_TYPE).includes(bill_type)
      ) {
        bill_type = 1
      }

      dataList.push({
        customer_id,
        name,
        phone,
        company_name,
        company_address,
        finance_manager,
        finance_manager_phone,
        account_name,
        bank,
        card_no,
        business_licence,
        pay_method: parseInt(pay_method),
        bill_type: parseInt(bill_type),
      })

      errorList.push({
        errorMsg: new Map(), // 格式为{columnName:['errorMsgItem',...]}
      })
    })

    this.verifyBasicList(dataList, errorList)

    this.setState(
      {
        dataList,
        errorList,
      },
      () => {
        this.setSubmitBtnStatus()
      }
    )
  }

  // 初始化校验
  verifyBasicList = (dataListData, errorListData) => {
    _.forEach(dataListData, (v, index) => {
      const { customer_id, name } = v

      // 判空
      if (isEmpty(customer_id)) {
        this.addErrorMsg(errorListData, index, 'customer_id', 'EMPTY')
      }

      if (isEmpty(name)) {
        this.addErrorMsg(errorListData, index, 'name', 'EMPTY')
      }

      // 判重
      if (this.isRepeat(dataListData, index, 'customer_id', customer_id)) {
        this.addErrorMsg(errorListData, index, 'customer_id', 'REPEAT')
      }

      // 判断编号是否是非法字符
      if (!isEmpty(customer_id) && !isNumOrLetter(customer_id)) {
        this.addErrorMsg(errorListData, index, 'customer_id', 'NUMBERORLETTER')
      }
    })
  }

  // 判断是否有该错误
  hasTargetErrorMsg = (columnName, errorMsgData, targetErrorMsg) => {
    return (
      errorMsgData.has(columnName) &&
      errorMsgData.get(columnName).includes(targetErrorMsg)
    )
  }

  // 判断重复，已加上后台返回错误信息的重复判断
  isRepeat = (dataListData, index, columnName, targetValue) => {
    const { returnErrorList } = this.state
    let isRepeat = false

    _.forEach(dataListData, (v, i) => {
      if (i !== index) {
        if (!isEmpty(v[columnName]) && v[columnName] === targetValue) {
          isRepeat = true
        }
      }

      if (
        !isEmpty(v[columnName]) &&
        columnName === 'customer_id' &&
        returnErrorList.includes(targetValue)
      ) {
        isRepeat = true
      }
    })

    return isRepeat
  }

  // 添加错误信息
  addErrorMsg = (errorListData, index, columnName, targetErrorMsg) => {
    const currentErrorMsg = errorListData[index].errorMsg.get(columnName)

    // 若已有其他错误则直接往后添加否则添加新的数组
    if (
      errorListData[index].errorMsg.has(columnName) &&
      !currentErrorMsg.includes(targetErrorMsg)
    ) {
      currentErrorMsg[currentErrorMsg.length] = targetErrorMsg
    } else {
      errorListData[index].errorMsg.set(columnName, [targetErrorMsg])
    }
  }

  // 删除错误信息
  deleteErrorMsg = (errorListData, index, columnName, targetErrorMsg) => {
    const currentErrorMsg = errorListData[index].errorMsg.get(columnName)

    currentErrorMsg.splice(
      _.find(currentErrorMsg, (v) => {
        return v === targetErrorMsg
      }),
      1
    )

    if (currentErrorMsg.length > 0) {
      errorListData[index].errorMsg.set(columnName, currentErrorMsg)
    } else {
      errorListData[index].errorMsg.delete(columnName)
    }
  }

  // 处理输入
  handleChangeValue(index, name, e) {
    const { dataList } = this.state
    let currentValue = ''

    if (!e.target) {
      currentValue = e
    } else {
      currentValue = e.target.value
    }

    dataList[index][name] = currentValue

    this.setState({ dataList })
  }

  // 处理需要校验的输入
  handleChangeVerifyValue = (index, name, e) => {
    const { dataList, errorList } = this.state
    const currentValue = e.target.value

    dataList[index][name] = currentValue

    // 判空
    if (isEmpty(currentValue)) {
      this.addErrorMsg(errorList, index, name, 'EMPTY')
    } else if (
      this.hasTargetErrorMsg(name, errorList[index].errorMsg, 'EMPTY')
    ) {
      this.deleteErrorMsg(errorList, index, name, 'EMPTY')
    }

    if (name === 'customer_id') {
      // 去掉编号内的所有空格
      dataList[index][name] = _.replace(currentValue, ' ', '')

      // 判断编号是否为数字或字母
      if (!isEmpty(currentValue) && !isNumOrLetter(currentValue)) {
        this.addErrorMsg(errorList, index, name, 'NUMBERORLETTER')
      } else if (
        this.hasTargetErrorMsg(
          name,
          errorList[index].errorMsg,
          'NUMBERORLETTER'
        )
      ) {
        this.deleteErrorMsg(errorList, index, name, 'NUMBERORLETTER')
      }

      // 判断编号是否重复,处理关联重复的方法里面也会判断处理，考虑是否不要这段
      if (this.isRepeat(dataList, index, name, currentValue)) {
        this.addErrorMsg(errorList, index, name, 'REPEAT')
      } else if (
        this.hasTargetErrorMsg(name, errorList[index].errorMsg, 'REPEAT')
      ) {
        this.deleteErrorMsg(errorList, index, name, 'REPEAT')
      }
    }

    this.handleRelevanceRepeatValue(dataList, errorList)

    this.setState(
      {
        dataList,
        errorList,
      },
      () => {
        this.setSubmitBtnStatus()
      }
    )
  }

  // 删除行
  handleDeleteList = (index) => {
    const { dataList, errorList } = this.state

    dataList.splice(index, 1)
    errorList.splice(index, 1)

    this.handleRelevanceRepeatValue(dataList, errorList)

    this.setState(
      {
        dataList,
        errorList,
      },
      () => {
        this.setSubmitBtnStatus()
      }
    )
  }

  // 处理关联的重复错误
  handleRelevanceRepeatValue = (dataListData, errorListData) => {
    _.forEach(dataListData, (v, index) => {
      const { customer_id } = v

      // 清除关联的“重复”错误，因为是关联的，所以在判断是否可以保存的时候需重新判断清除
      if (
        this.hasTargetErrorMsg(
          'customer_id',
          errorListData[index].errorMsg,
          'REPEAT'
        ) &&
        !this.isRepeat(dataListData, index, 'customer_id', customer_id)
      ) {
        this.deleteErrorMsg(errorListData, index, 'customer_id', 'REPEAT')
      }

      // 添加关联的“重复”错误
      if (this.isRepeat(dataListData, index, 'customer_id', customer_id)) {
        this.addErrorMsg(errorListData, index, 'customer_id', 'REPEAT')
      }
    })
  }

  // 表格中是否有错误信息
  hasAnyError = () => {
    const { errorList } = this.state
    let isInvalid = false

    _.forEach(errorList, (v) => {
      // 判断是否有错误
      if (v.errorMsg.size > 0) {
        isInvalid = true
      }
    })

    return isInvalid
  }

  // list的值有效且正确才可点击保存
  setSubmitBtnStatus = () => {
    const { dataList } = this.state

    this.setState({
      isDisableSubmit: dataList.length === 0 || this.hasAnyError(),
    })
  }

  // 处理后台返回的错误信息
  handleReturnError = (json) => {
    const { dataList, errorList } = this.state

    // 遍历后台返回的重复id，添加错误提示
    _.forEach(json, (jsonValue) => {
      _.forEach(dataList, (listValue, index) => {
        if (listValue.customer_id === jsonValue) {
          this.addErrorMsg(errorList, index, 'customer_id', 'REPEAT')
        }
      })
    })

    this.setState(
      {
        errorList,
        returnErrorList: json,
      },
      () => {
        // 重新判断以禁止保存
        this.setSubmitBtnStatus()
      }
    )
  }

  handleSubmit = () => {
    const { dataList } = this.state

    return Request('/supplier/import')
      .data({ details: JSON.stringify(dataList) })
      .code(1)
      .post()
      .then(
        (json) => {
          if (json.code !== 0) {
            Tip.warning(i18next.t('批量导入失败，请修改错误字段后再导入'))

            // 处理返回的错误数据
            this.handleReturnError(json.data)
          } else {
            Tip.success(i18next.t('批量导入供应商成功'))
            history.push('/sales_invoicing/base/supplier')
          }
        },
        (err) => {
          console.warn(err)
        }
      )
  }

  handleCancelSubmit = (e) => {
    history.go(-1)
  }

  render() {
    const { dataList, errorList } = this.state

    return (
      <QuickPanel icon='bill' title={i18next.t('待导入供应商信息预览')}>
        <Sheet
          className={styles.preview}
          list={dataList}
          enableEmptyTip
          scrollX
        >
          <SheetColumn
            field='customer_id'
            name={
              <span>
                <span style={{ color: 'red' }}>*</span>
                {i18next.t('供应商编号')}
              </span>
            }
          >
            {(value, i) => {
              const hasError = errorList[i].errorMsg.has('customer_id')
              const isEmpty =
                hasError &&
                errorList[i].errorMsg.get('customer_id').includes('EMPTY')
              const isRepeat =
                hasError &&
                errorList[i].errorMsg.get('customer_id').includes('REPEAT')
              const isNotNumOrLetter =
                hasError &&
                errorList[i].errorMsg
                  .get('customer_id')
                  .includes('NUMBERORLETTER')

              return (
                <div style={{ width: '70px' }}>
                  <input
                    type='text'
                    name='customer_id'
                    value={value || ''}
                    onChange={this.handleChangeVerifyValue.bind(
                      this,
                      i,
                      'customer_id'
                    )}
                    className={classNames(
                      { 'b-bg-warning': isEmpty },
                      'form-control'
                    )}
                    title={
                      isEmpty ? i18next.t('供应商编号为必填字段') : undefined
                    }
                  />

                  {(isRepeat || isNotNumOrLetter) && (
                    <Popover
                      showArrow
                      component={<div />}
                      type='hover'
                      popup={
                        isRepeat
                          ? errorPopover(
                              i18next.t('当前供应商编号已存在，请重新输入编号')
                            )
                          : errorPopover(i18next.t('只能输入英文字母和数字'))
                      }
                    >
                      <span
                        style={{
                          color: '#fff',
                          backgroundColor: '#f00',
                        }}
                      >
                        {i18next.t('异常')}
                      </span>
                    </Popover>
                  )}
                </div>
              )
            }}
          </SheetColumn>

          <SheetColumn
            field='name'
            name={
              <span>
                <span style={{ color: 'red' }}>*</span>
                {i18next.t('供应商名称')}
              </span>
            }
          >
            {(value, i) => {
              const hasError = errorList[i].errorMsg.has('name')
              const isEmpty =
                hasError && errorList[i].errorMsg.get('name').includes('EMPTY')

              return (
                <input
                  style={{ width: '110px' }}
                  className={classNames(
                    { 'b-bg-warning': isEmpty },
                    'form-control'
                  )}
                  type='text'
                  name='name'
                  value={value || ''}
                  title={
                    isEmpty ? i18next.t('供应商名称为必填字段') : undefined
                  }
                  onChange={this.handleChangeVerifyValue.bind(this, i, 'name')}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='phone' name={i18next.t('联系电话')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '100px' }}
                  className='form-control'
                  type='text'
                  name='phone'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(this, i, 'phone')}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='company_name' name={i18next.t('公司名称')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '100px' }}
                  className='form-control'
                  type='text'
                  name='company_name'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(
                    this,
                    i,
                    'company_name'
                  )}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='company_address' name={i18next.t('公司地址')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '100px' }}
                  className='form-control'
                  type='text'
                  name='company_address'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(
                    this,
                    i,
                    'company_address'
                  )}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='finance_manager' name={i18next.t('财务联系人')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '80px' }}
                  className='form-control'
                  type='text'
                  name='finance_manager'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(
                    this,
                    i,
                    'finance_manager'
                  )}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn
            field='finance_manager_phone'
            name={i18next.t('联系人电话')}
          >
            {(value, i) => {
              return (
                <input
                  style={{ width: '100px' }}
                  className='form-control'
                  type='text'
                  name='finance_manager_phone'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(
                    this,
                    i,
                    'finance_manager_phone'
                  )}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='account_name' name={i18next.t('开户名')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '80px' }}
                  className='form-control'
                  type='text'
                  name='account_name'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(
                    this,
                    i,
                    'account_name'
                  )}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='bank' name={i18next.t('开户银行')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '100px' }}
                  className='form-control'
                  type='text'
                  name='bank'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(this, i, 'bank')}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='card_no' name={i18next.t('银行账号')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '120px' }}
                  className='form-control'
                  type='text'
                  name='card_no'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(this, i, 'card_no')}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='business_licence' name={i18next.t('营业执照号')}>
            {(value, i) => {
              return (
                <input
                  style={{ width: '120px' }}
                  className='form-control'
                  type='text'
                  name='business_licence'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(
                    this,
                    i,
                    'business_licence'
                  )}
                />
              )
            }}
          </SheetColumn>

          <SheetColumn field='pay_method' name={i18next.t('结款方式')}>
            {(value, i) => {
              return (
                <Select
                  style={{ width: '80px' }}
                  name='pay_method'
                  value={value || ''}
                  onChange={this.handleChangeValue.bind(this, i, 'pay_method')}
                >
                  <Option value={1}>{i18next.t('日结')}</Option>
                  <Option value={2}>{i18next.t('周结')}</Option>
                  <Option value={3}>{i18next.t('半月结')}</Option>
                  <Option value={4}>{i18next.t('月结')}</Option>
                </Select>
              )
            }}
          </SheetColumn>

          <SheetColumn field='bill_type' name={i18next.t('开票类型')}>
            {(value, i) => (
              <Select
                style={{ width: '110px' }}
                onChange={this.handleChangeValue.bind(this, i, 'bill_type')}
                data={Object.entries(
                  SUPPLIER_INVOICE_TYPE
                ).map(([key, value]) => ({ value: Number(key), text: value }))}
                value={value}
              />
            )}
          </SheetColumn>

          <SheetAction>
            {(value, i) => {
              return (
                <a
                  style={{ color: '#666' }}
                  onClick={this.handleDeleteList.bind(this, i)}
                >
                  <i className='glyphicon glyphicon-trash' />
                </a>
              )
            }}
          </SheetAction>
        </Sheet>

        <div
          className='gm-padding-left-15 gm-padding-bottom-15'
          style={{ marginTop: '-35px' }}
        >
          <Button
            className='gm-margin-left-15'
            onClick={this.handleCancelSubmit}
          >
            {i18next.t('取消')}
          </Button>

          <div className='gm-gap-10' />

          <Button
            type='primary'
            htmlType='submit'
            onClick={this.handleSubmit}
            disabled={!!this.state.isDisableSubmit}
          >
            {i18next.t('保存')}
          </Button>
        </div>
      </QuickPanel>
    )
  }
}

SupplierImportDetail.propTypes = {
  supplier: PropTypes.object,
}

export default SupplierImportDetail
