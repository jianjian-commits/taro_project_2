import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Form,
  FormItem,
  BoxTable,
  Flex,
  PaginationV2,
  Button,
} from '@gmfe/react'
import { TableUtil, Table } from '@gmfe/table'
import { convertNumber2Sid } from 'common/filter'
import actions from '../../../actions'
import './actions'
import './reducer'
import TableTotalText from 'common/components/table_total_text'

class ProductRemark extends React.Component {
  componentDidMount() {
    actions.spu_remark_customer_search('')
  }

  handleSearch = (e) => {
    e.preventDefault()

    actions.spu_remark_customer_search(this.search_keyword.value)
  }

  handlePageChange = (page) => {
    actions.spu_remark_customer_search(this.search_keyword.value, page)
  }

  handleGotoDetail = (original) => {
    window.open(
      `#/merchandise/manage/spu_remark/detail?id=${original.address_id}&resname=${original.resname}&address=${original.address}`
    )
  }

  render() {
    const { customers } = this.props.spu_remark

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入商户ID（SID）或名称')}
                style={{ minWidth: '210px' }}
                ref={(ref) => {
                  this.search_keyword = ref
                }}
              />
            </FormItem>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
          </Form>
        </Box>

        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('商品总数'),
                    content: customers.pagination.count,
                  },
                ]}
              />
            </BoxTable.Info>
          }
        >
          <Table
            data={customers.list}
            columns={[
              {
                Header: i18next.t('序号'),
                accessor: 'id',
                Cell: ({ index }) => index + 1,
              },
              {
                Header: i18next.t('商户ID'),
                id: 'address_id',
                accessor: (d) => convertNumber2Sid(d.address_id),
              },
              {
                Header: i18next.t('商户名'),
                accessor: 'resname',
              },
              {
                Header: i18next.t('地址'),
                accessor: 'address',
              },
              {
                Header: i18next.t('收货人'),
                accessor: 'receiver_name',
              },
              {
                Header: i18next.t('电话'),
                accessor: 'recevier_phone',
              },
              {
                Header: TableUtil.OperationHeader,
                Cell: ({ original }) => (
                  <TableUtil.OperationCell>
                    <TableUtil.OperationDetail
                      onClick={this.handleGotoDetail.bind(this, original)}
                    />
                  </TableUtil.OperationCell>
                ),
              },
            ]}
          />
        </BoxTable>
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <PaginationV2
            data={customers.pagination}
            onChange={this.handlePageChange}
          />
        </Flex>
      </div>
    )
  }
}

ProductRemark.propTypes = {
  spu_remark: PropTypes.object,
}

export default ProductRemark
