import React, { useEffect, useState } from 'react'
import './styleProduct.css';
import axios from 'axios'

export const Product = () => {
  const [products,setproducts] = useState([])
  const [filteredproducts,setFilteresproducts] = useState([])
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [productData,setproductData]=useState({numero_documento:"",nombre:"",direccion:"",telefono:"",email:"",ciudad:"",departamento:""})
  const [errorMsg,setErrorMsg] = useState("")
  const [impuestos,setImouestos] = useState([])
  const [filteredimpuesto,setFilteresimpuesto] = useState([])
  const [categorias,setcategoria] = useState([])
  const [filteredcategoria,setFilterescategoria] = useState([])

  useEffect(()=>{
    getAllproducts()
    getAllImouestos()
    getAllCategorias()
  },[])

  const getAllproducts=()=>{
    axios.get('http://localhost:3005/productos').then((res)=>{
      console.log("Datos recibidos:", res.data);
      setproducts(res.data)
      setFilteresproducts(res.data)
    }).catch((error)=>{
      console.error("Error al obtener los productos:", error);
    })
  }
  const getAllImouestos=()=>{
    axios.get('http://localhost:3005/impuestos').then((res)=>{
      console.log("Datos recibidos:", res.data);
      setImouestos(res.data)
      setFilteresimpuesto(res.data)
    }).catch((error)=>{
      console.error("Error al obtener los impuestos:", error);
    })
  }
  const getAllCategorias=()=>{
    axios.get('http://localhost:3005/categorias').then((res)=>{
      console.log("Datos recibidos:", res.data);
      setcategoria(res.data)
      setFilterescategoria(res.data)
    }).catch((error)=>{
      console.error("Error al obtener los impuestos:", error);
    })
  }
const openPopup=()=>{
  setIsModalOpen(true)
}
const handleClose=()=>{
  setIsModalOpen(false)
  getAllproducts()
  setproductData({numero_documento:"",nombre:"",direccion:"",telefono:"",email:"",ciudad:"",departamento:""})
  setErrorMsg("")
}
const handleSubmit = async (e)=>{
  e.preventDefault();
  let errMsg = ""
  if(!productData.codigo || !productData.descripcion || !productData.precio_venta || !productData.impuesto_id_fk || !productData.medida || !productData.categoria_id_fk){
    errMsg = "Todos los campos son requeridos"
    setErrorMsg(errMsg)
  }

  if((errMsg.length===0) && productData.codigo){
    await axios.patch(`http://localhost:3005/productos/${productData.numero_documento}`,productData).then((res)=>{
      console.log(res.data);

    }).catch((error)=>{
      console.error("Error al obtener los productos:", error);
    })
  }else if((errMsg.length===0)){
    await axios.post('http://localhost:3005/productos',productData).then((res)=>{
      console.log("Datos recibidos:", res.data);
      setproducts(res.data)
    }).catch((error)=>{
      console.error("Error al obtener los productos:", error);
    })
  }
  if(errMsg.length===0){
    handleClose()
    getAllproducts()
  }


}

const handleChange = (e)=>{
  setproductData({...productData,[e.target.name]:e.target.value})
}

const handleSearch=(e)=>{
  const searchValue = e.target.value.toLowerCase()
  const filteredData = products.filter(product=>product.nombre_v.toLowerCase().includes(searchValue) ||
  product.numero_documento_v.toLowerCase().includes(searchValue) ||
  product.direccion_v.toLowerCase().includes(searchValue)||
  product.telefono_v.toLowerCase().includes(searchValue)||
  product.email_v.toLowerCase().includes(searchValue)||
  product.departamento_v.toLowerCase().includes(searchValue)||
  product.ciudad_v.toLowerCase().includes(searchValue))
  setFilteresproducts(filteredData)
}

const handleUpdate=(product)=>{
  setproductData({
    nombre: product.nombre_v,
    numero_documento: product.numero_documento_v,
    telefono: product.telefono_v,
    email: product.email_v,
    direccion: product.direccion_v,
    departamento: product.departamento_v,
    ciudad: product.ciudad_v,
  });
  openPopup()
}

const handleDelete =async(numero_documento)=>{
  const isConfirmed = window.confirm("Esta seguro que desea eliminar el producte")
  console.log(isConfirmed)
  if(isConfirmed){
    console.log(`http://localhost:3005/productos/${numero_documento}`);

    await axios.delete(`http://localhost:3005/productos/${numero_documento}`).then((res)=>{
      console.log(res);
      setproducts(res.data)
      setFilteresproducts(res.data)
    }).catch((error)=>{
      console.error("Error al eliminar el producte:", error);
    })
  }
  getAllproducts()
}
return (
  <div className="App">
    <h3>Factura ya</h3>
    <div className='search-box'>
      <input className='search-input' onChange={handleSearch} type='search' name='searchinput' id='searchinput' placeholder='Search product Here'/>
      <button className='addBtn' onClick={openPopup}>Add</button>
    </div>
    <div className='table-box'>
      {isModalOpen && <div className='addeditpopup'>
        <button className='closeBtn' onClick={handleClose}>&times;</button>
        <h4>Detalles Producto</h4>
        {errorMsg && <p className='error'>{errorMsg}</p>}
        <div className='izquierdo'><div className='popupdiv'>
          <label className='popopLabel' htmlFor='codigo'>Codigo</label><br></br>
          <input className='popupInput' value={productData.codigo} onChange={handleChange} type='text' name='codigo' id='codigo'/>
        </div>
        <div className='popupdiv'>
          <label className='popopLabel' htmlFor='descripcion'>Nombre</label><br></br>
          <input className='popupInput' value={productData.descripcion} onChange={handleChange} type='text' name='descripcion' id='descripcion'/>
        </div>
        <div className='popupdiv'>
          <label className='popopLabel' htmlFor='precio'>Precio</label><br></br>
          <input className='popupInput' value={productData.precio_venta} onChange={handleChange} type='number' name='precio' id='precio'/>
        </div><br></br>
        <button className='addproductBtn' onClick={handleSubmit}>{productData.codigo?"Update Product":"Agregar"}</button>
        </div>
        <div className='derecho'>
          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='impuesto'>Impuesto</label><br />
            <select
              className='popupInput'
              value={productData.impuesto}
              onChange={handleChange}
              name='impuesto'
              id='impuesto'>
              <option value="">Seleccione un impuesto</option>
              {Array.isArray(filteredimpuesto) && filteredimpuesto.map(impuesto => (
                <option key={impuesto.identificacion} value={impuesto.identificacion}>
                  {impuesto.p_nombre}
                </option>
              ))}
            </select>
          </div>
        <div className='popupdiv'>
          <label className='popopLabel' htmlFor='address'>Medida</label><br></br>
          <input className='popupInput' value={productData.direccion} onChange={handleChange} type='text' name='direccion' id='address'/>
        </div>
        <div className='popupdiv'>
            <label className='popopLabel' htmlFor='categoria'>Categoria</label><br />
            <select
              className='popupInput'
              value={productData.categoria}
              onChange={handleChange}
              name='categoria'
              id='categoria'>
              <option value="">Seleccione una categoria</option>
              {Array.isArray(filteredcategoria) && filteredcategoria.map(categoria => (
                <option key={categoria.identificacion} value={categoria.identificacion}>
                  {categoria.p_descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>}
      <div className="products-container">
        {Array.isArray(filteredproducts) && filteredproducts.map(product => (
            <div className="product-card" key={product.codigo}>
            <div><strong>Nombre:</strong> {product.p_codigo}</div>
            <div><strong>Descripción:</strong> {product.p_descripcion}</div>
            <div><strong>Precio:</strong> {product.p_precio_venta}</div>
            <div><strong>Impuesto:</strong> {product.p_impuesto_nombre}</div>
            <div><strong>Porcentaje Impuesto:</strong> {product.p_impuesto_porcentaje}</div>
            <div><strong>Medida:</strong> {product.p_medida}</div>
            <div><strong>Categoría:</strong> {product.p_categoria_nombre}</div>
            <div className="product-actions">
                <button className='editBtn' onClick={() => handleUpdate(product)}>Edit</button>
                <button className='deleteBtn' onClick={() => handleDelete(product.numero_documento_v)}>Delete</button>
            </div>
            </div>
        ))}
        </div>

    </div>
  </div>
)
}

