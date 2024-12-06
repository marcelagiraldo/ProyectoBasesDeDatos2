import React, { useEffect, useState } from 'react'
import './style.css'
import axios from 'axios'

export const Inventarios = () => {
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [errorMsg,setErrorMsg] = useState("")
  const [stockData,setstockData]=useState({fecha:"",tipo_movimiento:"Entrada",entrada:"",salida:"",observaciones:"",id_producto_fk:""})
  const [isEditMode, setIsEditMode] = useState(false)
  const [filteredStock, setFilteredStock] = useState([]);
  const [inventario, setinventario] = useState([]);

  useEffect(()=>{
    getAllInventarios()
  },[])

  const handleClose=()=>{
    setIsModalOpen(false)
    setstockData({fecha:"",tipo_movimiento:"Entrada",entrada:"",salida:"",observaciones:"",id_producto_fk:""})
    setErrorMsg("")
  }

  const handleChange = (e)=>{
    setstockData({...stockData,[e.target.name]:e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errMsg = '';

    // Validación
    if (!stockData.tipo_movimiento || !stockData.entrada || !stockData.observaciones || !stockData.id_producto_fk) {
      errMsg = 'Todos los campos son requeridos';
      setErrorMsg(errMsg);
      return;
    }

    const dataToSend = {
      id_producto_fk: stockData.id_producto_fk,
      tipo_movimiento: stockData.tipo_movimiento,
      entrada: parseInt(stockData.entrada), // Asegurarse de enviar como número
      observaciones: stockData.observaciones
    };

    try {
      await axios.post('http://localhost:3005/agregarStock', dataToSend);
      console.log('Producto agregado con éxito');
      handleClose();
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
    }
  };

  const openPopup=()=>{
    setIsModalOpen(true)
    setIsEditMode(false)
    setIsModalOpen(true)
  }
  const getAllInventarios = () => {
    axios.get('http://localhost:3005/inventarios').then((res) => {
      setinventario(res.data);
      setFilteredStock(res.data);
    }).catch((error) => {
      console.error("Error al obtener los clientes:", error);
    });
  };
  return (
    <div className='app'>
    <div className='table-box'>
      {isModalOpen && (
        <div className='addeditpopup'>
          <button className='closeBtn' onClick={handleClose}>&times;</button>
          <h4>Detalles Stock</h4>
          {errorMsg && <p className='error'>{errorMsg}</p>}

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='id_producto_fk'>Codigo Producto</label>
            <input
              className='popupInput'
              value={stockData.id_producto_fk}
              onChange={handleChange}
              type='text'
              name='id_producto_fk'
              id='id_producto_fk'
            />
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='tipo_movimiento'>Tipo movimiento</label>
            <input
              className='popupInput'
              value={'Entrada'}
              type='text'
              name='tipo_movimiento'
              id='tipo_movimiento'
              disabled
            />
            <input type='hidden' name='tipo_movimiento' value='Entrada' />
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='entrada'>Cantidad</label>
            <input
              className='popupInput'
              value={stockData.entrada}
              onChange={handleChange}
              type='text'
              name='entrada'
              id='entrada'
            />
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='observaciones'>Observación</label>
            <input
              className='popupInput'
              value={stockData.observaciones}
              onChange={handleChange}
              type='text'
              name='observaciones'
              id='observaciones'
            />
          </div>

          <button className='addproductBtn' onClick={handleSubmit}>
            Agregar
          </button>
        </div>

      )}
    </div>
    <button className='btn-stock' onClick={openPopup}>Agregar Stock</button>
    <table className='table'>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo movimiento</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Observacion</th>
            <th>Producto</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredStock) && filteredStock.map(stock => (
            <tr key={stock.id_}>
              <td>{stock.fecha_}</td>
              <td>{stock.tipo_movimiento_}</td>
              <td>{stock.entrada_}</td>
              <td>{stock.salida_}</td>
              <td>{stock.observaciones_}</td>
              <td>{stock.producto_nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  )
}

