/*------PRODUCTOS-------*/
/*Obtener Productos*/
create or replace function proyecto.obtener_productos()
returns table(
	id_ bigint,
	p_codigo varchar,
    p_descripcion varchar,
    p_precio_venta numeric,
    p_impuesto_id varchar,
    p_impuesto_nombre varchar,
    p_impuesto_porcentaje numeric,
    p_medida varchar,
    p_categoria_id varchar,
    p_categoria_nombre varchar,
    p_stock numeric
)
as $$
begin
	return query
	select p.id,p.codigo, p.descripcion, p.precio_venta,
	i.identificacion AS p_impuesto_id, i.nombre AS p_impuesto_nombre,i.porcentaje AS p_impuesto_porcentaje,
	p.medida,c.identificacion AS p_categoria_id ,c.descripcion AS p_categoria_nombre, p.cantidad
	from proyecto.productos p
	join proyecto.impuestos i on p.impuesto_id_fk=i.identificacion
	join proyecto.categorias c on p.categoria_id_fk=c.identificacion;
end
$$language plpgsql;
drop function proyecto.obtener_productos;
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
	insert into proyecto.productos (id,codigo, descripcion, precio_venta, impuesto_id_fk, medida, categoria_id_fk)
    values (nextval('proyecto.codigo_impuesto'),p_codigo, p_descripcion, p_precio_venta, p_impuesto_id, p_medida, p_categoria_id);
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

call proyecto.eliminar_productos('2121B');

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


/*------METODOS DE PAGO-------*/
/*------Funcion para obtener METODOS DE PAGO-------*/
create or replace function proyecto.obtener_metodos_pago()
returns table(id_ bigint,p_identificacion varchar,p_descripcion varchar)
as $$
begin
	return query
	select id,identificacion,descripcion from proyecto.metodos_pago;
end
$$language plpgsql;


select * from proyecto.obtener_metodos_pago();


/*------Procedimiento para crear metodos pago-------*/
create or replace procedure proyecto.crear_metodos_pago(p_identificacion varchar,p_descripcion varchar)
as $$
declare 
begin 
	insert into proyecto.metodos_pago(id,identificacion,descripcion)
	values(nextval('proyecto.codigo_metodo_pago'),p_identificacion,p_descripcion);
	exception when others then
    	raise notice 'Error al crear el metodo de pago: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.crear_metodos_pago('M03','Davi');
/*------Procedimiento para modificar metodos de pago-------*/
create or replace procedure proyecto.modificar_metodo_pago(p_identificacion varchar,p_descripcion varchar)
as $$
declare 
begin 
	if p_identificacion is null then
        raise exception 'Metodo de pago con código % no existe', producto_codigo;
    end if;
	update proyecto.metodoS_pago
	set descripcion = p_descripcion
	where identificacion = p_identificacion;
	exception when others then
    	raise notice 'Error al modificar el metodo de pago: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.modificar_metodo_pago('M01','TRANSFERENCIA');

/*------Procedimiento para eliminar metodos de pago-------*/
create or replace procedure proyecto.eliminar_metodos_pago(p_identificacion varchar)
as $$
declare 
begin 
	delete from proyecto.metodos_pago
	where identificacion = p_identificacion;
	exception when others then
    	raise notice 'No se pudo eliminar metodo pago: %', sqlerrm;
end;
$$ language plpgsql;

call proyecto.eliminar_categoria('M03');


