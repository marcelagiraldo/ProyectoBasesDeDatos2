import React, { useEffect, useState } from 'react';
import './home.css';
import axios from 'axios';
import { json } from 'express';

export const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0); // Inicializa como número
    const [isModalOpen,setIsModalOpen] = useState(false)
    const [facturas, setfacturas] = useState([]);
    const [facturaData,setfacturaData]=useState({codigo:"",fecha:"",id_cliente_fk:"",id_metodo_pago_fk:"",descuento:"",productos:json})
    const [clientes, setclientes] = useState([]);
    const [filteredclientes, setFilteredclientes] = useState([]);
    const [clienteData,setclienteData]=useState({identificacion:"",nombre:"",porcentaje:""})
    const [metodoPago,setmetodoPago] = useState([])
    const [filteredmetodoPago,setFilteresmetodoPago] = useState([])
    const [contadorCodigo, setContadorCodigo] = useState(1);



    useEffect(() => {
        getAllProducts()
        getAllClientes()
        getAllMetodosPago()
        const currentDate = new Date().toISOString().split('T')[0];
        setfacturaData((prevData) => ({ ...prevData, fecha: currentDate }))
    }, []);

    const getAllProducts = () => {
        axios.get('http://localhost:3005/productos')
            .then((res) => {
                console.log("Datos recibidos:", res.data);
                setProducts(res.data);
                setFilteredProducts(res.data);
            })
            .catch((error) => {
                console.error("Error al obtener los productos:", error);
            });
    };

    const getAllMetodosPago=()=>{
        axios.get('http://localhost:3005/metodosPago').then((res)=>{
          console.log("Datos recibidos:", res.data);
          setmetodoPago(res.data)
          setFilteresmetodoPago(res.data)
        }).catch((error)=>{
          console.error("Error al obtener los metodos de pago:", error)
        })
      }

    const addToSelectedProducts = (product) => {
        if (!product.p_codigo) {
            alert('El producto no tiene un código válido.');
            return;
        }

        setSelectedProducts((prevSelected) => [...prevSelected, product]);
        setTotalPrice((prevTotal) => parseFloat(prevTotal) + parseFloat(product.p_precio_venta)); // Asegura el tipo de dato
    };

    const createJsonFromSelectedProducts = () => {
        const json = JSON.stringify(
            selectedProducts.map(({ codigo, p_codigo, p_precio_venta, p_stock }) => ({
                codigo,
                nombre: p_codigo,
                precio: p_precio_venta,
                stock: p_stock
            }))
        );
        console.log("JSON filtrado de productos seleccionados:", json);

    };
    const openPopup=()=>{
        setIsModalOpen(true)
        generarCodigo()
        createJsonFromSelectedProducts()
    }

    const handleClose=()=>{
        setIsModalOpen(false)
    }

    const confirmarFactura= async()=>{
        setSelectedProducts([]);
        setTotalPrice(0);
        setIsModalOpen(false)
        setclienteData({codigo:"",fecha:"",id_cliente_fk:"",id_metodo_pago_fk:"",productos:[]})
        setfacturaData((prevState) => ({ ...prevState, id_cliente_fk: "" }))
        console.log(facturaData);
        console.log(selectedProducts);

        const facturaConProductos = {
            ...facturaData,
            productos: selectedProducts.map(({ p_codigo, p_descripcion, p_precio_venta }) => ({
                codigo: p_codigo,
                descripcion: p_descripcion,
                precio_venta: p_precio_venta
            }))
        };
        try {
            await axios.post('http://localhost:3005/crear_factura', facturaConProductos);
            console.log("Cliente agregado con éxito: ",facturaConProductos);
        } catch (error) {

        }

    }
    const handleChangeFactura = (e) => {
        const { name, value } = e.target;
        setfacturaData((prevState) => ({ ...prevState, [name]: value }));
        console.log("Nuevo estado de fa cturaData:", { ...facturaData, [name]: value });
    };

    const getAllClientes=()=>{
        axios.get('http://localhost:3005/clientes').then((res)=>{
          console.log("Datos recibidos:", res.data);
          setclientes(res.data)
          setFilteredclientes(res.data)
        }).catch((error)=>{
          console.error("Error al obtener los productos:", error)
        })
    }

    const generarCodigo = () => {
        const nuevoCodigo = `F-${String(contadorCodigo).padStart(2, '0')}`; // Formato F-01, F-02, ...
        setfacturaData((prevState) => ({ ...prevState, codigo: nuevoCodigo }));
        setContadorCodigo(contadorCodigo + 1); // Incrementa el contador
    };

    const creatFactura= async()=>{


    }


    return (
        <div className='app'>
            <div className='popupdiv_'>
                <label className='popopLabel' htmlFor='id_cliente_fk'>Cliente</label>
                <select
                    className='popupInput'
                    value={facturaData.id_cliente_fk}
                    onChange={handleChangeFactura}
                    name='id_cliente_fk'
                    id='id_cliente_fk'>
                    <option value="">Seleccione un cliente</option>
                    {Array.isArray(filteredclientes) && filteredclientes.map(cliente => (
                        <option key={cliente.numero_documento_v} value={cliente.numero_documento_v}>
                            {cliente.nombre_v}
                        </option>
                    ))}
                </select>
            </div>

            <div className='facturacion'>
                <div className="products-container">
                    {Array.isArray(filteredProducts) && filteredProducts.map(product => (
                        <div className="product-card" key={product.codigo}>
                            <div><strong>Nombre:</strong> {product.p_codigo}</div>
                            <div><strong>Descripción:</strong> {product.p_descripcion}</div>
                            <div><strong>Precio:</strong> {product.p_precio_venta}</div>
                            <div><strong>Stock:</strong> {product.p_stock}</div>
                            <button onClick={() => addToSelectedProducts(product)}>Seleccionar</button>
                        </div>
                    ))}
                </div>

                <div className="selected-products-container">
                    <div className="summary">
                        <h3>Total: ${totalPrice.toFixed(0)}</h3> {/* Muestra el total */}
                        <button onClick={openPopup}>Confirmar Productos</button>
                    </div>
                    <h2>Productos Seleccionados</h2>
                    {selectedProducts.map((product) => (
                        <div className="product-card-list" key={product.codigo}>
                            <div><strong>Nombre:</strong> {product.p_codigo}</div>
                            <div><strong>Precio:</strong> {product.p_precio_venta}</div>
                        </div>
                    ))}
                </div>
                <div className=''>
                    {isModalOpen && (
                        <div className='factura-container'>
                            <h2>Factura</h2>
                            <button className='closeBtn' onClick={handleClose}>&times;</button>
                            <div className='popupdiv'>
                                <label className='popopLabel' htmlFor='codigo'>Codigo</label>
                                <input className='popupInput' value={facturaData.codigo} onChange={handleChangeFactura} type='text' name='codigo' id='codigo'/>
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
                                <label className='popopLabel' htmlFor='id_cliente_fk'>Cliente</label>
                                <input className='popupInput' value={facturaData.id_cliente_fk} onChange={handleChangeFactura} type='text' name='id_cliente_fk' id='id_cliente_fk' disabled/>
                            </div>
                            <div className='popupdiv_'>
                                <label className='popopLabel' htmlFor='id_metodo_pago_fk'>Metodo pago</label><br></br>
                                <select
                                className='popupInput'
                                value={facturaData.id_metodo_pago_fk}
                                onChange={handleChangeFactura}
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
                            <div className='popupdiv'>
                                <label className='popopLabel' htmlFor='descuento'>Descuento</label>
                                <input className='popupInput' value={facturaData.descuento} onChange={handleChangeFactura} type='text' name='descuento' id='descuento'/>
                            </div>
                            <button onClick={confirmarFactura}>Aceptar</button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
