import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import ReceiveMaterial from './receive_material'
import ReturnMaterial from './return_material'
import { observer } from 'mobx-react'

@observer
class MaterialList extends React.Component {
  render() {
    return (
      <FullTab tabs={[i18next.t('物料领取'), i18next.t('物料退还')]}>
        <ReceiveMaterial />
        <ReturnMaterial />
      </FullTab>
    )
  }
}

export default MaterialList
