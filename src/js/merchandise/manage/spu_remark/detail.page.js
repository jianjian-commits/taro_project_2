import { t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  PaginationV2,
  Tip,
  Box,
  BoxTable,
  Select,
  Form,
  FormItem,
  FormButton,
  Button,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import { Table, TableUtil } from '@gmfe/table'
import _ from 'lodash'
import actions from '../../../actions'
import { withBreadcrumbs } from 'common/service'
import './actions'
import './reducer'
import ViewPopoverRemark from 'common/components/view_popover_remark'

class ProductRemarkDetail extends React.Component {
  constructor() {
    super()
    this.state = {
      search_keyword_filter: 'all',
    }
  }

  componentDidMount() {
    const { spuTypes } = this.props.spu_remark
    actions.spu_remark_spu_search(
      this.props.location.query.id,
      spuTypes[0].id,
      '',
    )
  }

  handleSearch = (e) => {
    e.preventDefault()
    actions.spu_remark_spu_search(
      this.props.location.query.id,
      this.state.search_keyword_filter,
      this.search_keyword_name.value,
    )
  }

  handlePageChange = (page) => {
    actions.spu_remark_spu_search(
      this.props.location.query.id,
      this.state.search_keyword_filter,
      this.search_keyword_name.value,
      page,
    )
  }

  handleEdit = (index) => {
    actions.spu_remark_spu_editable(index)
  }

  handleRemarkChange(index, e) {
    actions.spu_remark_spu_remark_change(index, e.target.value)
  }

  handleEditSave(index) {
    const spu = this.props.spu_remark.spus.list[index]
    if (spu.spu_remark?.length > 100) {
      return Tip.warning(t('备注长度不要超过100'))
    }
    actions.spu_remark_spu_remark_update(index, this.props.location.query.id)
  }

  handleEditCancel(index) {
    actions.spu_remark_spu_remark_cancel(index)
  }

  render() {
    const { spus, spuTypes } = this.props.spu_remark
    const { resname, address } = this.props.location.query

    const SPUTYPES = _.map(spuTypes, (v, i) => ({ text: v.name, value: v.id }))
    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={t('商品备注状态')}>
              <Select
                ref={(ref) => {
                  this.search_keyword_filter = ref
                }}
                data={SPUTYPES}
                value={this.state.search_keyword_filter}
                onChange={(value) =>
                  this.setState({ search_keyword_filter: value })
                }
              />
            </FormItem>
            <FormItem label={t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={t('请输入商品名')}
                ref={(ref) => {
                  this.search_keyword_name = ref
                }}
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
            <BoxTable.Info>
              {t('商户名')}：
              <span className='text-primary gm-text-bold gm-text-14'>
                {resname}
              </span>
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
              {t('地址')}：
              <span className='text-primary gm-text-bold gm-text-14'>
                {address}
              </span>
            </BoxTable.Info>
          }
        >
          <Table
            data={spus.list.slice()}
            loading={spus.loading}
            columns={[
              { Header: t('SPUID'), accessor: 'spu_id' },
              { Header: t('商品名'), accessor: 'spu_name' },
              {
                Header: t('分类'),
                accessor: 'category_name_1',
                Cell: ({ index }) => {
                  const spu = spus.list[index]
                  return `${spu.category_name_1}/${spu.category_name_2}`
                },
              },
              { Header: t('基本单位'), accessor: 'std_unit_name' },
              {
                Header: t('备注信息'),
                accessor: 'spu_remark',
                Cell: ({ original, index }) => {
                  const spu = spus.list[index]
                  const value = spu.spu_remark
                  if (spu.edit) {
                    return (
                      <input
                        value={spu.spu_remark}
                        onChange={this.handleRemarkChange.bind(this, index)}
                        className='form-control input-sm'
                        placeholder={t('备注长度不要超过100')}
                        maxLength={100}
                      />
                    )
                  }

                  return <ViewPopoverRemark value={value} />
                },
              },
              {
                Header: t('最后修改时间'),
                accessor: 'update_time',
                Cell: ({ original }) => {
                  return original.update_time || '-'
                },
              },
              {
                Header: t('修改人'),
                accessor: 'update_user',
                Cell: ({ original }) => {
                  return original.update_user || '-'
                },
              },
              {
                Header: TableUtil.OperationHeader,
                width: 100,
                Cell: ({ original, index }) => {
                  const edit = original.edit
                  return (
                    <TableUtil.OperationCell>
                      <TableUtil.OperationRowEdit
                        isEditing={edit}
                        onClick={this.handleEdit.bind(this, index)}
                        onSave={this.handleEditSave.bind(this, index)}
                        onCancel={this.handleEditCancel.bind(this, index)}
                      />
                    </TableUtil.OperationCell>
                  )
                },
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <PaginationV2
              data={spus.pagination}
              onChange={this.handlePageChange}
            />
          </Flex>
        </BoxTable>
      </div>
    )
  }
}

ProductRemarkDetail.propTypes = {
  spu_remark: PropTypes.object,
}

export default withBreadcrumbs([t('商品详情')])(ProductRemarkDetail)
