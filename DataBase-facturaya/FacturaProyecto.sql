/*----FACTURAS------------*/
/*Insertar facturas*/
create or replace procedure proyecto.crear_facturas(
	codigo_ varchar, 
	subtotal_ numeric,
	total_impuestos_ numeric, 
	total_ numeric, 
	estado_ varchar, 
	id_cliente_fk_ varchar, 
	id_metodo_pago_ varchar
)as $$
declare 
begin 
	raise notice 'Código: %, Subtotal: %, Total impuestos: %, Total: %, Estado: %, Cliente: %, Método de pago: %',
		codigo_, subtotal_, total_impuestos_, total_, estado_, id_cliente_fk_, id_metodo_pago_;
	insert into proyecto.facturas(id, codigo, fecha, subtotal, total_impuestos, total, estado, id_cliente_fk, id_metodo_pago_fk)
	values(nextval('proyecto.codigo_factura'),codigo_,CURRENT_TIMESTAMP,subtotal_,total_impuestos_,total_,estado_,id_cliente_fk_,id_metodo_pago_);
	raise notice 'Factura creada correctamente con código: %', codigo_;
	exception when others then
    	raise notice 'Error al crear la factura: %', sqlerrm;
		rollback;
end
$$ language plpgsql;
SELECT last_value FROM proyecto.codigo_factura;

drop procedure proyecto.crear_facturas;

INSERT INTO proyecto.facturas (
	id, codigo, fecha, subtotal, total_impuestos, total, estado, id_cliente_fk, id_metodo_pago_fk
) VALUES (
	nextval('proyecto.codigo_factura'), 'F-01', CURRENT_TIMESTAMP, 
	18100, 1900, 20000, 'Entregado', '30234876', 'M02'
);

call proyecto.crear_facturas('F-02',18100,1900,20000,'Entregado','30234876','M02');
/*Obtener facturas*/
create or replace function proyecto.obtener_facturas()
returns table(
	id_ bigint,
	codigo_ varchar,
	fecha_ date, 
	subtotal_ numeric,
	total_impuestos_ numeric, 
	total_ numeric, 
	estado_ varchar, 
	cliente_id varchar,
	cliente_nombre varchar,
	metodo_pago_ varchar)
as $$
begin
	return query
	select f.id, f.codigo,f.fecha,f.subtotal,f.total_impuestos,f.total,f.estado,
	c.numero_documento as cliente_id, c.nombre as cliente_nombre,
	mp.descripcion as metodo_pago_	
 	from proyecto.facturas f
	join proyecto.clientes c on f.id_cliente_fk = c.numero_documento
	join proyecto.metodos_pago mp on f.id_metodo_pago_fk = mp.identificacion ;
end
$$language plpgsql;

SELECT * FROM proyecto.metodos_pago WHERE identificacion = 'M01';
select * from proyecto.facturas f ;
SELECT * FROM proyecto.metodos_pago mp where identificacion = 'M02';
WHERE id_cliente_fk = 'M03';

select * from proyecto.obtener_facturas();

/*------Procedimiento para modificar clientes-------*/
create or replace procedure proyecto.modificar_facturas(
	codigo_ varchar,
	fecha_ date, 
	subtotal_ numeric,
	total_impuestos_ numeric, 
	total_ numeric, 
	estado_ varchar, 
	id_cliente_fk_ varchar, 
	id_metodo_pago_ varchar
)
as $$
declare 
begin 
	update proyecto.facturas
    set codigo = codigo_,
        fecha = fecha_,
        subtotal = subtotal_,
        toal_impuestos = total_impuestos_,
        total = total_,
        estado = estado_
		id_cliente_fk = id_cliente_fk_
		id_metodo_pago_fk = id_metodo_pago_
    where codigo = codigo_;
	exception when others then
    	raise notice 'Error al modificar la factura: %', sqlerrm;
end;
$$ language plpgsql;

--call proyecto.modificar_clientes('1098765432','Manuel Gomez','Cra25#28-09','3109876543','manuel.gomez@gmail.com','Manizales','Caldas');
/*------Procedimiento para eliminar clientes-------*/
create or replace procedure proyecto.eliminar_facturas(codigo_ varchar)
as $$
declare 
begin 
	delete from proyecto.facturas
    where codigo = codigo_;
	exception when others then
    	raise notice 'No se puedo eliminar la factura: %', sqlerrm;
end;
$$ language plpgsql;

--call proyecto.eliminar_clientes('1002657843');



/*------Procedimiento para Agregar Stock-------*/
create or replace procedure proyecto.stock_productos(p_codigo varchar,p_tipo_movimiento varchar,p_cantidad integer,p_observaciones varchar)
as $$
begin 
    -- Verificar si el producto existe
    if p_codigo is null then
        raise exception 'Producto con código % no existe', p_codigo;
    end if;

	if p_observaciones is null then
		p_observaciones = '';
	end if;

    -- Registrar el movimiento en la tabla de Inventario
    insert into proyecto.inventarios(id,fecha, tipo_movimiento, entrada, salida, observaciones, id_producto_fk)
    values (nextval('proyecto.codigo_inventario'),CURRENT_TIMESTAMP, p_tipo_movimiento, 
            case when p_tipo_movimiento = 'Entrada' then p_cantidad else 0 end,
            case when p_tipo_movimiento = 'Salida' then p_cantidad else 0 end,
            p_observaciones, p_codigo);
	if p_tipo_movimiento = 'Entrada' then
        update proyecto.productos set cantidad = cantidad + p_cantidad where codigo = p_codigo;
    elsif p_tipo_movimiento = 'Salida' then
        -- Evitar que la cantidad sea negativa
        if (select cantidad from proyecto.productos where codigo = p_codigo) >= p_cantidad then
            update proyecto.productos set cantidad = cantidad - p_cantidad where codigo = p_codigo;
        else
            raise exception 'No hay suficiente stock para realizar la salida del producto con código %', p_codigo;
        end if;
    else
        raise exception 'Tipo de movimiento no válido: %', p_tipo_movimiento;
    end if;
end;
$$ language plpgsql;

select * from proyecto.inventarios;

call proyecto.stock_productos('6785B','Entrada',20,'');
call proyecto.stock_productos('6787B','Entrada',20,'');
call proyecto.stock_productos('6787B','Salida',2,'');

create or replace function proyecto.obtener_inventario()
returns table(id_ bigint,fecha_ date,tipo_movimiento_ varchar,entrada_ numeric,salida_ numeric,observaciones_ varchar,producto_nombre varchar)
as $$
begin
	return query
	select i.id,i.fecha,i.tipo_movimiento, i.entrada, i.salida, i.observaciones,
	p.descripcion AS producto_nombre
	from proyecto.inventarios i
	join proyecto.productos p on i.id_producto_fk=p.codigo;
end
$$language plpgsql;


select * from proyecto.obtener_inventario();

create or replace function proyecto.consultar_stock_actual(p_codigo_producto varchar)
returns table (v_codigo_producto varchar,stock_actual integer)
as $$
begin
return QUERY
    select p.codigo, p.descripcion,
           COALESCE(SUM(i.entrada), 0) - COALESCE(SUM(i.salida), 0) as stock_actual
    from proyecto.productos p
    join proyecto.inventarios i on p.codigo = i.id_producto_fk
    where p.codigo = p_codigo_producto;
end;
$$ language plpgsql;


select * from proyecto.consultar_stock_actual('6785B');
	
create or replace procedure proyecto.crear_detalles_facturas(
	cantidad_ numeric, 
	desceunto_ numeric,
	valor_total_ numeric, 
	id_producto varchar, 
	id_factura_ varchar
)as $$
declare 
begin 
	insert into proyecto.detalles_factura(id,cantidad,descuento,valor_total,id_producto_fk,id_factura_fk)
	values(nextval('proyecto.codigo_detalle_factura'),cantidad_,desceunto_,valor_total_,id_producto,id_factura_);
	
	exception when others then
    	raise notice 'Error al crear la factura: %', sqlerrm;
		rollback;
end
$$ language plpgsql;

call proyecto.crear_detalles_facturas(2,0,20000,'6785B','F-01');

create or replace function proyecto.obtener_detalles_facturas()
returns table(
	id_ bigint,
	cantidad_ numeric,
	descuento_ numeric, 
	total_ numeric,
	nombre_producto varchar, 
	id_factura varchar)
as $$
begin
	return query
	select df.id, df.cantidad,df.descuento,df.valor_total,
	p.descripcion as nombre_producto, f.codigo as id_factura
 	from proyecto.detalles_factura df
	join proyecto.productos p on df.id_producto_fk = p.codigo
	join proyecto.facturas f on df.id_factura_fk = f.codigo ;
end
$$language plpgsql;

select * from proyecto.obtener_detalles_facturas();
