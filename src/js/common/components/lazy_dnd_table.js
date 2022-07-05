import { i18next } from 'gm-i18n'
import React from 'react'
import requireBeautifulDnd from 'gm-service/src/require_module/require_beautiful_dnd'

export default function getLazyDndTable(process) {
  const Component = React.lazy(() =>
    requireBeautifulDnd()
      .then(() => import('@gmfe/table/src/dnd_table'))
      .then((load) => {
        if (process) {
          return process(load)
        } else {
          return load
        }
      })
  )

  return React.forwardRef(function LazyDndTable(props, ref) {
    return (
      <React.Suspense
        fallback={<div className='text-center'>{i18next.t('加载中...')}</div>}
      >
        <Component ref={ref} {...props} />
      </React.Suspense>
    )
  })
}
