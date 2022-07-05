import React from 'react'

/**
 * 组件容错，防止组件不存在时整个页面崩掉
 *
 * Catch((props, error) =>{
 *
 *  if (error) return (<div>{error.message}</div>)
 *
 *  else return <div> component detail </div>
 *
 *}, (err)=> log(err) )
 *
 *
 * @param {(props: Props, error?: Error) => React.ReactNode} component
 * @returns {React.ReactNode}
 */
export default function Catch(component) {
  class ErrorBoundary extends React.Component {
    state = {
      error: undefined,
    }

    render() {
      try {
        return component(this.props, this.state.error)
      } catch (err) {
        return component(this.props, err)
      }
    }
  }
  return (props) => {
    return <ErrorBoundary {...props} />
  }
}
