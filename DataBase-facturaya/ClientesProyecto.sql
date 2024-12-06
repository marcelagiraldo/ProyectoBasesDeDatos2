/*------CLIENTES-------*/
/*------Funcion para obtener clientes-------*/
create or replace function proyecto.obtener_clientes()
returns table(id_ bigint ,numero_documento_v varchar, nombre_v varchar, direccion_v varchar, telefono_v varchar, email_v varchar, ciudad_v varchar, departamento_v varchar)
as $$
begin
	return query
	select id, numero_documento,nombre,direccion,telefono,email,ciudad,departamento from proyecto.clientes;
end
$$language plpgsql;

select * from proyecto.obtener_clientes();

create or replace function proyecto.obtener_cliente(numero_documento_p varchar)
returns table(id_ bigint ,numero_documento_v varchar, nombre_v varchar, direccion_v varchar, telefono_v varchar, email_v varchar, ciudad_v varchar, departamento_v varchar)
as $$
begin
	return query
	select id, numero_documento,nombre,direccion,telefono,email,ciudad,departamento from proyecto.clientes where numero_documento=numero_documento_p;
end
$$language plpgsql;

select * from proyecto.obtener_cliente('30234876');

create or replace function proyecto.obtener_cliente_documento(numero_documento_p varchar)
returns table(numero_documento_v varchar, nombre_v varchar)
as $$
begin
	return query
	select numero_documento,nombre from proyecto.clientes where numero_documento=numero_documento_p;
end
$$language plpgsql;

select * from proyecto.obtener_cliente_documento('30234876');

create or replace function proyecto.obtener_cliente_nombre(nombre_ varchar)
returns table(numero_documento_v varchar, nombre_v varchar)
as $$
begin
	return query
	select numero_documento,nombre from proyecto.clientes where nombre=nombre_;
end
$$language plpgsql;

select * from proyecto.obtener_cliente_nombre('Felipe Gomez');

/*------Procedimiento para crear clientes-------*/
create or replace procedure proyecto.crear_clientes(numero_documento_v varchar, nombre_v varchar, direccion_v varchar, telefono_v varchar, email_v varchar, ciudad_v varchar, departamento_v varchar)
as $$
declare 
begin 
	insert into proyecto.clientes(id,numero_documento, nombre, direccion, telefono, email, ciudad, departamento)
	values(nextval('proyecto.codigo_cliente'),numero_documento_v, nombre_v, direccion_v, telefono_v, email_v, ciudad_v, departamento_v);
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