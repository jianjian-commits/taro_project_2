import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { FormGroup, FormPanel, Form, FormItem, Flex } from '@gmfe/react'
import { history } from '../../../../common/service'
import SalemenuSearchSelector from '../components/salemenu_search_selector'
import BatchSaleMenusSkuTable from './components/batch_salemenus_sku_table'

@inject('store')
@observer
class BatchAdd extends React.Component {
  constructor(props) {
    super(props)
    this.form = React.createRef()
  }

  render() {
    const {
      salemenus,
      setSalemenus,
      combineSaleMenusSkuTable,
      submit,
    } = this.props.store

    return (
      <FormGroup
        formRefs={[this.form]}
        onSubmit={submit}
        disabled={!salemenus.length}
        onCancel={() => {
          history.goBack()
        }}
      >
        <FormPanel title={t('批量添加可见报价单')}>
          <Form ref={this.form} colWidth='900px' labelWidth='200px'>
            <FormItem label={t('选择需要批量添加的可见报价单')}>
              <SalemenuSearchSelector
                selected={salemenus.slice()}
                onSelect={setSalemenus}
              />
            </FormItem>
            {_.map(combineSaleMenusSkuTable, (item, index) => (
              <FormItem label={t('规格信息')} key={index}>
                <div className='gm-text-desc gm-margin-bottom-10'>
                  {t('组合商品已可见的报价单无需再次添加和修改')}
                </div>
                <Flex
                  className='b-combine-goods-background gm-padding-10'
                  alignCenter
                >
                  <span className='b-combine-goods-name'>{item[0].id}</span>
                  <span>{item[0].name}</span>
                </Flex>
                <BatchSaleMenusSkuTable
                  salemenusSkuTable={item}
                  store={this.props.store}
                  index={index}
                />
              </FormItem>
            ))}
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

BatchAdd.propTypes = {
  store: PropTypes.object,
}

export default BatchAdd
