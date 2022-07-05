import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { store } from '../store'
import moment from 'moment'
import { BoxTable, Button, Flex, Pagination } from '@gmfe/react'
import globalStore from 'stores/global'
import ExportCell from './export_cell'
import { toJS } from 'mobx'

const {
  OperationHeader,
  OperationCell,
  TABLE_X: { WIDTH_OPERATION },
} = TableXUtil

@observer
class List extends Component {
  columns = [
    {
      Header: t('报告编号'),
      accessor: 'id',
      Cell: ({
        row: {
          original: { id },
        },
      }) => (
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={`/#/supply_chain/food_security/supplier_report/action/edit?id=${id}`}
        >
          JC{id}
        </a>
      ),
    },
    { Header: t('报告名称'), accessor: 'report_name' },
    { Header: t('检测日期'), accessor: 'detect_date' },
    { Header: t('检测机构'), accessor: 'detect_institution' },
    {
      Header: t('有效状态'),
      accessor: 'status',
      Cell: ({
        row: {
          original: { status },
        },
      }) => {
        const map = {
          1: t('有效'),
          2: t('失效'),
        }
        return map[status]
      },
    },
    { Header: t('上传人'), accessor: 'uploader' },
    {
      Header: t('上传时间'),
      accessor: 'create_time',
      Cell: ({
        row: {
          original: { create_time },
        },
      }) => moment(create_time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      Header: OperationHeader,
      width: WIDTH_OPERATION,
      accessor: 'action',
      Cell: ({
        row: {
          original: { pictures },
        },
      }) => (
        <OperationCell>
          <ExportCell onClick={() => this.handleDownloadPic(pictures)} />
        </OperationCell>
      ),
    },
  ]

  onPageChange = async ({ offset, limit }) => {
    const { trueFilter, pagination, list } = store
    const _list = toJS(list)
    const obj = {
      ...trueFilter,
      limit,
      from:
        offset > pagination.offset
          ? _list[_list.length - 1].__cursor
          : _list[0].__cursor,
      reverse: offset >= pagination.offset ? 0 : 1,
    }
    if (offset === pagination.offset && offset === 0) {
      delete obj.from
    } else if (offset < pagination.offset && offset === 0) {
      delete obj.from
      obj.reverse = 0
    }
    await store.fetchList(obj)
    store.setPagination({ offset, limit })
  }

  /**
   * 下载图片
   * @param urls {string[]}
   */
  handleDownloadPic = (urls) => {
    urls.forEach((item) => {
      window.open(item)
    })
  }

  handleRouteJump = () => {
    window.open('/#/supply_chain/food_security/supplier_report/action/add')
  }

  render() {
    const { list, pagination } = store
    const canAddSecurityReport = globalStore.hasPermission(
      'add_security_report',
    )
    return (
      <BoxTable
        action={
          canAddSecurityReport && (
            <Button type='primary' onClick={this.handleRouteJump}>
              {t('新增检测报告')}
            </Button>
          )
        }
      >
        <TableX data={list.slice()} columns={this.columns} />
        <Flex justifyEnd className='gm-margin-top-10 gm-margin-right-20'>
          <Pagination
            data={pagination}
            toPage={this.onPageChange}
            nextDisabled={list.length < 10}
          />
        </Flex>
      </BoxTable>
    )
  }
}

export default List
