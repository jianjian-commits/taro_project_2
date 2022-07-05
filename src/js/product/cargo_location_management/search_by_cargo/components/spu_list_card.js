import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { createRightModal } from '../../utils'
import { i18next } from 'gm-i18n'
import ProductDetailsModal from './modals/product_details_modal'
import MoveStockModal from './modals/move_stock_modal'
import { store } from '../../store'
import { productDefaultImg } from '../../../../common/service'

export default function SpuListCard(props) {
  const { isMoving } = store
  const { data, canMove, negative } = props
  const {
    spu_id,
    spu_name,
    image,
    batch_count,
    stock_num,
    stock_money,
    toMoveNum,
  } = data

  const [url, changeUrl] = useState(image)

  return (
    <div
      className='gm-padding-20 gm-margin-bottom-20 spu-list-card'
      onClick={() =>
        createRightModal(
          i18next.t('商品信息'),
          <ProductDetailsModal spu={{ spu_id, spu_name, negative }} />
        )
      }
    >
      <Flex row alignCenter>
        <div className='spu-list-card-left gm-margin-right-20'>
          <img
            src={url}
            alt={spu_name}
            onError={() => changeUrl(productDefaultImg)}
          />
        </div>
        <div>
          <h4>{spu_name}</h4>
          <h4>{spu_id}</h4>
          <p>
            批次数量：<span>{batch_count}</span>
          </p>
          <p>
            库存数量：<span>{stock_num}</span>
          </p>
          <p>
            库存货值：
            <span>{stock_money}</span>
          </p>
        </div>
        {canMove && isMoving && (
          <p
            className='spu-list-card-icon'
            onClick={(event) => {
              event.stopPropagation()
              createRightModal(
                i18next.t('选择移库批次'),
                <MoveStockModal value={data} />
              )
            }}
          >
            {toMoveNum
              ? i18next.t('待移库数量') + `(${toMoveNum})`
              : i18next.t('移库')}
          </p>
        )}
      </Flex>
    </div>
  )
}

SpuListCard.propTypes = {
  data: PropTypes.shape({
    spu_id: PropTypes.string,
    spu_name: PropTypes.string,
    image: PropTypes.string,
    batch_count: PropTypes.number,
    stock_num: PropTypes.number,
    stock_money: PropTypes.string,
    toMoveNum: PropTypes.number,
  }).isRequired,
  canMove: PropTypes.bool,
  negative: PropTypes.bool,
}
