import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  Modal,
  Form,
  FormItem,
  FormButton,
  Uploader,
  Tip,
  Button,
} from '@gmfe/react'
import IconsList from 'common/components/icon_list'
import { tagDetailStore } from '../stores'

class IconsSelectModal extends React.Component {
  constructor(props) {
    super(props)

    const icon = tagDetailStore.iconsList.slice()[0]
    this.state = {
      iconSelected: icon.id,
      url: icon.url,
    }

    this.handleChooseIcon = ::this.handleChooseIcon
    this.handleCancel = ::this.handleCancel
    this.handleSubmitIcon = ::this.handleSubmitIcon
    this.handleUpload = ::this.handleUpload
  }

  handleChooseIcon(icon) {
    this.setState({
      iconSelected: icon.id,
      url: icon.url,
    })
  }

  handleUpload(file, event) {
    event.preventDefault()
    if (file[0].size > 1024 * 500) {
      Tip.warning(i18next.t('图片不能超过500kb'))
      return
    }
    tagDetailStore.setPic(file[0]).then((url) => {
      this.setState({ url })
    })
  }

  handleCancel() {
    Modal.hide()
  }

  handleSubmitIcon() {
    Promise.all([
      tagDetailStore.changePic(this.state.url),
      tagDetailStore.setInputDetail('pic_url', this.state.url),
    ]).then(() => {
      Modal.hide()
    })
  }

  render() {
    return (
      <div className='gm-padding-10'>
        <Form
          horizontal
          labelWidth='80px'
          onSubmit={this.handleSubmitIcon}
          disabledCol
        >
          <FormItem label={i18next.t('选择图标')}>
            <div
              className='form-control'
              style={{
                height: 'auto',
                maxHeight: '200px',
                overflowY: 'scroll',
              }}
            >
              <IconsList
                noSelected={false}
                iconList={tagDetailStore.iconsList.slice()}
                iconSelected={this.state.iconSelected}
                onChooseIcon={this.handleChooseIcon}
              />
            </div>
          </FormItem>
          <FormItem>
            <Uploader
              onUpload={this.handleUpload}
              accept='image/jpg, image/png'
            >
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                {i18next.t('我要上传图标')}
              </span>
              <span className='gm-text-desc'>
                {'(' + i18next.t('请按标准上传') + ')'}
              </span>
            </Uploader>
          </FormItem>
          <FormButton>
            <FormButton>
              <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
              <span className='gm-gap-5' />
              <Button htmlType='submit' type='primary'>
                {i18next.t('保存')}
              </Button>
            </FormButton>
          </FormButton>
        </Form>
      </div>
    )
  }
}

@observer
class DropperSelect extends React.Component {
  handleIconClick() {
    Modal.render({
      children: <IconsSelectModal />,
      title: i18next.t('活动图片'),
      onHide: Modal.hide,
    })
  }

  render() {
    const { pic } = tagDetailStore

    return (
      <div className='gm-inline-block'>
        <div
          style={{
            width: '70px',
            height: '70px',
            border: '2px dashed #eee',
            cursor: 'pointer',
          }}
        >
          <a style={{ height: '100%' }} onClick={this.handleIconClick}>
            {pic.preview || pic.url ? (
              <img
                className='gm-inline-block'
                src={pic.preview || pic.url}
                alt={pic && pic.name}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Flex justifyCenter alignCenter style={{ height: '100%' }}>
                <i className='ifont ifont-plus' /> {i18next.t('加图')}
              </Flex>
            )}
          </a>
        </div>
      </div>
    )
  }
}

export default DropperSelect
