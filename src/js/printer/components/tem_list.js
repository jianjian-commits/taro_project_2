import { i18next } from 'gm-i18n'
import React from 'react'
import { ToolTip, Flex, Tip, BoxTable, Button } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { history } from 'common/service'
import qs from 'query-string'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import TableTotalText from 'common/components/table_total_text'
import moment from 'moment'

import globalStore from '../../stores/global'

const {
  OperationHeader,
  OperationDelete,
  OperationDetail,
  OperationCell,
  referOfWidth,
} = TableUtil

const RightBtn = (props) => {
  const { canCreate, editURL } = props
  return (
    <div>
      {canCreate && (
        <Button type='primary' onClick={() => history.push(editURL)}>
          {i18next.t('新建模板')}
        </Button>
      )}
    </div>
  )
}

RightBtn.propTypes = {
  canCreate: PropTypes.bool,
  editURL: PropTypes.string,
}

@observer
class TemList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
    }
    const {
      canEdit,
      handleCustomerSetting,
      setDefaultTemplate,
      editURL,
      canDelete,
      deleteConfirmText,
    } = this.props
    this.columns = [
      {
        Header: i18next.t('创建时间'),
        id: 'create_time',
        accessor: (d) => moment(d.create_time).format('YYYY-MM-DD HH:mm:ss'),
      },
      { Header: i18next.t('模板名称'), accessor: 'content.name' },
      {
        Header: i18next.t('打印规格'),
        id: 'content.page.type',
        Cell: ({ original }) => {
          const {
            type,
            size,
            customizeWidth,
            customizeHeight,
          } = original.content.page

          let text = type
          if (type === 'DIY' && size) {
            text = `${_.trimEnd(size.width, 'm')}X${_.trimEnd(
              size.height,
              'm',
            )}`
          } else if (type === '-1') {
            text = `${customizeWidth}X${customizeHeight}`
          }
          return text
        },
      },
      {
        Header: i18next.t('商户配置'),
        id: 'customer_setting',
        show: _.isFunction(handleCustomerSetting),
        accessor: (item) => (
          <a onClick={() => handleCustomerSetting(item)}>
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
        show: setDefaultTemplate,
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
              href={`#${editURL}?${qs.stringify({
                template_id: cellProps.original.id,
              })}`}
              open
            />
            {canDelete && !cellProps.original.is_default && (
              <OperationDelete
                title='警告'
                onClick={this.handleDel.bind(this, cellProps.original.id)}
              >
                {deleteConfirmText}
              </OperationDelete>
            )}
          </OperationCell>
        ),
      },
    ]
  }

  render() {
    const {
      title,
      canCreate,
      editURL,
      temListStore,
      BoxTableAction,
    } = this.props

    const list = temListStore.temList
    const { loading } = this.state

    const tableInfo = [{ label: title, content: list.length }]
    let allColumns = this.columns
    const { isCStation } = globalStore.otherInfo
    // C站点无需展示商户配置
    if (isCStation) {
      allColumns = _.filter(
        this.columns,
        (column) => column.id !== 'customer_setting',
      )
    }

    return (
      <div className='b-order-printer-list'>
        <BoxTable
          headerProps={{ style: { backgroundColor: '#fff' } }}
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={<BoxTableAction canCreate={canCreate} editURL={editURL} />}
        >
          <Table loading={loading} data={list.slice()} columns={allColumns} />
        </BoxTable>
      </div>
    )
  }

  async componentDidMount() {
    await this.props.temListStore.getTemList()
    this.setState({ loading: false })
  }

  handleSetDefault = async (index) => {
    const { temListStore } = this.props
    this.setState({ loading: true })
    try {
      await temListStore.setDefaultTem(index)
      await temListStore.getTemList()
      Tip.success(i18next.t('保存成功'))
      this.setState({ loading: false })
    } catch (e) {
      this.setState({ loading: false })
    }
  }

  handleDel = (id) => {
    const { temListStore } = this.props
    temListStore.deleteTem(id).then(() => {
      temListStore.getTemList()
      Tip.success(i18next.t('删除成功'))
    })
  }
}

TemList.propTypes = {
  title: PropTypes.string,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
  canCreate: PropTypes.bool,
  editURL: PropTypes.string.isRequired,
  setDefaultTemplate: PropTypes.bool,
  handleCustomerSetting: PropTypes.func,
  temListStore: PropTypes.object.isRequired,
  BoxTableAction: PropTypes.any,
  deleteConfirmText: PropTypes.string,
}

TemList.defaultProps = {
  setDefaultTemplate: true,
  BoxTableAction: RightBtn,
  deleteConfirmText: i18next.t(
    '删除后此模板的商户将分配到默认模板，确定删除吗？',
  ),
}

export default TemList
