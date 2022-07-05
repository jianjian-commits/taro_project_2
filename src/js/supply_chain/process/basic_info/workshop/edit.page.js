import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withRouter, WithBreadCrumbs } from 'common/service'
import {
  Box,
  Button,
  Form,
  FormButton,
  FormItem,
  FormPanel,
  Input,
  MoreSelect,
  Tip,
  Validator,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { store } from './store'
import { store as globalStore } from '../store'
import { Request } from '@gm-common/request'

const Edit = ({ history }) => {
  const workshop_id = history.location?.query?.workshop_id
  const isEdit = !!workshop_id

  const [technicData, setData] = useState([])
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (!isEdit) {
      return
    }
    async function initData() {
      const {
        data: { name, custom_id, technics },
      } = await Request('/process/workshop/get').data({ workshop_id }).get()
      setName(name)
      setId(custom_id)
      setSelected(technics.map((v) => ({ value: v.technic_id, text: v.name })))
    }
    initData().then()
  }, [])

  useEffect(() => {
    async function initList() {
      const { technic_data } = await globalStore.fetchProcessList()
      setData(technic_data.map((item) => ({ value: item.id, text: item.name })))
    }
    initList().then()
  }, [])

  const handleChange = (value, action) => {
    action(value)
  }

  const handleCreate = async () => {
    store
      .createWorkShop({
        name,
        custom_id: id,
        technics: JSON.stringify(selected.map((item) => item.value)),
      })
      .then(() => {
        Tip.success(t('新建成功'))
        window.history.back()
      })
  }

  const handleCancel = (e) => {
    e.preventDefault()
    window.history.back()
  }

  const handleEdit = () => {
    store
      .editWorkShop({
        name,
        custom_id: id,
        technics: JSON.stringify(selected.map((item) => item.value)),
        workshop_id,
      })
      .then(() => {
        Tip.success(t('编辑成功'))
        window.history.back()
      })
  }

  const handleValidate = (value, name) => {
    if (!value) {
      return t('请输入') + name
    }
    if (value.length > 8) {
      return name + t('长度不能大于8')
    }
    return null
  }

  return (
    <Box hasGap>
      <WithBreadCrumbs breadcrumbs={[isEdit ? t('编辑车间') : t('新建车间')]} />
      <FormPanel title={isEdit ? t('编辑车间') : t('新建车间')}>
        <Form
          labelWidth='80px'
          onSubmitValidated={isEdit ? handleEdit : handleCreate}
        >
          <FormItem
            label={t('车间名称')}
            required
            validate={Validator.create([], name, (value) =>
              handleValidate(value, t('车间名称'))
            )}
          >
            <Input
              className='form-control'
              value={name}
              onChange={(e) => handleChange(e.target.value, setName)}
            />
          </FormItem>
          <FormItem
            label={t('车间编号')}
            required
            validate={Validator.create([], id, (value) =>
              handleValidate(value, t('车间编号'))
            )}
          >
            <Input
              className='form-control'
              value={id}
              onChange={(e) => handleChange(e.target.value, setId)}
            />
          </FormItem>
          <FormItem label={t('关联工艺')}>
            <MoreSelect
              selected={selected}
              data={technicData}
              onSelect={(value) => handleChange(value, setSelected)}
              multiple
            />
          </FormItem>
          <FormButton>
            <Button onClick={handleCancel}>{t('取消')}</Button>
            <Button
              htmlType='submit'
              type='primary'
              className='gm-margin-left-10'
            >
              {t('保存')}
            </Button>
          </FormButton>
        </Form>
      </FormPanel>
    </Box>
  )
}

Edit.propTypes = {
  history: PropTypes.object,
}

export default withRouter(Edit)
