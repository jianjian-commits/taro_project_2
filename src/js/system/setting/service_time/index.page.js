import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Button, ToolTip } from '@gmfe/react'
import { TableUtil, Table } from '@gmfe/table'
import store from './store'
import globalStore from '../../../stores/global'
import { history } from '../../../common/service'
import TableTotalText from '../../../common/components/table_total_text'
import SVGQuestionCircleO from 'svg/question-circle-o.svg'
import InitServiceTime from '../../../guides/init/guide/init_service_time'

import PreDetail from './pre_detail/index.page'

@observer
class Index extends React.Component {
  componentDidMount() {
    store.getSmmList()
  }

  handleDelete = (id) => {
    store.deleteServiceTime(id).then(() => {
      store.getSmmList()
    })
  }

  render() {
    const list = store.list.slice()
    const canDelete = globalStore.hasPermission('delete_service_time')
    const { isCStation } = globalStore.otherInfo

    // 纯C站点只有一个运营时间, 直接展示详情
    if (isCStation) {
      return <PreDetail />
    }

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('运营时间设置'),
                  content: list.length,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={
          <div data-id='initServiceTime'>
            <ToolTip
              right
              popup={
                <div className='gm-padding-10' style={{ width: '200px' }}>
                  {t('适用于当天下单，第二天收货的业务模式')}
                </div>
              }
            >
              <Button
                type='primary'
                onClick={() =>
                  history.push('/system/setting/service_time/detail')
                }
              >
                {i18next.t('新建普通运营时间')} <SVGQuestionCircleO />
              </Button>
            </ToolTip>
            {globalStore.hasPermission('add_presale_service_time') ? (
              <ToolTip
                right
                popup={
                  <div className='gm-padding-10' style={{ width: '200px' }}>
                    {t(
                      '适用于当天下单，然后下计划订单的业务场景，并且可设置允许下单的天数和礼拜数。'
                    )}
                    <br />
                    {t(
                      '例如：学校客户，在周五的时候提前将周一的订单在商城下好，选择好收货时间为周一，则配送公司可以在周一进行配送。'
                    )}
                  </div>
                }
              >
                <Button
                  type='primary'
                  onClick={() =>
                    history.push('/system/setting/service_time/pre_detail')
                  }
                  className='gm-margin-left-10'
                >
                  {i18next.t('新建预售运营时间')} <SVGQuestionCircleO />
                </Button>
              </ToolTip>
            ) : null}
          </div>
        }
      >
        <Table
          data={list}
          columns={[
            { Header: '运营配置名称', accessor: 'name' },
            {
              Header: '描述',
              accessor: 'desc',
            },
            {
              Header: TableUtil.OperationHeader,
              width: 80,
              Cell: (cellProps) => {
                const {
                  id,
                  type,
                  can_be_modified,
                  service_type, // 运营时间类型，1-tob, 2-toc
                } = cellProps.original

                return (
                  <TableUtil.OperationCell>
                    <TableUtil.OperationDetail
                      href={`#/system/setting/service_time/${
                        type === 2 ? 'pre_detail' : 'detail'
                      }?id=${id}&modify=${can_be_modified}`}
                    />
                    {can_be_modified && canDelete && service_type !== 2 && (
                      <TableUtil.OperationDelete
                        title='警告'
                        onClick={this.handleDelete.bind(this, id)}
                      >
                        {i18next.t(
                          '确定删除此运营时间吗？请确保此运营时间下所有订单均已处理完成，避免删除后对订单、分拣产生影响，谨慎操作！'
                        )}
                      </TableUtil.OperationDelete>
                    )}
                  </TableUtil.OperationCell>
                )
              },
            },
          ]}
        />
        <div className='gm-gap-20' />
        <InitServiceTime ready />
      </BoxTable>
    )
  }
}

export default Index
