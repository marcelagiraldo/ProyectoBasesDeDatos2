/*------IMPUESTOS-------*/
/*------Funcion para obtener impuestos-------*/
create or replace function proyecto.obtener_impuestos()
returns table(id_ bigint, p_identificacion varchar,p_nombre varchar,p_porcentaje numeric(5,2))
as $$
begin
	return query
	select id,identificacion,nombre,porcentaje from proyecto.impuestos;
end
$$language plpgsql;

select * from proyecto.obtener_impuestos();
/*------Procedimiento para crear impuestos-------*/
create or replace procedure proyecto.crear_impuestos(p_identificacion varchar,p_nombre varchar,p_porcentaje numeric(5,2))
as $$
declare 
begin 
	insert into proyecto.impuestos(id,identificacion,nombre,porcentaje)
	values(nextval('proyecto.codigo_impuesto'),p_identificacion,p_nombre,p_porcentaje);
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