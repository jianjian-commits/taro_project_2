import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer, Observer } from 'mobx-react'
import moment from 'moment'
import { Button, DateRangePicker, Flex, Select, Tip } from '@gmfe/react'
import store from './store'
import { GET_STATUS, getSku } from '../util'
import ReceiptHeaderDetail from '../../../../common/components/receipt_header_detail'
import _ from 'lodash'
import { history } from '../../../../common/service'
import { PRICE_RULE_STATUS } from '../../../../common/enum'
import globalStore from '../../../../stores/global'
import { isEndOfDay } from '../../../../common/util'

@observer
class Header extends React.Component {
  handleChangeName = event => {
    store.changeDetail('name', event.target.value)
  }

  handleDateChange = (begin, end) => {
    store.changeDetail('begin', begin)
    store.changeDetail('end', end)
  }

  handleCancel = () => {
    if (store.viewType === 'create') {
      window.closeWindow()
    } else if (store.viewType === 'copy') {
      history.push('/c_retail/marketing/flash_sale')
    } else {
      store.changeViewType('view')
      store.getDetail(store.detail.flash_sale_id)
    }
  }

  handleSubmit = () => {
    const { begin, end, name, skus, status, flash_sale_id } = store.detail
    if (!begin || !end || !name) {
      Tip.warning('请填写完整')
      return
    }

    const obj = getSku(_.filter(skus, v => !!v.sku_id))
    if (obj.inValid) return

    const req = {
      begin: moment(isEndOfDay(begin)).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(isEndOfDay(end)).format('YYYY-MM-DD HH:mm:ss'),
      name,
      status,
      ...obj
    }
    if (store.viewType === 'create' || store.viewType === 'copy') {
      store.create(req).then((json) => {
        history.push(
          `/c_retail/marketing/flash_sale/detail?id=${json.data.flash_sale_id}`
        )
      })
    } else if (store.viewType === 'edit') {
      store.edit(flash_sale_id, req).then(() => {
        store.changeViewType('view')
        store.getDetail(flash_sale_id)
      })
    }
  }

  handleCopy = () => {
    store.changeViewType('copy')
  }

  handleChange = () => {
    store.changeViewType('edit')
    if (!store.detail.skus || !store.detail.skus.length) {
      store.addListItem()
    }
  }

  render() {
    const {
      detail: {
        flash_sale_id,
        name,
        status,
        modify_time,
        create_time,
        begin,
        end,
        modifier,
        creator
      },
      viewType
    } = store
    const isView = viewType === 'view'
    const isEdit = viewType === 'edit'
    const isNew = viewType === 'create' || viewType === 'copy'

    const restArr = PRICE_RULE_STATUS.slice(1)
    if (status === 2) {
      restArr.splice(1, 1)
    } else {
      restArr.shift()
    }
    // 如果是总站,无法看到关闭
    if (!globalStore.isCenterSaller()) {
      restArr.pop()
    }

    let statusDom
    if (isEdit) {
      const statusArr = PRICE_RULE_STATUS.slice(1)
      if (status === 2) {
        statusArr.splice(1, 1)
      } else {
        statusArr.shift()
      }
      // 如果是总站,无法看到关闭
      if (!globalStore.isCenterSaller()) {
        statusArr.pop()
      }

      statusDom = (
        <Select
          value={status}
          onChange={value => store.changeDetail('status', value)}
        >
          {_.map(restArr, status => {
            return (
              <option value={status.id} key={status.id}>
                {status.name}
              </option>
            )
          })}
        </Select>
      )
    } else if (isNew) {
      statusDom = t('未创建')
    } else {
      statusDom = GET_STATUS(status)
    }

    return (
      <ReceiptHeaderDetail
        style={{ width: '900px' }}
        contentCol={3}
        contentLabelWidth={90}
        HeaderAction={
          !isView ? (
            <Flex justifyEnd>
              <Button className='gm-margin-right-5' onClick={this.handleCancel}>
                {i18next.t('取消')}
              </Button>
              {globalStore.hasPermission('edit_flash_sale') && (
                <Button type='primary' onClick={this.handleSubmit}>
                  {i18next.t('保存')}
                </Button>
              )}
            </Flex>
          ) : (
            <Flex justifyEnd>
              {status !== 0 && (
                <Button
                  type='primary'
                  className='gm-margin-right-5'
                  onClick={this.handleChange}
                >
                  {i18next.t('修改')}
                </Button>
              )}
              <Button onClick={this.handleCopy}>{i18next.t('复制')}</Button>
            </Flex>
          )
        }
        HeaderInfo={[
          {
            label: t('抢购规则名称'),
            item: (
              <>
                {isView ? (
                  name || '-'
                ) : (
                  <input
                    className='form-control input-sm'
                    value={name}
                    onChange={this.handleChangeName}
                    placeholder={t('输入规则的名称')}
                  />
                )}
              </>
            )
          },
          {
            label: t('状态'),
            item: statusDom
          },
          {
            label: t('抢购规则编号'),
            item: <>{isNew ? '-' : flash_sale_id}</>
          }
        ]}
        ContentInfo={[
          {
            label: t('起止时间'),
            item: (
              <>
                {isView ? (
                  t('KEY126', {
                    VAR1: moment(begin).format('YYYY-MM-DD HH:mm:ss'),
                    VAR2: moment(end).format('YYYY-MM-DD HH:mm:ss')
                  }) /* src:`${moment(this.state.begin).format("YYYY-MM-DD HH:mm:ss")}至${moment(this.state.end).format("YYYY-MM-DD HH:mm:ss")}` => tpl:${VAR1}至${VAR2} */
                ) : (
                  <Observer>
                    {() => (
                      <DateRangePicker
                        min={new Date()}
                        style={{ width: '290px' }}
                        begin={begin}
                        end={end}
                        onChange={this.handleDateChange}
                        enabledTimeSelect
                      />
                    )}
                  </Observer>
                )}
              </>
            )
          },
          {
            label: t('创建人'),
            item: <>{creator || '-'}</>
          },
          {
            label: t('创建时间'),
            item: (
              <>
                {create_time ? moment(create_time).format('YYYY-MM-DD') : '-'}
              </>
            )
          },
          {
            label: t('最后修改人'),
            item: <> {modifier || '-'}</>
          },
          {
            label: t('最后修改时间'),
            item: (
              <>
                {modify_time ? moment(modify_time).format('YYYY-MM-DD') : '-'}
              </>
            )
          }
        ]}
        customeContentColWidth={[400, 300, 300]}
      />
    )
  }
}

export default Header
