import React, { Component } from 'react'
import {
  Form,
  FormItem,
  FormButton,
  Input,
  Button,
  Box,
  BoxTable,
  Validator,
} from '@gmfe/react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import TableTotalText from 'common/components/table_total_text'

const orderStatusEnum = {
  1: t('等待分拣'),
  5: t('分拣中'),
  10: t('配送中'),
  15: t('已签收'),
}

const payStatusEnum = {
  0: t('全部状态'),
  1: t('未支付'),
  5: t('部分支付'),
  10: t('已支付'),
  15: t('超时关闭'),
}

const { Info } = BoxTable

const {
  OperationHeader,
  OperationCell,
  OperationDetail,
  TABLE_X: { WIDTH_OPERATION },
} = TableXUtil

class SkuReportSearch extends Component {
  columns = [
    {
      Header: t('序号'),
      accessor: 'index',
      Cell: ({ row: { index } }) => ++index,
    },
    {
      Header: t('商品图'),
      accessor: 'sku_image',
      Cell: ({
        row: {
          original: { sku_image },
        },
      }) => <img src={sku_image} alt='' style={{ width: '80px' }} />,
    },
    { Header: t('商品ID'), accessor: 'sku_id' },
    { Header: t('商品名'), accessor: 'sku_name' },
    {
      Header: t('销售规格'),
      accessor: 'sale_ratio',
      Cell: ({
        row: {
          original: { sale_ratio, std_unit_name, sale_unit_name },
        },
      }) => `${sale_ratio}${std_unit_name}/${sale_unit_name}`,
    },
    { Header: t('分类'), accessor: 'sku_category' },
    {
      Header: t('下单数'),
      accessor: 'sku_quantity',
      Cell: ({
        row: {
          original: { sku_quantity, sale_unit_name },
        },
      }) => `${sku_quantity}${sale_unit_name}`,
    },
    { Header: t('异常数'), accessor: 'exception_base_quantity' },
    { Header: t('应退数'), accessor: 'request_return_quantity' },
    { Header: t('实退数'), accessor: 'real_return_quantity' },
    { Header: t('订单号'), accessor: 'order_id' },
    {
      Header: t('订单状态'),
      accessor: 'order_status',
      Cell: ({
        row: {
          original: { order_status },
        },
      }) => orderStatusEnum[order_status] || '-',
    },
    {
      Header: t('支付状态'),
      accessor: 'pay_status',
      Cell: ({
        row: {
          original: { pay_status },
        },
      }) => payStatusEnum[pay_status] || '-',
    },
    {
      Header: <OperationHeader />,
      accessor: 'action',
      width: WIDTH_OPERATION,
      Cell: ({
        row: {
          original: { food_security_code },
        },
      }) => (
        <OperationCell>
          <OperationDetail
            href={`/#/supply_chain/food_security/sku_report_search/details?id=${food_security_code}`}
            open
          />
        </OperationCell>
      ),
    },
  ]

  state = {
    id: '',
    data: [],
  }

  handleChangeCode = (e) => {
    this.setState({ id: e })
  }

  handleSearch = () => {
    const { id } = this.state
    Request('/station/food_security/sku_detail/list')
      .data({ id })
      .get()
      .then(({ data }) => {
        this.setState({ data })
      })
  }

  render() {
    const { id, data } = this.state
    return (
      <>
        <Box hasGap>
          <Form inline onSubmitValidated={this.handleSearch}>
            <FormItem
              label={t('溯源码')}
              required
              validate={Validator.create(Validator.TYPE.required, id)}
            >
              <Input
                className='form-control'
                value={id}
                onChange={(event) => this.handleChangeCode(event.target.value)}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <BoxTable
          info={
            <Info>
              <TableTotalText
                data={[{ label: t('商品列表'), content: data.length }]}
              />
            </Info>
          }
        >
          <TableX data={data} columns={this.columns} />
        </BoxTable>
      </>
    )
  }
}

export default SkuReportSearch
