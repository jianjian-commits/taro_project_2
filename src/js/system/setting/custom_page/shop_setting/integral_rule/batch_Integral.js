import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { changExchangeRatio } from './util'
import {
  Button,
  Modal,
  Form,
  FormItem,
  Flex,
  InputNumber,
  FormButton,
  Tip,
} from '@gmfe/react'

const BatchIntegral = (props) => {
  const [point, setPoint] = useState('')
  const { checkSpu, onBatchRowChange } = props

  const handleSubmit = () => {
    const exchange_ratio = changExchangeRatio(point)
    const data = JSON.stringify(
      _.reduce(
        checkSpu,
        (result, v) =>
          _.concat(result, {
            spu_id: v,
            exchange_ratio,
          }),
        [],
      ),
    )
    Request('/station/point/reward_sku/exchange_ratio/update')
      .data({
        exchange_info: data,
      })
      .post()
      .then((json) => {
        Modal.hide()
        Tip.success(t('修改成功'))
        onBatchRowChange({
          id: checkSpu,
          key: 'exchange_ratio',
          value: exchange_ratio,
        })
      })
  }

  return (
    <Form onSubmitValidated={handleSubmit}>
      <FormItem label={t('积分比例')} colWidth='100%'>
        <InputNumber
          value={point}
          precision={0}
          min={0}
          max={999999}
          onChange={setPoint}
        />
      </FormItem>
      <FormButton>
        <Flex justifyEnd>
          <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
          <span className='gm-gap-5' />
          <Button type='primary' htmlType='submit'>
            {t('确认')}
          </Button>
        </Flex>
      </FormButton>
    </Form>
  )
}

BatchIntegral.propTypes = {
  checkSpu: PropTypes.array,
  onBatchRowChange: PropTypes.func,
}

export default BatchIntegral
