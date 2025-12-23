import React from 'react'
import "./Button.css"

const Button = ({children, handleClick, variant}) => {
  return (
    <button onClick={handleClick} className={`btn ${variant}`}>{children}</button>
  )
}

export default Button