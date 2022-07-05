import React from 'react'
import PropTypes from 'prop-types'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitImportGoods = (props) => {
  console.log(props.refMoreAction)

  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initBatchImportGoods"]',
          content: (
            <Content title='批量导入商品'>
              上传商品库表格
              <br />
              上传前请确认表格格式与观麦商品模板一直
              <br />
              若出现上传失败，下载「失败原因」，对症修改
            </Content>
          ),
          actionBefore: () => {
            props.refMoreAction.current.apiDoSetActive(true)
          },
          actionAfter: () => {
            props.refMoreAction.current.apiDoSetActive(false)
          },
        },
      ]}
    />
  )
}

InitImportGoods.propTypes = {
  refMoreAction: PropTypes.object.isRequired,
}

InitImportGoods.TYPE = 'InitImportGoods'
InitImportGoods.pathname = '/merchandise/manage/list'

export default guideTypeHOC(InitImportGoods)
