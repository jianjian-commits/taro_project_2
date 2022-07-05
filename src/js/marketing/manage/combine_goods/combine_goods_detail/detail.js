import React from 'react'
import { i18next } from 'gm-i18n'
import { history } from 'common/service'
import { FormGroup, FormPanel, Tip } from '@gmfe/react'
import Form1 from './components/form_1'
import Form2 from './components/form_2'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'

@inject('store')
@observer
class Detail extends React.Component {
  static propTypes = {
    store: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.f1 = React.createRef()
    this.f2 = React.createRef()
  }

  handleSubmit = async () => {
    const { submit, type } = this.props.store
    try {
      const res = await submit()
      if (res.code === 0) {
        if (type === 'create') {
          history.push('/marketing/manage/combine_goods')
        }
        Tip.success(i18next.t('保存成功'))
      }
    } catch (e) {}
  }

  render() {
    return (
      <FormGroup
        formRefs={[this.f1, this.f2]}
        onSubmitValidated={this.handleSubmit}
      >
        <FormPanel title={i18next.t('基本信息')}>
          <Form1 store={this.props.store} ref={this.f1} />
        </FormPanel>
        <FormPanel title={i18next.t('报价单与规格设置')}>
          <Form2 store={this.props.store} ref={this.f2} />
        </FormPanel>
      </FormGroup>
    )
  }
}

export default Detail
