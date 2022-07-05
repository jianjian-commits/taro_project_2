import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Uploader, Button } from '@gmfe/react'
import { Table } from '@gmfe/table'

class ImportLead extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedFile: null,
    }
  }

  getColumms = (tipsMap) => {
    return _.map(this.props.data.columns, (v, i) => ({
      ...v,
      Cell: ({ original }) => {
        const tip = _.find(
          tipsMap,
          (t) => t.id === original.id && t.field === v.accessor,
        )
        return tip ? (
          <div className={tip.modifyed ? 'gm-bg-info' : 'gm-bg-invalid'}>
            {original[v.accessor]}
            <small className='gm-import-lead-tip badge'>
              <i>{tip.msg}</i>
            </small>
          </div>
        ) : (
          original[v.accessor]
        )
      },
    }))
  }

  handleUploaer = (files) => {
    this.setState({
      selectedFile: files[0],
    })
    if (files[0] && this.props.onUpload) {
      this.props.onUpload(files[0])
    }
  }

  render() {
    const data = _.extend({ columns: [], list: [] }, this.props.data)
    const tips = this.props.tips || []

    const columns = this.getColumms(tips)

    const fileTempUrl = this.props.fileTempUrl

    return (
      <div className='gm-import-lead'>
        <div className='gm-margin-bottom-10'>
          <div>
            <Uploader
              className='gm-dropper-wrap gm-margin-right-10'
              onUpload={this.handleUploaer}
              accept='.xlsx'
            >
              <Button type='primary'>{t('上传xlsx')}</Button>
            </Uploader>
            {fileTempUrl ? (
              <a href={fileTempUrl} target='blank'>
                {t('模板下载')}
              </a>
            ) : undefined}
          </div>
        </div>
        <div
          className='gm-import-lead-content'
          ref={(ref) => (this.refContent = ref)}
        >
          {data && <Table data={this.props.data.list} columns={columns} />}
        </div>
      </div>
    )
  }
}

ImportLead.propTypes = {
  onUpload: PropTypes.func,
  data: PropTypes.object,
  tips: PropTypes.array,
  fileTempUrl: PropTypes.string,
}

export default ImportLead
