import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Tip,
  Flex,
  RightSideModal,
  BoxTable,
  ToolTip,
  Button,
} from '@gmfe/react'
import { Link } from 'react-router-dom'
import TableTotalText from 'common/components/table_total_text'
import { Table, TableUtil } from '@gmfe/table'
import CustomerSettingModal from './components/customer_setting_modal'
import qs from 'query-string'
import actions from '../actions'
import './actions'
import './reducer'
import postPrinterVersion from '../common/components/post_printer_version_hoc'
import { getPrinterVersion } from '../common/print_log'
import { history } from '../common/service'
import { connect } from 'react-redux'
import globalStore from '../stores/global'
import PropTypes from 'prop-types'
const {
  OperationHeader,
  OperationDelete,
  OperationDetail,
  OperationCell,
  referOfWidth,
} = TableUtil

@postPrinterVersion('new')
class RightBtn extends React.Component {
  render() {
    const canCreate = globalStore.hasPermission('add_distribute_config')
    return (
      <div>
        <Link
          to='/system/setting/distribute_templete/order_printer'
          onClick={() => this.props.postPrinterVersion()}
          replace
        >
          {i18next.t('新版本')}
        </Link>
        <div className='gm-gap-10' />
        {canCreate && (
          <Button
            type='primary'
            onClick={() => {
              window.location.href = '#/system/setting/distribute_templete/add'
            }}
          >
            {i18next.t('新建模板')}
          </Button>
        )}
      </div>
    )
  }
}

RightBtn.propTypes = {
  postPrinterVersion: PropTypes.func,
}

@connect((state) => ({
  distribute_template: state.distribute_template,
}))
class OldTemList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
    }

    this.handleSetDefault = ::this.handleSetDefault
  }

  async componentDidMount() {
    const printerVersion = await getPrinterVersion()

    if (printerVersion === 2) {
      history.replace('/system/setting/distribute_templete/order_printer')
    } else {
      actions.template_config_list_fetch().then(() => {
        this.setState({ loading: false })
      })
    }
  }

  handleCustomerSetting = (template) => {
    const canEditDistributeConfig = globalStore.hasPermission(
      'edit_distribute_config',
    )

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '570px' },
      children: (
        <CustomerSettingModal
          canSave
          templateId={template.id}
          selectedIDs={template.address_ids}
          editPermission={canEditDistributeConfig}
          onSave={() => {
            actions.template_config_list_fetch()
          }}
        />
      ),
    })
  }

  handleSetDefault(index) {
    const { templateConfigList } = this.props.distribute_template

    this.setState({ loading: true })

    actions
      .template_config_update({
        ...templateConfigList[index],
        is_default: true,
      })
      .then(() => {
        actions.template_config_list_fetch().then(() => {
          this.setState({ loading: false })
          Tip.success(i18next.t('保存成功'))
        })
        RightSideModal.hide()
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  handleDel(id) {
    // 在模板绑定了商户的情况下，如果 is_force == 0，后台会返回code==1 “删除后此模板的商户将分配到默认模板，确定删除吗？”；
    // 如果 is_force == 1，后台会把此模板的商户将分配到默认模板
    actions.template_config_list_del(id, 1).then((json) => {
      if (json.code === 0) {
        actions.template_config_list_fetch()
        Tip.success(i18next.t('删除成功'))
      }
    })
  }

  render() {
    const { templateConfigList } = this.props.distribute_template
    const canEdit = globalStore.hasPermission('edit_distribute_config')
    const canDel = globalStore.hasPermission('delete_distribute_config')

    const tableInfo = [
      { label: i18next.t('配送单列表'), content: templateConfigList.length },
    ]

    return (
      <div className='b-order-printer-list'>
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={<RightBtn />}
        >
          <Table
            loading={this.state.loading}
            data={templateConfigList}
            columns={[
              { Header: i18next.t('创建时间'), accessor: 'create_time' },
              { Header: i18next.t('模板名称'), accessor: 'name' },
              { Header: i18next.t('打印规格'), accessor: 'print_size' },
              {
                Header: i18next.t('商户配置'),
                id: 'customer_setting',
                accessor: (item) => (
                  <a onClick={() => this.handleCustomerSetting(item)}>
                    {i18next.t('点击设置')}
                  </a>
                ),
              },
              {
                Header: (
                  <Flex alignCenter>
                    {i18next.t('默认模板')}
                    <ToolTip
                      popup={
                        <div className='gm-padding-5'>
                          {i18next.t('新注册商家所属的默认模板')}
                        </div>
                      }
                    />
                  </Flex>
                ),
                id: 'is_default',
                Cell: (cellProps) => {
                  const {
                    original: { is_default },
                    index,
                  } = cellProps

                  if (is_default) {
                    return i18next.t('默认')
                  }

                  return (
                    <div className='b-order-printer-hover-wrap'>
                      {canEdit && (
                        <a
                          onClick={this.handleSetDefault.bind(this, index)}
                          className='b-order-printer-hover-col'
                        >
                          {i18next.t('设为默认')}
                        </a>
                      )}
                    </div>
                  )
                },
              },
              { Header: i18next.t('创建人'), accessor: 'creator' },
              {
                Header: OperationHeader,
                width: referOfWidth.operationCell,
                Cell: (cellProps) => (
                  <OperationCell>
                    <OperationDetail
                      href={`#/system/setting/distribute_templete/detail?${qs.stringify(
                        {
                          template_id: cellProps.original.id,
                        },
                      )}`}
                      open
                    />
                    {canDel && !cellProps.original.is_default && (
                      <OperationDelete
                        title='警告'
                        onClick={this.handleDel.bind(
                          this,
                          cellProps.original.id,
                        )}
                      >
                        {i18next.t(
                          '删除后此模板的商户将分配到默认模板，确定删除吗？',
                        )}
                      </OperationDelete>
                    )}
                  </OperationCell>
                ),
              },
            ]}
          />
        </BoxTable>
      </div>
    )
  }
}

OldTemList.propTypes = {
  distribute_template: PropTypes.object,
}

export default OldTemList
