import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import {
  FormBlock,
  FormItem,
  BoxForm,
  FormButton,
  Cascader,
  Button,
  RightSideModal,
} from '@gmfe/react'
import TaskList from '../../../../task/task_list'
import { Observer, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { dateFilterData, COMPONENT_TYPE_SELECT } from 'common/enum'
import _ from 'lodash'
import store from '../store/store_spu'
import PropTypes from 'prop-types'
import CategoryFilter from 'common/components/category_filter_hoc'
import LimitDateFilter from './date_filter'
import globalStore from 'stores/global'
import { Customize } from '../../../../common/components/customize'
import { parseCustomizeRadioList } from '../../../../common/util'

const More = BoxForm.More

@observer
class QueryFilter extends Component {
  formatQuery = () => {
    const {
      // 订单号、商户
      search_text,
      categoryFilter: { category1_ids, category2_ids, pinlei_ids },
      shelf_ids,
      detail_customized_field,
    } = store.searchQuery
    const { limit, offset } = store.pagination
    const data = {
      search_text,
      limit,
      offset,
      category1_ids: category1_ids.length
        ? JSON.stringify(category1_ids.map((c) => c.id))
        : null,
      category2_ids: category2_ids.length
        ? JSON.stringify(category2_ids.map((c) => c.id))
        : null,
      pinlei_ids: pinlei_ids.length
        ? JSON.stringify(pinlei_ids.map((c) => c.id))
        : null,
      shelf_id: shelf_ids.slice().pop() || null,
      detail_customized_field: _.keys(detail_customized_field).length
        ? JSON.stringify(detail_customized_field)
        : null,
    }
    return data
  }

  handleChange = (v, k) => {
    let format = v
    if (k === 'search_text') {
      format = v.trim()
    }
    store.changeSearchQuery({ [k]: format })
  }

  search = () => {
    store.resetPagination()
    this.props.getData()
  }

  handleCustomizeInfoChange(key, value) {
    const customizedField = {
      ...store.searchQuery.customized_field,
      [key]: value,
    }
    store.changeSearchQuery({ customized_field: customizedField })
  }

  handleCustomizeDetailChange(key, value) {
    const customizedField = {
      ...store.searchQuery.detail_customized_field,
      [key]: value,
    }
    store.changeSearchQuery({ detail_customized_field: customizedField })
  }

  handleExport = () => {
    const data = this.formatQuery()
    data.export = 1
    store.handleExport(data).then((json) => {
      console.log('json', json)
      // if (json.data.async === 1) {
      RightSideModal.render({
        children: <TaskList tabKey={0} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
      // }
    })
  }

  render() {
    const { searchQuery, service_times, reset, shelfs } = store
    const {
      search_text,
      dateType,
      begin,
      end,
      time_config_id,
      categoryFilter,
      shelf_ids,
      detail_customized_field,
    } = searchQuery
    const dateFilerDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...service_times],
    }

    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) =>
        v.permission.read_station_picking &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )

    return (
      <BoxForm
        btnPosition='left'
        labelWidth='100px'
        colWidth='360px'
        // eslint-disable-next-line
        onSubmit={this.search}
      >
        <FormBlock col={3}>
          <LimitDateFilter
            type='spu'
            data={dateFilerDataTotal}
            filter={{ dateType, begin, end, time_config_id }}
          />
          <FormItem label={i18next.t('搜索')}>
            <input
              value={search_text}
              onChange={(e) => this.handleChange(e.target.value, 'search_text')}
              placeholder={i18next.t('输入商品信息搜索')}
            />
          </FormItem>
        </FormBlock>

        <More>
          <FormBlock col={3}>
            <FormItem col={2} label={i18next.t('商品分类')}>
              <CategoryFilter
                selected={categoryFilter}
                onChange={(v) => this.handleChange(v, 'categoryFilter')}
              />
            </FormItem>
            <FormItem label={i18next.t('货位筛选')}>
              <Cascader
                filtrable
                data={toJS(shelfs)}
                onChange={(v) => this.handleChange(v, 'shelf_ids')}
                value={shelf_ids.slice()}
                inputProps={{ placeholder: i18next.t('全部货位') }}
              />
            </FormItem>
            {_.map(detailConfigs, (v) => {
              const radioList = parseCustomizeRadioList(v.radio_list)
              return (
                <FormItem label={v.field_name}>
                  <Observer>
                    {() => (
                      <Customize
                        type={v.field_type}
                        value={detail_customized_field[v.id]}
                        onChange={this.handleCustomizeDetailChange.bind(
                          this,
                          v.id,
                        )}
                        data={radioList}
                      />
                    )}
                  </Observer>
                </FormItem>
              )
            })}
          </FormBlock>
        </More>

        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>

          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={reset}>{i18next.t('重置')}</Button>
          </BoxForm.More>

          <div className='gm-gap-10' />
          <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

QueryFilter.propTypes = {
  getData: PropTypes.func.isRequired,
}

export default QueryFilter
