const express = require('express')
const cors = require('cors')
const postgresPool =  require('pg').Pool
const app = express()
const bodyParser = require('body-parser')
const { Connection } = require('pg')
const port = process.env.port || 3005

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
    const setId = Number(req.params.clienteId)
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

app.post('/productos',(req,res)=>{
    const {codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk} = req.body
    const sql = "call proyecto.crear_clientes($1,$2,$3,$4,$5,$6,$7)"
    pool.query(sql,[codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk],(err,result)=>{
        if(err) {
            console.error("Error al llamar al procedimiento:", err);
            return res.status(500).json({ error: "Error al insertar el cliente." });
        }
        return res.status(200).json({ message: "Cliente insertado exitosamente." });
    })
})

app.get('/impuestos',(req,res)=>{
    const sql = "select * from proyecto.obtener_impuestos()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})

app.get('/categorias',(req,res)=>{
    const sql = "select * from proyecto.obtener_categorias()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})
