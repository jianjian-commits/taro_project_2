import React, { useEffect, useState } from 'react'
import { Request } from '@gm-common/request'
import { ProcessPrintList } from '../components'
import { t } from 'gm-i18n'
import { Tip } from '@gmfe/react'

const ProcessPrint = (props) => {
  const [productList, setProductList] = useState([])
  const [technicList, setTechnicList] = useState([])
  const [workshopList, setWorkshopList] = useState([])

  useEffect(() => {
    const {
      order_ids,
      product,
      technic,
      workshop,
      task_ids,
      workshop_ids,
    } = props.location.query

    const promiseAllArray = []
    const promiseSign = [] // 记录promise顺序
    if (product === 'true') {
      const productPromise = Request('/stock/process/process_order/print')
        .data({ ids: order_ids })
        .get()
        .then((json) => {
          setProductList(json.data)

          return json
        })
      promiseSign.push('product')
      promiseAllArray.push(productPromise)
    }
    if (technic === 'true') {
      const technicPromise = Request(
        '/stock/process/process_order/print_by_technic',
      )
        .data({ ids: order_ids, task_ids, workshop_ids }) // task_ids当按工艺打印才会传，不是则undefined，会过滤掉
        .get()
        .then((json) => {
          setTechnicList(json.data)

          return json
        })
      promiseSign.push('technic')
      promiseAllArray.push(technicPromise)
    }
    if (workshop === 'true') {
      const workshopPromise = Request(
        '/stock/process/process_order/print_by_workshop',
      )
        .data({ ids: order_ids, task_ids, workshop_ids })
        .get()
        .then((json) => {
          setWorkshopList(json.data)

          return json
        })
      promiseAllArray.push(workshopPromise)
      promiseSign.push('workshop')
    }

    Promise.all(promiseAllArray).then((result) => {
      let canPrint = false
      // 存在无工艺和车间的情况,产品加工单也要判断一下
      result.forEach((item) => {
        if (item.data.length !== 0) {
          canPrint = true
        }
      })

      if (!canPrint) {
        Tip.warning(t('所选商品未关联工艺或车间，暂无法打印加工单'))
      } else {
        setTimeout(() => {
          window.print()
        }, 500)
      }
    })
  }, [])

  return (
    <div className='gm-padding-10'>
      <ProcessPrintList list={productList} title={t('产品加工单')} />
      <ProcessPrintList list={technicList} title={t('工艺加工单')} />
      <ProcessPrintList list={workshopList} title={t('车间加工单')} />
    </div>
  )
}

export default ProcessPrint
