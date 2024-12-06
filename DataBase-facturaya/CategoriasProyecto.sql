/*------CATEGORIAS-------*/
/*------Funcion para obtener categorias-------*/
create or replace function proyecto.obtener_categorias()
returns table(id_ bigint,p_identificacion varchar,p_descripcion varchar)
as $$
begin
	return query
	select id,identificacion,descripcion from proyecto.categorias;
end
$$language plpgsql;

select * from proyecto.obtener_categorias();

/*------Procedimiento para crear categorias-------*/
create or replace procedure proyecto.crear_catgeorias(p_identificacion varchar,p_descripcion varchar)
as $$
declare 
begin 
	insert into proyecto.categorias(id,identificacion,descripcion)
	values(nextval('proyecto.codigo_categoria'),p_identificacion,p_descripcion);
	exception when others then
    	raise notice 'Error al crear la categoria: %', sqlerrm;
end;
$$ language plpgsql;
delete from proyecto.categorias ;
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