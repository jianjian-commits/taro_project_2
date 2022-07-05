import React from 'react'
import {
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  Modal,
  Button,
} from '@gmfe/react'
import {
  getCurrentLng,
  i18next,
  setCurrentLng,
  SUPPORT_LANGUAGES,
} from 'gm-i18n'

class Language extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lng: getCurrentLng(),
    }
  }

  handleChange = (lng) => {
    this.setState({
      lng,
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { lng } = this.state
    setCurrentLng(lng)
    window.location.reload()
  }

  handleCancel = (e) => {
    e.preventDefault()
    Modal.hide()
  }

  render() {
    const { lng } = this.state
    return (
      <div>
        <Form disabledCol onSubmit={this.handleSubmit} horizontal>
          <FormItem label={i18next.t('语言')}>
            <Select value={lng} onChange={this.handleChange}>
              {SUPPORT_LANGUAGES.map(({ text, value }) => {
                return (
                  <Option key={value} value={value}>
                    {text}
                  </Option>
                )
              })}
            </Select>
          </FormItem>
          <FormButton>
            <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
            <span className='gm-gap-5' />
            <Button type='primary' htmlType='submit'>
              {i18next.t('确认')}
            </Button>
          </FormButton>
        </Form>
      </div>
    )
  }
}

export default Language
