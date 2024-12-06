import React, { useEffect, useState } from 'react'
import './style.css';
import axios from 'axios'

export const Client = () => {
  const [clients,setclients] = useState([])
  const [filteredClients,setFilteresClients] = useState([])
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [clientData,setClientData]=useState({numero_documento:"",nombre:"",direccion:"",telefono:"",email:"",ciudad:"",departamento:""})
  const [errorMsg,setErrorMsg] = useState("")
  const [isEditMode, setIsEditMode] = useState(false);


  const getAllClients=()=>{
    axios.get('http://localhost:3005/clientes').then((res)=>{
      console.log("Datos recibidos:", res.data);
      setclients(res.data)
      setFilteresClients(res.data)
    }).catch((error)=>{
      console.error("Error al obtener los clientes:", error);
    })
  }
  useEffect(()=>{
    getAllClients()
  },[])

const openPopup=()=>{
  setIsModalOpen(true)
  setIsEditMode(false);
  setIsModalOpen(true);
}
const handleClose=()=>{
  setIsModalOpen(false)
  getAllClients()
  setClientData({numero_documento:"",nombre:"",direccion:"",telefono:"",email:"",ciudad:"",departamento:""})
  setErrorMsg("")
}
const handleSubmit = async (e) => {
  e.preventDefault();
  let errMsg = "";
  if (!clientData.nombre || !clientData.numero_documento || !clientData.telefono ||
      !clientData.email || !clientData.direccion || !clientData.departamento ||
      !clientData.ciudad) {
    errMsg = "Todos los campos son requeridos";
    setErrorMsg(errMsg);
    return;
  }

  try {
    if (isEditMode) {
      await axios.patch(`http://localhost:3005/clientes/${clientData.numero_documento}`, clientData);
      console.log("Cliente actualizado con éxito");
    } else {
      console.log("Este es el client data: ",clientData);
      await axios.post('http://localhost:3005/clientes', clientData);
      console.log("Cliente agregado con éxito");
    }
    handleClose();
    getAllClients();
  } catch (error) {
    console.error("Error al guardar el cliente:", error);
  }
}


const handleChange = (e)=>{
  setClientData({...clientData,[e.target.name]:e.target.value})
}

const handleSearch=(e)=>{
  const searchValue = e.target.value.toLowerCase()
  const filteredData = clients.filter(client=>client.nombre_v.toLowerCase().includes(searchValue) ||
  client.numero_documento_v.toLowerCase().includes(searchValue) ||
  client.direccion_v.toLowerCase().includes(searchValue)||
  client.telefono_v.toLowerCase().includes(searchValue)||
  client.email_v.toLowerCase().includes(searchValue)||
  client.departamento_v.toLowerCase().includes(searchValue)||
  client.ciudad_v.toLowerCase().includes(searchValue))
  setFilteresClients(filteredData)
}

const handleUpdate=(client)=>{
  console.log(client);

  setClientData({
    nombre: client.nombre_v,
    numero_documento: client.numero_documento_v,
    telefono: client.telefono_v,
    email: client.email_v,
    direccion: client.direccion_v,
    departamento: client.departamento_v,
    ciudad: client.ciudad_v,
  });
  setIsEditMode(true);
  setIsModalOpen(true);
  openPopup()
}

const handleDelete =async(numero_documento)=>{
  const isConfirmed = window.confirm("Esta seguro que desea eliminar el cliente")
  console.log(isConfirmed)
  if(isConfirmed){
    console.log(`http://localhost:3005/clientes/${numero_documento}`);

    await axios.delete(`http://localhost:3005/clientes/${numero_documento}`).then((res)=>{
      console.log(res);
      setclients(res.data)
      setFilteresClients(res.data)
    }).catch((error)=>{
      console.error("Error al eliminar el cliente:", error);
    })
  }
  getAllClients()
}
return (
  <div className="App">
    <h3>Clientes</h3>
    <div className='search-box'>
      <input className='search-input' onChange={handleSearch} type='search' name='searchinput' id='searchinput' placeholder='Search Client Here'/>
      <button className='addBtn' onClick={openPopup}>Add</button>
    </div>
    <div className='table-box'>
      {isModalOpen && (
        <div className='addeditpopup'>
          <button className='closeBtn' onClick={handleClose}>&times;</button>
          <h4>Detalles Cliente</h4>
          {errorMsg && <p className='error'>{errorMsg}</p>}
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='name'>Nombre</label><br></br>
            <input className='popupInput' value={clientData.nombre} onChange={handleChange} type='text' name='nombre' id='name'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='document'>Documento</label><br></br>
            <input className='popupInput' value={clientData.numero_documento} onChange={handleChange} type='text' name='numero_documento' id='document'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='phone'>Telefono</label><br></br>
            <input className='popupInput' value={clientData.telefono} onChange={handleChange} type='number' name='telefono' id='phone'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='email'>Correo</label><br></br>
            <input className='popupInput' value={clientData.email} onChange={handleChange} type='email' name='email' id='email'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='address'>Direccion</label><br></br>
            <input className='popupInput' value={clientData.direccion} onChange={handleChange} type='text' name='direccion' id='address'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='department'>Departamento</label><br></br>
            <input className='popupInput' value={clientData.departamento} onChange={handleChange} type='text' name='departamento' id='department'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='city'>Municipio</label><br></br>
            <input className='popupInput' value={clientData.ciudad} onChange={handleChange} type='text' name='ciudad' id='city'/>
          </div>

          <button className='addClientBtn' onClick={handleSubmit}>{isEditMode?"Actualizar":"Agregar"}</button>
        </div>)}
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Telefono</th>
            <th>Correo</th>
            <th>Direccion</th>
            <th>Departamento</th>
            <th>Municipio</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredClients) && filteredClients.map(client => (
            <tr key={client.numero_documento}>
              <td>{client.nombre_v}</td>
              <td>{client.numero_documento_v}</td>
              <td>{client.telefono_v}</td>
              <td>{client.email_v}</td>
              <td>{client.direccion_v}</td>
              <td>{client.departamento_v}</td>
              <td>{client.ciudad_v}</td>
              <td><button className='editBtn' onClick={()=>handleUpdate(client)}>Edit</button></td>
              <td><button className='deleteBtn' onClick={()=>handleDelete(client.numero_documento_v)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>
)
}
