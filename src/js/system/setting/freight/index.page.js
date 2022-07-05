import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  RightSideModal,
  BoxTable,
  Dialog,
  ToolTip,
  Button,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import moment from 'moment'
import { observer } from 'mobx-react'
import store from './store'
import globalStore from '../../../stores/global'

import { history } from '../../../common/service'
import AddressSet from './address_set'
import TableTotalText from 'common/components/table_total_text'

@observer
class Freight extends React.Component {
  componentDidMount() {
    // 拉取模板列表 / 商户列表 -- toc拉取C商户列表，tob拉取b+c商户列表
    store.getFreightTemplateList()
    store.getFreightMerchantList()
    store.getCMerchantList()
  }

  handleCreateFreightTemplate = () => {
    store.clearTemplateData()
    store.changeViewType('create')
    history.push('/system/setting/freight/add_freight')
  }

  handleSetAddress = (template) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '570px' },
      children: <AddressSet template={template} />,
    })
  }

  handleToDetail = (id) => {
    store.changeViewType('edit')
    store.getMerchantListSelected(id)
    history.push({
      pathname: `/system/setting/freight/add_freight?id=${id}`,
    })
  }

  handleDel = (template) => {
    if (template.default) {
      Dialog.alert({
        children: i18next.t(
          '当前模板为默认模板，无法删除。请先在其他模板里设置一个默认模板，再来删除当前模板'
        ),
      }).then(() => {
        console.log('resolve')
      })
      return
    }
    store.delFreightTemplate({ freight_id: template.id })
    history.push('/system/setting/freight')
  }

  handleSetDefaultTemplate = (id) => {
    store.setDefaultTemplate({ freight_id: id })
  }

  render() {
    const { freightTemplateList, isLoading } = store
    // 权限：新建、查看、删除、编辑
    const canAddFreight = globalStore.hasPermission('add_freight')
    // const canViewFreight = globalStore.hasPermission('get_freight')
    const canDelFreight = globalStore.hasPermission('delete_freight')
    const canEditFreight = globalStore.hasPermission('edit_freight')
    const { isCStation } = globalStore.otherInfo

    const tableInfo = [
      {
        label: i18next.t('运费模板列表'),
        content: freightTemplateList.length,
      },
    ]

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText data={tableInfo} />
          </BoxTable.Info>
        }
        action={
          canAddFreight ? (
            <Button type='primary' onClick={this.handleCreateFreightTemplate}>
              {i18next.t('新建运费模板')}
            </Button>
          ) : (
            <span />
          )
        }
      >
        <Table
          data={freightTemplateList.slice()}
          loading={isLoading}
          columns={[
            {
              Header: i18next.t('创建时间'),
              id: 'create_time',
              width: 160,
              Cell: ({ original }) =>
                moment(original.create_time).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              Header: i18next.t('创建人'),
              accessor: 'creator_name',
            },
            {
              Header: i18next.t('模板名称'),
              accessor: 'name',
            },
            {
              Header: (
                <Flex alignCenter>
                  {i18next.t('默认模板')}
                  <ToolTip
                    popup={
                      <div className='gm-padding-5'>
                        {i18next.t(
                          '新注册商户所属的默认模板（当注册的商户所属的报价单已设置默认生效模板时，优先生效对应运费模板）'
                        )}
                      </div>
                    }
                  />
                </Flex>
              ),
              id: 'default',
              Cell: ({ original }) => {
                if (original.default) {
                  return i18next.t('默认')
                } else {
                  return (
                    <div className='b-freight-template-list'>
                      {canEditFreight && (
                        <a
                          onClick={() =>
                            this.handleSetDefaultTemplate(original.id)
                          }
                          className='b-freight-template-list-hover-item'
                        >
                          {i18next.t('设为默认')}
                        </a>
                      )}
                    </div>
                  )
                }
              },
            },
            {
              Header: (
                <Flex alignCenter>
                  {i18next.t('默认生效报价单')}
                  <ToolTip
                    popup={
                      <p className='gm-padding-5'>
                        {i18next.t(
                          '设置默认生效报价单后，从对应报价单注册而来的商户，将优先默认关联当前运费模板（未设置的报价单，则关联默认模板）'
                        )}
                      </p>
                    }
                  />
                </Flex>
              ),
              id: 'set',
              show: !isCStation,
              Cell: ({ original }) => (
                <a onClick={() => this.handleSetAddress(original)}>
                  {i18next.t('点击设置')}
                </a>
              ),
            },
            {
              Header: i18next.t('最后编辑时间'),
              id: 'edit_time',
              width: 160,
              Cell: ({ original }) =>
                moment(original.edit_time).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              Header: i18next.t('最后编辑人'),
              accessor: 'edit_user_name',
            },
            {
              Header: TableUtil.OperationHeader,
              width: 80,
              Cell: (cellProps) => {
                return (
                  <TableUtil.OperationCell>
                    {canEditFreight && (
                      <TableUtil.OperationDetail
                        onClick={this.handleToDetail.bind(
                          this,
                          cellProps.original.id
                        )}
                      />
                    )}
                    {canDelFreight && (
                      <TableUtil.OperationDelete
                        title='确认删除'
                        onClick={this.handleDel.bind(this, cellProps.original)}
                      >
                        {i18next.t(
                          '删除后此模板的商户将分配到默认模板，确认删除'
                        )}
                        {cellProps.original.name}
                        {i18next.t('模板吗')}
                      </TableUtil.OperationDelete>
                    )}
                  </TableUtil.OperationCell>
                )
              },
            },
          ]}
        />
      </BoxTable>
    )
  }
}

export default Freight
