import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Loading } from '@gmfe/react'
import TextEdit from './text_edit'
import ImgEdit from './img_edit'

import PropTypes from 'prop-types'
@observer
class Component extends React.Component {
  renderEdit = () => {
    const { type } = this.props
    if (type === 'img') {
      return <ImgEdit {...this.props} />
    } else {
      return <TextEdit {...this.props} />
    }
  }

  renderList = () => {
    const { type } = this.props
    if (type === 'img') {
      return <ImgEdit {...this.props} />
    } else {
      return <TextEdit {...this.props} />
    }
  }

  render() {
    const {
      textRecognition,
      tabKey,
      imgRecognition,
      canRecognizeText,
    } = this.props

    const isEdit =
      tabKey === 0 && canRecognizeText
        ? textRecognition.isEdit
        : imgRecognition.isEdit
    const loading =
      tabKey === 0 && canRecognizeText
        ? textRecognition.isLoading
        : imgRecognition.isLoading

    return (
      <div>
        {loading ? (
          <Loading
            style={{ marginTop: '100px' }}
            text={i18next.t('数据请求中...')}
          />
        ) : (
          <>{isEdit ? this.renderEdit() : this.renderList()}</>
        )}
      </div>
    )
  }
}

Component.propTypes = {
  type: PropTypes.string,
  textRecognition: PropTypes.object,
  imgRecognition: PropTypes.object,
  tabKey: PropTypes.number,
  canRecognizeText: PropTypes.bool,
  searchCombineGoods: PropTypes.bool,
  onAdd: PropTypes.func,
}

export default Component
