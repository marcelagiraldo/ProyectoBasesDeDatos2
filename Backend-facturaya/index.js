const express = require('express')
const cors = require('cors')
const postgresPool =  require('pg').Pool
const app = express()
const bodyParser = require('body-parser')
const { Connection } = require('pg')
const port = process.env.port || 3005
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))

app.listen(port,(err)=>{
    if(err) throw err;
    console.log(`Servidor corriendo correctamente en el puerto: ${port}`);

})

const pool = new postgresPool({
    user:'postgres',
    password:'AutonomaSQL123.',
    database:'facturaya',
    host:'localhost',
    port:'5432'
})

pool.connect((err,Connection)=>{
    if(err) throw err;
    console.log(`Conexion correcta`);
})

app.get('/clientes',(req,res)=>{
    const sql = "select * from proyecto.obtener_clientes()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.get('/clientes/:clienteId',(req,res)=>{
    const setId = req.params.clienteId
    const sql = "select * from proyecto.obtener_cliente($1)"
    pool.query(sql,[setId],(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows[0])
    })
})

app.post('/clientes',(req,res)=>{
    const {numero_documento,nombre,direccion,telefono,email,ciudad,departamento} = req.body
    const sql = "call proyecto.crear_clientes($1,$2,$3,$4,$5,$6,$7)"
    pool.query(sql,[numero_documento, nombre, direccion, telefono, email, ciudad, departamento],(err,result)=>{
        if(err) {
            console.error("Error al llamar al procedimiento:", err);
            return res.status(500).json({ error: "Error al insertar el cliente." });
        }
        return res.status(200).json({ message: "Cliente insertado exitosamente." });
    })
})

app.patch('/clientes/:clienteId',(req,res)=>{
    const setId = Number(req.params.clienteId)
    const {numero_documento,nombre,direccion,telefono,email,ciudad,departamento} = req.body
    const sql = "call proyecto.modificar_clientes($1,$2,$3,$4,$5,$6,$7)"
    pool.query(sql,[numero_documento, nombre, direccion, telefono, email, ciudad, departamento],(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).send(`Cliente actualizado correctamente para ClienteId: ${setId}`)
    })
})

app.delete('/clientes/:clienteId',(req,res)=>{
    const setId = Number(req.params.clienteId)
    const sql = "call proyecto.eliminar_clientes($1)"
    console.log(sql);

    pool.query(sql,[setId],(err,result)=>{
        console.log(result);
        if(err) return res.json(err);
        return res.status(200).send(`Cliente eliminado correctamente para ClienteId: ${setId}`)
    })
})

app.get('/productos',(req,res)=>{
    const sql = "select * from proyecto.obtener_productos()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.get('/productos/:codigo',(req,res)=>{
    const setId = req.params.codigo
    const sql = "select * from proyecto.obtener_productos_codigo($1)"
    pool.query(sql,[setId],(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows[0])
    })
})

app.post('/productos',(req,res)=>{
    const {codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk} = req.body
    const sql = "call proyecto.crear_productos($1,$2,$3,$4,$5,$6)"
    pool.query(sql,[codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk],(err,result)=>{
        if(err) {
            console.error("Error al llamar al procedimiento:", err);
            return res.status(500).json({ error: "Error al insertar el producto." });
        }
        return res.status(200).json({ message: "Producto insertado exitosamente." });
    })
})

app.patch('/productos/:codigo',(req,res)=>{
    const setCodigo = Number(req.params.codigo)
    const {codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk} = req.body
    const sql = "call proyecto.modificar_productos($1,$2,$3,$4,$5,$6)"
    pool.query(sql,[codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk],(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).send(`Producto actualizado correctamente para Codigo: ${setCodigo}`)
    })
})

app.delete('/clientes/:clienteId',(req,res)=>{
    const setId = req.params.clienteId
    const sql = "call proyecto.eliminar_clientes($1)"
    console.log(sql);

    pool.query(sql,[setId],(err,result)=>{
        console.log(result);
        if(err) return res.json(err);
        return res.status(200).send(`Cliente eliminado correctamente para ClienteId: ${setId}`)
    })
})
app.delete('/productos/:codigo',(req,res)=>{
    const setCodigo = req.params.codigo
    const sql = "call proyecto.eliminar_productos($1)"
    console.log(sql);

    pool.query(sql,[setCodigo],(err,result)=>{
        console.log(result);
        if(err) return res.json(err);
        return res.status(200).send(`Producto eliminado correctamente para codigo: ${setCodigo}`)
    })
})


app.get('/impuestos',(req,res)=>{
    const sql = "select * from proyecto.obtener_impuestos()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.post('/impuestos',(req,res)=>{
    const {identificacion,nombre,porcentaje} = req.body
    const sql = "call proyecto.crear_impuestos($1,$2,$3)"
    pool.query(sql,[identificacion,nombre,porcentaje],(err,result)=>{
        if(err) {
            console.error("Error al llamar al procedimiento:", err);
            return res.status(500).json({ error: "Error al insertar el impuesto." });
        }
        return res.status(200).json({ message: "Impuesto insertado exitosamente." });
    })
})

app.patch('/impuestos/:identificacion',(req,res)=>{
    const setId = Number(req.params.identificacion)
    const {identificacion,nombre,porcentaje} = req.body
    const sql = "call proyecto.modificar_impuestos($1,$2,$3)"
    pool.query(sql,[identificacion,nombre,porcentaje],(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).send(`Imouesto actualizado correctamente para Identificacion: ${setId}`)
    })
})

app.delete('/impuestos/:identificacion',(req,res)=>{
    const setId = Number(req.params.identificacion)
    const sql = "call proyecto.eliminar_impuestos($1)"
    console.log(sql);

    pool.query(sql,[setId],(err,result)=>{
        console.log(result);
        if(err) return res.json(err);
        return res.status(200).send(`Impuesto eliminado correctamente para identificación: ${setId}`)
    })
})

app.get('/categorias',(req,res)=>{
    const sql = "select * from proyecto.obtener_categorias()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.get('/facturas',(req,res)=>{
    const sql = "select * from proyecto.obtener_facturas()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.post('/facturas',(req,res)=>{
    const {codigo,fecha,subtotal,total_impuestos,total,estado,id_cliente_fk,id_metodo_pago_fk} = req.body
    const sql = "call proyecto.crear_impuestos($1,$2,$3,$4,$5,$6,$7,$8)"
    pool.query(sql,[codigo,fecha,subtotal,total_impuestos,total,estado,id_cliente_fk,id_metodo_pago_fk],(err,result)=>{
        if(err) {
            console.error("Error al llamar al procedimiento:", err);
            return res.status(500).json({ error: "Error al insertar el impuesto." });
        }
        return res.status(200).json({ message: "Impuesto insertado exitosamente." });
    })
})

app.get('/metodosPago',(req,res)=>{
    const sql = "select * from proyecto.obtener_metodos_pago()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.get('/clientesNombre/:nombre',(req,res)=>{
    const setId = req.params.nombre
    const sql = "select * from proyecto.obtener_cliente_nombre($1)"
    pool.query(sql,[setId],(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows[0])
    })
})
app.get('/metodosPago',(req,res)=>{
    const sql = "select * from proyecto.obtener_metodos_pago()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.post('/agregarStock', (req, res) => {
    const { id_producto_fk, tipo_movimiento, entrada, observaciones } = req.body;

    const p_codigo = id_producto_fk; // Renombrar para coincidir con el procedimiento
    const p_cantidad = parseInt(entrada); // Convertir a entero
    const p_observaciones = observaciones || '';

    const sql = "CALL proyecto.stock_productos($1, $2, $3, $4)";
    pool.query(sql, [p_codigo, tipo_movimiento, p_cantidad, p_observaciones], (err, result) => {
        if (err) {
            console.error("Error al llamar al procedimiento:", err);
            return res.status(500).json({ error: "Error al insertar el impuesto." });
        }
        return res.status(200).json({ message: "Stock agregado exitosamente." });
    });
});

app.get('/inventarios',(req,res)=>{
    const sql = "select * from proyecto.obtener_inventario()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.post('/deatllesFactura',(req,res)=>{
    const {cantidad,descuento,valor_total,id_producto_fk,id_factura_fk} = req.body
    const sql = "call proyecto.crear_detalles_facturas($1,$2,$3,$4,$5)"
    pool.query(sql,[cantidad,descuento,valor_total,id_producto_fk,id_factura_fk],(err,result)=>{
        if(err) {
            console.error("Error al llamar al procedimiento:", err);
            return res.status(500).json({ error: "Error al insertar el impuesto." });
        }
        return res.status(200).json({ message: "Impuesto insertado exitosamente." });
    })
})

app.get('/detallesFactura',(req,res)=>{
    const sql = "select * from proyecto.obtener_detalles_facturas()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

async function crearFactura(codigoFactura, fecha, clienteId, metodoPagoId, productos, descuentoFactura = 0) {
    const productosJSONB = JSON.stringify(productos);
    console.log('productosJSONB:', productosJSONB);
    try {
      const query = `
        CALL proyecto.crear_factura($1, $2, $3, $4, $5, $6);
      `;
      const params = [codigoFactura, fecha, clienteId, metodoPagoId, productosJSONB, descuentoFactura];
      await pool.query(query, params);
      console.log('Factura creada exitosamente');
    } catch (err) {
      console.error('Error al crear la factura:', err);
    }
}

async function actualizarStock(codigoProducto, tipoMovimiento, cantidad, observaciones = '') {
    try {
      const query = `
        CALL proyecto.stock_productos($1, $2, $3, $4);
      `;
      const params = [codigoProducto, tipoMovimiento, cantidad, observaciones];
      await pool.query(query, params);
      console.log('Stock actualizado exitosamente');
      const auditData = {
        tipo_accion: 'Actualización de stock',
        codigo_producto: codigoProducto,
        Tipo_movimiento:tipoMovimiento,
        fecha_creacion: new Date()
    };
    await logAuditAction(auditData);
    } catch (err) {
      console.error('Error al actualizar el stock:', err);
    }
}

async function procesarFacturaYActualizarStock(facturaData) {
    try {
      // Llama a crear_factura
      await crearFactura(
        facturaData.codigoFactura,
        facturaData.fecha,
        facturaData.clienteId,
        facturaData.metodoPagoId,
        facturaData.productos,
        facturaData.descuentoFactura
      );

      // Actualiza el stock para cada producto
      for (const producto of facturaData.productos) {
        await actualizarStock(
          producto.id_producto,
          'Salida',
          producto.cantidad,
          'Venta de producto'
        );
      }
      const auditData = {
            tipo_accion: 'creación_factura',
            codigo_factura: facturaData.codigoFactura,
            cliente:facturaData.clienteId,
            fecha_creacion: new Date(),
            descripcion: 'Factura creada correctamente'
        };
        await logAuditAction(auditData);
      console.log('Proceso completado exitosamente');
    } catch (err) {
      console.error('Error en el proceso:', err);
    }
}

app.post('/crearFactura', async (req, res) => {
    try {
      const facturaData = req.body;
      await procesarFacturaYActualizarStock(facturaData);
      console.log(pool.query('COMMIT'));
      await generarPDFFactura(facturaData);
      res.status(200).send({ message: 'Factura procesada exitosamente' });
    } catch (err) {
      res.status(500).send({ error: 'Error al procesar la factura' });
    }
});

async function generarPDFFactura(facturaData) {
    try {
        const doc = new PDFDocument();
        const fileName = path.join(__dirname, `factura_${facturaData.codigoFactura}.pdf`);

        doc.pipe(fs.createWriteStream(fileName));

        // Encabezado
        doc.fontSize(20).text('Factura', {
            align: 'center'
        });
        doc.moveDown();

        // Datos de la factura
        doc.fontSize(14).text(`Código de Factura: ${facturaData.codigoFactura}`, { align: 'left' });
        doc.text(`Fecha: ${(new Date(facturaData.fecha)).toDateString()}`, { align: 'left' });
        doc.text(`Cliente ID: ${facturaData.clienteId}`, { align: 'left' });
        doc.text(`Método de Pago: ${facturaData.metodoPagoId}`, { align: 'left' });
        doc.text(`Total: ${facturaData.total}`, { align: 'left' });
        doc.moveDown();

        // Detalles de la factura
        doc.fontSize(16).text('Detalles de la Factura:', { underline: true });
        facturaData.productos.forEach((producto, index) => {
            doc.fontSize(12).text(`Producto ${index + 1}:`, { align: 'left' });
            doc.text(`ID: ${producto.id_producto}`, { align: 'left' });
            doc.text(`Cantidad: ${producto.cantidad}`, { align: 'left' });
            doc.text(`Descuento: ${producto.descuento || 0}%`, { align: 'left' });
            doc.moveDown();
        });

        // Crear el archivo PDF
        doc.end();
        console.log(`Factura ${facturaData.codigoFactura} generada y guardada como ${fileName}`);
    } catch (err) {
        console.error('Error al generar el PDF de la factura:', err);
    }
}

async function logAuditAction(actionData) {
    try {
        await client.connect();
        const database = client.db('auditoria_db'); // Nombre de la base de datos
        const collection = database.collection('factura_auditoria');

        const result = await collection.insertOne(actionData);
        console.log('Registro de auditoría insertado:', result);
    } catch (error) {
        console.error('Error al insertar el registro de auditoría:', error);
    } finally {
        await client.close();
    }
}
