import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, RightSideModal, Button, Loading } from '@gmfe/react'
import GroupTransfer from '../../../common/components/group_transfer'
import store from './store'
import { renderAddressItem, searchAddress } from './util'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'
import { toJS } from 'mobx'

@observer
class AddressSet extends React.Component {
  handleSelectClick = (selectedValue, type) => {
    const { saleMenuLeft, saleMenuRight } = store
    let newLeft = []
    let newRight = []
    const move = []
    // left -> right
    if (type === 'left') {
      newLeft = saleMenuLeft.filter((v) => {
        if (selectedValue.includes(v.value)) {
          move.push(v)
          return false
        }
        return true
      })
      newRight = saleMenuRight.concat(move)
    } else {
      // right -> left
      newRight = saleMenuRight.filter((v) => {
        if (selectedValue.includes(v.value)) {
          move.push(v)
          return false
        }
        return true
      })
      newLeft = saleMenuLeft.concat(move)
    }
    store.changeSaleMenuGroup(newLeft, newRight)
  }

  handleSave = () => {
    const data = {
      freight_id: this.props.template.id,
      salemenu_ids: JSON.stringify(store.saleMenuRight.map((v) => v.value)),
    }
    store.handleChangeLoading(true)
    Request('/station/freight/sale_menu/update')
      .data(data)
      .post()
      .then(() => {
        store.getFreightTemplateList()
        RightSideModal.hide()
      })
      .finally(() => store.handleChangeLoading(false))
  }

  componentDidMount() {
    store.getSaleMenus(this.props.template.id)
  }

  render() {
    const { saleMenuRight, saleMenuLeft, getSaleMenuLoading } = store

    return (
      <div className='gm-padding-lr-15'>
        <div className='gm-text-14 gm-padding-tb-10'>
          {i18next.t('默认生效报价单')}
          {`(${this.props.template.name})`}
        </div>
        <Flex justifyBetween alignCenter>
          <span className='gm-text-12 gm-text-red'>
            {i18next.t('注:配置的报价单，新注册商户将默认关联当前运费模板')}
          </span>
          <Button type='primary' onClick={this.handleSave}>
            {i18next.t('确定')}
          </Button>
        </Flex>
        <hr />
        {getSaleMenuLoading ? (
          <Loading />
        ) : (
          <GroupTransfer
            leftTree={{
              leftPlaceholder: i18next.t('搜索报价单或模板名称'),
              leftTitle: i18next.t('全部报价单'),
              leftList: toJS(saleMenuLeft),
            }}
            rightTree={{
              rightPlaceholder: i18next.t('搜索报价单或模板名称'),
              rightTitle: i18next.t('已选报价单'),
              rightList: toJS(saleMenuRight),
            }}
            onToRightClick={(selected) =>
              this.handleSelectClick(selected, 'left')
            }
            onToLeftClick={(selected) =>
              this.handleSelectClick(selected, 'right')
            }
            onLeafItemRender={renderAddressItem}
            onSearch={searchAddress}
          />
        )}
      </div>
    )
  }
}

AddressSet.propTypes = {
  template: PropTypes.object,
}

export default AddressSet
