import React from 'react'
import { BoxPanel, Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import ShowForm from './show_form'
import PropTypes from 'prop-types'

const TestingInformation = ({ detectInstitution, detectImages }) => {
  return (
    <BoxPanel
      title={t('检测信息')}
      className='b-sku-report-search-panel'
      style={{ width: '98%' }}
    >
      <div className='b-sku-report-search-panel-content'>
        <ShowForm data={[{ label: t('检测机构'), value: detectInstitution }]} />
        <Images images={detectImages} />
      </div>
    </BoxPanel>
  )
}

TestingInformation.propTypes = {
  detectInstitution: PropTypes.string,
  detectImages: PropTypes.arrayOf(PropTypes.string),
}

TestingInformation.defaultProps = {
  detectImages: [],
}

export default TestingInformation

const Images = ({ images }) => {
  return (
    <Flex wrap className='gm-padding-tb-10 gm-padding-lr-20'>
      {images.map((image, index) => (
        <img
          src={image}
          key={index}
          alt=''
          className='gm-margin-right-10 gm-margin-bottom-10 b-testing-information-image'
        />
      ))}
    </Flex>
  )
}

Images.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
}

Images.defaultProps = {
  images: [],
}
