import './App.css';
import {useEffect, useState} from 'react'
import axios from 'axios'

function App() {
  const [students,setStudents] = useState([])
  const getAllClients=()=>{
    axios.get('http://localhost:3005/clientes').then((res)=>{
      console.log("Datos recibidos:", res.data);
      setStudents(res.data)
    }).catch((error)=>{
      console.error("Error al obtener los clientes:", error);
    })
  }
  useEffect(()=>{
    getAllClients()
  },[])
  const [isModalOpen,setIsModalOpen] = useState(false)
  const openPopup=()=>{
    setIsModalOpen(true)
  }
  const handleClose=()=>{
    setIsModalOpen(false)
  }
  return (
    <div className="App">
      <h3>Factura ya</h3>
      <div className='search-box'>
        <input className='search-input' type='search' name='searchinput' id='searchinput' placeholder='Search Client Here'/>
        <button className='addBtn' onClick={openPopup}>Add</button>
      </div>
      <div className='table-box'>
        {isModalOpen && <div className='addeditpopup'>
          <button className='closeBtn' onClick={handleClose}>&times;</button>
          <h4>Detalles Cliente</h4>
        </div>}
        <table className='table'>
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
          <tbody>
            {students && students.map(student=>{
              return(<tr key={student.numero_documento}>
              <td>{student.numero_documento_v}</td>
              <td>{student.nombre_v}</td>
              <td>{student.telefono_v}</td>
              <td>{student.email_v}</td>
              <td>{student.direccion_v}</td>
              <td>{student.departamento_v}</td>
              <td>{student.ciudad_v}</td>
              <td><button className='editBtn'>Edit</button></td>
              <td><button className='deleteBtn'>Delete</button></td>

              </tr>)
            })}

          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
