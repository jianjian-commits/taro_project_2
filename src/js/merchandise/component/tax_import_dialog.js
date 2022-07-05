import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Dialog, Tip, Button } from '@gmfe/react'

import _ from 'lodash'
import { isRightNumber } from '../../common/util'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { getXlsxURLByLocale } from '../../common/service'

// 验证导入的税率必须是num，并且只能最多有两位小数，且值少于100
const isVerify = (val) => {
  if (isRightNumber(val)) {
    return _.toNumber(val) < 100 && _.toNumber(val) >= 0
  } else {
    return false
  }
}

class TaxImportDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fileName: '',
      sheetData: [],
    }

    this.handleCancel = ::this.handleCancel
    this.handleDialogOK = ::this.handleDialogOK
    this.handleClick = ::this.handleClick
    this.handleImport = ::this.handleImport
    this.handleDownload = ::this.handleDownload
  }

  handleCancel() {
    this.setState({
      fileName: '',
      sheetData: [],
    })
    this.props.handleCancel()
  }

  handleDialogOK() {
    this.props.handleImportData(this.state.sheetData)
    this.setState({
      fileName: '',
      sheetData: [],
    })
  }

  handleClick() {
    this.refImportXlsx.click()
  }

  handleImport() {
    const { type } = this.props

    requireGmXlsx((res) => {
      const { sheetToJson } = res

      sheetToJson(this.refImportXlsx.files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        sheetData.shift()

        if (sheetData.length === 0) {
          Tip.warning(i18next.t('没有可导入数据，请确认表格数据有效'))
          return false
        }

        let arr = []
        if (type === 'address') {
          arr = _.map(sheetData, (val) => {
            if (val[0] !== undefined && val[1] !== undefined) {
              return {
                address_id: val[0],
                address_name: val[1],
              }
            }
          })
        } else if (type === 'spu') {
          arr = _.map(sheetData, (val) => {
            if (val[0] !== undefined && val[1] !== undefined) {
              return {
                spu_id: val[0],
                spu_name: val[1],
                tax_rate: isVerify(_.toNumber(val[2])) ? val[2] : '',
              }
            }
          })
        }

        this.setState({
          fileName: this.refImportXlsx.files[0].name,
          sheetData: _.filter(arr, (v) => !!v),
        })
      })
    })
  }

  handleDownload() {
    const downloadUrl =
      this.props.type === 'spu'
        ? getXlsxURLByLocale('station_spu_add.xlsx')
        : getXlsxURLByLocale('station_address_add.xlsx')
    window.open(downloadUrl)
  }

  render() {
    const { fileName } = this.state
    const { type, show } = this.props

    return (
      <Dialog
        show={show}
        title={
          i18next.t('KEY62', {
            VAR1: type === 'spu' ? i18next.t('商品') : i18next.t('商户'),
          }) /* src:`批量上传${type === 'spu' ? '商品' : '商户'}` => tpl:批量上传${VAR1} */
        }
        onCancel={this.handleCancel}
        onOK={this.handleDialogOK}
      >
        <div>
          <div>
            <Button
              type='primary'
              plain
              onClick={this.handleClick}
              className='gm-margin-right-10'
            >
              {i18next.t('上传xlsx')}&nbsp;&nbsp;
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

            <a
              onClick={this.handleDownload}
              target='blank'
              className='gm-cursor'
            >
              {i18next.t('模板下载')}
            </a>
          </div>
          <div>{fileName}</div>
        </div>
      </Dialog>
    )
  }
}

TaxImportDialog.propTypes = {
  type: PropTypes.string.isRequired,
}

export default TaxImportDialog
