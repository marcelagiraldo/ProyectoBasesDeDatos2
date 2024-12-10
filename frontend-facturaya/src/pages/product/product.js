import React, { useEffect, useState } from 'react'
import './styleProduct.css';
import axios from 'axios'

export const Product = () => {
  const [products,setproducts] = useState([])
  const [filteredproducts,setFilteresproducts] = useState([])
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [productData,setproductData]=useState({codigo:"",descripcion:"",precio_venta:"",impuesto_id_fk:"",medida:"",categoria_id_fk:"",cantidad:""})
  const [errorMsg,setErrorMsg] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [impuestos,setImpuestos] = useState([])
  const [filteredimpuesto,setFilteresimpuesto] = useState([])
  const [impuestoData,setimpuestoData]=useState({identificacion:"",nombre:"",porcentaje:""})
  const [categorias,setcategoria] = useState([])
  const [filteredcategoria,setFilterescategoria] = useState([])

  const [isModalCIOpen,setIsModalCIOpen] = useState(false)

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
      console.error("Error al obtener los productos:", error)
    })
  }
  const getAllImouestos=()=>{
    axios.get('http://localhost:3005/impuestos').then((res)=>{
      console.log("Datos recibidos:", res.data)
      setImpuestos(res.data)
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
      console.error("Error al obtener los impuestos:", error)
    })
  }
const openPopup=()=>{
  setIsModalOpen(true)
  setIsEditMode(false)
}
const openCreateImpuesto=()=>{
  setIsModalCIOpen(true)
}
const handleClose=()=>{
  setIsModalOpen(false)
  setIsModalCIOpen(false)
  getAllproducts()
  setproductData({codigo:"",descripcion:"",precio_venta:"",impuesto_id_fk:"",medida:"",categoria_id_fk:"",cantidad:""})
  setErrorMsg("")
}
const handleCloseCI=()=>{
  setIsModalCIOpen(false)
  getAllImouestos()
}
const handleSubmitCI = async (e) => {
  e.preventDefault();

  let errMsg = "";

  // Validación de campos
  if (!impuestoData.identificacion || !impuestoData.nombre || !impuestoData.porcentaje) {
    errMsg = "Todos los campos son requeridos";
    setErrorMsg(errMsg);
    return;
  }

  const dataToSend = { ...impuestoData };

  try {
    // Crear un nuevo impuesto
    await axios.post('http://localhost:3005/impuestos', dataToSend);
    console.log("Impuesto agregado con éxito");

    // Cerrar el modal y actualizar los impuestos
    handleCloseCI();
    getAllImouestos();
  } catch (error) {
    console.error("Error al agregar el impuesto:", error);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault()
  let errMsg = ""
  const dataToSend = { ...productData };
  if (!productData.codigo || !productData.descripcion || !productData.precio_venta ||
      !productData.impuesto_id_fk || !productData.medida || !productData.categoria_id_fk) {
    errMsg = "Todos los campos son requeridos";
    setErrorMsg(errMsg);
    return;
  }

  try {
    if (isEditMode) {
      await axios.patch(`http://localhost:3005/productos/${productData.codigo}`, dataToSend);
      console.log("Producto actualizado con éxito");
    } else {
      await axios.post('http://localhost:3005/productos', dataToSend);
      console.log("Producto agregado con éxito");
      console.log(dataToSend)
    }
    handleClose();
    getAllproducts();
  } catch (error) {
    console.error("Error al guardar el cliente:", error);
  }
}

const handleChange = (e) => {
  const { name, value } = e.target;
  setproductData((prevState) => ({
    ...prevState,
    [name]: value, // Asegúrate de que el nombre coincide con el atributo `name` del input/select
  }));
};

const handleSearch=(e)=>{
  const searchValue = e.target.value.toLowerCase()
  const filteredData = products.filter(product=>product.p_codigo.toLowerCase().includes(searchValue) ||
  product.p_descripcion.toLowerCase().includes(searchValue) ||
  product.p_precio_venta.toLowerCase().includes(searchValue)||
  product.p_impuesto_nombre.toLowerCase().includes(searchValue)||
  product.p_medida.toLowerCase().includes(searchValue)||
  product.p_categoria_nombre.toLowerCase().includes(searchValue)||
  product.p_impuesto_porcentaje.toLowerCase().includes(searchValue))
  setFilteresproducts(filteredData)
}

const handleUpdate=(product)=>{
  setproductData({
    codigo: product.p_codigo,
    descripcion: product.p_descripcion,
    precio_venta: product.p_precio_venta,
    impuesto_id_fk: product.p_impuesto_id,
    medida: product.p_medida,
    categoria_id_fk: product.p_categoria_id,
  });
  openPopup()
  setIsEditMode(true);
  setIsModalOpen(true);
}

const handleDelete =async(codigo)=>{
  const isConfirmed = window.confirm("Esta seguro que desea eliminar el producte")
  console.log(isConfirmed)
  if(isConfirmed){
    await axios.delete(`http://localhost:3005/productos/${codigo}`).then((res)=>{
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
    <h3>Productos</h3>
    <div className='search-box'>
      <input className='search-input' onChange={handleSearch} type='search' name='searchinput' id='searchinput' placeholder='Search product Here'/>
      <button className='addBtn' onClick={openPopup}>Add</button>
    </div>
    <div className='table-box'>
      {isModalOpen && (
        <div className='addeditpopup'>
          <button className='closeBtn' onClick={handleClose}>&times;</button>
          <h4>Detalles Producto</h4>
          {errorMsg && <p className='error'>{errorMsg}</p>}

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='codigo'>Codigo</label>
            <input className='popupInput' value={productData.codigo} onChange={handleChange} type='text' name='codigo' id='codigo'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='descripcion'>Nombre</label>
            <input className='popupInput' value={productData.descripcion} onChange={handleChange} type='text' name='descripcion' id='descripcion'/>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='precio_venta'>Precio</label>
            <input className='popupInput' value={productData.precio_venta} onChange={handleChange} type='text' name='precio_venta' id='precio_venta'/>
          </div>

          <div className='popupdiv_'>
            <label className='popopLabel' htmlFor='impuesto_id_fk'>Impuesto</label>
            <button onClick={openCreateImpuesto}>+</button>
            <select className='popupInput' value={productData.impuesto_id_fk} onChange={handleChange} name='impuesto_id_fk' id='impuesto_id_fk'>
              <option value="">Seleccione un impuesto</option>
              {Array.isArray(filteredimpuesto) && filteredimpuesto.map(impuesto => (
                <option key={impuesto.p_identificacion} value={impuesto.p_identificacion}>
                  {impuesto.p_nombre}
                </option>
              ))}
            </select>
          </div>

          <div className='popupdiv'>
            <label className='popopLabel' htmlFor='medida'>Medida</label>
            <input className='popupInput' value={productData.medida} onChange={handleChange} type='text' name='medida' id='medida'/>
          </div>

          <div className='popupdiv_'>
            <label className='popopLabel' htmlFor='categoria_id_fk'>Categoria</label>
            <button>+</button>
            <select className='popupInput' value={productData.categoria_id_fk} onChange={handleChange} name='categoria_id_fk' id='categoria_id_fk' >
              <option value="">Seleccione una categoria</option>
              {Array.isArray(filteredcategoria) && filteredcategoria.map(categoria => (
                <option key={categoria.p_identificacion} value={categoria.p_identificacion}>
                  {categoria.p_descripcion}
                </option>
              ))}
            </select>
          </div>

          <button className='addproductBtn' onClick={handleSubmit}>
            {isEditMode ? "Actualizar" : "Agregar"}
          </button>
        </div>
      )}
    </div>
    <div>{isModalCIOpen && (
      <div className='agregar-impuesto'>
  <button className='closeBtn' onClick={handleCloseCI}>&times;</button>
  <div className='popupdiv'>
    <label className='popopLabel' htmlFor='identificacion'>Identificación</label><br />
    <input className='popupInput' value={impuestoData.identificacion} onChange={handleChange} type='text' name='identificacion' id='identificacion' />
  </div>
  <div className='popupdiv'>
    <label className='popopLabel' htmlFor='nombre'>Nombre</label><br />
    <input className='popupInput' value={impuestoData.nombre} onChange={handleChange} type='text' name='nombre' id='nombre' />
  </div>
  <div className='popupdiv'>
    <label className='popopLabel' htmlFor='porcentaje'>Porcentaje</label><br />
    <input className='popupInput' value={impuestoData.porcentaje} onChange={handleChange} type='number' name='porcentaje' id='porcentaje' />
  </div>
  <button className='addproductBtn' onClick={handleSubmitCI}>
    Agregar
  </button>
</div>

    )}</div>

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
        <div><strong>Stock:</strong> {product.p_stock}</div>

        <div className="product-actions">
          <button className='editBtn' onClick={() => handleUpdate(product)}>Edit</button>
          <button className='deleteBtn' onClick={() => handleDelete(product.p_codigo)}>Delete</button>
        </div>
      </div>))}
    </div>
  </div>
)
}

