import React from 'react'
import { t } from 'gm-i18n'
import Permission from './permission'
import { observer } from 'mobx-react'
import store from '../store'
import _ from 'lodash'
export const writeConfig = [
  {
    name: t('下单'),
    content: [
      {
        text: t('业务平台'),
        disabled: true,
        value: 'write_station',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609832783899-468285390566215.png'
            />
          </div>
        ),
      },
      {
        text: t('商城端'),
        value: 'write_bshop',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609832783897-5782258515484957.png'
            />
          </div>
        ),
      },
      {
        text: t('云管家'),
        value: 'write_yunguanjia',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609832783894-4421685609474322.png'
            />
          </div>
        ),
      },
    ],
  },
]

const InputConfig = () => {
  function handleChange(keys = []) {
    const map = {
      write_station: 1,
      write_bshop: 0,
      write_yunguanjia: 0,
    }
    keys.forEach((v) => {
      map[v] = 1
    })
    _.each(map, (v, k) => {
      store.permissionUpdate(k, v)
    })
  }

  const {
    write_station,
    write_bshop,
    write_yunguanjia,
  } = store.detail.permission
  return (
    <Permission
      data={{ write_station, write_bshop, write_yunguanjia }}
      config={writeConfig}
      onChange={handleChange}
    />
  )
}

export default observer(InputConfig)
