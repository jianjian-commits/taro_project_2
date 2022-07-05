import React from 'react'
import PropTypes from 'prop-types'
import { Button, Uploader } from '@gmfe/react'
import { t } from 'gm-i18n'

function Upload(props) {
  const { onUpload, file } = props

  return (
    <>
      <Uploader onUpload={onUpload} accept='.xlsx'>
        <Button type='primary' onClick={(event) => event.preventDefault()}>
          {file ? t('重新上传') : t('上传文件')}
        </Button>
      </Uploader>
      {file && (
        <div
          style={{ width: 'max-content' }}
          className='gm-text-desc gm-margin-left-5'
        >
          {file.name}
        </div>
      )}
    </>
  )
}

Upload.propTypes = {
  onUpload: PropTypes.func.isRequired,
  file: PropTypes.object,
}
export default Upload
