import DriverEditorStore from '../components/driver_editor_store'
import { action } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { history } from '../../../common/service'

class CreateDriverStore extends DriverEditorStore {
  @action.bound
  createDriver() {
    const submit = () => {
      Request('/station/driver/create')
        .data(this.data)
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功!'))
          history.push('/supply_chain/distribute/driver_manage')
        })
    }

    this.updateCarrierOrCarModelAndSubmit(submit)
  }
}

export default CreateDriverStore
