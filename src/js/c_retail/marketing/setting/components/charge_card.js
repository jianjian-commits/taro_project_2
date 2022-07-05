import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { Flex, Price, InputNumberV2, Tip } from '@gmfe/react'
import { SvgEdit, SvgDelete, SvgSave } from 'gm-svg'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Big from 'big.js'
import _ from 'lodash'

import SVGDiscountBg from '../../../../../svg/member_card_discount_bg.svg'

const ChargeCard = (props) => {
  const { onChange, onDelete, index } = props
  const init_info = {
    card_type: props.card_type,
    card_day: props.card_day,
    current_price: props.current_price,
    origin_price: props.origin_price,
    average_price: 0,
    discount: 10,
  }
  const [info, setInfo] = useState(init_info)
  const [isEdit, setEdit] = useState(false)

  const handleSubmit = () => {
    if (!canSave()) {
      Tip.warning(t('请填写完整会员卡定价'))
      return null
    }
    if (info.card_day === 0) {
      Tip.warning(t('会员卡天数不能为零'))
      return null
    }
    onChange(info, index)
    setEdit(false)
  }

  const canSave = () => {
    const noEmpty = _.map(info, (item) => {
      // 价格大于等于0
      if (item === 0) {
        return true
      }
      return !!item
    })
    return _.every(noEmpty, Boolean)
  }

  const handleEdit = () => {
    setEdit(true)
  }

  const handleDelete = () => {
    onDelete(index)
  }

  const handleChangeText = (e) => {
    const value = e.target.value
    const name = e.target.name
    setInfo({ ...info, [name]: value })
  }

  const handleChangeNumber = (name, val) => {
    setInfo({ ...info, [name]: val })
  }

  const { card_type, card_day, current_price, origin_price } = info
  const average_price =
    card_day && current_price && card_day !== 0
      ? Big(current_price).div(card_day).toFixed(2)
      : 0
  const discount =
    origin_price && current_price && origin_price !== 0
      ? Big(current_price).div(origin_price).times(10).toFixed(1)
      : 10

  return (
    <Box>
      <Container column justifyBetween>
        <div>
          <Flex>
            <CardType>
              {isEdit ? (
                <TextInput
                  value={card_type}
                  onChange={handleChangeText}
                  name='card_type'
                  maxLength={8}
                />
              ) : (
                <span>{card_type}</span>
              )}
            </CardType>
            <CardDays>
              {isEdit && (
                <NumberInput
                  min={0}
                  value={card_day}
                  precision={0}
                  onChange={(v) => handleChangeNumber('card_day', v)}
                />
              )}
              <span>{isEdit ? t('天') : `${card_day}${t('天')}`}</span>
            </CardDays>
          </Flex>
          <div className='gm-text-desc'>
            {`${t('相当于')}${average_price}${Price.getUnit()}/${t('天')}`}
          </div>
        </div>
        <div>
          <DeleteMoney className='gm-text-desc'>
            {Price.getCurrency()}
            {isEdit ? (
              <NumberInput
                min={0}
                value={origin_price}
                precision={2}
                onChange={(v) => handleChangeNumber('origin_price', v)}
              />
            ) : (
              origin_price
            )}
          </DeleteMoney>
          <Money>
            <span>{Price.getCurrency()}</span>
            {isEdit ? (
              <NumberInput
                min={0}
                value={current_price}
                precision={2}
                onChange={(v) => handleChangeNumber('current_price', v)}
              />
            ) : (
              current_price
            )}
          </Money>
        </div>
        <BtnGroup>
          {isEdit ? (
            <SvgSave onClick={handleSubmit} />
          ) : (
            <SvgEdit onClick={handleEdit} />
          )}
          <SvgDelete onClick={handleDelete} />
        </BtnGroup>
      </Container>
      <TopLabelBox>
        <TopLabel />
        <TopLabelText>{`${discount}${t('折')}`}</TopLabelText>
      </TopLabelBox>
    </Box>
  )
}

ChargeCard.propTypes = {
  card_type: PropTypes.string,
  card_day: PropTypes.number,
  origin_price: PropTypes.number,
  current_price: PropTypes.number,
  index: PropTypes.number,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
}

ChargeCard.defaultProps = {
  onChange: () => null,
  onDelete: () => null,
}

const Container = styled(Flex)`
  position: relative;
  background-color: rgba(242, 242, 242);
  width: 180px;
  height: 180px;
  padding: 20px 10px;
  margin-right: 40px;
  margin-top: 20px;
  margin-bottom: 10px;
`

const Box = styled.div`
  position: relative;
`

const CardType = styled.div`
  font-size: 16px;
  width: 60%;
`

const CardDays = styled.div`
  text-align: right;
  font-size: 16px;
  width: 50%;
`

const DeleteMoney = styled.div`
  text-decoration: line-through;
  font-size: 14px;
  font-weight: 100;
`

const Money = styled.div`
  font-size: 30px;
  font-weight: bold;

  & span {
    font-size: 20px;
  }
`

const BtnGroup = styled.div`
  position: absolute;
  right: 0;
  top: 0;

  & * {
    margin: 2px;
    width: 20px;
    height: 20px;
    color: #56a3f2;
    cursor: pointer;
  }
`

const TextInput = styled.input`
  width: 60px;
  font-size: 14px;
  padding: 0px;
`

const NumberInput = styled(InputNumberV2)`
  width: 60px;
  font-size: 14px;
`

const TopLabelBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`

const TopLabel = styled(SVGDiscountBg)`
  top: 0;
  left: 0;
  color: #fff;
  width: 60px;
  height: 40px;
`

const TopLabelText = styled.span`
  position: absolute;
  color: #fff;
  top: 12px;
  left: 10px;
`

export default ChargeCard
