import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Tip, Button } from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import CategoriesList from './categories_list'
import { history, System } from 'common/service'
import {
  flattenAndUniq,
  findChtreeAll,
  getChildIdList_1,
  getChildIdList_2,
  getChildIdList_3,
  isAllInSelectedList,
} from './util'
import _ from 'lodash'
import store from '../batch/store'

@observer
class Component extends React.Component {
  constructor() {
    super()
    this.state = {
      active_id_list: [],

      category_2_list: [],
      category_3_list: [],
      category_4_list: [],

      selected_id_1_list: [],
      selected_id_2_list: [],
      selected_id_3_list: [],
      selected_id_4_list: [],
    }
  }

  componentDidMount() {
    const { salemenuId } = this.props.location.query
    if (!salemenuId) {
      Tip.warning(i18next.t('缺少参数salemenuId!'))
      history.go(-1)
    }
    store.setLoading()
    store.getTree()
    store.setSpuIdList()
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const {
      categories: { spuIdList },
    } = store
    if (!spuIdList.length) {
      Tip.warning(i18next.t('请至少选择一个商品！'))
      return false
    }
    if (spuIdList.length > 1500) {
      Tip.warning(i18next.t('单次批量创建商品数量不能超过1500个！'))
      return false
    }
    const {
      salemenuId,
      salemenuName,
      salemenuType,
      feeType,
      guide_type,
    } = this.props.location.query

    history.push({
      pathname: System.isC()
        ? '/c_retail/basic_info/list/batch_sales'
        : '/merchandise/manage/sale/batch_sales',
      query: {
        salemenuId,
        spuIdList: JSON.stringify(spuIdList),
        name: salemenuName,
        salemenuType,
        feeType,
        guide_type,
      },
    })
  }

  // 1 级，currentNum 为 1
  handleCategoryTextClick = (currentNum = 1, data) => {
    const { active_id_list } = this.state
    if (_.includes(active_id_list, data.id)) {
      return true
    }
    const update_active_id_list = active_id_list.slice(0, currentNum)
    update_active_id_list[currentNum - 1] = data.id
    if (currentNum === 1) {
      this.setState({
        active_id_list: update_active_id_list,
        category_2_list: data.chtree,
        category_3_list: [],
        category_4_list: [],
      })
    } else if (currentNum === 2) {
      this.setState({
        active_id_list: update_active_id_list,
        category_3_list: data.chtree,
        category_4_list: [],
      })
    } else if (currentNum === 3) {
      this.setState({
        active_id_list: update_active_id_list,
        category_4_list: data.chtree,
      })
    }
  }

  handleCategoryItemChange = (currentNum, data, isSelected) => {
    const {
      selected_id_1_list,
      selected_id_2_list,
      selected_id_3_list,
      selected_id_4_list,
    } = this.state
    const {
      categories: { spuList },
    } = store
    const list = spuList.slice()

    let allChtree_1 = []
    let allChtree_2 = []
    let allChtree_3 = []
    let isAllSelected_1 = false
    let isAllSelected_2 = false
    let isAllSelected_3 = false
    if (isSelected) {
      if (currentNum === 1) {
        this.setState({
          selected_id_1_list: flattenAndUniq([...selected_id_1_list, data.id]),
          selected_id_2_list: flattenAndUniq([
            ...selected_id_2_list,
            getChildIdList_1(data).ret_2,
          ]),
          selected_id_3_list: flattenAndUniq([
            ...selected_id_3_list,
            getChildIdList_1(data).ret_3,
          ]),
          selected_id_4_list: flattenAndUniq([
            ...selected_id_4_list,
            getChildIdList_1(data).ret_4,
          ]),
        })
        store.setSpuIdList(
          flattenAndUniq([...selected_id_4_list, getChildIdList_1(data).ret_4]),
        )
      } else if (currentNum === 2) {
        allChtree_1 = findChtreeAll(list, data.upstream_id)
        isAllSelected_1 = isAllInSelectedList(
          allChtree_1,
          flattenAndUniq([...selected_id_2_list, data.id]),
        )
        this.setState({
          selected_id_1_list: isAllSelected_1
            ? flattenAndUniq([...selected_id_1_list, data.upstream_id])
            : selected_id_1_list,
          selected_id_2_list: flattenAndUniq([...selected_id_2_list, data.id]),
          selected_id_3_list: flattenAndUniq([
            ...selected_id_3_list,
            getChildIdList_2(data).ret_3,
          ]),
          selected_id_4_list: flattenAndUniq([
            ...selected_id_4_list,
            getChildIdList_2(data).ret_4,
          ]),
        })
        store.setSpuIdList(
          flattenAndUniq([...selected_id_4_list, getChildIdList_2(data).ret_4]),
        )
      } else if (currentNum === 3) {
        allChtree_1 = findChtreeAll(list, data.category_id_1)
        isAllSelected_1 = isAllInSelectedList(
          allChtree_1,
          flattenAndUniq([...selected_id_2_list, data.upstream_id]),
        )

        allChtree_2 = findChtreeAll(list, data.upstream_id)
        isAllSelected_2 = isAllInSelectedList(
          allChtree_2,
          flattenAndUniq([...selected_id_3_list, data.id]),
        )

        this.setState({
          selected_id_1_list:
            isAllSelected_2 && isAllSelected_1
              ? flattenAndUniq([...selected_id_1_list, data.category_id_1])
              : selected_id_1_list,
          selected_id_2_list: isAllSelected_2
            ? flattenAndUniq([...selected_id_2_list, data.upstream_id])
            : selected_id_2_list,
          selected_id_3_list: flattenAndUniq([...selected_id_3_list, data.id]),
          selected_id_4_list: flattenAndUniq([
            ...selected_id_4_list,
            getChildIdList_3(data),
          ]),
        })
        store.setSpuIdList(
          flattenAndUniq([...selected_id_4_list, getChildIdList_3(data)]),
        )
      } else if (currentNum === 4) {
        allChtree_1 = findChtreeAll(list, data.category_id_1)
        isAllSelected_1 = isAllInSelectedList(
          allChtree_1,
          flattenAndUniq([...selected_id_2_list, data.category_id_2]),
        )

        allChtree_2 = findChtreeAll(list, data.category_id_2)
        isAllSelected_2 = isAllInSelectedList(
          allChtree_2,
          flattenAndUniq([...selected_id_3_list, data.pinlei_id]),
        )

        allChtree_3 = findChtreeAll(list, data.pinlei_id)
        isAllSelected_3 = isAllInSelectedList(
          allChtree_3,
          flattenAndUniq([...selected_id_4_list, data.id]),
        )
        this.setState({
          selected_id_1_list:
            isAllSelected_3 && isAllSelected_2 && isAllSelected_1
              ? flattenAndUniq([...selected_id_1_list, data.category_id_1])
              : selected_id_1_list,
          selected_id_2_list:
            isAllSelected_3 && isAllSelected_2
              ? flattenAndUniq([...selected_id_2_list, data.category_id_2])
              : selected_id_2_list,
          selected_id_3_list: isAllSelected_3
            ? flattenAndUniq([...selected_id_3_list, data.pinlei_id])
            : selected_id_3_list,
          selected_id_4_list: flattenAndUniq([...selected_id_4_list, data.id]),
        })
        store.setSpuIdList(flattenAndUniq([...selected_id_4_list, data.id]))
      }
    } else {
      if (currentNum === 1) {
        this.setState({
          selected_id_1_list: _.without(selected_id_1_list, data.id),
          selected_id_2_list: _.difference(
            selected_id_2_list,
            getChildIdList_1(data).ret_2,
          ),
          selected_id_3_list: _.difference(
            selected_id_3_list,
            getChildIdList_1(data).ret_3,
          ),
          selected_id_4_list: _.difference(
            selected_id_4_list,
            getChildIdList_1(data).ret_4,
          ),
        })
        store.setSpuIdList(
          _.difference(selected_id_4_list, getChildIdList_1(data).ret_4),
        )
      } else if (currentNum === 2) {
        this.setState({
          selected_id_1_list: _.without(selected_id_1_list, data.upstream_id),
          selected_id_2_list: _.without(selected_id_2_list, data.id),
          selected_id_3_list: _.difference(
            selected_id_3_list,
            getChildIdList_2(data).ret_3,
          ),
          selected_id_4_list: _.difference(
            selected_id_4_list,
            getChildIdList_2(data).ret_4,
          ),
        })
        store.setSpuIdList(
          _.difference(selected_id_4_list, getChildIdList_2(data).ret_4),
        )
      } else if (currentNum === 3) {
        this.setState({
          selected_id_1_list: _.without(selected_id_1_list, data.category_id_1),
          selected_id_2_list: _.without(selected_id_2_list, data.upstream_id),
          selected_id_3_list: _.without(selected_id_3_list, data.id),
          selected_id_4_list: _.difference(
            selected_id_4_list,
            getChildIdList_3(data),
          ),
        })
        store.setSpuIdList(
          _.difference(selected_id_4_list, getChildIdList_3(data)),
        )
      } else if (currentNum === 4) {
        this.setState({
          selected_id_1_list: _.without(selected_id_1_list, data.category_id_1),
          selected_id_2_list: _.without(selected_id_2_list, data.category_id_2),
          selected_id_3_list: _.without(selected_id_3_list, data.pinlei_id),
          selected_id_4_list: _.without(selected_id_4_list, data.id),
        })
        store.setSpuIdList(_.without(selected_id_4_list, data.id))
      }
    }
  }

  render() {
    const {
      categories: { spuList, loading, spuIdList },
    } = store
    const { category_2_list, category_3_list, category_4_list } = this.state
    const { active_id_list } = this.state
    const {
      selected_id_1_list,
      selected_id_2_list,
      selected_id_3_list,
      selected_id_4_list,
    } = this.state

    return (
      <QuickPanel
        title={i18next.t('批量添加销售商品')}
        icon='bill'
        right={
          <div style={{ position: 'absolute', right: '20px', top: '15px' }}>
            <Button
              type='primary'
              plain
              className='gm-margin-right-5'
              onClick={this.handleSubmit}
            >
              {i18next.t('确认新建')} <i className='ifont ifont-pi-liang' />
            </Button>
          </div>
        }
      >
        <div
          className='gm-border gm-bg gm-padding-10'
          style={{
            position: 'fixed',
            bottom: '50px',
            right: '50px',
            zIndex: '1000',
          }}
        >
          <span>
            {i18next.t('已选商品数')}:{spuIdList.length}
          </span>
        </div>
        <div className='gm-padding-15 row'>
          <div className='col-md-3 gm-margin-bottom-10'>
            <CategoriesList
              index='1'
              title={i18next.t('一级分类')}
              placeHolder={i18next.t('输入一级分类名称')}
              list={spuList.slice()}
              selectedList={selected_id_1_list}
              activeIdList={active_id_list}
              onTextClick={this.handleCategoryTextClick.bind(this, 1)}
              onItemChange={this.handleCategoryItemChange.bind(this, 1)}
              loading={loading}
            />
          </div>
          <div className='col-md-3 gm-margin-bottom-10'>
            <CategoriesList
              index='2'
              title={i18next.t('二级分类')}
              placeHolder={i18next.t('输入二级分类名称')}
              list={category_2_list}
              selectedList={selected_id_2_list}
              activeIdList={active_id_list}
              onTextClick={this.handleCategoryTextClick.bind(this, 2)}
              onItemChange={this.handleCategoryItemChange.bind(this, 2)}
              loading={loading}
              showType
            />
          </div>
          <div className='col-md-3 gm-margin-bottom-10'>
            <CategoriesList
              index='3'
              title={i18next.t('品类')}
              placeHolder={i18next.t('输入品类名称')}
              list={category_3_list}
              selectedList={selected_id_3_list}
              activeIdList={active_id_list}
              onTextClick={this.handleCategoryTextClick.bind(this, 3)}
              onItemChange={this.handleCategoryItemChange.bind(this, 3)}
              loading={loading}
              showType
            />
          </div>
          <div className='col-md-3 gm-margin-bottom-10'>
            <CategoriesList
              index='4'
              title={i18next.t('商品(SPU)')}
              placeHolder={i18next.t('输入商品名')}
              list={category_4_list}
              selectedList={selected_id_4_list}
              onTextClick={() => false}
              onItemChange={this.handleCategoryItemChange.bind(this, 4)}
              loading={loading}
              showType
            />
          </div>
        </div>
      </QuickPanel>
    )
  }
}

export default Component
