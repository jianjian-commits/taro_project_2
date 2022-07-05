import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { LoadingChunk } from '@gmfe/react'
import { MaterialPrintItem } from '../components'
import { uniqueId } from 'lodash'

const MaterialPrint = (props) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { ids } = props.location.query
    setLoading(true)
    Request('/stock/process/process_order/print')
      .data({ ids })
      .get()
      .then(({ data }) => {
        setList(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (list.length) {
      setTimeout(() => window.print())
    }
  }, [list])

  return (
    <LoadingChunk loading={loading} text={t('拼命加载中')}>
      <div className='gm-padding-20'>
        <table className='table table-bordered gm-bg'>
          <caption>
            {t('物料单')}
            <style jsx>{`
              caption {
                font-size: 20px;
              }
            `}</style>
          </caption>
          <tbody>
            <tr>
              <th className='text-center'>{t('成品名称')}</th>
              <th className='text-center'>
                {t('生产数量')}
                <br />（{t('销售单位')}）
              </th>
              <th className='text-center'>{t('规格')}</th>
              <th className='text-center'>
                {t('生产数量')}
                <br />（{t('基本单位')}）
              </th>
              <th className='text-center'>{t('物料名称')}</th>
              <th className='text-center'>{t('物料类型')}</th>
              <th className='text-center'>{t('单位需求量')}</th>
              <th className='text-center'>
                {t('总需求量')}
                <br />（{t('基本单位')}）
              </th>
              <th className='text-center'>{t('规格')}</th>
              <th className='text-center'>
                {t('总需求量')}
                <br />（{t('包装单位')}）
              </th>
            </tr>
            {list.map((item) => {
              return item.ingredients.map((m, i, materials) => {
                const rowspan = materials.length
                if (i) {
                  return (
                    <tr key={uniqueId()}>
                      <MaterialPrintItem
                        item={m}
                        planAmount={item.plan_amount}
                      />
                    </tr>
                  )
                } else {
                  return (
                    <tr key={uniqueId()}>
                      <td rowSpan={rowspan} className='text-center'>
                        {item.sku_name}
                      </td>
                      <td rowSpan={rowspan} className='text-center'>
                        {item.plan_amount}
                        {item.sale_unit_name}
                      </td>
                      <td rowSpan={rowspan} className='text-center'>
                        {item.ratio}
                        {item.std_unit_name}/{item.sale_unit_name}
                      </td>
                      <td rowSpan={rowspan} className='text-center'>
                        {item.std_plan_amount}
                        {item.std_unit_name}
                      </td>
                      <MaterialPrintItem
                        item={m}
                        planAmount={item.plan_amount}
                      />
                    </tr>
                  )
                }
              })
            })}
          </tbody>
        </table>
      </div>
    </LoadingChunk>
  )
}

export default MaterialPrint
