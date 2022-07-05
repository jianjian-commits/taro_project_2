import { action, computed, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  @observable edit = false

  @action setEdit(status) {
    this.edit = status
  }

  /**
   * 检测报告 form1
   * @type {{detect_date: Date, detect_institution: string,
   *  report_type: number, detector: string, detect_sender: string,status:number}}
   */
  @observable filter = {
    /**
     * 写死
     */
    report_type: 6,
    /**
     * 编辑id
     */
    id: '',
    /**
     * 报告名称
     */
    report_name: '',
    /**
     * 检测人
     */
    detector: '',
    /**
     * 检测机构
     */
    detect_institution: '',
    /**
     * 送检机构
     */
    detect_sender: '',
    /**
     * 检测日期
     */
    detect_date: new Date(),
    /**
     * 编辑检测状态
     */
    status: 0, // 编辑时候显示检测状态
  }

  @action setFilter(key, value) {
    this.filter[key] = value
  }

  @action setAllFilter(filter) {
    Object.assign(this.filter, filter)
  }

  /**
   * 图片url
   * @type {string[]}[]}
   */
  @observable images = []

  @action setImages(img) {
    this.images = img
  }

  /**
   * 图片上传返回信息集合
   * @type {{url:string,id:string}[]}
   */
  imageFiles = []

  @action uploadImages(images) {
    const requests = images.map((item) =>
      Request('/food_security_report/image/upload')
        .data({ image_file: item })
        .post(),
    )
    return Promise.all(requests).then((result) => {
      runInAction(() => {
        this.imageFiles = [
          ...this.imageFiles,
          ...result.map((item) => {
            const {
              data: { image_url: url, img_path_id: id },
            } = item
            return { url, id }
          }),
        ]
      })
      return result.map((item) => item.data.image_url)
    })
  }

  @observable products = []

  @action fetchProducts() {
    Request('/food_security_report/merchandise_tree')
      .get()
      .then(({ data }) => {
        runInAction(() => {
          this.products = data
        })
      })
  }

  @computed get tree() {
    return rebuildTree(this.products)
  }

  /**
   * 树选中
   * @type {string[]}
   */
  @observable selected = []

  @action setSelected(selected) {
    this.selected = selected
  }

  /**
   * 是否从未选择过
   * @type {boolean}
   */
  @observable dirty = false

  @action setDirty() {
    this.dirty = true
  }

  /**
   * @type {number}
   */
  @observable bindProduct = 1

  @action setBindProduct(value) {
    this.bindProduct = value
  }

  @observable validity = new Date()

  @action setValidity(date) {
    this.validity = date
  }

  @observable editInfo = {
    /**
     * @type {string}
     * 报告编号
     **/
    id: '',
    /**
     * @type {string}
     * 报告名称
     */
    report_name: '',
    /**
     * @type {string}
     * 检测日期
     */
    detect_date: '',
    /**
     * @type {string}
     * 送检机构
     */
    detect_sender: '',
    /**
     * @type {string}
     * 检测机构
     */
    detect_institution: '',
    /**
     * @type {string}
     * 检测人
     */
    detector: '',
    /**
     * @type {number}
     * 检测状态 0｜1
     */
    status: 0, // 检测状态 1 2
    /**
     * @type {string}
     * 到期时间，非必有
     */
    expiring_time: '',
    /**
     * @type {{category1_name:string,category2_name:string,name:string,batches?:{batch_number}[],id:number,spu_id:string}[]}
     */
    spus: [],
    /**
     * @type {{picture_id:string,picture:string}[]}
     */
    pictures: [],
  }

  @action fetchEditInfo(id) {
    return Request('/food_security_report/detail')
      .data({ id })
      .code([1])
      .get()
      .then(({ data, msg, code }) => {
        this.editInfo = data
        if (code !== 0) {
          throw new Error(msg)
        }
      })
  }

  @action deleteReport(id) {
    return Request('/food_security_report/delete').data({ id }).post()
  }

  /**
   * 新增或更新检测报告
   * @param option {Object}
   * @param edit {boolean?}
   * @returns {Promise<*>}
   */
  @action processingReport(option, edit) {
    let url = '/food_security_report/create'
    if (edit) {
      url = '/food_security_report/update'
    }
    return Request(url).code([20]).data(option).post()
  }
}

export const store = new Store()

function rebuildTree(list) {
  return list
    .map((item) => {
      const { name, id, children, ...rest } = item
      const option = {
        value: id,
        text: name,
        ...rest,
      }
      if (children) {
        option.children = rebuildTree(children)
        if (!option.children.length) {
          delete option.children
        }
      }
      return option
    })
    .filter((item) => !!item.children || item.value[0] === 'C')
}
