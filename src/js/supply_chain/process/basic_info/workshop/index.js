import React, { Component, createRef } from 'react'
import {
  Button,
  Form,
  FormButton,
  FormItem,
  Input,
  Tip,
  Box,
  BoxTable,
} from '@gmfe/react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { store } from './store'
import { store as basicStore } from '../store'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import AssociatedProcessCell from './associated_process_cell'

const {
  OperationDelete,
  OperationCell,
  OperationHeader,
  OperationDetail,
} = TableXUtil

@withRouter
@observer
class Workshop extends Component {
  pagination = createRef()
  columns = [
    { Header: t('车间编号'), accessor: 'custom_id' },
    { Header: t('车间名称'), accessor: 'name' },
    {
      Header: t('关联工艺'),
      accessor: 'technics',
      Cell: ({ row: { index } }) => {
        return <AssociatedProcessCell index={index} onOk={this.handleSubmit} />
      },
    },
    {
      Header: <OperationHeader />,
      accessor: 'edit',
      Cell: ({ row: { original } }) => {
        const { workshop_id } = original
        return (
          <OperationCell>
            <OperationDetail
              href={`#/supply_chain/process/basic_info/workshop/edit?workshop_id=${workshop_id}`}
            />
            <OperationDelete
              title={t('确认删除')}
              onClick={() => this.handleDelete(workshop_id)}
            >
              <p>
                {t('删除后不影响已生成数据，仅影响后续生成的数据')}
                <style jsx>{`
                  p {
                    color: red;
                  }
                `}</style>
              </p>
            </OperationDelete>
          </OperationCell>
        )
      },
    },
  ]

  async componentDidMount() {
    await basicStore.fetchProcessList()
    this.handleSubmit()
  }

  handleSubmit = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handlePageChange = (pagination) => {
    return store.fetchWorkShopList(pagination)
  }

  handleCreateWorkshop = () => {
    this.props.history.push('/supply_chain/process/basic_info/workshop/edit')
  }

  handleDelete = async (id) => {
    await store.deleteWorkShop(id)
    Tip.success(t('删除成功'))
    return this.handleSubmit()
  }

  render() {
    const { q, workShopList } = store
    return (
      <>
        <Box hasGap>
          <Form inline onSubmit={this.handleSubmit} disabledCol>
            <FormItem label={t('搜索')}>
              <Input
                style={{ width: '250px' }}
                value={q}
                maxLength={8}
                onChange={({ target: { value } }) => store.setQ(value)}
                className='form-control'
                placeholder={t('输入车间名或车间编号')}
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
          action={
            <Button type='primary' onClick={this.handleCreateWorkshop}>
              {t('新建车间')}
            </Button>
          }
        >
          <ManagePaginationV2
            onRequest={this.handlePageChange}
            ref={this.pagination}
            id='workshop'
          >
            <TableX
              data={workShopList.slice()}
              columns={this.columns}
              className='gm-margin-bottom-10'
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

Workshop.propTypes = {
  history: PropTypes.object,
}

export default Workshop
