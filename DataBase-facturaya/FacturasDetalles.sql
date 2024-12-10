	CREATE OR REPLACE procedure proyecto.crear_factura(
	    p_codigo_factura VARCHAR,
	    p_fecha DATE,
	    p_id_cliente_fk VARCHAR,
	    p_id_metodo_pago_fk VARCHAR,
	    p_productos JSONB, -- Lista de productos en formato JSONB (id_producto, cantidad, descuento)
	    p_descuento_factura NUMERIC DEFAULT 0 -- Descuento global para la factura
	)
	AS $$
	DECLARE
	    subtotal_ NUMERIC := 0;
	    total_impuestos_ NUMERIC := 0;
	    total_ NUMERIC := 0;
	    producto JSONB;
	    impuesto_producto_ NUMERIC;
	    valor_total_producto_ NUMERIC;
	    id_producto_ VARCHAR;
	    cantidad_ NUMERIC;
	    descuento_producto_ NUMERIC;
	    precio_venta_ NUMERIC;
	    tasa_impuesto_ NUMERIC;
	    stock_actual_ NUMERIC;
	BEGIN
		RAISE NOTICE 'Iniciando procedimiento crear_factura';
	    -- Verificar si el cliente existe
	    IF NOT EXISTS (
	        SELECT 1 FROM proyecto.clientes WHERE numero_documento = p_id_cliente_fk
	    ) THEN
	        RAISE EXCEPTION 'El cliente con ID % no existe.', p_id_cliente_fk;
	    END IF;
	
	    -- Insertar factura
	    INSERT INTO proyecto.facturas (
	        id, codigo, fecha, subtotal, total_impuestos, total, estado, id_cliente_fk, id_metodo_pago_fk
	    ) VALUES (
	        nextval('proyecto.codigo_factura'), -- Usar secuencia para generar ID
	        p_codigo_factura,
	        CURRENT_TIMESTAMP,	
	        0, -- Se calculará más adelante
	        0,
	        0,
	        'pendiente',
	        p_id_cliente_fk,
	        p_id_metodo_pago_fk
	    );
		RAISE NOTICE 'Factura creada con código: %', p_codigo_factura;
	    -- Iterar sobre los productos
	    FOR producto IN SELECT * FROM jsonb_array_elements(p_productos)
	    LOOP
	        -- Extraer los valores del JSONB
	        id_producto_ := producto->>'id_producto';
	        cantidad_ := (producto->>'cantidad')::NUMERIC;
	        descuento_producto_ := COALESCE((producto->>'descuento')::NUMERIC, 0);
	
	        -- Verificar existencia del producto
	        SELECT p.precio_venta, p.cantidad, i.porcentaje
	        INTO precio_venta_, stock_actual_, tasa_impuesto_
	        FROM proyecto.productos p
	        JOIN proyecto.impuestos i ON p.impuesto_id_fk = i.identificacion
	        WHERE p.codigo = id_producto_;
	
	        IF stock_actual_ < cantidad_ THEN
	            RAISE EXCEPTION 'Stock insuficiente para el producto %.', id_producto_;
	        END IF;
	
	        -- Calcular impuestos y valor total por producto
	        valor_total_producto_ := precio_venta_ * cantidad_;
	        impuesto_producto_ := valor_total_producto_ * (tasa_impuesto_ / 100);
	        valor_total_producto_ := valor_total_producto_ + impuesto_producto_ - descuento_producto_;
	
	        -- Insertar detalle de la factura
	        INSERT INTO proyecto.detalles_factura (
	            id, cantidad, descuento, valor_total, id_producto_fk, id_factura_fk
	        ) VALUES (
	            nextval('proyecto.codigo_detalle_factura'),
	            cantidad_,
	            descuento_producto_,
	            valor_total_producto_,
	            id_producto_,
	            p_codigo_factura
	        );
	
	        -- Actualizar inventario
	        UPDATE proyecto.productos
	        SET cantidad = stock_actual_ - cantidad_
	        WHERE codigo = id_producto_;
	
	        -- Acumular valores para la factura
	        subtotal_ := subtotal_ + (precio_venta_ * cantidad_ - descuento_producto_);
	        total_impuestos_ := total_impuestos_ + impuesto_producto_;
	    END LOOP;
	
	    -- Aplicar descuento global a la factura
	    total_ := subtotal_ + total_impuestos_ - p_descuento_factura;
	
	    -- Actualizar la factura con los valores calculados
	    UPDATE proyecto.facturas
	    SET subtotal = subtotal_,
	        total_impuestos = total_impuestos_,
	        total = total_
	    WHERE codigo = p_codigo_factura;
	COMMIT;
	END;
	$$ LANGUAGE plpgsql;


call proyecto.crear_factura(
    'FAC001',
    '2024-12-06',
    '30234876',
    'M02',
    '[{"id_producto": "6785B", "cantidad": 2, "descuento": 0}, {"id_producto": "6787B", "cantidad": 1, "descuento": 3}]',
    5 -- Descuento global
);

call proyecto.crear_factura(
    'FAC002',
    '2024-12-06',
    '30234876',
    'M01',
    '[{"id_producto": "6785B", "cantidad": 2, "descuento": 0}, {"id_producto": "6787B", "cantidad": 1, "descuento": 3}]',
    5 -- Descuento global
);

CALL proyecto.crear_factura(
    'FAC005', 
    CURRENT_DATE, 
    '30234876', 
    'M01', 
    '[{"id_producto": "6785B", "cantidad": 2, "descuento": 10}]',
    0
);


select * from proyecto.facturas f; 
select * from proyecto.detalles_factura df;


CREATE OR REPLACE FUNCTION proyecto.actualizar_metodo_pago(
    p_codigo_factura VARCHAR,
    p_metodo_pago_id VARCHAR
)
RETURNS VOID AS $$
DECLARE
    metodo_pago_existente BOOLEAN;
    factura_existente BOOLEAN;
BEGIN
    -- Validar que el método de pago existe
    SELECT EXISTS(
        SELECT 1
        FROM proyecto.metodos_pago
        WHERE identificacion = p_metodo_pago_id
    ) INTO metodo_pago_existente;

    IF NOT metodo_pago_existente THEN
        RAISE EXCEPTION 'El método de pago con ID % no existe.', p_metodo_pago_id;
    END IF;

    -- Validar que la factura existe
    SELECT EXISTS(
        SELECT 1
        FROM proyecto.facturas
        WHERE codigo = p_codigo_factura
    ) INTO factura_existente;

    IF NOT factura_existente THEN
        RAISE EXCEPTION 'La factura con código % no existe.', p_codigo_factura;
    END IF;

    -- Actualizar el método de pago de la factura
    UPDATE proyecto.facturas
    SET id_metodo_pago_fk = p_metodo_pago_id
    WHERE codigo = p_codigo_factura;

    RAISE NOTICE 'El método de pago de la factura % ha sido actualizado a %.', p_codigo_factura, p_metodo_pago_id;
END;
$$ LANGUAGE plpgsql;

drop function proyecto.generar_xml_factura;

CREATE OR REPLACE PROCEDURE proyecto.generar_xml_factura(p_codigo_factura VARCHAR)
AS $$
DECLARE
    factura JSONB;
    detalles JSONB;
    xml_factura XML;
    detalle JSONB; -- Cambiado a JSONB
BEGIN
    -- Obtener datos de la factura
    SELECT row_to_json(f)::JSONB
    INTO factura
    FROM (
        SELECT f.codigo, f.fecha, f.subtotal, f.total_impuestos, f.total, c.nombre AS cliente, mp.descripcion AS metodo_pago
        FROM proyecto.facturas f
        JOIN proyecto.clientes c ON f.id_cliente_fk = c.numero_documento
        JOIN proyecto.metodos_pago mp ON f.id_metodo_pago_fk = mp.identificacion
        WHERE f.codigo = p_codigo_factura
    ) f;

    IF factura IS NULL THEN
        RAISE EXCEPTION 'Factura con código % no encontrada.', p_codigo_factura;
    END IF;

    -- Obtener detalles de la factura
    SELECT jsonb_agg(row_to_json(d))::JSONB
    INTO detalles
    FROM (
        SELECT 
            df.cantidad, 
            df.descuento, 
            df.valor_total, 
            p.descripcion AS producto 
        FROM proyecto.detalles_factura df
        JOIN proyecto.productos p ON df.id_producto_fk = p.codigo
        WHERE df.id_factura_fk = p_codigo_factura
    ) d;

    -- Construir XML
    xml_factura := 
    '<?xml version="1.0" encoding="UTF-8"?>' ||
    '<Factura>' ||
    '<Codigo>' || factura->>'codigo' || '</Codigo>' ||
    '<Fecha>' || factura->>'fecha' || '</Fecha>' ||
    '<Cliente>' || factura->>'cliente' || '</Cliente>' ||
    '<MetodoPago>' || factura->>'metodo_pago' || '</MetodoPago>' ||
    '<Subtotal>' || factura->>'subtotal' || '</Subtotal>' ||
    '<TotalImpuestos>' || factura->>'total_impuestos' || '</TotalImpuestos>' ||
    '<Total>' || factura->>'total' || '</Total>' ||
    '<Detalles>';

    -- Iterar sobre los detalles
    FOR detalle IN SELECT * FROM jsonb_array_elements(detalles) LOOP
        xml_factura := xml_factura ||
        '<Detalle>' ||
        '<Producto>' || detalle->>'producto' || '</Producto>' ||
        '<Cantidad>' || detalle->>'cantidad' || '</Cantidad>' ||
        '<Descuento>' || detalle->>'descuento' || '</Descuento>' ||
        '<ValorTotal>' || detalle->>'valor_total' || '</ValorTotal>' ||
        '</Detalle>';
    END LOOP;

    xml_factura := xml_factura || '</Detalles></Factura>';

    -- Guardar XML en la tabla
    INSERT INTO proyecto.xml_facturas (codigo_factura, xml_contenido)
    VALUES (p_codigo_factura, xml_factura::XML);
END;
$$ LANGUAGE plpgsql;

call proyecto.generar_xml_factura('FAC002');

drop function proyecto.informe_top;

create or replace function proyecto.informe_top()
returns table(codigo_producto varchar,nombre_producto varchar,total_vendido numeric,facturas text)
as $$ 
begin
	return query
	SELECT p.codigo AS codigo_producto, p.descripcion AS nombre_producto,
	    SUM(df.cantidad) AS total_vendido, STRING_AGG(f.codigo, ', ') AS facturas
		FROM proyecto.detalles_factura df 
		JOIN proyecto.productos p ON df.id_producto_fk = p.codigo
		JOIN proyecto.facturas f ON df.id_factura_fk = f.codigo
		GROUP BY p.codigo, p.descripcion
		ORDER BY total_vendido DESC
		LIMIT 10;
end
$$ LANGUAGE plpgsql;

select * from proyecto.informe_top();
drop FUNCTION proyecto.informe_ventas;

CREATE OR REPLACE FUNCTION proyecto.informe_ventas(
    p_mes INTEGER,
    p_anio INTEGER
) 
RETURNS TABLE (
    codigo_factura VARCHAR,
    fecha_factura DATE,
    codigo_producto VARCHAR,
    nombre_producto VARCHAR,
    cantidad_vendida NUMERIC,
    valor_total_producto NUMERIC,
    subtotal_factura NUMERIC,
    impuestos_factura NUMERIC,
    total_factura NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.codigo AS codigo_factura,
        f.fecha AS fecha_factura,
        p.codigo AS codigo_producto,
        p.descripcion AS nombre_producto,
        df.cantidad AS cantidad_vendida,
        df.valor_total AS valor_total_producto,
        f.subtotal AS subtotal_factura,
        f.total_impuestos AS impuestos_factura,
        f.total AS total_factura
    FROM 
        proyecto.facturas f
    JOIN 
        proyecto.detalles_factura df ON f.codigo = df.id_factura_fk
    JOIN 
        proyecto.productos p ON df.id_producto_fk = p.codigo
    WHERE 
        DATE_PART('month', f.fecha) = p_mes
        AND DATE_PART('year', f.fecha) = p_anio
    ORDER BY 
        f.fecha, f.codigo;
END;
$$;

CREATE OR REPLACE FUNCTION proyecto.resumen_ventas(
    p_mes INTEGER,
    p_anio INTEGER
) 
RETURNS TABLE (
    mes INTEGER,
    anio INTEGER,
    total_subtotal NUMERIC,
    total_impuestos NUMERIC,
    total_facturado NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_PART('month', f.fecha)::INTEGER AS mes,
        DATE_PART('year', f.fecha)::INTEGER AS anio,
        SUM(f.subtotal) AS total_subtotal,
        SUM(f.total_impuestos) AS total_impuestos,
        SUM(f.total) AS total_facturado
    FROM 
        proyecto.facturas f
    WHERE 
        DATE_PART('month', f.fecha) = p_mes
        AND DATE_PART('year', f.fecha) = p_anio
    GROUP BY 
        DATE_PART('month', f.fecha), DATE_PART('year', f.fecha);
END;
$$;

select * from proyecto.informe_ventas(12,2024);

SELECT 
    f.codigo AS codigo_factura,
    f.fecha AS fecha_factura,
    p.codigo AS codigo_producto,
    p.descripcion AS nombre_producto,
    df.cantidad AS cantidad_vendida,
    df.valor_total AS valor_total_producto,
    f.subtotal AS subtotal_factura,
    f.total_impuestos AS impuestos_factura,
    f.total AS total_factura
FROM 
    proyecto.facturas f
JOIN 
    proyecto.detalles_factura df ON f.codigo = df.id_factura_fk
JOIN 
    proyecto.productos p ON df.id_producto_fk = p.codigo
WHERE 
    DATE_PART('month', f.fecha) = :mes
    AND DATE_PART('year', f.fecha) = :anio
ORDER BY 
    f.fecha, f.codigo;

-- Resumen de totales facturados en el mes
SELECT 
    DATE_PART('month', f.fecha) AS mes,
    DATE_PART('year', f.fecha) AS anio,
    SUM(f.subtotal) AS total_subtotal,
    SUM(f.total_impuestos) AS total_impuestos,
    SUM(f.total) AS total_facturado
FROM 
    proyecto.facturas f
WHERE 
    DATE_PART('month', f.fecha) = :mes
    AND DATE_PART('year', f.fecha) = :anio
GROUP BY 
    DATE_PART('month', f.fecha), DATE_PART('year', f.fecha);

