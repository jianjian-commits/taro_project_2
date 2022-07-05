import DriverEditorStore from '../components/driver_editor_store'
import { action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'

class EditDriverStore extends DriverEditorStore {
  formatData({
    name,
    phone,
    carrier_id,
    car_model_id,
    plate_number,
    share,
    state,
    account,
    is_allow_login,
    max_load,
  }) {
    return {
      name,
      phone,
      carrier_id,
      car_model_id,
      plate_number,
      share,
      state,
      account,
      password: null,
      password_check: null,
      allow_login: is_allow_login,

      car_model_name: null,
      max_load,
      company_name: null,
    }
  }

  // 按司机ID获得对应司机信息
  @action.bound
  getDriverDetail(id) {
    Request('/station/driver/get')
      .data({ id })
      .get()
      .then((res) => {
        runInAction(() => {
          const detail = this.formatData(res.data)
          this.data = detail
          // 源数据
          this.originalData = detail
        })
      })
  }

  @action.bound
  editDriver(driver_id) {
    const submit = () => {
      Request('/station/driver/update')
        .data({ ...this.data, driver_id })
        .post()
        .then(() => {
          Tip.success(i18next.t('保存成功'))
        })
    }

    this.updateCarrierOrCarModelAndSubmit(submit)
  }
}

export default EditDriverStore
