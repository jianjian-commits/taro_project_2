import React from 'react'
import { withRouter } from '../../common/service'
import { Button } from '@gmfe/react'
import queryString from 'query-string'

function guideTypeHOC(Component) {
  if (!Component.TYPE || !Component.pathname) {
    console.warn('Component 没有提供 TYPE 和 pathname')
  }

  const GoToButton = ({ children, ...rest }) => {
    return (
      <Button
        type='primary'
        onClick={() => {
          const obj = queryString.parseUrl(Component.pathname)

          obj.query.guide_type = Component.TYPE

          if (Component.pathname.startsWith('/')) {
            window.open(`#${queryString.stringifyUrl(obj)}`)
          } else {
            window.open(Component.pathname)
          }
        }}
        {...rest}
      >
        {children}
      </Button>
    )
  }

  const GuideWithType = withRouter(
    ({
      location: {
        query: { guide_type },
      },
      ready,
      forceShow,
      ...rest
    }) => {
      if (!forceShow) {
        if (!ready) {
          return null
        }

        if (guide_type !== Component.TYPE) {
          return null
        }
      }

      return <Component {...rest} />
    }
  )

  GuideWithType.TYPE = Component.TYPE
  GuideWithType.pathname = Component.pathname

  GuideWithType.GoToButton = GoToButton

  return GuideWithType
}

export default guideTypeHOC
