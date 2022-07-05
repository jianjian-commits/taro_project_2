/* eslint-disable react/prop-types */
import React from 'react'
import { t } from 'gm-i18n'
import { TableX } from '@gmfe/table-x'
import { Flex } from '@gmfe/react'
import { CombinedGoodsSelector, CookbookSetting } from './index'
import CookbookStore from '../store'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'

const CookbookTable = () => {
  const { initDataList, creatNewBatch } = CookbookStore
  const columns = [
    {
      Header: t('餐次'),
      id: 'mealTimes',
      width: 110,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              return (
                <>
                  <CookbookSetting mealTimesIndex={index} />
                </>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('周一'),
      id: 'monday',
      minWidth: 170,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              let { monday } = original
              if (!monday.length) monday = [{}]
              return _.map(monday, (item, j) => {
                return (
                  <CombinedGoodsSelector
                    key={j}
                    selectedValue={item}
                    mealTimesIndex={index}
                    itemIndex={j}
                    week='monday'
                  />
                )
              })
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('周二'),
      id: 'tuesday',
      minWidth: 170,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              let { tuesday } = original
              if (!tuesday.length) tuesday = [{}]
              return _.map(tuesday, (item, j) => {
                return (
                  <CombinedGoodsSelector
                    key={j}
                    selectedValue={item}
                    mealTimesIndex={index}
                    itemIndex={j}
                    week='tuesday'
                  />
                )
              })
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('周三'),
      id: 'wednesday',
      minWidth: 170,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              let { wednesday } = original
              if (!wednesday.length) wednesday = [{}]
              return _.map(wednesday, (item, j) => {
                return (
                  <CombinedGoodsSelector
                    key={j}
                    selectedValue={item}
                    mealTimesIndex={index}
                    itemIndex={j}
                    week='wednesday'
                  />
                )
              })
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('周四'),
      id: 'thursday',
      minWidth: 170,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              let { thursday } = original
              if (!thursday.length) thursday = [{}]
              return _.map(thursday, (item, j) => {
                return (
                  <CombinedGoodsSelector
                    key={j}
                    selectedValue={item}
                    mealTimesIndex={index}
                    itemIndex={j}
                    week='thursday'
                  />
                )
              })
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('周五'),
      id: 'friday',
      minWidth: 170,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              let { friday } = original
              if (!friday.length) friday = [{}]
              return _.map(friday, (item, j) => {
                return (
                  <CombinedGoodsSelector
                    key={j}
                    selectedValue={item}
                    mealTimesIndex={index}
                    itemIndex={j}
                    week='friday'
                  />
                )
              })
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('周六'),
      id: 'saturday',
      minWidth: 170,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              let { saturday } = original
              if (!saturday.length) saturday = [{}]
              return _.map(saturday, (item, j) => {
                return (
                  <CombinedGoodsSelector
                    key={j}
                    selectedValue={item}
                    mealTimesIndex={index}
                    itemIndex={j}
                    week='saturday'
                  />
                )
              })
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('周日'),
      id: 'sunday',
      minWidth: 170,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              let { sunday } = original
              if (!sunday.length) sunday = [{}]
              return _.map(sunday, (item, j) => {
                return (
                  <CombinedGoodsSelector
                    key={j}
                    selectedValue={item}
                    mealTimesIndex={index}
                    itemIndex={j}
                    week='sunday'
                  />
                )
              })
            }}
          </Observer>
        )
      },
    },
  ]
  const handleNewBatch = () => {
    creatNewBatch()
  }
  return (
    <>
      <div className='gm-margin-top-20'>
        选择商品，如找不到，可以在
        <a
          onClick={() => {
            window.open('#/marketing/manage/combine_goods')
          }}
        >
          组合商品
        </a>
        进行设置
      </div>
      <TableX
        data={initDataList.cookbook_info?.slice() ?? []}
        columns={columns}
        className='gm-margin-top-5'
      />
      <Flex
        justifyCenter
        alignCenter
        className='b-cookbook-box gm-margin-top-20'
        onClick={handleNewBatch}
      >
        + 新建批次
      </Flex>
    </>
  )
}
export default observer(CookbookTable)
