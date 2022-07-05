import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import Big from 'big.js'
import { createRef } from 'react'

export default new (class DetailsStore {
  formRef = createRef()

  @observable params = {
    name: '',
    remark: '',
    source_spu: null,
    is_deleted: false, // 待分割品 SPU 是否被删除
    gain_spus: [
      {
        spu: null, // is_deleted boolean // 获得品 SPU 是否被删除
        split_ratio: null,
      },
    ],
  }

  @action setParams = (key, value) => {
    this.params[key] = value
  }

  @action fetchParams = (id) => {
    return Request('/stock/split/plan/detail')
      .data({ id })
      .get()
      .then(({ data }) => {
        const {
          source_spu_id,
          source_spu_name,
          gain_spus,
          std_unit_name,
          is_deleted,
          ...rest
        } = data
        this.params = {
          ...rest,
          source_spu: {
            value: source_spu_id,
            text: source_spu_name,
            std_unit_name,
            is_deleted: !!is_deleted,
          },
          gain_spus: gain_spus.map((item) => ({
            spu: {
              value: item.spu_id,
              text: item.spu_name,
              std_unit_name: item.std_unit_name,
              is_deleted: !!item.is_deleted,
            },
            split_ratio: Big(item.split_ratio).toFixed(2),
          })),
        }
      })
  }

  @action setGainSpu = (index, value) => {
    Object.assign(this.params.gain_spus[index], value)
  }

  @action addGainSpu = (index) => {
    this.params.gain_spus.splice(index, 0, { spu: null, split_ratio: null })
  }

  @action deleteGainSpu = (index) => {
    this.params.gain_spus.splice(index, 1)
  }

  @observable spus = []

  @action fetchSpu = (text) => {
    if (!text) {
      this.spus = []
      return
    }
    return Request('/stock/list')
      .data({ limit: 100000, text, remain_status: 1 })
      .get()
      .then(({ data }) => {
        runInAction(() => {
          this.spus = data.map((item) => ({
            value: item.spu_id,
            text: item.name,
            ...item,
          }))
        })
      })
  }

  filterData() {
    const { source_spu, gain_spus, ...rest } = this.params
    const data = {
      ...rest,
      gain_spus: JSON.stringify(
        gain_spus.map((item) => ({
          spu_id: item.spu.value,
          split_ratio: item.split_ratio,
        }))
      ),
    }
    if (source_spu) {
      data.source_spu_id = source_spu.value
    }
    return data
  }

  handleCreate = () => {
    return Request('/stock/split/plan/create')
      .data(this.filterData())
      .code([100])
      .post()
      .then((result) => {
        if (result.code === 100) {
          throw result
        }
        return result
      })
  }

  handleModify = () => {
    return Request('/stock/split/plan/update')
      .data(this.filterData())
      .code([100])
      .post()
      .then((result) => {
        if (result.code === 100) {
          throw result
        }
        return result
      })
  }

  /**
   * 从错误信息中回显
   * @param deleted_spu_ids {string[]}
   */
  checkErrorData = (deleted_spu_ids) => {
    const {
      params: { source_spu, gain_spus },
      setParams,
      formRef,
    } = this
    if (deleted_spu_ids.includes(source_spu.value)) {
      setParams(
        'source_spu',
        Object.assign({}, source_spu, { is_deleted: true })
      )
    }
    gain_spus.forEach((item) => {
      if (deleted_spu_ids.includes(item.spu.value)) {
        item.spu.is_deleted = true
      }
    })
    setParams('gain_spus', gain_spus)
    formRef.current.apiDoValidate()
  }
})()
