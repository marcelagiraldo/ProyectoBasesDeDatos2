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
    const setId = req.params.clienteId
    const sql = "select * from proyecto.obtener_clientes()"
    pool.query(sql,(err,result)=>{
        if(err) return res.json(err);
        return res.status(200).json(result.rows)
    })
})
