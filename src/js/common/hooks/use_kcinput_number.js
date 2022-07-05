/*
 * @Description: KCInputNumberV2 onFocus、onBlur
 */
import { useRef } from 'react'
export default function useKCInputNumber() {
  const isFocusRef = useRef(false)
  const onFocus = (e) => {
    isFocusRef.current = true
    const target = e.target
    const timer = setTimeout(() => {
      isFocusRef.current && target && target.select()
      clearTimeout(timer)
    }, 10)
  }
  const onBlur = () => {
    isFocusRef.current = false
  }

  return {
    onFocus,
    onBlur,
  }
}
