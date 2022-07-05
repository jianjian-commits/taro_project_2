import { action, observable, autorun, computed, runInAction } from 'mobx'
import _ from 'lodash'
import { adapterNilData, excelHeaderData, compareFindIndex } from '../util'
import { Request } from '@gm-common/request'

class Store {
  // 上传的表格数据
  @observable technologySheetList = []

  // 规整后的表格数据（相同的工艺名称放在一起）
  @observable sortedTechnologySheetList = []

  @observable errorData = []

  emptyIdAndNameDisposer = _.noop // 校验是否id或name为空
  abnormalIdDisposer = _.noop // 校验是否相同name下custom_id不同
  abnormalNameDisposer = _.noop // 校验是否相同custom_id下name不同
  batchErrorDisposer = _.noop // 校验后台返回的错误
  abnormalColTypeDisposer = _.noop // 校验col_type是否为0/1
  inputLengthDisposer = _.noop // 校验输入的长度

  // 初始化 autorun
  @action
  initAutoRun() {
    // id 和 name 不为空
    this.emptyIdAndNameDisposer = autorun(() => {
      _.each(this.sortedTechnologySheetList, (item, index) => {
        if (!item.custom_id) {
          item.emptyIdError = true
        } else {
          item.emptyIdError = false
        }

        if (!item.name) {
          item.emptyNameError = true
        } else {
          item.emptyNameError = false
        }
      })
    })

    // 校验相同name下custom_id是否相同
    this.abnormalIdDisposer = autorun(() => {
      // 结构：{ name: { custom_id: custom_id, sameIndexArray: [1,2,5], abnormal: 0 } }
      const uniqueKeyData = {}

      _.each(this.sortedTechnologySheetList, (item, index) => {
        if (_.includes(Object.keys(uniqueKeyData), item.name)) {
          // 一旦存在相同的name, custom_id不同，则打上异常标志
          if (uniqueKeyData[item.name].custom_id !== item.custom_id) {
            uniqueKeyData[item.name].abnormal = true
          }
          // 添加到该name下
          uniqueKeyData[item.name].sameIndexArray.push(index)
        } else {
          // 若name不在唯一组中，则添加新的
          uniqueKeyData[item.name] = {
            custom_id: item.custom_id,
            sameIndexArray: [index],
            abnormal: false,
          }
        }
      })

      // 针对以name分组的数据，将abnormal为true的index对应项error设为true,反之设为false
      _.each(uniqueKeyData, (item) => {
        if (item.abnormal) {
          _.each(item.sameIndexArray, (abnormalItem) => {
            this.sortedTechnologySheetList[abnormalItem].idNotSameError = true
          })
        } else {
          _.each(item.sameIndexArray, (normalItem) => {
            this.sortedTechnologySheetList[normalItem].idNotSameError = false
          })
        }
      })
    })

    // 校验相同custom_id下name是否相同
    this.abnormalNameDisposer = autorun(() => {
      // 结构：{ name: { custom_id: custom_id, sameIndexArray: [1,2,5], abnormal: 0 } }
      const uniqueKeyData = {}

      _.each(this.sortedTechnologySheetList, (item, index) => {
        if (_.includes(Object.keys(uniqueKeyData), item.custom_id)) {
          // 一旦存在相同的custom_id, name不同，则打上异常标志
          if (uniqueKeyData[item.custom_id].name !== item.name) {
            uniqueKeyData[item.custom_id].abnormal = true
          }
          // 添加到该name下
          uniqueKeyData[item.custom_id].sameIndexArray.push(index)
        } else {
          // 若name不在唯一组中，则添加新的
          uniqueKeyData[item.custom_id] = {
            name: item.name,
            sameIndexArray: [index],
            abnormal: false,
          }
        }
      })

      // 针对以custom_id分组的数据，将abnormal为true的index对应项error设为true,反之设为false
      _.each(uniqueKeyData, (item) => {
        if (item.abnormal) {
          _.each(item.sameIndexArray, (abnormalItem) => {
            this.sortedTechnologySheetList[abnormalItem].nameNotSameError = true
          })
        } else {
          _.each(item.sameIndexArray, (normalItem) => {
            this.sortedTechnologySheetList[normalItem].nameNotSameError = false
          })
        }
      })
    })

    // 显示后台返回的error
    this.batchErrorDisposer = autorun(() => {
      // 是否有error
      if (this.errorData && this.errorData.length !== 0) {
        const nameErrorData = this.errorData.names
        const idErrorData = this.errorData.custom_ids

        _.each(this.sortedTechnologySheetList, (item) => {
          if (_.includes(nameErrorData, item.name)) {
            item.nameExitedError = true
          } else {
            item.nameExitedError = false
          }

          if (_.includes(idErrorData, item.custom_id)) {
            item.idExitedError = true
          } else {
            item.idExitedError = false
          }
        })
      }
    })

    // 校验col_type是否为0/1
    this.abnormalColTypeDisposer = autorun(() => {
      _.each(this.sortedTechnologySheetList, (item) => {
        const colTypes = [0, 1]
        if (!colTypes.includes(item.col_type)) {
          item.colTypeError = true
        } else {
          item.colTypeError = false
        }
      })
    })

    // 校验输入的长度
    this.inputLengthDisposer = autorun(() => {
      console.log('item')
      _.each(this.sortedTechnologySheetList, (item) => {
        const lengthError = []
        if (item.custom_id.length > 8) {
          lengthError.push('custom_id')
        }
        if (item.name.length > 8) {
          lengthError.push('name')
        }
        if (item.desc.length > 50) {
          lengthError.push('desc')
        }
        if (item.col_name.length > 20) {
          lengthError.push('col_name')
        }
        item.lengthError = lengthError
      })
    })
  }

  // idNotSameError
  @computed
  get hasIdOrNameNotSameError() {
    let hasError = false

    _.each(this.sortedTechnologySheetList, (item) => {
      if (item.idNotSameError || item.nameNotSameError) {
        hasError = true
      }
    })

    return hasError
  }

  @computed
  get hasError() {
    let isError = false

    if (this.sortedTechnologySheetList.length === 0) {
      isError = true
    }

    _.each(this.sortedTechnologySheetList, (item) => {
      if (
        item.idNotSameError ||
        item.emptyNameError ||
        item.emptyIdError ||
        item.idExitedError ||
        item.nameExitedError ||
        item.nameNotSameError ||
        item.colTypeError ||
        item.lengthError.length > 0
      ) {
        isError = true
      }
    })

    return isError
  }

  @action
  initTechnologyData() {
    this.classifyTechnologyData()
    this.clearTextParams()
  }

  @action.bound
  clearData() {
    this.technologySheetList = []
    this.sortedTechnologySheetList = []
    this.errorData = []
    // 清掉autorun
    this.abnormalIdDisposer()
    this.batchErrorDisposer()
    this.emptyIdAndNameDisposer()
    this.abnormalNameDisposer()
    this.abnormalColTypeDisposer()
    this.inputLengthDisposer()
  }

  /**
   * 下标
   * @param {number} index
   * 更新的数据
   * @param {object} changeData
   */
  @action
  changeTechnologyItem(index, changeData) {
    Object.assign(this.sortedTechnologySheetList[index], { ...changeData })
  }

  /**
   * @param {number} index
   */
  @action
  deleteTechnologyItem(index) {
    this.sortedTechnologySheetList.remove(this.sortedTechnologySheetList[index])
  }

  /**
   * 待处理excel数据
   * @param {array} data
   */
  @action
  adapterTechnologyData(data) {
    const result = []
    const header = data.shift()

    _.each(data, (item) => {
      // 找到对应列的值，先匹配对应值的index，再通过index找到该值
      const name =
        item[
          _.findIndex(header, (fieldName) =>
            compareFindIndex(fieldName, excelHeaderData.name)
          )
        ]
      const custom_id =
        item[
          _.findIndex(header, (fieldName) =>
            compareFindIndex(fieldName, excelHeaderData.custom_id)
          )
        ]
      const desc =
        item[
          _.findIndex(header, (fieldName) =>
            compareFindIndex(fieldName, excelHeaderData.desc)
          )
        ]
      const col_name =
        item[
          _.findIndex(header, (fieldName) =>
            compareFindIndex(fieldName, excelHeaderData.col_name)
          )
        ]
      const params =
        item[
          _.findIndex(header, (fieldName) =>
            compareFindIndex(fieldName, excelHeaderData.params)
          )
        ]
      const col_type =
        item[
          _.findIndex(header, (fieldName) =>
            compareFindIndex(fieldName, excelHeaderData.col_type)
          )
        ]

      // 受控组件不能undefined，设为''
      result.push({
        name: adapterNilData(name),
        custom_id: adapterNilData(custom_id),
        desc: adapterNilData(desc),
        col_name: adapterNilData(col_name),
        params: adapterNilData(params),
        col_type: +col_type || 0, // 空和0都默认为0，这里是数字
        idNotSameError: false, // 辅助数据，提交时应去除
        nameExitedError: false, // 辅助数据
        idExitedError: false, // 辅助数据
        emptyIdError: false, // 辅助数据
        emptyNameError: false, // 辅助数据
        nameNotSameError: false, // 辅助数据
        colTypeError: false, // 辅助数据
        lengthError: [], // 辅助数据，长度校验
      })
    })

    return result
  }

  /**
   * excel数据
   * @param {array} data
   */
  @action
  setUploadTechnologyData(data) {
    this.technologySheetList = this.adapterTechnologyData(data)
  }

  // 归类数据
  @action
  classifyTechnologyData() {
    const processData = new Map()

    _.each(this.technologySheetList, (item) => {
      // 将相同name的项放在同一个key下
      if (processData.has(item.name)) {
        const keyData = processData.get(item.name)
        keyData[keyData.length] = item
      } else {
        processData.set(item.name, [item])
      }
    })

    // 按归类来合并成一个数组
    for (const value of processData.values()) {
      this.sortedTechnologySheetList = this.sortedTechnologySheetList.concat(
        value
      )
    }
  }

  /**
   * 把文本选择状态下对应的自定义字段参数描述的值清除
   */
  @action
  clearTextParams() {
    _.each(this.sortedTechnologySheetList, (item) => {
      if (item.col_type === 1) {
        item.params = ''
      }
    })
  }

  /**
   * 获取待提交数据
   * @returns{[ {name: string, custom_id: string, desc: string, custom_cols: {col_name: string, params: {name: string}[] }[] }] }
   * */
  @action
  getPostData() {
    const result = []

    // 以key 为 name+custome_id 的集合数据
    const uniqueKeyData = {} // 结构：{ namekey: [1,3,5] }

    // 将name+custom_id合在一起唯一的归类，归类index,再汇总数据
    _.each(this.sortedTechnologySheetList, (item, index) => {
      const currentNameKey = item.name + item.custom_id

      // 若已存在该值，则添加index
      if (_.includes(Object.keys(uniqueKeyData), currentNameKey)) {
        uniqueKeyData[currentNameKey].push(index)
      } else {
        // 未存在则新增
        uniqueKeyData[currentNameKey] = [index]
      }
    })

    // 将相同的keyName col_name合成一个数组，即整理custom_cols数组
    _.each(Object.values(uniqueKeyData), (dataIndexArray) => {
      // 相同的keyName中name,custom_id, desc是一样的，取第一项就好
      const { name, custom_id, desc } = this.sortedTechnologySheetList[
        dataIndexArray[0]
      ]
      const technology = {
        name,
        custom_id,
        desc,
        custom_cols: [],
      }

      _.each(dataIndexArray, (dataIndex) => {
        const { col_name, params, col_type } = this.sortedTechnologySheetList[
          dataIndex
        ]
        // 参数字符串以「#」分割，规整为对象数组
        const currentParams = params
          .split('#')
          .filter((param) => {
            // 去掉空
            return param
          })
          .map((item) => {
            return { param_name: item }
          })

        // 仅当不为空时才传给后台
        if (col_name) {
          technology.custom_cols.push({
            col_name: col_name,
            col_type,
            params: col_type === 1 ? [] : currentParams, // 1为文本，0为单选，文本时params无效，因此传空数组
          })
        }
      })

      result.push(technology)
    })

    return result
  }

  // 提交批量导入数据
  @action
  postBatchImportTechnologyData() {
    const postData = {
      technics: JSON.stringify(this.getPostData()),
    }

    return Request('/process/technic/import')
      .code([0, 1])
      .data(postData)
      .post()
      .then((json) => {
        if (json.code === 1) {
          runInAction(() => {
            this.errorData = json.data
          })
        }
        return json
      })
  }
}

export default new Store()
