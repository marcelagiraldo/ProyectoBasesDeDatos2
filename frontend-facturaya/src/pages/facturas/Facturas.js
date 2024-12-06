import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './style.css';


export const Facturas = () => {
  const [facturas,setfacturas] = useState([])
  const [filteredfacturas,setFilteresfacturas] = useState([])
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [facturaData,setfacturaData]=useState({codigo:"",descripcion:"",precio_venta:"",impuesto_id_fk:"",medida:"",categoria_id_fk:""})
  const [errorMsg,setErrorMsg] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [metodoPago,setmetodoPago] = useState([])
  const [filteredmetodoPago,setFilteresmetodoPago] = useState([])

  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);

  useEffect(()=>{
    getAllfacturas()
    const currentDate = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    setfacturaData((prevData) => ({ ...prevData, fecha: currentDate }));
    getAllMetodosPago()
  },[])

  const getAllClientes = () => {
    axios.get('http://localhost:3005/clientes').then((res) => {
      setClientes(res.data);
      setFilteredClientes(res.data);
    }).catch((error) => {
      console.error("Error al obtener los clientes:", error);
    });
  };

  const getAllfacturas=()=>{
    axios.get('http://localhost:3005/facturas').then((res)=>{
      console.log("Datos recibidos:", res.data);
      setfacturas(res.data)
      setFilteresfacturas(res.data)
    }).catch((error)=>{
      console.error("Error al obtener las facturas:", error)
    })
  }
  const getAllMetodosPago=()=>{
    axios.get('http://localhost:3005/metodosPago').then((res)=>{
      console.log("Datos recibidos:", res.data);
      setmetodoPago(res.data)
      setFilteresmetodoPago(res.data)
    }).catch((error)=>{
      console.error("Error al obtener los metodos de pago:", error)
    })
  }
  const openPopup=()=>{
    setIsModalOpen(true)
    setIsEditMode(false)
    setIsModalOpen(true)
  }
  const handleClose=()=>{
    setIsModalOpen(false)
    getAllfacturas()
    setfacturaData({codigo:"",descripcion:"",precio_venta:"",impuesto_id_fk:"",medida:"",categoria_id_fk:""})
    setErrorMsg("")
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    let errMsg = ""
    const dataToSend = { ...facturaData };
    if (!facturaData.codigo || !facturaData.descripcion || !facturaData.precio_venta ||
        !facturaData.impuesto_id_fk || !facturaData.medida || !facturaData.categoria_id_fk) {
      errMsg = "Todos los campos son requeridos";
      setErrorMsg(errMsg);
      return;
    }

    try {
      if (isEditMode) {
        await axios.patch(`http://localhost:3005/facturas/${facturaData.codigo}`, dataToSend);
        console.log("Producto actualizado con éxito");
      } else {
        await axios.post('http://localhost:3005/facturas', dataToSend);
        console.log("Producto agregado con éxito");
        console.log(dataToSend)
      }
      handleClose();
      getAllfacturas();
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
    }
  }

  const handleChange = (e)=>{
    setfacturaData({...facturaData,[e.target.name]:e.target.value})
    const { name, value } = e.target;
    setfacturaData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const handleSearch=(e)=>{
    const searchValue = e.target.value.toLowerCase()
    const filteredData = facturas.filter(factura=>factura.p_codigo.toLowerCase().includes(searchValue) ||
    factura.p_descripcion.toLowerCase().includes(searchValue) ||
    factura.p_precio_venta.toLowerCase().includes(searchValue)||
    factura.p_impuesto_nombre.toLowerCase().includes(searchValue)||
    factura.p_medida.toLowerCase().includes(searchValue)||
    factura.p_categoria_nombre.toLowerCase().includes(searchValue)||
    factura.p_impuesto_porcentaje.toLowerCase().includes(searchValue))
    setFilteresfacturas(filteredData)
  }

  const handleSearchClient = async (e) => {
    const searchValue = e.target.value;
    setSelectedCliente(searchValue);

    if (searchValue.trim() === '') {
        setClientes([]); // Limpia la lista si el input está vacío
        return;
    }

    try {
        const response = await fetch(`/clientesNombre/${searchValue}`);
        if (!response.ok) throw new Error('Error fetching clients');

        const data = await response.json();
        setClientes(data ? [data] : []); // Asegura un array aunque sea un solo cliente
    } catch (error) {
        console.error('Error al buscar clientes:', error);
        setClientes([]);
    }
};

  const handleUpdate=(factura)=>{
    setfacturaData({
      codigo: factura.p_codigo,
      descripcion: factura.p_descripcion,
      precio_venta: factura.p_precio_venta,
      impuesto_id_fk: factura.p_impuesto_id,
      medida: factura.p_medida,
      categoria_id_fk: factura.p_categoria_id,
    });
    openPopup()
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  const handleDelete =async(codigo)=>{
    const isConfirmed = window.confirm("Esta seguro que desea eliminar el producte")
    console.log(isConfirmed)
    if(isConfirmed){
      await axios.delete(`http://localhost:3005/facturas/${codigo}`).then((res)=>{
        console.log(res);
        setfacturas(res.data)
        setFilteresfacturas(res.data)
      }).catch((error)=>{
        console.error("Error al eliminar el producte:", error);
      })
    }
    getAllfacturas()
  }
  return (
    <div className="App">
    <h3>Facturas</h3>
    <div className='search-box'>
      <input className='search-input' onChange={handleSearch} type='search' name='searchinput' id='searchinput' placeholder='Search Client Here'/>
      <button className='addBtn' onClick={openPopup}>Add</button>
    </div>
    <div className='table-box'>
      {isModalOpen && (
        <div className='addeditpopup'>
          <button className='closeBtn' onClick={handleClose}>&times;</button>
          <h4>Detalles Facturas</h4>
          {errorMsg && <p className='error'>{errorMsg}</p>}
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='codigo'>Codigo</label><br></br>
            <input className='popupInput' value={facturaData.nombre} onChange={handleChange} type='text' name='nombre' id='name'/>
          </div>
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='fecha'>Fecha</label><br />
            <input
              className='popupInput'
              value={facturaData.fecha}
              type='text'
              name='fecha'
              id='fecha'
              disabled // Inhabilita la edición
            />
          </div>
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='subtotal'>Subtotal</label><br></br>
            <input className='popupInput' value={facturaData.telefono} onChange={handleChange} type='number' name='telefono' id='phone'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='email'>Total IVA</label><br></br>
            <input className='popupInput' value={facturaData.email} onChange={handleChange} type='email' name='email' id='email'/>
          </div>
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='address'>Total</label><br></br>
            <input className='popupInput' value={facturaData.direccion} onChange={handleChange} type='text' name='direccion' id='address'/>
          </div>
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='department'>Cliente</label><br></br>
            <input className='popupInput' onChange={handleSearchClient} type='search' name='searchinput' id='searchinput' placeholder='Buscar por nombre o documento' value={selectedCliente}/>
            <ul className='client-list'>
                {clientes.map((client, index) => (
                  <li key={index}>
                      {client.nombre_v} - {client.numero_documento_v}
                  </li>
                ))}
            </ul>
          </div>
          <div className='popupdiv_'>
            <label className='popopLabel' htmlFor='city'>Metodo pago</label><br></br>
            <button>+</button>
            <select
              className='popupInput'
              value={facturaData.metodo_pago_}
              onChange={handleChange}
              name='impuesto_id_fk'
              id='impuesto_id_fk'>
              <option value="">Seleccione un metodo pago</option>
              {Array.isArray(filteredmetodoPago) && filteredmetodoPago.map(metodoPago => (
                <option key={metodoPago.p_identificacion} value={metodoPago.p_identificacion}>
                  {metodoPago.p_descripcion}
                </option>
              ))}
            </select>
          </div>
          <button className='addClientBtn' onClick={handleSubmit}>{isEditMode?"Actualizar":"Agregar"}</button>
       </div>)}
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Fecha</th>
            <th>Subtotal</th>
            <th>Total imouestos</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Cliente</th>
            <th>Metodo de pago</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredfacturas) && filteredfacturas.map(factura => (
            <tr key={factura.codigo}>
              <td>{factura.codigo_}</td>
              <td>{factura.fecha_}</td>
              <td>{factura.subtotal_}</td>
              <td>{factura.total_impuestos_}</td>
              <td>{factura.total_}</td>
              <td>{factura.estado_}</td>
              <td>{factura.cliente_nombre}</td>
              <td>{factura.metodo_pago_}</td>
              <td><button className='editBtn' onClick={()=>handleUpdate(factura)}>Edit</button></td>
              <td><button className='deleteBtn' onClick={()=>handleDelete(factura.codigo_)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>
  )
}

