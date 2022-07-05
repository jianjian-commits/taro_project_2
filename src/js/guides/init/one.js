import React from 'react'
import { Flex, Button, FunctionSet, IconDownUp } from '@gmfe/react'
import InitImportGoods from './guide/init_import_goods'
import InitCloudGoods from './guide/init_cloud_goods'
import { getXlsxURLByLocale } from '../../common/service'
import Tab from './components/tab'
import Video from './components/video'
import _ from 'lodash'

const area = [
  {
    text: '华南地区商品库01',
    filename: 'area_hn01.xlsx',
  },
  {
    text: '华南地区商品库02',
    filename: 'area_hn02.xlsx',
  },
  {
    text: '华东地区商品库',
    filename: 'area_hd.xlsx',
  },
  {
    text: '华北地区商品库',
    filename: 'area_hb.xlsx',
  },
  {
    text: '华中地区商品库',
    filename: 'area_hz.xlsx',
  },
  {
    text: '西南地区商品库',
    filename: 'area_xn.xlsx',
  },
]

const One = () => {
  return (
    <Tab
      data={[
        {
          title: '我没有商品资料',
          children: (
            <div>
              <div>
                <Video src='https://image.document.guanmai.cn/video/no_items.mov' />
              </div>
              <div className='gm-padding-10' />
              <Flex>
                <div>
                  <div>
                    <div className='gm-margin-bottom-10 gm-text-bold'>
                      方案一：
                    </div>
                    <div className='gm-margin-bottom-10'>
                      ① 根据你所在的地区下载商品库模板
                    </div>
                    <FunctionSet
                      data={_.map(area, (v) => ({
                        text: v.text,
                        onClick: () => {
                          window.open(
                            'https://js.guanmai.cn/static_storage/files/merchandise/' +
                              v.filename
                          )
                        },
                      }))}
                    >
                      <Button type='primary' plain>
                        下载地区商品库模板 <IconDownUp />
                      </Button>
                    </FunctionSet>
                    <div className='gm-margin-tb-10'>② 导入系统商品库</div>
                    <InitImportGoods.GoToButton>
                      前往商品库
                    </InitImportGoods.GoToButton>
                  </div>
                </div>
                <div className='gm-border-left gm-margin-lr-20' />
                <Flex flex column>
                  <div>
                    <div className='gm-margin-bottom-10 gm-text-bold'>
                      方案二：
                    </div>
                    <div className='gm-margin-bottom-10'>
                      在云商品库中挑选商品加入你的商品库
                    </div>
                    <InitCloudGoods.GoToButton>
                      前往云商品库
                    </InitCloudGoods.GoToButton>
                  </div>
                </Flex>
              </Flex>
            </div>
          ),
        },
        {
          title: '我有商品资料',
          children: (
            <Flex column>
              <div>
                <Video src='https://image.document.guanmai.cn/video/have_items.mov' />
              </div>
              <div className='gm-padding-10' />
              <div>
                <div className='gm-margin-bottom-10'>
                  ①
                  若已有商品资料，可下载系统商品库模板将已有的商品资料格式修改为系统表格格式
                </div>
                <Button
                  type='primary'
                  plain
                  onClick={() => {
                    window.open(
                      getXlsxURLByLocale(
                        'station_spu_add_batch.xlsx?v=123134134'
                      )
                    )
                  }}
                >
                  下载商品库模板
                </Button>
                <div className='gm-margin-tb-10'>② 导入系统商品库</div>
                <InitImportGoods.GoToButton>
                  前往商品库
                </InitImportGoods.GoToButton>
              </div>
            </Flex>
          ),
        },
      ]}
    />
  )
}

export default One
