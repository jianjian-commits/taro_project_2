import React, { useEffect, useState, useCallback } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { GroupSortable } from '@gmfe/sortable'
import { fetchCategoryData, saveCategoryConfig } from './api'
import SvgGap from 'svg/gap.svg'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Label from 'common/components/label'
import {
  Popover,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
} from '@gmfe/react'
import printerOptionsStore from '../common_printer_options/printer_options_store'
import { observer } from 'mobx-react'
import { Storage } from '@gmfe/react'

const Wrap = React.forwardRef(({ className, ...rest }, ref) => (
  <div
    {...rest}
    ref={ref}
    className={classNames(
      'gm-border gm-padding-10 gm-flex gm-flex-wrap',
      className,
    )}
  />
))

Wrap.propTypes = {
  className: PropTypes.string,
}

const Item = styled.div`
  position: relative;
  width: 90px;
  margin: 5px 8px;
  padding: 5px;
  white-space: nowrap;

  .item-text {
    overflow: hidden;
  }

  .active-gap {
    position: absolute;
    left: -17px;
    top: 4px;
    font-size: 16px;
    z-index: 999;
  }
`

Index.propTypes = {
  addressId: PropTypes.string,
}

function Index({ addressId }) {
  const [groupData, setGroupData] = useState([])
  const [grouplist, setGrouplist] = useState([])
  const [dataId, setDataId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const { diyCategoryToggle, setDiyCategoryToggle } = printerOptionsStore

  const handleChange = useCallback(
    (newData, i) => {
      Storage.remove('Category1_groupData')
      Storage.remove('Category2_groupData')
      Storage.remove('Category1_index')
      Storage.remove('Category2_index')
      const data = newData.filter((arr) => arr.length)
      setGroupData(data)
      setGrouplist(_.range(data.length))
      saveCategoryConfig({ data, id: dataId, diyCategoryToggle })
    },
    [dataId, diyCategoryToggle],
  )

  useEffect(() => {
    fetchCategoryData({ addressId }).then(({ categoryGroupData, id }) => {
      setActiveId(categoryGroupData?.[0]?.[0]?.value)
      setGroupData(categoryGroupData)
      setGrouplist(_.range(categoryGroupData.length))
      setDataId(id)
    })
  }, [addressId, diyCategoryToggle])

  useEffect(() => {
    if (diyCategoryToggle === 1 && Storage.get('Category1_index')) {
      setGrouplist(Object.values(Storage.get('Category1_index'))[0])
    }
    if (diyCategoryToggle === 2 && Storage.get('Category2_index')) {
      setGrouplist(Object.values(Storage.get('Category2_index'))[0])
    }
    const handleSplitItems = (e) => {
      if (e.key === 'Enter') {
        Storage.remove('Category1_groupData')
        Storage.remove('Category2_groupData')
        Storage.remove('Category1_index')
        Storage.remove('Category2_index')
        const newData = []
        _.each(groupData, (group) => {
          const index = group.findIndex((item) => item.value === activeId)
          if (index !== -1) {
            newData.push(group.slice(0, index), group.slice(index)) // 分组一分为二
          } else {
            newData.push(group)
          }
        })
        setActiveId(null)
        setGroupData(newData)
        setGrouplist(_.range(newData.length))
        saveCategoryConfig({ data: newData, id: dataId, diyCategoryToggle })
      }
    }

    document.body.addEventListener('keydown', handleSplitItems)
    return () => document.body.removeEventListener('keydown', handleSplitItems)
  }, [groupData, activeId, dataId, diyCategoryToggle])

  const handleDiyCategoryToggle = (value) => {
    setDiyCategoryToggle(value)
  }

  return (
    <div>
      <RadioGroup
        name='setCategoryToggle'
        value={diyCategoryToggle}
        onChange={handleDiyCategoryToggle}
        className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
      >
        <Radio value={1} key='CategoryToggleTypeOne'>
          {t('按一级分类查看')}
        </Radio>
        <Radio value={2} key='CategoryToggleTypeTwo'>
          {t('按二级分类查看')}
        </Radio>
      </RadioGroup>

      <GroupSortable
        data={groupData}
        onChange={handleChange}
        renderItem={(item) => {
          return (
            <Item
              title={item.text}
              className='gm-border'
              onClick={() => setActiveId(item.value)}
            >
              <div className='item-text'>{item.text}</div>
              {item.value === activeId && (
                <Popover
                  type='hover'
                  showArrow
                  arrowLeft={-3}
                  popup={
                    <div className='gm-padding-5'>
                      {t('分组功能，点击Enter键')}
                    </div>
                  }
                >
                  <div className='active-gap'>
                    <SvgGap />
                  </div>
                </Popover>
              )}
            </Item>
          )
        }}
        tag={Wrap}
      >
        {(items) => {
          return (
            <div>
              {_.map(items, (item, i) => {
                return (
                  <CheckboxGroup
                    inline
                    value={grouplist}
                    onChange={(value) => {
                      setGrouplist(value)
                      const list = _.filter(groupData, (item, index) => {
                        return value.includes(index)
                      })
                      const category_list = list.map((group) => {
                        return group.map((item) => item.value)
                      })
                      if (diyCategoryToggle === 1) {
                        Storage.set('Category1_groupData', {
                          category_config: category_list,
                        })
                        Storage.set('Category1_index', {
                          value: value,
                        })
                      } else if (diyCategoryToggle === 2) {
                        Storage.set('Category2_groupData', {
                          category_config_2: category_list,
                        })
                        Storage.set('Category2_index', {
                          value: value,
                        })
                      }
                    }}
                  >
                    <Checkbox value={i} className='gm-margin-right-10'>
                      <div
                        key={i}
                        className='gm-margin-bottom-10 gm-position-relative'
                      >
                        {i === 0 && (
                          <Label
                            text={t('默认')}
                            style={{
                              position: 'absolute',
                              left: '21px',
                              top: 0,
                            }}
                          />
                        )}
                        {item}
                      </div>
                    </Checkbox>
                  </CheckboxGroup>
                )
              })}
            </div>
          )
        }}
      </GroupSortable>
    </div>
  )
}
export default observer(Index)
