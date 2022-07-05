import React from 'react'
import PropTypes from 'prop-types'
import { productDefaultImg as defaultImage } from 'common/service'
import { BoxPanel, Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import ShowForm from './show_form'

const ProductInformation = ({
  skuImage,
  skuId,
  skuName,
  saleSpecification,
  skuCategory,
  skuQuantity,
  outBaseQuantity,
  exceptionBaseQuantity,
  shallReturnQuantity,
  realReturnQuantity,
}) => {
  const columns1 = [
    { label: t('商品ID'), value: skuId },
    { label: t('商品名'), value: skuName },
    { label: t('销售规格'), value: saleSpecification },
    { label: t('分类'), value: skuCategory },
  ]

  const columns2 = [
    { label: t('下单数'), value: skuQuantity },
    { label: t('出库数'), value: outBaseQuantity },
    { label: t('异常数'), value: exceptionBaseQuantity },
    { label: t('应退数'), value: shallReturnQuantity },
    { label: t('实退数'), value: realReturnQuantity },
  ]

  return (
    <BoxPanel
      title={t('商品信息')}
      className='b-sku-report-search-panel'
      style={{ width: '48%' }}
    >
      <Flex alignStart className='b-sku-report-search-panel-content'>
        <img
          src={skuImage}
          alt=''
          style={{ width: '160px' }}
          className='gm-margin-right-20'
        />
        <Flex alignStart>
          <ShowForm data={columns1} />
          <ShowForm data={columns2} />
        </Flex>
      </Flex>
    </BoxPanel>
  )
}

ProductInformation.propTypes = {
  skuImage: PropTypes.string,
  skuId: PropTypes.string,
  skuName: PropTypes.string,
  saleSpecification: PropTypes.string,
  skuCategory: PropTypes.string,
  skuQuantity: PropTypes.string,
  outBaseQuantity: PropTypes.string,
  exceptionBaseQuantity: PropTypes.string,
  shallReturnQuantity: PropTypes.string,
  realReturnQuantity: PropTypes.string,
}

ProductInformation.defaultProps = {
  skuImage: defaultImage,
}

export default ProductInformation
