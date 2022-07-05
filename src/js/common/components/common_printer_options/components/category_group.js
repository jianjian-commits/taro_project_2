import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { SvgDown, SvgUp } from 'gm-svg'
import {
  RadioGroup,
  Radio,
  Storage,
  Checkbox,
  CheckboxGroup,
} from '@gmfe/react'
import { Request } from '@gm-common/request'
import { observer } from 'mobx-react'
import printer_options_store from '../printer_options_store'
import CommonSwitchControl from './common_switch_control'

const getCategory1 = () => Request('/merchandise/category1/get').get()
const getCategory2 = () => Request('/merchandise/category2/get').get()

export default observer(function CategoryGroup() {
  const [categoryShow, setCategoryShow] = useState(false)
  const [category1List, setCategory1List] = useState([])
  const [category2List, setCategory2List] = useState([])
  // 打印范围 0-全部，1-部分
  const [printRange, setPrintRange] = useState(
    Storage.get('PRINT_CATEGORY_RANGE') || 0,
  )
  const {
    changeCategoryList,
    category1ListSelected,
    category2ListSelected,
    setSplitOrderWay,
    splitOrderTypeWay,
    isCategorySuffix,
    setCategorySuffix,
  } = printer_options_store

  useEffect(() => {
    getCategory1().then((category1Json) => {
      setCategory1List(category1Json.data)
      getCategory2().then((json) => {
        // 过滤出本站点二级分类id
        const category1ListIds = category1Json.data.map((item) => item.id)
        const stationCategory2List = json.data.filter((item) =>
          category1ListIds.includes(item.upstream_id),
        )
        setCategory2List(stationCategory2List)
      })
    })
  }, [])
  const handleChangeCategoryGroup = (type, value) => {
    changeCategoryList(type, value)
  }
  const handleToggleCategoryShow = () => {
    setCategoryShow(!categoryShow)
  }
  const handleSplitOrderWay = (value) => {
    setSplitOrderWay(value)
  }

  // 取消分类后缀名的props
  const commonSwitchControlProps = {
    commonSwitchControlTitle: t('分类单抬头展示分类后缀名'),
    commonSwitchControlTip: [
      t(`关闭：分类单抬头不展示分类名，只保留原始头 `),
      <br />,
      t(` 开启：分类单抬头后缀有分类名`),
    ],
    commonSwitchControlCheck: isCategorySuffix,
    commonSwitchControlHandle: setCategorySuffix,
  }

  return (
    <div style={{ paddingLeft: '19px' }}>
      <div>{t('选择拆分方式:')}</div>
      <RadioGroup
        name='setKidMergeTypeWay'
        value={splitOrderTypeWay}
        onChange={handleSplitOrderWay}
        className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
      >
        <Radio value={1} key='CategorySplitTypeOne'>
          {t('按一级分类拆分')}
        </Radio>
        <Radio value={2} key='CategorySplitTypeTwo'>
          {t('按二级分类拆分')}
        </Radio>
      </RadioGroup>
      <div>{t('选择打印范围:')}</div>
      <RadioGroup
        name='CategorySplitType'
        value={printRange}
        onChange={(val) => {
          if (typeof val !== 'number') {
            return
          }
          setPrintRange(val)
          Storage.set('PRINT_CATEGORY_RANGE', val)
        }}
        className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
      >
        <Radio value={0} key='CategorySplitTypeOne'>
          {t('打印全部分类')}
        </Radio>
        <Radio value={1} key='CategorySplitTypeTwo'>
          <span>
            {t('仅打印部分分类')}
            <a href='javascrpit:;' onClick={handleToggleCategoryShow}>
              {t('设置')}
              <span>{categoryShow ? <SvgUp /> : <SvgDown />}</span>
            </a>
          </span>
          <div className='gm-text-desc' style={{ paddingLeft: '19px' }}>
            {t('仅打印选取的分类，其余分类不会打印')}
          </div>
        </Radio>
        <CommonSwitchControl {...commonSwitchControlProps} />
        {categoryShow && (
          <div>
            {splitOrderTypeWay === 1 ? (
              <CheckboxGroup
                inline
                col={2}
                name='category1List'
                value={category1ListSelected}
                onChange={(value) => {
                  handleChangeCategoryGroup('category1', value)
                }}
              >
                {_.map(category1List, (item) => {
                  return <Checkbox value={item.id}>{item.name}</Checkbox>
                })}
              </CheckboxGroup>
            ) : (
              <CheckboxGroup
                inline
                col={2}
                name='category2List'
                value={category2ListSelected}
                onChange={(value) => {
                  handleChangeCategoryGroup('category2', value)
                }}
              >
                {_.map(category2List, (item) => {
                  return <Checkbox value={item.id}>{item.name}</Checkbox>
                })}
              </CheckboxGroup>
            )}
          </div>
        )}
      </RadioGroup>
    </div>
  )
})
