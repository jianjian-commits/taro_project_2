/*
 * @Description: 绩效工资总表
 */
import React from 'react'
import PropType from 'prop-types'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import SimpleTable from '../simple_table'

const columns = [
  {
    title: t('姓名'),
    dataIndex: 'name',
  },
  {
    title: t('统计日期'),
    dataIndex: 'statistical_date',
  },
  {
    title: t('工作天数（天）'),
    dataIndex: 'work_days',
  },
  {
    title: t('基本工资（元）'),
    dataIndex: 'base_salary',
  },
  {
    title: t('计件数'),
    dataIndex: 'piece_value',
  },
  {
    title: t('计件绩效（元）'),
    dataIndex: 'piece_salary',
  },
  {
    title: t('计重数'),
    dataIndex: 'weight_value',
  },
  {
    title: t('计重绩效（元）'),
    dataIndex: 'weight_salary',
  },
  {
    title: t('工资（元）'),
    dataIndex: 'total_salary',
  },
]
function TotalSalaryTable(props) {
  const {
    // 工资数组
    salaries,
  } = props

  return (
    <div style={{ display: 'table' }} className='gm-padding-left-10'>
      <Flex justifyCenter>
        <h2>{t('绩效工资总表')}</h2>
      </Flex>
      <SimpleTable rowKey='user_id' columns={columns} dataSource={salaries} />
    </div>
  )
}

TotalSalaryTable.propTypes = {
  salaries: PropType.array.isRequired,
}
export default TotalSalaryTable
