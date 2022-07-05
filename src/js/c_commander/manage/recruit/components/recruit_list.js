import React, { useEffect, useState } from 'react'
import { FormPanel, Flex, Form, FormItem } from '@gmfe/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import commander_bg_1 from '../../../../../img/commander_bg_1.jpg'
import commander_bg_2 from '../../../../../img/commander_bg_2.jpg'
import SingleImg from './single_img'

const RecruitList = () => {
  const [qrCode, setQrCode] = useState(null)
  const imgList = [
    {
      bg: commander_bg_1,
      className: 'b-commander-recruit-code-1'
    },
    {
      bg: commander_bg_2,
      className: 'b-commander-recruit-code-2'
    }
  ]

  const fetchQrCode = () => {
    return Request('/community/distributor/invitation_img/get')
      .data()
      .get()
      .then(json => {
        setQrCode(json.data.qrcode)
      })
  }

  useEffect(() => {
    fetchQrCode()
  }, [])

  return (
    <FormPanel title={t('团长招募')}>
      <p style={{ paddingBottom: '80px', paddingLeft: '8px' }}>
        团长推广图用于制作宣传推广物料，用户扫码后即可进入团长小程序填写团长申请信息。请在下方选择一张团长招募海报下载：
      </p>
      <Form labelWidth='170px'>
        <FormItem>
          <Flex style={{ paddingLeft: '170px' }} row>
            {_.map(imgList, (item, value) => (
              <SingleImg imgInfo={item} key={value} qrCode={qrCode} />
            ))}
          </Flex>
        </FormItem>
      </Form>
    </FormPanel>
  )
}

export default RecruitList
