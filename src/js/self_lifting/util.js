import _ from 'lodash'

const getAreaDict = (citySelected) => {
  let districtCode = null
  let l1AreaId = null
  let l2AreaId = null
  if (citySelected && _.isArray(citySelected)) {
    districtCode = citySelected[0] ? citySelected[0] : null
    l1AreaId = citySelected[1] ? citySelected[1] : null
    l2AreaId = citySelected[2] ? citySelected[2] : null
  }
  return {
    district_code: districtCode,
    area_l1: l1AreaId,
    area_l2: l2AreaId,
  }
}

export { getAreaDict }
