import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { Dialog, FormGroup, FormPanel, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import TestReport from './components/test_report'
import TestImages from './components/test_images'
import TestProduct from './components/test_product'
import { store } from '../store'
import batchStore from './components//batch_table/index.store.js'
import { observer } from 'mobx-react'
import moment from 'moment'

@observer
class Add extends Component {
  static propTypes = {
    location: PropTypes.object,
  }

  form1Ref = createRef()
  form2Ref = createRef()
  form3Ref = createRef()

  handleSubmit = () => {
    const { edit } = store
    this.handleAction(edit).then()
  }

  /**
   * 获取参数
   * @param edit? {boolean}
   */
  getParams = (edit) => {
    const {
      filter,
      selected,
      bindProduct,
      validity,
      imageFiles,
      images,
    } = store
    const { list } = batchStore
    const {
      id,
      report_name,
      detect_date,
      detect_institution,
      detect_sender,
      detector,
    } = filter
    const option = {
      report_name,
      detect_date: moment(detect_date).format('YYYY-MM-DD'),
      detect_institution,
      detect_sender,
      detector,
      images: JSON.stringify(
        imageFiles
          .filter((item) => images.includes(item.url))
          .map((item) => item.id),
      ),
      spu_ids: JSON.stringify(
        selected.filter((item) => item[0] === 'C').slice(),
      ),
    }
    if (bindProduct === 0) {
      option.batch_numbers = JSON.stringify(
        list.map((item) => item.data.batch_number),
      )
    } else if (bindProduct === 1) {
      option.expiring_time = moment(validity).format('YYYY-MM-DD')
    }
    if (edit) {
      option.id = id
    }
    return option
  }

  /**
   * 添加或编辑检测报告
   * @param edit {boolean}
   * @returns {Promise<void>}
   */
  handleAction = async (edit) => {
    const option = this.getParams(edit)
    store.processingReport(option, edit).then(({ msg, code }) => {
      if (code === 20) {
        Dialog.confirm({
          title: t('提示'),
          children: `${msg}，是否覆盖？`,
          onOK: () =>
            store.processingReport({ ...option, replace: 1 }, edit).then(() => {
              this._saveSuccess()
            }),
        })
      } else {
        this._saveSuccess()
      }
    })
  }

  _saveSuccess = () => {
    Tip.success(t('保存成功，3s后关闭当前页'))
    setTimeout(() => {
      window.closeWindow()
    }, 3000)
  }

  render() {
    return (
      <FormGroup
        formRefs={[this.form1Ref, this.form2Ref, this.form3Ref]}
        onSubmitValidated={this.handleSubmit}
      >
        <FormPanel title={t('检测报告')}>
          <TestReport ref={this.form1Ref} />
        </FormPanel>
        <FormPanel title={t('检测商品')}>
          <TestProduct ref={this.form2Ref} />
        </FormPanel>
        <FormPanel
          title={
            <div>
              {t('检测报告')}
              <span className='gm-text-red gm-text-12'>&nbsp;*</span>
              <span className='desc-wrap gm-text-desc gm-text-12'>
                {'(' + t('图片大小请不要超过1MB,支持jpg/png/gif格式') + '）'}
              </span>
            </div>
          }
        >
          <TestImages ref={this.form3Ref} />
        </FormPanel>
      </FormGroup>
    )
  }
}

export default Add
