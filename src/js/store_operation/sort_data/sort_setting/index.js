import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Box,
  Pagination,
  Tip,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  Flex,
  Button,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import SortSettingTable from './sort_setting_table.js'
import './reducer'
import './actions'
import actions from '../../../actions'
import globalStore from '../../../stores/global'
import { System } from '../../../common/service'
import qs from 'query-string'

class SortSetting extends React.Component {
  componentDidMount() {
    Promise.all([
      actions.sort_setting_select_spu_lib(1),
      actions.sort_setting_get_spu(1),
    ])
  }

  componentWillUnmount() {
    actions.sort_setting_empty_list()
  }

  handleSelectSpuLib = async (val) => {
    const spuLib = parseInt(val)
    await actions.sort_setting_change_loading(true)
    await actions.sort_setting_select_spu_lib(spuLib)
    await actions.sort_setting_get_spu(spuLib)
  }

  handleChangeEditing = (spuId, key, value) => {
    const canEdit = globalStore.hasPermission('edit_SpuDispatchSetting')
    if (!canEdit) {
      Tip.warning(i18next.t('你没有编辑分拣方式权限!'))
      return
    }
    actions.sort_setting_change_editing(spuId, key, value)
  }

  handleChangeSortType = (spuId, sortType) => {
    actions.sort_setting_change_sort_type(spuId, sortType)
  }

  handleChangeSearch = (e) => {
    const search = e.target.value
    actions.sort_setting_change_search(search)
  }

  handleSearchSpu = async () => {
    const { sortSetting } = this.props
    await actions.sort_setting_change_loading(true)
    await actions.sort_setting_get_spu(
      sortSetting.spuLibSelected,
      sortSetting.search,
    )
  }

  onHandlePage = async (pagination) => {
    const { sortSetting } = this.props
    const spuLib = sortSetting.spuLibSelected
    await actions.sort_setting_change_loading(true)
    const search = sortSetting.search !== '' ? sortSetting.search : null
    await actions.sort_setting_get_spu(spuLib, search, pagination)
  }

  handleExportSetting = () => {
    const { sortSetting } = this.props
    const typeMap = {
      1: '',
      2: 1,
      3: 0,
    }
    window.open(
      '/merchandise/spu/export?' +
        qs.stringify({
          p_type: typeMap[sortSetting.spuLibSelected],
          is_retail_interface: System.isC() ? 1 : null,
        }),
    )
  }

  render() {
    const { sortSetting } = this.props
    const watchPermission = globalStore.hasPermission('get_SpuDispatchSetting')
    if (!watchPermission) {
      return (
        <p className='bg-warning gm-padding-10'>
          {i18next.t('你没有查看分拣设置的权限!')}
        </p>
      )
    }

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearchSpu}>
            <FormItem label={i18next.t('商品库')}>
              <Select
                value={sortSetting.spuLibSelected}
                onChange={this.handleSelectSpuLib}
              >
                <Option value={1} key='1'>
                  {i18next.t('全部商品库')}
                </Option>
                <Option value={2} key='2'>
                  {i18next.t('本站商品库')}
                </Option>
                <Option value={3} key='3'>
                  {i18next.t('通用商品库')}
                </Option>
              </Select>
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                className='form-control'
                value={sortSetting.search}
                onChange={this.handleChangeSearch}
                placeholder={i18next.t('输入spuId或者spu名称')}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' onClick={this.handleSearchSpu}>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={this.handleExportSetting}>
                {i18next.t('导出')}
              </Button>
            </FormButton>
          </Form>
        </Box>
        <SortSettingTable
          loading={sortSetting.loading}
          list={sortSetting.spuList}
          onEditing={this.handleChangeEditing}
          onSave={this.handleChangeSortType}
        >
          {sortSetting.pagination.count ? (
            <Flex justifyEnd alignCenter className='gm-padding-20'>
              <Pagination
                data={sortSetting.pagination}
                toPage={this.onHandlePage}
              />
            </Flex>
          ) : null}
        </SortSettingTable>
      </div>
    )
  }
}

SortSetting.propTypes = {
  sortSetting: PropTypes.object,
}

export default SortSetting
