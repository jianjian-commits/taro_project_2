import Big from 'big.js'
import { t } from 'gm-i18n'
import Introduction from './print_introduction'
import PropTypes from 'prop-types'
import { remarkType, technicFlowCustomCols } from '../utils'
import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'

const TdStyled = styled.td`
  padding-left: 8px;
`

const Technic = ({ value, num }) => {
  const list = value.ingredients.map((item) => {
    let sum = 0
    item.tasks.forEach((task) => {
      sum = Big(sum)
        .plus(task.plan_amount || 0)
        .toFixed(2)
    })
    return {
      tips: `${item.ingredient_name}，${t('总计需求数量')}：${sum}${
        item.ingredient_std_unit_name
      }`,
      tasks: item.tasks.map((task) => ({
        skuId: task.sku_id,
        skuName: task.sku_name,
        skuPlanAmount: task.sku_plan_amount,
        skuStdUnitName: task.sku_std_unit_name,
        skuSaleUnitName: task.sku_sale_unit_name,
        skuStdPlanAmount: task.sku_std_plan_amount,
        name: task.ingredient_name,
        type: task.ingredient_type,
        id: task.custom_id,
        flow: task.technic_flow_custom_cols,
        planAmount: task.plan_amount,
        unit: task.ingredient_std_unit_name,
        recv: task.technic_recv_amount,
        output: task.technic_output_amount,
      })),
    }
  })
  return (
    <>
      <Introduction name={value.technic_name} desc={value.technic_desc} />
      <div className='gm-padding-top-10 gm-padding-bottom-5 gm-text-bold'>
        {t('任务列表')}：{num}
      </div>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>{t('成品名称')}</th>
            <th>{t('计划生产数')}</th>
            <th>{t('物料名称')}</th>
            <th>{t('物料类型')}</th>
            <th>{t('关联加工单')}</th>
            <th>{t('加工规格')}</th>
            <th>{t('需求数量')}</th>
            <th>{t('工艺领料数量')}</th>
            <th>{t('工艺产出数量')}</th>
          </tr>
        </thead>
        {list.map((item, index) => (
          <Ingredients {...item} key={index} />
        ))}
      </table>
    </>
  )
}

Technic.propTypes = {
  value: PropTypes.object,
  num: PropTypes.number,
}

export default Technic

const Ingredients = ({ tasks, tips }) => {
  const groupIndexObj = {} // { index: item.length } index:分组的起始index,item.length:分组的长度

  let index = 0
  const groupTasks = []
  // 根据skuId（成品id）分组
  _.each(_.groupBy(tasks, 'skuId'), (item) => {
    let totalSalePlanNum = 0
    let totalStdPlanNum = 0
    // 将同一个分组下的skuPlanAmount, skuStdPlanAmount设为汇总值
    _.each(item, (i) => {
      totalSalePlanNum += i.skuPlanAmount
      totalStdPlanNum += i.skuStdPlanAmount
    })
    _.each(item, (i) => {
      i.skuPlanAmount = totalSalePlanNum
      i.skuStdPlanAmount = totalStdPlanNum
    })
    groupTasks.push(...item)
    groupIndexObj[index] = item.length

    index = index + item.length
  })
  return (
    <>
      <tbody>
        {groupTasks.map((item, index) => (
          <Task
            {...item}
            key={index}
            index={index}
            rowSpan={tasks.length}
            groupIndexObj={groupIndexObj}
          />
        ))}
      </tbody>
      <tr>
        <td colSpan={9} className='gm-text-bold gm-padding-10 gm-border-bottom'>
          {tips}
        </td>
      </tr>
    </>
  )
}

Ingredients.propTypes = {
  tips: PropTypes.string,
  tasks: PropTypes.array,
}

const Task = ({
  skuName,
  skuPlanAmount,
  skuSaleUnitName,
  skuStdUnitName,
  name,
  type,
  id,
  flow,
  planAmount,
  unit,
  recv,
  output,
  rowSpan,
  index,
  groupIndexObj,
  skuStdPlanAmount,
}) => {
  const groupFirstIndexes = Object.keys(groupIndexObj)

  return (
    <tr>
      {groupFirstIndexes.includes(index + '') && (
        <td rowSpan={groupIndexObj[index] || 1}>{skuName}</td>
      )}
      {groupFirstIndexes.includes(index + '') && (
        <td rowSpan={groupIndexObj[index] || 1}>
          {skuPlanAmount
            ? `${skuPlanAmount}${skuSaleUnitName}(${skuStdPlanAmount}${skuStdUnitName})`
            : '-'}
        </td>
      )}
      <TdStyled style={{ paddingLeft: '8px' }}>{name}</TdStyled>
      <td>{remarkType(type)}</td>
      <td>{id}</td>
      <td>{technicFlowCustomCols(flow)}</td>
      <td>{planAmount ? `${planAmount}${unit}` : '-'}</td>
      <td>{recv ? `${recv}${unit}` : '-'}</td>
      <td>{output ? `${output}${unit}` : '-'}</td>
    </tr>
  )
}

Task.propTypes = {
  skuPlanAmount: PropTypes.number,
  skuSaleUnitName: PropTypes.string,
  skuStdUnitName: PropTypes.string,
  skuName: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.number,
  id: PropTypes.string,
  flow: PropTypes.array,
  planAmount: PropTypes.number,
  unit: PropTypes.string,
  recv: PropTypes.number,
  output: PropTypes.number,
  rowSpan: PropTypes.number,
  index: PropTypes.number,
  groupIndexObj: PropTypes.object.isRequired, // { index: item.length } index:分组的起始index,item.length:分组的长度
  skuStdPlanAmount: PropTypes.number,
}
