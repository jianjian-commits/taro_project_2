import React, { Component } from 'react'
import { Box, Flex, FormPanel } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import CargoLocationFilter from './components/cargo_filter'
import './style.less'
import { observer } from 'mobx-react'
import { store } from '../store'
import Summary from '../summary'
import SpuList from './components/spu_list'
import NegativeList from './components/negative_list'
import { searchByCargoLocation } from '../utils'
import globalStore from '../../../stores/global'

const permission = !globalStore.otherInfo.cleanFood

@observer
class SearchByCargo extends Component {
  async componentDidMount() {
    store.setCargoLocationName('')
    store.resetCargoLocationSearchOption()
    await store.getCargoLocationMenu(true) // 初次获取货位列表
    searchByCargoLocation(store.cargoLocationMenu[0])
  }

  componentWillUnmount() {
    store.setError(false) // 离开页面清空错误状态
  }

  render() {
    const {
      searchItem: { name },
      summary,
    } = store

    return (
      <Flex style={{ backgroundColor: '#F7F8FA' }}>
        <Flex
          flex={1}
          style={{ minWidth: '300px' }}
          className='b-full-tabs-content gm-margin-10'
        >
          <Box className='width-100-percent'>
            <FormPanel title={i18next.t('货位层级')}>
              <CargoLocationFilter />
            </FormPanel>
          </Box>
        </Flex>
        {permission && (
          <Flex flex={4} className='b-full-tabs-content gm-margin-tb-10'>
            <Flex column className='width-100-percent overflow-auto'>
              <Box className='gm-margin-bottom-10'>
                <FormPanel title={i18next.t('cargo_statistics', { name })}>
                  <Summary type='stock' data={summary} />
                </FormPanel>
              </Box>
              <Box className='gm-margin-bottom-10 gm-border-0'>
                <FormPanel
                  title={i18next.t('商品列表')}
                  className='gm-margin-bottom-10'
                >
                  <SpuList />
                </FormPanel>
              </Box>
              <Box className='gm-border-0'>
                <FormPanel title={i18next.t('负库存商品列表')}>
                  <NegativeList />
                </FormPanel>
              </Box>
            </Flex>
          </Flex>
        )}
      </Flex>
    )
  }
}

export default SearchByCargo
