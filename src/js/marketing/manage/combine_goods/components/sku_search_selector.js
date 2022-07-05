import React, { useState, useRef, useEffect } from 'react'
import { MoreSelect } from '@gmfe/react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'

const getList = (list) =>
  list.map((d) => ({
    ...d,
    text: d.name,
    value: d.id,
  }))

const SkuSearchSelector = (props) => {
  const msRef = useRef(null)
  const [list, setList] = useState([])
  const [isShowTip, setShowTip] = useState(false)
  const [n, setN] = useState(0)

  useEffect(() => {
    setN(0)
    getSkus().then((res) => {
      setList(getList(res.data))
    })
  }, [props.sku_id])

  const getSkus = (search_text) => {
    return Request('/station/skus')
      .data({
        search_text,
        limit: 30,
        ...props.searchOption,
      })
      .get()
  }

  const handleSearch = (search_text) => {
    getSkus(search_text).then((res) => {
      setList(getList(res.data))
      res.data.length && setShowTip(false)
    })
  }

  const handleClick = () => {
    // 如果select为空,那么就去检测一下有没有sku,如果没有就提示新建
    if (props.selected === undefined) {
      getSkus().then((res) => {
        // 如果是空,说明此报价单和spu下没有sku
        if (res.data.length === 0) {
          setShowTip(true)
          setList([])
          setN(0)
        } else {
          setShowTip(false)
          setList(getList(res.data))
          setN(1)
          setTimeout(() => msRef.current.apiDoFocus(), 100)
        }
      })
    }
  }

  return (
    <>
      <div
        // 当没填写sku时 给个红框提示 方便用户快速定位
        className={classNames('', {
          'b-has-error': props.selected === undefined,
        })}
      >
        {n === 0 && props.selected === undefined ? (
          <input
            type='text'
            onClick={handleClick}
            className='form-control '
            placeholder={t('请输入商品名搜索')}
          />
        ) : (
          <MoreSelect
            ref={msRef}
            popoverType='realFocus'
            data={list}
            selected={props.selected}
            onSelect={props.onSelect}
            onSearch={handleSearch}
            placeholder={t('请输入商品名搜索')}
            renderListFilterType='pinyin'
          />
        )}

        {props.selected === undefined && !isShowTip ? (
          <div className='gm-margin-top-5'>{t('请填写')}</div>
        ) : null}
      </div>

      {isShowTip && (
        <>
          <div className='gm-gap-5' />
          <div className='b-no-sku-tip'>
            {t('所选报价单下无此商品销售规格,点击')}
            <a
              target='_blank'
              rel='noopener noreferrer'
              href={`#/merchandise/manage/sale/sku_detail?spu_id=${props.searchOption.spu_id}&salemenuId=${props.searchOption.salemenu_id}`}
            >
              {t('快速新建')}
            </a>
          </div>
        </>
      )}
    </>
  )
}

SkuSearchSelector.propTypes = {
  selected: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  /** searchOption 搜索条件
   station_id  O   string  站点ID
   salemenu_id    O   string  销售单ID
   search_text     O   string  搜索内容
   spu_id  O       str             spuID
   active   O   string  “1”或“0“是否只查上架商品
   offset    O   int 分页偏移
   limit    O   int 分页每页限制
   fetch_category  O   string  “1”或“0“是否需要拉分类信息
   */
  searchOption: PropTypes.object,
  sku_id: PropTypes.string,
}

export default observer(SkuSearchSelector)
