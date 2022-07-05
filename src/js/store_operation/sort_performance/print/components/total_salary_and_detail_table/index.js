/*
 * @Description: 绩效工资总表及明细表
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'

import SimpleTable from '../simple_table'

// 工资总表
const totalSalaryColumns = [
  {
    title: t('基本工资'),
    dataIndex: 'base_salary',
  },
  {
    title: t('计件工资'),
    dataIndex: 'piece_salary',
  },
  {
    title: t('计重工资'),
    dataIndex: 'weight_salary',
  },
  {
    title: t('总工资'),
    dataIndex: 'total_salary',
  },
]
// 工资明细表
const detailSalaryColumns = [
  {
    title: t('日期'),
    dataIndex: 'date',
  },
  {
    title: t('基本工资'),
    dataIndex: 'base_salary',
  },
  {
    title: t('计件数'),
    dataIndex: 'piece_value',
  },
  {
    title: t('单位计件工资'),
    dataIndex: 'piece_price',
  },
  {
    title: t('计件工资'),
    dataIndex: 'piece_salary',
  },
  {
    title: t('计重数'),
    dataIndex: 'weight_value',
  },
  {
    title: t('单位计重工资'),
    dataIndex: 'weight_price',
  },
  {
    title: t('计重工资'),
    dataIndex: 'weight_salary',
  },
  {
    title: t('总工资'),
    dataIndex: 'total_salary',
  },
]

function TotalSalaryAndDetailTable(props) {
  const { salaries } = props

  return (
    <>
      {salaries.map((salary) => (
        <SingleItem {...salary} key={salary.user_id} />
      ))}
    </>
  )
}

function SingleItem(props) {
  const {
    name,
    statistical_date,
    base_salary,
    piece_salary,
    weight_salary,
    total_salary,
    details,
  } = props

  return (
    <div style={{ display: 'table', pageBreakAfter: 'always' }}>
      <Flex justifyCenter>
        <h2>{t('工资条')}</h2>
      </Flex>
      <Flex justifyBetween>
        <span>
          {t('姓名')}：{name}
        </span>
        <span>
          {t('结算周期')}：{statistical_date}
        </span>
      </Flex>
      <div className='gm-margin-top-10'>
        <div className='gm-margin-bottom-10'>{t('工资总表')}：</div>
        <SimpleTable
          rowKey='base_salary'
          columns={totalSalaryColumns}
          dataSource={[
            {
              base_salary,
              piece_salary,
              weight_salary,
              total_salary,
            },
          ]}
        />
      </div>
      <div className='gm-margin-top-10'>
        <div className='gm-margin-bottom-10'>{t('工资明细表')}：</div>
        <SimpleTable
          rowKey='date'
          columns={detailSalaryColumns}
          dataSource={details}
        />
      </div>
    </div>
  )
}

TotalSalaryAndDetailTable.propTypes = {
  salaries: PropTypes.array.isRequired,
}
SingleItem.propTypes = {
  name: PropTypes.string,
  statistical_date: PropTypes.string,
  base_salary: PropTypes.string,
  piece_salary: PropTypes.string,
  weight_salary: PropTypes.string,
  total_salary: PropTypes.string,
  details: PropTypes.array,
}
export default TotalSalaryAndDetailTable
