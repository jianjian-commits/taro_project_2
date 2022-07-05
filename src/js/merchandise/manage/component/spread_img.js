import styled from 'styled-components'

export default styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
  min-height: ${(props) => props.minHeight || '40px'};
`
