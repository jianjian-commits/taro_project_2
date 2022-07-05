import { observable, runInAction, action } from 'mobx'
import { getStaticStorage } from 'gm_static_storage'

class Store {
  @observable carouselList = []
  @observable appCopyWriterList = []

  @action
  getCarouselListData() {
    getStaticStorage(`/station/application_center/carousel.json`).then(
      (json) => {
        runInAction(() => {
          this.carouselList = json
        })
      }
    )
  }

  @action
  getAppCopyWriterData() {
    getStaticStorage(`/station/application_center/app_copy_writer.json`).then(
      (json) => {
        runInAction(() => {
          const Map = {}
          json.forEach((item) => {
            const { classification = '', ...rest } = item
            if (Map[classification]) {
              Map[classification].push(rest)
            } else {
              Map[classification] = [rest]
            }
          })
          this.appCopyWriterList = Object.entries(Map)
        })
      }
    )
  }
}

export default new Store()
