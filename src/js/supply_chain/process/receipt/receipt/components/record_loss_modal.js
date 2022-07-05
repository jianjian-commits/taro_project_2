import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import store from '../store'
import { observer } from 'mobx-react'
import {
  Flex,
  Select,
  DateRangePicker,
  Uploader,
  Button,
  Modal,
  RightSideModal,
  Tip,
} from '@gmfe/react'
import TaskList from '../../../../../task/task_list'

const summary = [
  '计划编号：必填，若为空，则导入时系统对该行数据不做解析；',
  '商品ID：必填，若为空，则导入时系统对该行数据不做解析；',
  '物料ID：必填，若为空，则导入时系统对该行数据不做解析；',
  '数量字段：请填写正数，最多两位小数；',
  '领料数量：不用填写，系统自动读取物料已领取数；',
]

const RecordLossModal = () => {
  useEffect(() => {
    const { fetchWorkshopList, setFile, mergeRecordLossFilter } = store
    fetchWorkshopList()
    return () => {
      setFile(null)
      mergeRecordLossFilter({
        begin_time: new Date(),
        end_time: new Date(),
        workshop_id: 0,
      })
    }
  }, [])

  const { recordLossFilter, workshopList, file } = store

  const handleChange = (value, key) => {
    const { mergeRecordLossFilter } = store
    mergeRecordLossFilter({ [key]: value })
  }

  const handleUpload = ([file]) => {
    const { setFile } = store
    setFile(file)
  }

  const handleSubmit = () => {
    if (!file) {
      Tip.warning(t('请上传文件'))
      return
    }
    const { uploadConfirm } = store
    uploadConfirm().then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleDownload = () => {
    const { getDownloadFile } = store
    getDownloadFile().then(() => {
      handleCancel()
      setTimeout(() => {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
    })
  }

  const { workshop_id, begin_time, end_time } = recordLossFilter

  const list = [{ value: 0, text: t('全部车间') }].concat(
    workshopList
      .map((item) => ({ value: item.workshop_id, text: item.name }))
      .slice()
  )
  return (
    <div className='gm-padding-10'>
      <div className='gm-margin-bottom-20'>
        <p>{t('请选择需要导出的车间和日期，选择后点击“下载导入模板”')}</p>
        <Flex justifyBetween alignCenter wrap>
          <Select
            value={workshop_id}
            data={list}
            onChange={(value) => handleChange(value, 'workshop_id')}
          />
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            onChange={(begin, end) => {
              handleChange(begin, 'begin_time')
              handleChange(end, 'end_time')
            }}
            endProps={{ min: begin_time }}
          />
          <Button type='link' onClick={handleDownload}>
            {t('下载导入模板')}
          </Button>
        </Flex>
      </div>
      <div className='gm-margin-bottom-20'>
        <p>{t('上传需导入文件')}</p>
        <Uploader multiple={false} accept='.xlsx' onUpload={handleUpload}>
          <Button>{file ? t('重新上传') : t('上传')}</Button>
        </Uploader>
        {file && <span className='gm-margin-left-10'>{file.name}</span>}
      </div>
      <span>{t('填写说明：')}</span>
      <ul>
        {summary.map((text, i) => (
          <li key={i} style={{ listStyle: 'none' }}>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className='text-right'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button
          type='primary'
          className='gm-margin-left-5'
          onClick={handleSubmit}
        >
          {t('确认')}
        </Button>
      </div>
    </div>
  )
}

export default observer(RecordLossModal)
