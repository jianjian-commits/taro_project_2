import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import { action, observable, toJS } from 'mobx'
import _ from 'lodash'
import { isCStationAndC } from '../../../../common/service'

const defaultBrand = {
  corporate_profile:
    '本公司是集加工、配送于一体的专业化配送公司，主要为大型商超、机关企事业单位、部队、金融、银行、学校、医院、餐饮业、工厂食堂等机构提供无公害蔬菜、水果、放心肉、冻品、水产海鲜、南北干货、调味配料、绿色食品等若干类数千款食材食品农产品的一站式供应。',
  corporate_style: [
    '//gmfiles-1251112841.file.myqcloud.com/station_pic/609747164008a802.jpeg',
    '//gmfiles-1251112841.file.myqcloud.com/station_pic/8c45a0d82e92ba92.png',
    '//gmfiles-1251112841.file.myqcloud.com/station_pic/9946f3e3157dfa92.jpeg',
  ], // 企业风采
  work_description:
    '本公司毗邻一级农批市场，拥有3000平米的分拣仓库，设有多个冷藏库、冷冻库，设置独立检测室，保证每批菜品都经过农残检测，确保食材安全、健康、新鲜。',
  worksite: [
    '//gmfiles-1251112841.file.myqcloud.com/station_pic/1e0dda1eef592282.jpeg',
    '//gmfiles-1251112841.file.myqcloud.com/station_pic/838a5cd6e6b886ff.jpeg',
  ], // 作业说明
  qualification_description: '', // 资质说明
  company_qualification: [], // 公司资历
  customer_case: [], // 合作企业
}

class DiyStore {
  @observable
  enterprise_brand = {
    corporate_profile: '',
    corporate_style: [],
    work_description: '',
    worksite: [],
    qualification_description: '',
    company_qualification: [],
    customer_case: [],
  }

  @observable
  img_ids = {
    worksite: [],
    corporate_style: [],
    company_qualification: [],
    customer_case: [],
  }

  @action.bound
  handleChange(field, value) {
    this.enterprise_brand[field] = value
  }

  @action.bound
  handleImageChange(field, index, url, id) {
    const imgArr = this.enterprise_brand[field]
    const ids = _.clone(toJS(imgArr))
    if (!url) {
      imgArr.splice(index, 1)
      ids.splice(index, 1)
    } else {
      imgArr[index] = url
      ids[index] = id
    }
    this.img_ids[field] = ids
  }

  fetchData() {
    let url = '/station/customized'
    if (isCStationAndC()) url = '/station/cshop/customized_info/get'
    Request(url)
      .get()
      .then(
        action((json) => {
          const { enterprise_brand } = json.data
          if (enterprise_brand.corporate_profile) {
            this.enterprise_brand = enterprise_brand
          } else {
            this.enterprise_brand = { ...defaultBrand }
          }
        }),
      )
  }

  handleSubmit = () => {
    const brand = toJS(this.enterprise_brand)
    if (!_.trim(brand.corporate_profile)) {
      Tip.warning('请填写企业介绍')
      return
    }
    const params = {}
    Object.entries(brand).forEach(([key, val]) => {
      let newVal = val
      if (typeof val === 'object') {
        // 解决图片协议的问题，只传图片id
        if (this.img_ids[key].length > 0) {
          val = this.img_ids[key]
        }
        newVal = JSON.stringify(val)
      }
      params[key] = newVal
    })

    Request('/station/customized/brand_shop/update')
      .data(params)
      .post()
      .then(() => {
        Tip.success(t('保存成功！'))
      })
  }
}

export default new DiyStore()
