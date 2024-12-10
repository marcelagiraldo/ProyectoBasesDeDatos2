import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './style.css';


export const Facturas = () => {
  const [facturas,setfacturas] = useState([])
  const [filteredfacturas,setFilteresfacturas] = useState([])
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [facturaData,setfacturaData]=useState({codigo:"",fecha:"",subtotal:"",total_impuestos:"",total:"",estado:"",id_cliente_fk:"",id_metodo_pago_fk:""})
  const [errorMsg,setErrorMsg] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [metodoPago,setmetodoPago] = useState([])
  const [filteredmetodoPago,setFilteresmetodoPago] = useState([])

  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const [detallesFactura, setdetallesFactura] = useState([]);
  const [filteredDetallesfacturas,setFilteresDetallesfacturas] = useState([])

  const [productos,setproductos] = useState([])
  const [filteredproductos,setFilteresproductos] = useState([])

  const [nuevoDetalle, setNuevoDetalle] = useState({id_producto_fk: "",cantidad: "",descuento: 0,});

  useEffect(()=>{
    getAllfacturas()
    const currentDate = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    setfacturaData((prevData) => ({ ...prevData, fecha: currentDate }));
    getAllMetodosPago()
    getAllDetallesFactura()
    getAllProductos()
    getAllClientes()
  },[])

  const getAllClientes = () => {
    axios.get('http://localhost:3005/clientes').then((res) => {
      setClientes(res.data);
      setFilteredClientes(res.data);
    }).catch((error) => {
      console.error("Error al obtener los clientes:", error);
    });
  };
  const getAllProductos = () => {
    axios.get('http://localhost:3005/productos').then((res) => {
      setproductos(res.data);
      setFilteresproductos(res.data);
    }).catch((error) => {
      console.error("Error al obtener los clientes:", error);
    });
  };

  const getAllDetallesFactura = () => {
    axios.get('http://localhost:3005/detallesFactura').then((res) => {
      setdetallesFactura(res.data);
      setFilteresDetallesfacturas(res.data);
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
    setfacturaData({codigo:"",fecha:"",subtotal:"",total_impuestos:"",total:"",estado:"",id_cliente_fk:"",id_metodo_pago_fk:""})
    setErrorMsg("")
  }
  const handleSubmit = async () => {
    try {
        // Paso 1: Crear la factura principal
        const facturaResponse = await axios.post('http://localhost:3005/crearFactura', {
            codigo: facturaData.codigo,
            fecha: facturaData.fecha,
            subtotal: facturaData.subtotal,
            total_impuestos: facturaData.total_impuestos,
            total: facturaData.total,
            estado: "Pendiente", // Ejemplo de estado inicial
            id_cliente_fk: selectedCliente.numero_documento,
            id_metodo_pago_fk: facturaData.metodo_pago_
        });

        const facturaCodigo = facturaResponse.data.codigo;

        // Paso 2: Crear los detalles de la factura
        for (const detalle of detallesFactura) {
            await axios.post('http://localhost:3005/crearDetalleFactura', {
                id: detalle.id,
                cantidad: detalle.cantidad,
                descuento: detalle.descuento || 0,
                valor_total: detalle.valor_total,
                id_producto_fk: detalle.id_producto_fk,
                id_factura_fk: facturaCodigo
            });
        }

        alert("Factura y detalles creados exitosamente.");
        handleClose();
    } catch (error) {
        console.error("Error al guardar la factura o los detalles:", error);
    }
};


  const handleChange = (e)=>{
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
            <input className='popupInput' value={facturaData.codigo} onChange={handleChange} type='text' name='nombre' id='name'/>
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
            <input className='popupInput' value={facturaData.subtotal} onChange={handleChange} type='number' name='telefono' id='phone'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='email'>Total IVA</label><br></br>
            <input className='popupInput' value={facturaData.total_impuestos} onChange={handleChange} type='email' name='email' id='email'/>
          </div>
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='address'>Total</label><br></br>
            <input className='popupInput' value={facturaData.total} onChange={handleChange} type='text' name='direccion' id='address'/>
          </div>
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='id_cliente_fk'>Cliente</label><br></br>
            <select className='popupInput' value={facturaData.id_cliente_fk} onChange={handleChange} name='id_cliente_fk' id='id_cliente_fk'>
              <option value="">Seleccione un cliente</option>
              {Array.isArray(filteredClientes) && filteredClientes.map(clientes => (
                <option key={clientes.numero_documento_v} value={clientes.numero_documento_v}>
                  {clientes.nombre_v}
                </option>
              ))}
            </select>
          </div>
          <div className='popupdiv_'>
            <label className='popopLabel' htmlFor='city'>Metodo pago</label><br></br>
            <button>+</button>
            <select
              className='popupInput'
              value={facturaData.id_metodo_pago_fk}
              onChange={handleChange}
              name='id_metodo_pago_fk'
              id='id_metodo_pago_fk'>
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

