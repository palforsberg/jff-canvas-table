import PropTypes from 'prop-types'
import React from 'react'
import * as domTools from '../../tools/domTools'

const propTypes = {
   children: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.func.isRequired]),
}

const defaultProps = {
}

/**
 * Supplies children with width to use all space available in parent and height to use all space on the rest of the page.
 */
class Flexer extends React.PureComponent {
   constructor(props) {
      super(props)
      this.state = {
         height: 150,
         width: 600,
         offset: 0,
      }
      this.didResize = this.didResize.bind(this)
      this.iframe = React.createRef()
   }
   componentDidMount() {
      this.iframe.current.contentWindow.addEventListener('resize', this.didResize)
      this.didResize()
   }
   componentWillUnmount() {
      this.iframe.current.contentWindow.removeEventListener('resize', this.didResize)
   }

   didResize(event) {
      const offset = domTools.getOffset(this.iframe.current)
      const height = window.innerHeight - offset.y
      this.setState({ height, width: this.iframe.current.offsetWidth, offset: offset.y })
   }

   render() {
      const { children } = this.props
      return (
         <div style={{ position: 'relative' }}>
            <iframe title="resize-iframe" ref={this.iframe} style={{ width: '100%', height: `calc(100vh - ${this.state.offset}px)`, visibility: 'hidden', position: 'absolute', border: 0 }} />
            { typeof children === 'function' ? children(this.state) : React.cloneElement(children, this.state) }
         </div>
      )
   }
}

Flexer.propTypes = propTypes
Flexer.defaultProps = defaultProps

export default Flexer
