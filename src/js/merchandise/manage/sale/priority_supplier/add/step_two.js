import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import {
  FormPanel,
  Flex,
  Loading,
  Dialog,
  Tip,
  RightSideModal,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { filterGroupList } from '../../../../../common/util'
import { history } from '../../../../../common/service'
import Transfer from '../../../../../common/components/sku_transfer'
import BatchModify from '../components/batch_modify'
import TaskList from '../../../.../../../../task/task_list'

import store from './store'
import supplierStore from '../store'

@observer
class Component extends React.Component {
  componentDidMount() {
    const { salemenu_id } = this.props.location.query
    store.getSkuList(salemenu_id)
  }

  handleSelect = (selected) => {
    store.setSelectedSkus(selected)
  }

  getBatchParams = () => {
    const { selectedCustomers, selectedSkus } = store
    const {
      suppliers: { selected },
    } = supplierStore
    const skus = toJS(selectedSkus)
    return {
      all: 0,
      sku_ids: JSON.stringify(_.map(skus, (v) => v.id)),
      address_ids: JSON.stringify(selectedCustomers.slice()),
      supplier_id: selected.supplier_id,
    }
  }

  jumpToList = () => {
    const { salemenu_id, name } = this.props.location.query
    history.replace({
      pathname: '/merchandise/manage/sale/priority_supplier',
      search: `?salemenu_id=${salemenu_id}&name=${name}`,
    })
  }

  renderTaskList = (tab = 0) => {
    RightSideModal.render({
      children: <TaskList tabKey={tab} />,
      onHide: RightSideModal.hide,
      style: {
        width: '300px',
      },
    })
  }

  handleBack = () => {
    store.setStep(0)
  }

  handleBatchModify = () => {
    const selectedCustomers = store.selectedCustomers.slice()
    const selectedSkus = store.selectedSkus.slice()
    const { salemenu_id, name } = this.props.location.query
    if (!selectedCustomers.length || !selectedSkus.length) {
      Tip.info(i18next.t('请设置商户和商品'))
      return Promise.reject(new Error('请设置商户和商品'))
    }
    Dialog.confirm({
      children: (
        <BatchModify
          statistics={{
            address_num: selectedCustomers.length,
            sku_num: selectedSkus.length,
          }}
        />
      ),
      onOK: () => {
        const {
          suppliers: { selected },
        } = supplierStore
        if (!selected) {
          Tip.info(i18next.t('请选择供应商'))
          return Promise.reject(new Error('请选择供应商'))
        }
        supplierStore.setByBatch(this.getBatchParams()).then((json) => {
          if (json.data.async) {
            this.renderTaskList(1)
            this.jumpToList()
          } else {
            const { error_list } = json.data
            if (error_list.length) {
              history.push({
                pathname:
                  '/merchandise/manage/sale/priority_supplier/error_list',
                search: `?salemenu_id=${salemenu_id}&name=${name}`,
              })
            } else {
              Tip.success(i18next.t('批量修改成功'))
              this.jumpToList()
            }
          }
        })
      },
    })
  }

  render() {
    const { skuList, selectedSkus, skuListLoading } = store
    const { name } = this.props.location.query
    const list = toJS(skuList)
    const skus = toJS(selectedSkus)

    // 过滤掉的左边
    const arraySkusValues = _.map(skus, (v) => v.id || v.value)
    const skuFilterList = filterGroupList(list, (v) => {
      return !_.includes(arraySkusValues, v.id || v.value)
    })
    if (skuListLoading) return <Loading />
    return (
      <FormPanel title={`${i18next.t('设置商品')}(${name})`}>
        {skuListLoading ? (
          <Loading />
        ) : (
          <Flex column>
            <Flex justifyCenter>
              <Transfer
                listStyle={{ width: '300px', height: '450px' }}
                placeholder={i18next.t('输入商品名')}
                leftTitle={i18next.t('选择商品')}
                rightTitle={i18next.t('已选商品')}
                leftList={skuFilterList}
                rightList={skus}
                labelList={[]}
                onRightListChange={this.handleSelect}
                leftDisableSelectAll
                isCheckedLabel2={0}
                type={1}
              />
            </Flex>
            <div style={{ height: '60px' }} />
            <Flex justifyCenter>
              <Button onClick={this.handleBack}>{i18next.t('上一步')}</Button>
              <Button
                type='primary'
                className='gm-margin-left-10'
                onClick={this.handleBatchModify}
              >
                {i18next.t('设置优先供应商')}
              </Button>
            </Flex>
          </Flex>
        )}
      </FormPanel>
    )
  }
}

Component.propTypes = {
  location: PropTypes.object,
}

export default Component
