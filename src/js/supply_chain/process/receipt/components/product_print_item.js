import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import moment from 'moment'
import { technicFlowCustomCols, technologyNames, remarkType } from '../utils'
import Title from './print_title'
import Header from './print_header'
import _ from 'lodash'

const ProductPrintItem = ({ item, title }) => {
  return (
    <div className='gm-margin-bottom-10 b-print-page-break'>
      <Title title={title} id={item.id} code={item.code} />
      <Header
        col={3}
        content={[
          { label: t('计划编号'), text: item.custom_id },
          {
            label: t('开工时间'),
            text: item.start_time
              ? moment(item.start_time).format('YYYY-MM-DD')
              : '-',
          },
          {
            label: t('计划生产数'),
            text: `${item.plan_amount}${item.sale_unit_name}(${item.std_plan_amount}${item.std_unit_name})`,
          },
          { label: t('生产成品'), text: item.sku_name },
          {
            label: t('完成时间'),
            text: item.finish_time
              ? moment(item.finish_time).format('YYYY-MM-DD')
              : '-',
          },
        ]}
      />
      <Content
        ingredients={item.ingredients}
        isCombine={!!item.combine_technic_status}
        combineTechnicsData={item.combine_technics}
      />
    </div>
  )
}

ProductPrintItem.propTypes = {
  item: PropTypes.object,
  title: PropTypes.string,
}

export default ProductPrintItem

const Content = ({ ingredients, isCombine, combineTechnicsData }) => {
  return (
    <div>
      <div className='gm-border gm-margin-top-15 gm-margin-bottom-20' />
      {isCombine ? (
        <CombineIngredients
          ingredients={ingredients}
          isCombine={isCombine}
          combineTechnicsData={combineTechnicsData}
        />
      ) : (
        ingredients.map((item, index) => (
          <Ingredients
            key={index}
            name={item.sku_name}
            tasks={item.tasks}
            type={item.type}
            planAmount={item.plan_amount}
            recvAmount={item.recv_amount}
            outputAmount={item.output_amount}
            unit={item.std_unit_name}
          />
        ))
      )}
    </div>
  )
}

Content.propTypes = {
  ingredients: PropTypes.array,
  combineTechnicsData: PropTypes.array,
  isCombine: PropTypes.bool.isRequired, // 是否是组合工艺
}

const CombineIngredientsDesc = (props) => {
  const { combineTechnicsData } = props

  return (
    <>
      <div className='gm-padding-tb-5 gm-padding-lr-10'>{t('工艺说明：')}</div>

      <div className='gm-padding-10 table table-bordered'>
        {_.map(combineTechnicsData, (item, index) => {
          const {
            technic_flow_name, // 工艺名
            technic_flow_custom_cols,
            technic_flow_desc, // 工艺描述
          } = item

          return (
            <div className='gm-padding-tb-10'>
              {`${index + 1}. ${technic_flow_name}，`}
              {_.map(technic_flow_custom_cols, (colItem, colIndex) => {
                const {
                  technic_flow_col_name, // 自定义字段
                  technic_flow_param_name, // 字段参数
                } = colItem
                return `${technic_flow_col_name}：${technic_flow_param_name}${
                  colIndex !== technic_flow_custom_cols.length - 1 ? '，' : ''
                }`
              })}
              {technic_flow_desc && `，（${technic_flow_desc}）`}
            </div>
          )
        })}
      </div>
    </>
  )
}

CombineIngredientsDesc.propTypes = {
  combineTechnicsData: PropTypes.array,
}

const CombineIngredients = (props) => {
  const { combineTechnicsData, ingredients, isCombine } = props

  return (
    <div className='gm-padding-bottom-5'>
      {/* 组合工艺不展示物料表格，展示工艺说明 */}

      <CombineIngredientsDesc combineTechnicsData={combineTechnicsData} />

      <div className='gm-padding-tb-5 gm-padding-lr-10'>{t('组成物料：')}</div>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>{t('物料名称')}</th>
            <th>{t('物料类型')}</th>
            <th>{t('需求数量')}</th>
            <th>{t('领料数量')}</th>
            <th>{t('产出数量')}</th>
            <th>{t('涉及工艺')}</th>
            <th>{t('工艺领料数量')}</th>
            <th>{t('工艺产出数量')}</th>
          </tr>
        </thead>
        <tbody>
          {_.map(ingredients, (item, index) => {
            // 工艺赋值放到这里
            return (
              <Tasks
                key={index}
                type={item.type}
                planAmount={item.plan_amount}
                recvAmount={item.recv_amount}
                outputAmount={item.output_amount}
                unit={item.std_unit_name}
                skuName={item.sku_name}
                rowSpan={item.tasks.length}
                tasks={item.tasks}
                isCombine={isCombine}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

CombineIngredients.propTypes = {
  isCombine: PropTypes.bool.isRequired, // 是否是组合工艺
  combineTechnicsData: PropTypes.array,
  ingredients: PropTypes.array, // 组合工艺需要完整的工艺数据
}

const Ingredients = ({ name, tasks, ...rest }) => {
  const rowspan = tasks && tasks.length

  return (
    <div className='gm-padding-bottom-5'>
      <p className='gm-text-bold'>
        {t('物料名称')}：{name}
      </p>
      <div className='gm-padding-tb-5 gm-padding-lr-10 b-print-border-lr b-print-border-top'>
        {t('加工工艺')}：{technologyNames(tasks)}
      </div>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>{t('顺序')}</th>
            <th>{t('工艺名称')}</th>
            <th>{t('加工规格')}</th>
            <th>{t('备注')}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((item, index) => (
            <Process
              technic_flow_custom_cols={item.technic_flow_custom_cols}
              technic_flow_desc={item.technic_flow_desc}
              technic_flow_name={item.technic_flow_name}
              key={index}
              index={index}
            />
          ))}
        </tbody>
      </table>

      <div className='gm-padding-tb-5 gm-padding-lr-10'>{t('加工任务')}</div>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>{t('物料类型')}</th>
            <th>{t('需求数量')}</th>
            <th>{t('领料数量')}</th>
            <th>{t('产出数量')}</th>
            <th>{t('涉及工艺')}</th>
            <th>{t('工艺领料数量')}</th>
            <th>{t('工艺产出数量')}</th>
          </tr>
        </thead>
        <tbody>
          <Tasks {...rest} rowSpan={rowspan} tasks={tasks} />
        </tbody>
      </table>
    </div>
  )
}

Ingredients.propTypes = {
  name: PropTypes.string,
  tasks: PropTypes.array,
  type: PropTypes.number,
  planAmount: PropTypes.number,
  recvAmount: PropTypes.number,
  outputAmount: PropTypes.number,
  unit: PropTypes.string,
}

const Process = ({
  index,
  technic_flow_name,
  technic_flow_custom_cols,
  technic_flow_desc,
}) => {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{technic_flow_name}</td>
      <td>{technicFlowCustomCols(technic_flow_custom_cols)}</td>
      <td>{technic_flow_desc}</td>
    </tr>
  )
}

Process.propTypes = {
  index: PropTypes.number,
  technic_flow_name: PropTypes.string,
  technic_flow_custom_cols: PropTypes.array,
  technic_flow_desc: PropTypes.string,
}

const Tasks = ({
  type,
  planAmount,
  recvAmount,
  outputAmount,
  tasks,
  rowSpan,
  unit,
  skuName,
  isCombine,
}) => {
  if (!tasks.length) {
    return null
  }
  return (
    <>
      <tr>
        {isCombine && <td rowSpan={rowSpan}>{skuName}</td>}
        <td rowSpan={rowSpan}>{remarkType(type)}</td>
        <td rowSpan={rowSpan}>{planAmount ? `${planAmount}${unit}` : '-'}</td>
        <td rowSpan={rowSpan}>{recvAmount ? `${recvAmount}${unit}` : '-'}</td>
        <td rowSpan={rowSpan}>
          {outputAmount ? `${outputAmount}${unit}` : '-'}
        </td>
        <Task
          name={tasks[0].technic_flow_name}
          recv={tasks[0].technic_recv_amount}
          output={tasks[0].technic_output_amount}
          unit={unit}
        />
      </tr>
      {tasks.slice(1, tasks.length).map((item, index) => (
        <tr key={index}>
          <Task
            name={item.technic_flow_name}
            recv={item.technic_recv_amount}
            output={item.technic_output_amount}
            unit={unit}
          />
        </tr>
      ))}
    </>
  )
}

Tasks.propTypes = {
  isCombine: PropTypes.bool.isRequired, // 是否是组合工艺
  type: PropTypes.number,
  planAmount: PropTypes.number,
  recvAmount: PropTypes.number,
  outputAmount: PropTypes.number,
  tasks: PropTypes.array,
  rowSpan: PropTypes.number,
  unit: PropTypes.string,
  skuName: PropTypes.string,
}

const Task = ({ name, recv, output, unit }) => {
  return (
    <>
      <td style={{ paddingLeft: '8px' }}>{name}</td>
      <td>{recv ? `${recv}${unit}` : '-'}</td>
      <td>{output ? `${output}${unit}` : '-'}</td>
    </>
  )
}

Task.propTypes = {
  name: PropTypes.string,
  recv: PropTypes.number,
  output: PropTypes.number,
  unit: PropTypes.string,
}
