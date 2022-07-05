/**
 * @description 删除报价单
 */
import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../sale_card_store'
import { Button, Checkbox, Flex } from '@gmfe/react'
import PropTypes from 'prop-types'

@observer
class DeleteSaleMenuModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasRead: false,
    }
  }

  handleOk = () => {
    const { salemenu, onSuccess } = this.props
    return store.deleteSaleMenu(salemenu.id).then(() => {
      onSuccess()
    })
  }

  handleChange = (e) => {
    const hasRead = e.target.checked
    this.setState({ hasRead })
  }

  render() {
    const { onCancel, salemenu } = this.props
    const { hasRead } = this.state
    const {
      defaultSaleMenu: {
        default_salemenu_name,
        station_name,
        default_salemenu_id,
      },
    } = store
    const disabled = default_salemenu_id ? !hasRead : true

    return (
      <div>
        <div className='gm-margin-bottom-5'>
          {i18next.t(
            /* tpl:确定要删除报价单：${VAR1}(${VAR2})吗 */ 'delete_sale_menu_confirm_title',
            {
              VAR1: salemenu.name,
              VAR2: salemenu.id,
            },
          )}
        </div>
        <div className='gm-text-red gm-margin-bottom-5'>
          {i18next.t('1. 删除报价单且删除报价单中的所有商品')} <br />
          {i18next.t(
            '2. 删除后将解除绑定此报价单的商户，若商户仅绑定此报价单，商户将自动与',
          )}
          {default_salemenu_name}
          {i18next.t('（站点名称')}：{station_name}
          {i18next.t('）绑定，')}
          {i18next.t(
            '若无默认报价单，则无法删除此报价单，请到店铺运营中进行设置',
          )}
          <br />
          {i18next.t('3. 删除后报价单相关数据将无法恢复，请谨慎操作')} <br />
          {i18next.t('4.删除报价单后该报价单所属的周期定价规则也会被一并删除')}
          <br />
        </div>
        <Checkbox checked={hasRead} onChange={this.handleChange}>
          {i18next.t('我已阅读以上提示，确认要删除报价单')}
        </Checkbox>
        <Flex justifyEnd className='gm-margin-top-5'>
          <Button onClick={onCancel}>{i18next.t('取消')}</Button>
          <span className='gm-gap-5' />
          <Button
            htmlType='submit'
            type='primary'
            onClick={this.handleOk}
            disabled={disabled}
          >
            {i18next.t('确认')}
          </Button>
        </Flex>
      </div>
    )
  }
}

DeleteSaleMenuModal.propTypes = {
  salemenu: PropTypes.object,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
}

export default DeleteSaleMenuModal
