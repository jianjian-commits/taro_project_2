import React from 'react'
import { Box, Flex, FormPanel } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import ProductFilter from './components/product_filter'
import './style.less'
import Summary from '../summary'
import { store } from '../store'
import CargoLocationList from './components/cargo_location_list'
import { observer } from 'mobx-react'
import globalStore from '../../../stores/global'

const permission = !globalStore.otherInfo.cleanFood

const SearchByProduct = observer(() => {
  const { summary, productMenuCount } = store

  return (
    <Flex style={{ backgroundColor: '#F7F8FA' }}>
      <Flex
        flex={1}
        style={{ minWidth: '320px' }}
        className='b-full-tabs-content gm-margin-10'
      >
        <Box className='width-100-percent'>
          <FormPanel
            title={i18next.t('商品列表') + '(' + productMenuCount + ')'}
          >
            <ProductFilter />
          </FormPanel>
        </Box>
      </Flex>
      {permission && (
        <Flex flex={3} className='b-full-tabs-content gm-margin-tb-10'>
          <Flex column className='width-100-percent overflow-auto'>
            <Box className='gm-margin-bottom-10'>
              <FormPanel
                title={i18next.t('商品货位统计')}
                className='gm-margin-bottom-10'
              >
                <Summary data={summary} type='product' />
              </FormPanel>
            </Box>
            <Box className='gm-border-0'>
              <FormPanel title={i18next.t('货位列表')}>
                <CargoLocationList />
              </FormPanel>
            </Box>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
})

export default SearchByProduct
