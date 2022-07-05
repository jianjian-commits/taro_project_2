import React from 'react'
import { i18next } from 'gm-i18n'
import { Uploader, Button } from '@gmfe/react'

class Component extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
    }
  }
  handleDownload = () => {}

  handleUpload = (files) => {
    this.setState({
      file: files[0],
    })
  }

  render() {
    const { file } = this.state
    return (
      <div>
        <div>
          <p>
            {i18next.t(
              '第一步：可以先在列表页面勾选需要修改的商品，此步骤可跳过；'
            )}
          </p>
          <p>
            {i18next.t('第二步：点击')}
            <a
              onClick={this.handleDownload}
              href='javascript:;'
              target='_blank'
              rel='noopener noreferrer'
            >
              {i18next.t('下载xslx模板')}
            </a>
            {i18next.t(
              '，此模板会根据上一步的勾选的商品信息，自动补全商品ID及商品名称；'
            )}
          </p>
          <p>
            {i18next.t(
              '第三步：阅读模板中的填写说明，根据填写说明来编辑文件；'
            )}
          </p>
          <p>{i18next.t('第四步：上传xslx文件；')}</p>
          <div>
            <Uploader onUpload={this.handleUpload} accept='.xlsx'>
              <Button>{i18next.t('上传')}</Button>
            </Uploader>
            {file ? (
              <span className='gm-padding-left-5'>{file.name}</span>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}

export default Component
