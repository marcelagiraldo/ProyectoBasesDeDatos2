create table proyecto.clientes(
	id serial unique,
	numero_documento varchar(10) primary key unique not null,
	nombre varchar not null,
	direccion varchar not null,
	telefono varchar unique not null,
	email varchar unique not null,
	ciudad varchar not null,
	departamento varchar not null
);

create table proyecto.categorias(
	id serial unique,
	identificacion varchar primary key unique,
	descripcion varchar not null
);
create table proyecto.impuestos(
	id serial unique,
	identificacion varchar primary key unique,
	nombre varchar unique not null,
	porcentaje numeric(5,2) not null
);


create table proyecto.productos(
	id serial unique,
	codigo varchar primary key unique not null,
	descripcion varchar unique not null,
	precio_venta numeric not null,
	impuesto_id_fk varchar not null,
	medida varchar not null,
	categoria_id_fk varchar not null,
	constraint fk_categoria foreign key(categoria_id_fk) references proyecto.categorias(identificacion),
	constraint fk_impuesto foreign key(impuesto_id_fk) references proyecto.impuestos(identificacion)
);

create table proyecto.inventarios(
	id serial primary key unique,
	fecha date not null,
	tipo_movimiento varchar not null,
	entrada numeric,
	salida numeric,
	observaciones varchar,
	id_producto_fk varchar not null,
	constraint fk_producto foreign key(id_producto_fk) references proyecto.productos(codigo)
);

create table proyecto.metodos_pago(
	id serial unique,
	identificacion varchar primary key unique,
	descripcion varchar not null
);

create table proyecto.facturas(
	id serial unique,
	codigo varchar primary key unique not null,
	fecha date not null,
	subtotal numeric not null,
	total_impuestos numeric,
	total numeric not null,
	estado varchar not null,
	id_cliente_fk varchar not null,
	id_metodo_pago_fk varchar not null,
	constraint fk_cliente foreign key(id_cliente_fk) references proyecto.clientes(numero_documento),
	constraint fk_metodo_pago foreign key(id_metodo_pago_fk) references proyecto.metodos_pago(identificacion)
);

create table proyecto.detalles_factura(
	id serial primary key unique,
	cantidad numeric not null,
	descuento numeric,
	valor_total numeric not null,
	id_producto_fk varchar not null,
	id_factura_fk varchar not null,
	constraint fk_producto foreign key(id_producto_fk) references proyecto.productos(codigo),
	constraint fk_factura foreign key(id_factura_fk) references proyecto.facturas(codigo)
);

create table proyecto.informes(
	id serial primary key unique,
	tipo_informe varchar not null,
	fecha date not null,
	datos_json jsonb not null
);

/********************************************************************************************************************************/

/*------CLIENTES-------*/
/*------Funcion para obtener clientes-------*/
create or replace function proyecto.obtener_clientes()
returns table(numero_documento_v varchar, nombre_v varchar, direccion_v varchar, telefono_v varchar, email_v varchar, ciudad_v varchar, departamento_v varchar)
as $$
begin
	return query
	select numero_documento,nombre,direccion,telefono,email,ciudad,departamento from proyecto.clientes;
end
$$language plpgsql;

select * from proyecto.obtener_clientes();

/*------Procedimiento para crear clientes-------*/
create or replace procedure proyecto.crear_clientes(numero_documento_v varchar, nombre_v varchar, direccion_v varchar, telefono_v varchar, email_v varchar, ciudad_v varchar, departamento_v varchar)
as $$
declare
begin
	insert into proyecto.clientes(numero_documento, nombre, direccion, telefono, email, ciudad, departamento)
	values(numero_documento_v, nombre_v, direccion_v, telefono_v, email_v, ciudad_v, departamento_v);
	exception when others then
    	raise notice 'Error al crear el cliente: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.crear_clientes('1054678930','Manuel Gomez','Cra25#28-09','3145678901','manuel.gomez@gmail.com','Manizales','Caldas');
call proyecto.crear_clientes('1002657843','Esteban Rivera','Cra23#32-45','3207654321','esteban.rivera@gmail.com','Manizales','Caldas');
/*------Procedimiento para modificar clientes-------*/
create or replace procedure proyecto.modificar_clientes(numero_documento_v varchar, nombre_v varchar, direccion_v varchar, telefono_v varchar, email_v varchar, ciudad_v varchar, departamento_v varchar)
as $$
declare
begin
	update proyecto.clientes
    set nombre = nombre_v,
        direccion = direccion_v,
        telefono = telefono_v,
        email = email_v,
        ciudad = ciudad_v,
        departamento = departamento_v
    where numero_documento = numero_documento_v;
	exception when others then
    	raise notice 'Error al modificar el cliente: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.modificar_clientes('1098765432','Manuel Gomez','Cra25#28-09','3109876543','manuel.gomez@gmail.com','Manizales','Caldas');
/*------Procedimiento para eliminar clientes-------*/
create or replace procedure proyecto.eliminar_clientes(numero_documento_v varchar)
as $$
declare
begin
	delete from proyecto.clientes
    where numero_documento = numero_documento_v;
	exception when others then
    	raise notice 'No se puedo eliminar el cliente: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.eliminar_clientes('1002657843');

/*------IMPUESTOS-------*/
/*------Funcion para obtener impuestos-------*/
create or replace function proyecto.obtener_impuestos()
returns table(p_identificacion varchar,p_nombre varchar,p_porcentaje numeric(5,2))
as $$
begin
	return query
	select identificacion,nombre,porcentaje from proyecto.impuestos;
end
$$language plpgsql;


select * from proyecto.obtener_impuestos();
/*------Procedimiento para crear impuestos-------*/
create or replace procedure proyecto.crear_impuestos(p_identificacion varchar,p_nombre varchar,p_porcentaje numeric(5,2))
as $$
declare
begin
	insert into proyecto.impuestos(identificacion,nombre,porcentaje)
	values(p_identificacion,p_nombre,p_porcentaje);
	exception when others then
    	raise notice 'Error al crear el impuesto: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.crear_impuestos('I01','IVA 19%',19.00);
call proyecto.crear_impuestos('I02','Impuesto al consumo',8.00);
call proyecto.crear_impuestos('I03','Impuesto otro',3.00);
/*------Procedimiento para modificar impuestos-------*/
create or replace procedure proyecto.modificar_impuestos(p_identificacion varchar,p_nombre varchar,p_porcentaje numeric)
as $$
declare
begin
	update proyecto.impuestos
	set nombre = p_nombre,
		porcentaje = p_porcentaje
	where identificacion = p_identificacion;
	exception when others then
    	raise notice 'Error al modificar el impuesto: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.modificar_impuestos('I01','IVA',19.00);

/*------Procedimiento para eliminar impuestos-------*/
create or replace procedure proyecto.eliminar_impuestos(p_identificacion varchar)
as $$
declare
begin
	delete from proyecto.impuestos
	where identificacion = p_identificacion;
	exception when others then
    	raise notice 'No se pudo eliminar el impuesto: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.eliminar_impuestos('I03');
/*------CATEGORIAS-------*/
/*------Funcion para obtener categorias-------*/
create or replace function proyecto.obtener_categorias()
returns table(p_identificacion varchar,p_descripcion varchar)
as $$
begin
	return query
	select identificacion,descripcion from proyecto.categorias;
end
$$language plpgsql;


select * from proyecto.obtener_categorias();

/*------Procedimiento para crear categorias-------*/
create or replace procedure proyecto.crear_catgeorias(p_identificacion varchar,p_descripcion varchar)
as $$
declare
begin
	insert into proyecto.categorias(identificacion,descripcion)
	values(p_identificacion,p_descripcion);
	exception when others then
    	raise notice 'Error al crear la categoria: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.crear_catgeorias('C01','Lacteos');
call proyecto.crear_catgeorias('C02','Verduras');
call proyecto.crear_catgeorias('C03','Granos');
call proyecto.crear_catgeorias('C04','Frutas');
call proyecto.crear_catgeorias('C05','Otras');
/*------Procedimiento para modificar categorias-------*/
create or replace procedure proyecto.modificar_categorias(p_identificacion varchar,p_descripcion varchar)
as $$
declare
begin
	if p_identificacion is null then
        raise exception 'Categoria con código % no existe', producto_codigo;
    end if;
	update proyecto.categorias
	set descripcion = p_descripcion
	where identificacion = p_identificacion;
	exception when others then
    	raise notice 'Error al modificar la categoria: %', sqlerrm;
end;
$$ language plpgsql;

drop procedure proyecto.modificar_categorias;
call proyecto.modificar_categorias('C05','Despensa');

/*------Procedimiento para eliminar categorias-------*/
create or replace procedure proyecto.eliminar_categoria(p_identificacion varchar)
as $$
declare
begin
	delete from proyecto.categorias
	where identificacion = p_identificacion;
	exception when others then
    	raise notice 'No se pudo eliminar la categoria: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.eliminar_categoria('C05');
/*------PRODUCTOS-------*/
/*Obtener Productos*/
create or replace function proyecto.obtener_productos()
returns table(
	p_codigo varchar,
    p_descripcion varchar,
    p_precio_venta numeric,
    p_impuesto_nombre varchar,
    p_impuesto_porcentaje numeric,
    p_medida varchar,
    p_categoria_nombre varchar
)
as $$
begin
	return query
	select p.codigo, p.descripcion, p.precio_venta, i.nombre,i.porcentaje, p.medida, c.descripcion
	from proyecto.productos p
	join proyecto.impuestos i on p.impuesto_id_fk=i.identificacion
	join proyecto.categorias c on p.categoria_id_fk=c.identificacion;
end
$$language plpgsql;

select * from proyecto.obtener_productos();

/*------Procedimiento para crear productos-------*/
create or replace procedure proyecto.crear_productos(
	p_codigo varchar,
    p_descripcion varchar,
    p_precio_venta numeric,
    p_impuesto_id varchar,
    p_medida varchar,
    p_categoria_id varchar
)
as $$
declare
begin
	insert into proyecto.productos (codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk)
    values (p_codigo, p_descripcion, p_precio_venta, p_impuesto_id, p_medida, p_categoria_id);
	exception when others then
    	raise notice 'Error al crear el producto: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.crear_productos('6785B','Queso campesino',10000,'I01','Unidad','C01');
call proyecto.crear_productos('6786B','Leche deslactosada x6',23800,'I01','Unidad','C01');
call proyecto.crear_productos('6787B','Leche entera x3',21900,'I01','Unidad','C01');
call proyecto.crear_productos('3765A','Manzana',4500,'I01','Kilo','C04');

/*------Procedimiento para modificar productos-------*/
create or replace procedure proyecto.modificar_productos(
	p_codigo varchar,
    p_descripcion varchar,
    p_precio_venta numeric,
    p_impuesto_id varchar,
    p_medida varchar,
    p_categoria_id varchar
)
as $$
declare
begin
	update proyecto.productos
    set descripcion = p_descripcion,
        precio_venta = p_precio_venta,
        impuesto_id_fk = p_impuesto_id,
        medida = p_medida,
        categoria_id_fk = p_categoria_id
    where codigo = p_codigo;
	exception when others then
    	raise notice 'Error al modificar el producto: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.modificar_productos('6787B','Leche entera x6',21900,'I01','Unidad','C01');


/*------Procedimiento para eliminar productos-------*/
create or replace procedure proyecto.eliminar_productos(p_codigo varchar)
as $$
declare
begin
	delete from proyecto.productos
    where codigo = p_codigo;
	exception when others then
    	raise notice 'No se pudo eliminar el producto: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.eliminar_productos('6788B');

/*------Procedimiento para Agregar Stock-------*/
create or replace procedure proyecto.stock_productos(p_codigo varchar,p_tipo_movimiento varchar,p_cantidad integer,p_observaciones varchar)
as $$
begin
    -- Verificar si el producto existe
    if p_codigo is null then
        raise exception 'Producto con código % no existe', producto_codigo;
    end if;

    -- Registrar el movimiento en la tabla de Inventario
    insert into proyecto.inventarios(fecha, tipo_movimiento, entrada, salida, observaciones, id_producto_fk)
    values (CURRENT_TIMESTAMP, p_tipo_movimiento,
            case when p_tipo_movimiento = 'entrada' then p_cantidad else 0 end,
            case when p_tipo_movimiento = 'salida' then p_cantidad else 0 end,
            p_observaciones, p_codigo);
end;
$$ language plpgsql;

drop procedure proyecto.stock_productos;

select * from proyecto.inventarios;

call proyecto.stock_productos('6785B','entrada',20,'');

/*------Funcion para buscar producto por nombre-------*/
create or replace function proyecto.obtener_productos_nombre(nombre_producto varchar)
returns table(
	p_codigo varchar,
    p_descripcion varchar,
    p_precio_venta numeric,
    p_impuesto_nombre varchar,
    p_impuesto_porcentaje numeric,
    p_medida varchar,
    p_categoria_nombre varchar
)
as $$
begin
	return query
	select p.codigo, p.descripcion, p.precio_venta, i.nombre,i.porcentaje, p.medida, c.descripcion
	from proyecto.productos p
	join proyecto.impuestos i on p.impuesto_id_fk=i.identificacion
	join proyecto.categorias c on p.categoria_id_fk=c.identificacion
	where p.descripcion=nombre_producto;
end
$$language plpgsql;


select * from proyecto.obtener_productos_nombre('Queso campesino');
/*------Funcion para buscar producto por codigo-------*/
create or replace function proyecto.obtener_productos_codigo(codigo_producto varchar)
returns table(
	p_codigo varchar,
    p_descripcion varchar,
    p_precio_venta numeric,
    p_impuesto_nombre varchar,
    p_impuesto_porcentaje numeric,
    p_medida varchar,
    p_categoria_nombre varchar
)
as $$
begin
	return query
	select p.codigo, p.descripcion, p.precio_venta, i.nombre,i.porcentaje, p.medida, c.descripcion
	from proyecto.productos p
	join proyecto.impuestos i on p.impuesto_id_fk=i.identificacion
	join proyecto.categorias c on p.categoria_id_fk=c.identificacion
	where p.codigo=codigo_producto;
end
$$language plpgsql;

select * from proyecto.obtener_productos_codigo('6787B');

/*------Funcion para buscar producto por categoria-------*/
create or replace function proyecto.obtener_productos_categoria(categoria_producto varchar)
returns table(
	p_codigo varchar,
    p_descripcion varchar,
    p_precio_venta numeric,
    p_impuesto_nombre varchar,
    p_impuesto_porcentaje numeric,
    p_medida varchar,
    p_categoria_nombre varchar
)
as $$
begin
	return query
	select p.codigo, p.descripcion, p.precio_venta, i.nombre,i.porcentaje, p.medida, c.descripcion
	from proyecto.productos p
	join proyecto.impuestos i on p.impuesto_id_fk=i.identificacion
	join proyecto.categorias c on p.categoria_id_fk=c.identificacion
	where c.descripcion=categoria_producto;
end
$$language plpgsql;

select * from proyecto.obtener_productos_categoria('Lacteos');

