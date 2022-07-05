import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
const getColumns = () => {
  return [
    {
      Header: i18next.t('商品图片'),
      id: 'image',
      accessor: (d) =>
        d.images[0] ? (
          <Flex
            alignCenter
            style={{
              width: '40px',
              height: '40px',
            }}
            className='gm-border'
          >
            <img
              src={d.images[0]}
              style={{
                maxWidth: '40px',
                width: '100%',
                height: '100%',
              }}
            />
          </Flex>
        ) : (
          ''
        ),
    },
    {
      Header: i18next.t('商品名称'),
      accessor: 'name',
    },
    {
      Header: i18next.t('商品分类'),
      id: 'category',
      accessor: (d) => (
        <span>
          {d.category_name_1}/{d.category_name_2}/{d.pinlei_name}
        </span>
      ),
    },
    {
      Header: i18next.t('单位'),
      accessor: 'std_unit_name',
    },
    {
      Header: i18next.t('商品描述'),
      accessor: 'desc',
    },
  ]
}

export { getColumns }
