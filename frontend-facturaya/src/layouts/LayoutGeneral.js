import './Layout.css'
import React from 'react'
import {Layout} from 'antd'
import { useNavigate } from 'react-router-dom'

export const LayoutGeneral = (props) => {
    const {children} = props
    const navigate = useNavigate()
    const handleClickclient = () =>{
        navigate('/clients')
    }
    const handleClickproduct = () =>{
      navigate('/products')
  }
  return (
    <Layout>
        <div className='menu'>
            <button onClick={handleClickproduct} className='btn'>Productos</button>
            <button onClick={handleClickclient} className='btn'>Clientes</button>
            <button className='btn'>Facturas</button>
            <button className='btn'>Inventario</button>
            <button className='btn'>Informes</button>
        </div>
        {children}
    </Layout>
  )
}
