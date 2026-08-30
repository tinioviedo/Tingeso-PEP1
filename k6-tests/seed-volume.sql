-- VOLUME TESTING — poblar la tabla reservations con datos ficticios
--
-- Objetivo: medir cómo se degrada el endpoint de Reportes (Épica 7) a medida
-- que crece el volumen de datos en la BD, manteniendo constante la carga de
-- usuarios concurrentes.
--
-- La cantidad de registros a insertar se pasa como variable :cantidad
--
-- Uso (desde la raíz del proyecto):
--   docker exec -i tingeso-pep1-postgres-1 psql -U postgres -d travelagency \
--     -v cantidad=500 -f - < k6-tests/seed-volume.sql
--
-- Limpiar entre escenarios (deja solo las reservas originales, id <= 100):
--   docker exec tingeso-pep1-postgres-1 psql -U postgres -d travelagency \
--     -c "DELETE FROM reservations WHERE id > 100;"

INSERT INTO reservations (
    base_amount,
    client_id,
    discount_amount,
    quantity,
    reservation_date,
    reservation_status,
    total_amount,
    package_id
)
SELECT
    2000 + (random() * 3000)::int,                        -- monto base entre 2000 y 5000
    (SELECT id FROM clients ORDER BY random() LIMIT 1),   -- cliente existente al azar
    0,
    1 + (random() * 4)::int,                              -- entre 1 y 5 pasajeros
    -- Fecha dentro de 2026, para que caiga en el rango consultado por el reporte
    TIMESTAMP '2026-01-01' + (random() * 364) * INTERVAL '1 day',
    'CONFIRMED',
    2000 + (random() * 3000)::int,
    (SELECT id FROM packages ORDER BY random() LIMIT 1)   -- paquete existente al azar
FROM generate_series(1, :cantidad);

SELECT COUNT(*) AS total_reservas FROM reservations;
