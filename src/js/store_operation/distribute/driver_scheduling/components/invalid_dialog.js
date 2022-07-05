import React from 'react'
import { i18next } from 'gm-i18n'
import { Dialog } from '@gmfe/react'
import { changeDomainName } from '../../../../common/service'
import { convertNumber2Sid } from '../../../../common/filter'

class InvalidCustomerList extends React.Component {
  handleClick = (address_id) => {
    const sid = convertNumber2Sid(address_id)
    window.open(
      changeDomainName('station', 'manage') +
        `/#/customer_manage/customer/manage/${sid}`
    )
  }

  render() {
    return (
      <div>
        <div>
          {i18next.t(
            '当前筛选条件下，找到以下商户无法获取地理位置，请点击前往重新设置地理位置：'
          )}
        </div>
        {this.props.list.map((item) => (
          <a
            href='javascript:'
            key={item.id}
            className='gm-block'
            onClick={this.handleClick.bind(this, item.address_id)}
          >
            {item.customer_name}
          </a>
        ))}
      </div>
    )
  }
}

export default function showDialog(list) {
  if (list.length) {
    // 提示去ma填写坐标,list为没有坐标的商户
    Dialog.alert({
      children: <InvalidCustomerList list={list} />,
      OKBtn: i18next.t('了解，关闭弹窗'),
    }).then(() => {})
  }
}
