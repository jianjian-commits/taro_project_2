import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Dialog, Tip, Flex, Button } from '@gmfe/react'

import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { getXlsxURLByLocale } from '../../../common/service'

class ImportDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fileName: '',
      sheetData: [],
    }
  }

  resetState = () => {
    this.setState({
      fileName: '',
      sheetData: [],
    })
  }

  handleCancel = () => {
    this.resetState()
    this.props.handleCancel()
  }

  handleDialogOK = () => {
    this.resetState()
    this.props.handleImportData(this.state.sheetData)
  }

  handleClick = () => {
    this.refImportXlsx.click()
  }

  handleImport = () => {
    requireGmXlsx((res) => {
      const { sheetToJson } = res

      sheetToJson(this.refImportXlsx.files[0]).then((json) => {
        let sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
          return false
        }

        this.setState({
          fileName: this.refImportXlsx.files[0].name,
          sheetData: sheetData,
        })
      })
    })
  }

  handleDownload = () => {
    const downloadUrl = getXlsxURLByLocale(this.props.downloadTempName)
    window.open(downloadUrl)
  }

  render() {
    const { fileName } = this.state
    const { show } = this.props

    return (
      <Dialog
        show={show}
        title={this.props.title}
        onCancel={this.handleCancel}
        onOK={this.handleDialogOK}
      >
        <div className='gm-margin-lr-10'>
          <div>
            <Flex alignCenter>
              <div>{i18next.t('上传需导入的文件')}</div>
              <Button
                type='primary'
                plain
                onClick={this.handleClick}
                className='gm-margin-left-10'
              >
                {i18next.t('上传')}&nbsp;&nbsp;
                <i className='xfont xfont-upload' />
              </Button>
              <input
                type='file'
                multiple='false'
                accept='.xlsx, .xls'
                ref={(ref) => {
                  this.refImportXlsx = ref
                }}
                onChange={this.handleImport}
                style={{ display: 'none' }}
              />
            </Flex>
            <Flex>
              <a onClick={this.handleDownload} target='blank'>
                {i18next.t('下载导入模板')}
              </a>
            </Flex>
          </div>
          <div>{fileName}</div>
        </div>
      </Dialog>
    )
  }
}

ImportDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  downloadTempName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  handleImportData: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
}

export default ImportDialog
