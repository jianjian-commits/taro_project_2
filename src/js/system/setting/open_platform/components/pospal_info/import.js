import React, { useRef, useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import { asyncImportExcel } from 'common/util'
import { list2Map } from '../../util'
import pospalStore from './store'
import store from '../../store'
import { Tip, Button } from '@gmfe/react'

const ImportInfo = observer(({ index, className }) => {
  const refExcel = useRef(null)
  const app = store.platforms[index]

  useEffect(() => {
    if (app.appid === store.pospalId) {
      pospalStore.customerSearch(true)
    }
  }, [])

  const getData = async (file) => {
    const { doImport } = await asyncImportExcel()
    const sheets = await doImport(file)
    return sheets
  }

  const getIndex = (list, index) => {
    const item = list[index]
    let value = item
    if (item instanceof Object) {
      value = item.text
    }

    if (!value) {
      return Promise.reject(new Error(i18next.t('读取的Excel存在字段为空')))
    }
    return Promise.resolve(value.toString())
  }

  const getCustomer = (sid = '', map) => {
    const id = +sid.slice(1)
    if (!id) {
      return Promise.reject(
        new Error(i18next.t('读取的Excel存在字段SID不合法'))
      )
    }
    const customer = map[id]
    if (!customer) {
      return Promise.reject(new Error(i18next.t('不存在SID：') + sid))
    }

    return Promise.resolve({
      customer_id: customer.value,
      customer_name: customer.text,
    })
  }

  const getParams = async (list, map) => {
    const params = []
    for (const item of list) {
      const value = await getIndex(item, 1)
      params.push({
        name: await getIndex(item, 0),
        customer: await getCustomer(value, map),
        url: await getIndex(item, 2),
        app_id: await getIndex(item, 3),
        app_key: await getIndex(item, 4),
        supplier_id: await getIndex(item, 5),
      })
    }
    return params
  }

  const handleUpload = async () => {
    const { customerList } = pospalStore
    let sheets = []
    try {
      sheets = await getData(refExcel.current.files[0])
    } catch (error) {
      console.log(error.message)
      Tip.warning('解析excel失败，请修改后重试！')
      return Promise.reject(new Error(''))
    }
    refExcel.current.value = ''
    const data = _.values(sheets[0])[0]
    if (
      !_.isEqual(
        [
          '门店名',
          '商户SID',
          '接口地址前缀',
          'AppID',
          'AppKey',
          '门店供应商ID',
        ],
        data[0].slice(0, 6)
      )
    ) {
      Tip.warning(i18next.t('没有导入正确的表格文件，请确认表格正确'))
      return false
    }
    store.getAuthority(index).then(async () => {
      const map = list2Map(customerList)
      const action = _.find(
        app.settings,
        (item) => item.trigger === 'after_auth'
      )
      const { name, action: actionName, sync } = action
      let params = null
      try {
        params = await getParams(data.slice(1), map)
      } catch (error) {
        Tip.warning(error.message)
        return Promise.reject(new Error(''))
      }
      Tip.info('正在批量授权中...')
      store
        .updateApp(index, { [`${name}_${actionName}`]: params }, sync)
        .then(() => {
          Tip.info('授权成功')
          store.getPlatforms()
        })
    })
  }

  const handleClick = () => {
    refExcel && refExcel.current.click()
  }

  if (app.appid !== store.pospalId) {
    return null
  }

  return (
    <div className={classNames('gm-inline-block', className)}>
      <input
        accept='.xlsx'
        type='file'
        ref={refExcel}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <Button type='primary' onClick={handleClick}>
        {i18next.t('批量授权')}
      </Button>
    </div>
  )
})

ImportInfo.propTypes = {
  index: PropTypes.number,
}

export default ImportInfo
