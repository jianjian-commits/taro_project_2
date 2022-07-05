import { Observer, observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { ManagePaginationV2 } from '@gmfe/business'

import _ from 'lodash'
import { t } from 'gm-i18n'

import { Modal, Flex, Button, Price, InputNumberV2, Popover } from '@gmfe/react'
import { TableX, TableXUtil, editTableXHOC } from '@gmfe/table-x'
import store from './store'
import PropTypes from 'prop-types'
import moment from 'moment'
import { fixedNumber } from './util'
import { STATUS_DATA, RETURN_STATUS_DATA } from './enum'
import SvgRefundReview from 'svg/refund_review.svg'
import styled from 'styled-components'

import Filter from './filter'

const StyledTip = styled.div`
  width: 60px;
`

const StyledRed = styled.span`
  color: red;
`

const EditTable = editTableXHOC(TableX)

const AuditModal = observer((props) => {
  const {
    data: { id, return_status, refund },
  } = props
  const isWaitReturn = return_status === 1
  const isAlreadyReturn = return_status === 2
  const handleSave = () => {
    store.postData({ id, refund }).then(() => {
      store.fetchList(store.page)
    })
    Modal.hide()
  }

  return (
    <Flex column>
      {isWaitReturn && (
        <Flex column>
          <span className='gm-margin-10'>
            {t('1.当前周转物状态为「未归还」，请留意')}
          </span>
          <span className='gm-margin-10'>
            <span>{t('2.请确定')}</span>
            <StyledRed>{t('退还金额填写正确')}</StyledRed>
            <span>{t('，确定后系统将所填写的金额原路退换给商户')}</span>
          </span>
        </Flex>
      )}
      {isAlreadyReturn && (
        <span className='gm-margin-10'>
          <span>{t('请确定')}</span>
          <StyledRed>{t('退还金额填写正确')}</StyledRed>
          <span>{t('，确定后系统将所填写的金额原路退换给商户')}</span>
        </span>
      )}
      <div style={{ alignSelf: 'flex-end' }}>
        <Button type='default' onClick={() => Modal.hide()}>
          {t('取消')}
        </Button>
        <Button
          type='primary'
          className='gm-margin-left-10'
          onClick={handleSave}
        >
          {t('确认')}
        </Button>
      </div>
    </Flex>
  )
})

AuditModal.propTypes = {
  data: PropTypes.object.isRequired,
}

const Deposit = observer(() => {
  const refPagination = useRef(null)

  useEffect(() => {
    store.setFirstRequest(refPagination.current.apiDoFirstRequest)
    refPagination.current.apiDoFirstRequest()
  }, [])

  const columns = [
    {
      Header: t('申请单号'),
      accessor: 'id',
    },
    {
      Header: t('申请时间'),
      accessor: 'create_time',
      Cell: (cell) => {
        const {
          original: { create_time },
        } = cell.row
        return moment(create_time).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      Header: t('商户名称'),
      accessor: 'sname',
      Cell: (cellProps) => {
        const { sname } = cellProps.row.original
        return !sname ? t('-') : sname
      },
    },
    {
      Header: t('归还周转物'),
      accessor: 'tname',
    },
    {
      Header: t('单个货值'),
      accessor: 'price',
      Cell: (cell) => {
        const {
          row: {
            original: { price },
          },
        } = cell
        return fixedNumber(price) + Price.getUnit()
      },
    },
    {
      Header: t('申请归还数量'),
      accessor: 'apply_amount',
    },
    {
      Header: t('申请退押金额'),
      accessor: 'apply_refund',
      Cell: (cell) => {
        const {
          row: {
            original: { apply_refund },
          },
        } = cell
        return fixedNumber(apply_refund) + Price.getUnit()
      },
    },
    {
      Header: t('归还状态'),
      accessor: 'return_status',
      Cell: (cell) => {
        const {
          row: {
            original: { return_status },
          },
        } = cell
        return _.find(RETURN_STATUS_DATA, { value: return_status })?.text
      },
    },
    {
      Header: t('归还人'),
      accessor: 'operator',
      Cell: (cellProps) => {
        const { operator } = cellProps.row.original
        return !operator ? t('无') : operator
      },
    },
    {
      Header: t('实际退还数量'),
      accessor: 'amount',
    },
    {
      Header: t('实际退还金额'),
      accessor: 'refund',
      Cell: (cell) => {
        return (
          <Observer>
            {() => {
              const {
                original: { refund, status },
                index,
              } = cell.row

              return (
                <Flex alignCenter>
                  {status === 2 ? (
                    refund
                  ) : (
                    <InputNumberV2
                      value={refund}
                      min={0}
                      onChange={(value) => {
                        store.changeListItem(index, 'refund', value)
                      }}
                    />
                  )}
                  {Price.getUnit()}
                </Flex>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('审核状态'),
      accessor: 'status',
      Cell: (cell) => {
        const {
          original: { status },
        } = cell.row
        return _.find(STATUS_DATA, { value: status })?.text
      },
    },
    {
      Header: TableXUtil.OperationHeader,
      accessor: 'operate',
      Cell: (cellProps) => {
        return (
          <TableXUtil.OperationCell>
            {cellProps.row.original.status === 2 ? null : (
              <Popover
                popup={
                  <StyledTip className='gm-padding-5'>
                    {t('审核通过')}
                  </StyledTip>
                }
                type='hover'
                arrowLeft='90'
              >
                <span
                  onClick={handleAudit.bind(this, cellProps.row.original)}
                  className='gm-text-14 gm-cursor'
                >
                  <SvgRefundReview />
                </span>
              </Popover>
            )}
          </TableXUtil.OperationCell>
        )
      },
    },
  ]

  const handleAudit = (data) => {
    Modal.render({
      children: <AuditModal data={data} />,
      onHide: Modal.hide,
      style: {
        width: '300px',
      },
      title: t('退还押金审核'),
    })
  }

  const handleChangPage = (page) => {
    return store.fetchList(page)
  }

  return (
    <>
      <Filter />
      <ManagePaginationV2
        id='deposit_review_list'
        ref={refPagination}
        onRequest={handleChangPage}
      >
        <EditTable data={store.list.slice()} columns={columns} />
      </ManagePaginationV2>
    </>
  )
})

export default Deposit
