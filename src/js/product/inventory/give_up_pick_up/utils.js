import _ from 'lodash'

/**
 * @param category1 {{text:string,value:number}[]}
 * @param category2 {{text:string,value:number}[]}
 * @param q {string}
 * @param begin {string}
 * @param end {string}
 * @param pagination {{limit:number,offset:number,page_obj:string,peek:number}}
 * @returns {{category_id_1?:number[],category_id_2?:number[],
 * q?:string,begin:string,end:string,
 * limit?:number,offset?:number,page_obj?:string,peek?:number}}
 */
export function checkFilter({
  begin,
  end,
  category1,
  category2,
  q,
  pagination,
}) {
  let filter = {
    begin,
    end,
  }
  if (pagination) {
    filter = { ...filter, ...pagination }
  }
  if (category1.length) {
    filter.category_id_1 = JSON.stringify(category1.map((v) => v.value))
  }
  if (category2.length) {
    filter.category_id_2 = JSON.stringify(category2.map((v) => v.value))
  }
  if (q) {
    filter.q = _.trim(q)
  }
  return filter
}
