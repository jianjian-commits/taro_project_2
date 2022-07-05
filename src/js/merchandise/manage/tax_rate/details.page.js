import { i18next, t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Select, Tip, Flex, Button } from '@gmfe/react'
import { observer } from 'mobx-react'
import globalStore from 'stores/global'
import taxRateStore, { STATUS } from './store'
import { history } from 'common/service'
import _ from 'lodash'
import moment from 'moment'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { TAX_RATE_STATUS } from 'common/enum'
import Merchants from './components/merchants'
import Product from 'common/components/tax_rate/product'
import { checkData, getSearchOption } from './utils'
import { toJS } from 'mobx'

@observer
class TaxRateCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.handleName = ::this.handleName
    this.handleCancel = ::this.handleCancel
    this.handleSave = ::this.handleSave
    this.handleModify = ::this.handleModify
  }

  componentDidMount() {
    const { tax_id, viewType } = this.props.location.query
    if (tax_id) {
      taxRateStore.getTaxRateDetail(tax_id, viewType)
    } else {
      taxRateStore.create()
    }
    taxRateStore.clearPagination()
    taxRateStore.clearnSearchData('searchAddressData')
    taxRateStore.clearnSearchData('searchSpuData')
  }

  componentWillUnmount() {
    const { resetProduct } = taxRateStore
    resetProduct()
  }

  handleSelectStatus = (value) => {
    taxRateStore.selectStatus(value)
  }

  handleName(e) {
    taxRateStore.changeName(e.target.value)
  }

  handleCancel() {
    history.go(-1)
  }

  handleSave() {
    const {
      data: { ruleDetail },
      category,
      handleCreate,
      handleEdit,
    } = taxRateStore
    const { location } = this.props
    const tax_id = location.query?.tax_id

    const { name, addresses, new_status } = ruleDetail
    if (checkData(name, addresses, category)) {
      return
    }
    const option = getSearchOption(
      name,
      new_status,
      addresses.slice(),
      category.slice(),
      tax_id
    )
    if (tax_id) {
      handleEdit(option).then(() => {
        Tip.success(t('编辑成功'))
        this.handleCancel()
      })
    } else {
      handleCreate(option).then(({ data }) => {
        Tip.success(t('创建成功'))
        window.location.href = `#/merchandise/manage/tax_rate/details?tax_id=${data}&viewType=view`
      })
    }
  }

  handleModify() {
    taxRateStore.modify()
  }

  handleChange = (list) => {
    const { setCategory } = taxRateStore
    setCategory(list)
  }

  render() {
    const {
      ruleDetail: {
        name,
        new_status,
        viewType,
        create_user,
        create_time,
        modify_time,
        finally_operator,
        tax_id,
        spus,
      },
    } = taxRateStore.data
    const { category } = taxRateStore
    const editStatus = viewType === 'edit'
    const status = _.cloneDeep(STATUS).slice(1)

    return (
      <div>
        <ReceiptHeaderDetail
          HeaderInfo={[
            {
              label: t('税率规则名'),
              item: (
                <>
                  {editStatus ? (
                    <input
                      type='text'
                      className='form-control'
                      value={name}
                      placeholder={i18next.t('输入规则的名称')}
                      onChange={this.handleName}
                    />
                  ) : (
                    name
                  )}
                </>
              ),
            },
            {
              label: t('状态'),
              item: (
                <>
                  {editStatus ? (
                    <Select
                      className='gm-border-0'
                      style={{ minWidth: '80px' }}
                      value={new_status}
                      onChange={this.handleSelectStatus}
                      data={status.map((v) => ({ value: v.id, text: v.name }))}
                    />
                  ) : (
                    TAX_RATE_STATUS[new_status]
                  )}
                </>
              ),
            },
          ]}
          HeaderAction={
            <div>
              {editStatus ? (
                <div>
                  <Button
                    className='gm-margin-right-5'
                    onClick={this.handleCancel}
                  >
                    {i18next.t('取消')}
                  </Button>
                  <Button
                    htmlType='submit'
                    type='primary'
                    onClick={this.handleSave}
                  >
                    {i18next.t('保存')}
                  </Button>
                </div>
              ) : (
                <div>
                  {globalStore.hasPermission('edit_tax') ? (
                    <Button
                      type='primary'
                      className='gm-margin-right-5'
                      onClick={this.handleModify}
                    >
                      {i18next.t('修改')}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          }
          ContentInfo={[
            {
              label: t('创建人'),
              item: <div>{editStatus && !tax_id ? '-' : create_user}</div>,
            },
            {
              label: t('创建时间'),
              item: (
                <div>
                  {(editStatus && !tax_id) || !create_time
                    ? '-'
                    : moment(create_time).format('YYYY-MM-DD HH:mm')}
                </div>
              ),
            },
            {
              label: t('最后修改人'),
              item: <div>{editStatus && !tax_id ? '-' : finally_operator}</div>,
            },
            {
              label: t('最后修改时间'),
              item: (
                <div>
                  {(editStatus && !tax_id) || !modify_time
                    ? '-'
                    : moment(modify_time).format('YYYY-MM-DD HH:mm')}
                </div>
              ),
            },
          ]}
        />
        <Flex className='gm-margin-top-10'>
          <Merchants />
          <Product
            edit={editStatus}
            spu={spus.slice()}
            category={toJS(category)}
            onChange={this.handleChange}
          />
        </Flex>
      </div>
    )
  }
}

export default TaxRateCreate
