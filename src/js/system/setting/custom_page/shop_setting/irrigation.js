import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'
import {
  Flex,
  Form,
  FormItem,
  FormButton,
  Button,
  Tip,
  Modal,
} from '@gmfe/react'
import _ from 'lodash'
import { isNumberCombination } from '../../../../common/util'
import { Request } from '@gm-common/request'
import { isCStationAndC } from '../../../../common/service'

const Irrigation = ({ data, onSave, onCancel }) => {
  const [list, setList] = useState(
    data.length === 0 ? [{ name: '', account: '' }] : data
  )

  const handleSubmit = () => {
    const error = _.find(list, (v) => {
      return (
        v.name === '' ||
        v.account.length !== 4 ||
        !isNumberCombination(v.account)
      )
    })

    if (error) {
      Tip.info(i18next.t('名称必填且不能为空,账号为4位数字'))
      return false
    }

    if (_.uniqBy(list, (v) => v.name).length !== list.length) {
      Tip.info(i18next.t('账号名称不能相同'))
      return false
    }

    let url = '/station/customized/update'
    if (isCStationAndC()) url = '/station/cshop/customized_info/update'

    Request(url)
      .data({
        account: JSON.stringify(list),
      })
      .post()
      .then(() => {
        Tip.success(i18next.t('保存成功'))

        onSave()
      })
  }

  const handleChange = (index, field, value) => {
    const newList = [...list]
    newList[index][field] = value
    setList(newList)
  }

  const handleAdd = (index) => {
    const newList = [...list]
    if (newList.length >= 10) {
      Tip.info(i18next.t('最多添加10个，已到达上限'))
    } else {
      newList.splice(index + 1, 0, { name: '', account: '' })
      setList(newList)
    }
  }

  const handleRemove = (index) => {
    const newList = [...list]
    newList.splice(index, 1)
    setList(newList)
  }

  return (
    <Flex justifyCenter column alignCenter>
      <div>
        {i18next.t(
          '到账渠道只供财务识别，账号输入后4位即可，如：建设银行，1234'
        )}
      </div>
      <div className='gm-gap-10' />
      <Form horizontal='true' onSubmit={handleSubmit}>
        {_.map(list, (v, i) => (
          <FormItem key={i} label={`到账渠道${i}`}>
            <Flex alignCenter>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入名称')}
                value={v.name}
                onChange={(e) => handleChange(i, 'name', e.target.value)}
              />
              <span className='gm-gap-15' />
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入账号')}
                value={v.account}
                onChange={(e) => handleChange(i, 'account', e.target.value)}
              />
              &nbsp;
              <i
                className='xfont xfont-plus gm-cursor'
                onClick={() => handleAdd(i)}
              />
              &nbsp;
              <i
                style={{ visibility: list.length > 1 ? 'visible' : 'hidden' }}
                className='xfont xfont-minus gm-cursor'
                onClick={() => handleRemove(i)}
              />
            </Flex>
          </FormItem>
        ))}
        <FormButton>
          <Button onClick={onCancel}>{i18next.t('取消')}</Button>
          &nbsp;
          <Button type='primary' htmlType='submit' disabled={list.length === 0}>
            {i18next.t('保存')}
          </Button>
        </FormButton>
      </Form>
    </Flex>
  )
}

Irrigation.render = (props) => {
  return Modal.render({
    title: i18next.t('到账渠道(最多添加10个)'),
    onHide: Modal.hide,
    children: (
      <Irrigation
        {...props}
        onSave={() => {
          Modal.hide()
          props.onSave()
        }}
        onCancel={() => {
          Modal.hide()
        }}
      />
    ),
  })
}

Irrigation.propTypes = {
  data: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default Irrigation
