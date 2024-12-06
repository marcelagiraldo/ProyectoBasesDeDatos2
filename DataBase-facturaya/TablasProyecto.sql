--Creacion de tablas

--Tabla clientes
create table proyecto.clientes(
	id bigint unique,
	numero_documento varchar(10) primary key unique not null,
	nombre varchar not null,
	direccion varchar not null,
	telefono varchar unique not null,
	email varchar unique not null,
	ciudad varchar not null,
	departamento varchar not null
);

--Tabla categorias
create table proyecto.categorias(
	id bigint unique,
	identificacion varchar primary key unique,
	descripcion varchar not null
);

--Tabla impuestos
create table proyecto.impuestos(
	id bigint unique,
	identificacion varchar primary key unique,
	nombre varchar unique not null,
	porcentaje numeric(5,2) not null
);

--Tabla productos
create table proyecto.productos(
	id bigint unique,
	codigo varchar primary key unique not null,
	descripcion varchar unique not null,
	precio_venta numeric not null,
	impuesto_id_fk varchar not null,
	medida varchar not null,
	categoria_id_fk varchar not null,
	constraint fk_categoria foreign key(categoria_id_fk) references proyecto.categorias(identificacion),
	constraint fk_impuesto foreign key(impuesto_id_fk) references proyecto.impuestos(identificacion)
);
ALTER TABLE proyecto.productos
ADD COLUMN cantidad numeric NOT NULL DEFAULT 0;
--Tabla inventarios
create table proyecto.inventarios(
	id bigint unique,
	codigo varchar primary key unique,
	fecha date not null,
	tipo_movimiento varchar not null,
	entrada numeric,
	salida numeric,
	observaciones varchar,
	id_producto_fk varchar not null,
	constraint fk_producto foreign key(id_producto_fk) references proyecto.productos(codigo)
);
ALTER TABLE proyecto.inventarios
DROP COLUMN codigo;
--Tabla metodos de pago
create table proyecto.metodos_pago(
	id bigint unique,
	identificacion varchar primary key unique,
	descripcion varchar not null
);

--Tabla facturas
create table proyecto.facturas(
	id bigint unique,
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

--Tabla detalles factura
create table proyecto.detalles_factura(
	id bigint primary key unique,
	cantidad numeric not null,
	descuento numeric,
	valor_total numeric not null,
	id_producto_fk varchar not null,
	id_factura_fk varchar not null,
	constraint fk_producto foreign key(id_producto_fk) references proyecto.productos(codigo),
	constraint fk_factura foreign key(id_factura_fk) references proyecto.facturas(codigo)
);

--Tabla informes
create table proyecto.informes(
	id bigint primary key unique,
	tipo_informe varchar not null,
	fecha date not null,
	datos_json jsonb not null
);

/*--------SECUENCIAS---------*/
create sequence proyecto.codigo_cliente
	start with 001
	increment by 1;

create sequence proyecto.codigo_impuesto
	start with 001
	increment by 1;

create sequence proyecto.codigo_categoria
	start with 001
	increment by 1;

create sequence proyecto.codigo_producto
	start with 001
	increment by 1;

create sequence proyecto.codigo_factura
	start with 001
	increment by 1;

create sequence proyecto.codigo_metodo_pago
	start with 001
	increment by 1;

create sequence proyecto.codigo_detalle_factura
	start with 001
	increment by 1;

create sequence proyecto.codigo_informe
	start with 001
	increment by 1;

create sequence proyecto.codigo_inventario
	start with 001
	increment by 1;
