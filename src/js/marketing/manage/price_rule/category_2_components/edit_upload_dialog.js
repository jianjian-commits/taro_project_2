import React, { Component } from 'react'
import { SvgRemove } from 'gm-svg'
import { Dialog, Flex, InputNumber, Button } from '@gmfe/react'
import { observer, Observer } from 'mobx-react'
import TextTip from 'common/components/text_tip'
import { Table, TableUtil } from '@gmfe/table'
import { apiDownloadPriceRule } from '../api_request'
import { i18next } from 'gm-i18n'
import editStore from './edit_store'
import classNames from 'classnames'
import { isVariationMultipleFail } from '../filter'

@observer
class UploadDialogChildren extends Component {
  state = {
    fileName: null,
  }

  componentWillUnmount() {
    editStore.xlsxListClear()
  }

  handleFileInput = () => {
    editStore.uploadFileData(this.refFileInput.files[0]).then(() => {
      this.setState({ fileName: this.refFileInput.files[0].name })
      this.refFileInput.value = null
    })
  }

  handleDownload = () => {
    // 下载所有二级分类
    apiDownloadPriceRule(undefined, 'category_2')
  }

  handleUpload = () => {
    this.refFileInput.click()
  }

  handleXlsxListRemoveItem(index, e) {
    e.stopPropagation()
    editStore.xlsxListRemoveItem(index)
  }

  handleItemChange(category_2_id, key, value) {
    editStore.xlsxListPriceRuleChange(category_2_id, key, value)
  }

  render() {
    const { xlsxList } = editStore
    const { fileName } = this.state

    return (
      <div>
        <input
          type='file'
          accept='.xlsx'
          ref={(ref) => {
            this.refFileInput = ref
          }}
          onChange={this.handleFileInput}
          style={{ display: 'none' }}
        />
        <Flex alignCenter className='gm-margin-bottom-10'>
          <Button type='primary' onClick={this.handleUpload}>
            {i18next.t('上传表格')}
          </Button>
          {fileName ? (
            <span className='gm-text-desc gm-margin-left-5'>{fileName}</span>
          ) : null}
          <div className='gm-gap-10' />
          <a href='javascript:;' onClick={this.handleDownload}>
            {i18next.t('模板下载')}
          </a>
        </Flex>

        <Table
          data={xlsxList.slice()}
          columns={[
            {
              Header: i18next.t('一级分类名'),
              accessor: 'category_1_name',
            },
            {
              Header: i18next.t('二级分类ID'),
              id: 'category_2_id',
              accessor: (d) => {
                return (
                  <div className={d.check_status ? '' : 'gm-bg-invalid'}>
                    {d.category_2_id}
                    {d.check_status || i18next.t('不存在这个二级分类')}
                  </div>
                )
              },
            },
            {
              Header: i18next.t('二级分类名'),
              accessor: 'category_2_name',
            },
            {
              Header: i18next.t('价格变动'),
              id: 'variation',
              accessor: (d) => (
                <Observer>
                  {() => {
                    const isInvalid = isVariationMultipleFail(d.price_rule)

                    const Input = (
                      <InputNumber
                        className={classNames('form-control', {
                          'gm-bg-invalid': isInvalid,
                        })}
                        style={{ width: '80px' }}
                        max={9999}
                        min={-9999}
                        value={d.price_rule.variation || ''}
                        minus
                        onChange={this.handleItemChange.bind(
                          this,
                          d.category_2_id,
                          'variation'
                        )}
                      />
                    )

                    return (
                      <TextTip
                        type='focus'
                        disabled={!isInvalid}
                        content={i18next.t('价格变动,倍数只能输入其中一列')}
                      >
                        {Input}
                      </TextTip>
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: i18next.t('倍数'),
              id: 'multiple',
              accessor: (d) => (
                <Observer>
                  {() => {
                    const { multiple = '' } = d.price_rule

                    const isInvalid = isVariationMultipleFail(d.price_rule)
                    const isInvalidNum = multiple !== '' && multiple <= 0

                    const errorText = isInvalidNum
                      ? i18next.t('倍数需大于0')
                      : i18next.t('价格变动,倍数只能输入其中一列')

                    const Input = (
                      <InputNumber
                        className={classNames('form-control', {
                          'gm-bg-invalid': isInvalid || isInvalidNum,
                        })}
                        style={{ width: '80px' }}
                        max={9999}
                        minus
                        precision={4}
                        value={multiple}
                        onChange={this.handleItemChange.bind(
                          this,
                          d.category_2_id,
                          'multiple'
                        )}
                      />
                    )

                    return (
                      <TextTip
                        type='focus'
                        disabled={!isInvalid && !isInvalidNum}
                        content={errorText}
                      >
                        {Input}
                      </TextTip>
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: TableUtil.OperationHeader,
              Cell: (row) => (
                <TableUtil.OperationCell>
                  <Button
                    type='danger'
                    onClick={this.handleXlsxListRemoveItem.bind(
                      this,
                      row.index
                    )}
                  >
                    <SvgRemove />
                  </Button>
                </TableUtil.OperationCell>
              ),
            },
          ]}
        />
      </div>
    )
  }
}

export default () => {
  Dialog.confirm({
    size: 'lg',
    title: i18next.t('批量上传分类'),
    children: <UploadDialogChildren />,
    onOK: () => {
      return editStore.resultListBulkImport()
    },
  })
}
