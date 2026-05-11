-- ============================================================
-- TravelAgency - Initial Data Script
-- ============================================================

-- Packages
CREATE TABLE IF NOT EXISTS packages (
    id BIGSERIAL PRIMARY KEY,
    package_name VARCHAR(255),
    destination VARCHAR(255),
    price DOUBLE PRECISION,
    slots INTEGER,
    available_slots INTEGER,
    package_status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    trip_type VARCHAR(100),
    description TEXT,
    included_services TEXT,
    conditions TEXT
);

CREATE TABLE IF NOT EXISTS discounts (
    id BIGSERIAL PRIMARY KEY,
    discount_type VARCHAR(50),
    min_threshold DOUBLE PRECISION,
    discount_rate DOUBLE PRECISION,
    active BOOLEAN
);

CREATE TABLE IF NOT EXISTS promotions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    discount_rate DOUBLE PRECISION,
    start_date DATE,
    end_date DATE,
    active BOOLEAN
);

CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    active BOOLEAN,
    email VARCHAR(255),
    full_name VARCHAR(255),
    id_document VARCHAR(255),
    nationality VARCHAR(255),
    phone VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    applied_discounts TEXT,
    base_amount DOUBLE PRECISION,
    discount_amount DOUBLE PRECISION,
    quantity INTEGER,
    reservation_date TIMESTAMP,
    reservation_status VARCHAR(50),
    total_amount DOUBLE PRECISION,
    client_id BIGINT REFERENCES clients(id),
    package_id BIGINT REFERENCES packages(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    amount DOUBLE PRECISION,
    card_expiration VARCHAR(255),
    card_number VARCHAR(255),
    cvv VARCHAR(255),
    payment_date TIMESTAMP,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    reservation_id BIGINT REFERENCES reservations(id)
);

-- ============================================================
-- Insert packages only if table is empty
-- ============================================================
INSERT INTO packages (package_name, destination, price, slots, available_slots, package_status, start_date, end_date, trip_type, description, included_services, conditions)
SELECT * FROM (VALUES
(
  'NBA Playoffs - Knicks en el Madison Square Garden',
  'New York, USA',
  2500.0,
  20,
  20,
  'AVAILABLE',
  DATE '2026-08-15',
  DATE '2026-08-22',
  'Deportivo',
  'Vive la experiencia única de los playoffs de la NBA en el mítico Madison Square Garden apoyando a los New York Knicks en pleno corazón de Manhattan.',
  'Vuelo ida y vuelta, hotel 4 estrellas 7 noches, entrada al partido de playoffs, tour por Manhattan, traslados aeropuerto',
  'No incluye comidas. Pasaporte vigente obligatorio. No reembolsable una vez iniciado el viaje.'
),
(
  'Teatro de los Sueños - Manchester United en Old Trafford',
  'Manchester, Inglaterra',
  2200.0,
  18,
  18,
  'AVAILABLE',
  DATE '2026-09-05',
  DATE '2026-09-12',
  'Deportivo',
  'Siente la magia de Old Trafford, el legendario Teatro de los Sueños. Vive un partido de la Premier League junto a los fanáticos del Manchester United.',
  'Vuelo ida y vuelta, hotel 4 estrellas 7 noches, entrada al partido en Old Trafford, tour por el estadio y museo, traslados',
  'No incluye comidas. Pasaporte vigente obligatorio. Entrada sujeta a disponibilidad de fixture.'
),
(
  'ATP Roma - Internazionali BNL d''Italia',
  'Roma, Italia',
  1900.0,
  15,
  15,
  'AVAILABLE',
  DATE '2026-10-08',
  DATE '2026-10-15',
  'Deportivo',
  'Disfruta del mejor tenis sobre tierra batida en el Foro Itálico de Roma, uno de los torneos Masters 1000 más prestigiosos del circuito ATP.',
  'Vuelo ida y vuelta, hotel 4 estrellas 7 noches, entradas al torneo ATP, visita al Coliseo y Vaticano, traslados',
  'No incluye comidas. Pasaporte vigente obligatorio. Entradas sujetas a disponibilidad.'
),
(
  'Final UEFA Champions League - Londres',
  'Londres, Inglaterra',
  3200.0,
  12,
  12,
  'AVAILABLE',
  DATE '2026-11-20',
  DATE '2026-11-27',
  'Deportivo',
  'Sé parte de la noche más grande del fútbol europeo. Vive la final de la UEFA Champions League en el estadio de Wembley, en el corazón de Londres.',
  'Vuelo ida y vuelta, hotel 5 estrellas 7 noches, entrada a la final de Champions, city tour Londres, traslados',
  'Pasaporte vigente obligatorio. No reembolsable. Disponibilidad limitada de entradas.'
),
(
  'Mundial de Fútbol 2026 - Ciudad de México',
  'Ciudad de México, México',
  2800.0,
  25,
  25,
  'AVAILABLE',
  DATE '2026-07-10',
  DATE '2026-07-18',
  'Deportivo',
  'Vive el evento deportivo más grande del planeta. El Mundial de Fútbol 2026 llega a México y tú puedes estar ahí para verlo en el Estadio Azteca.',
  'Vuelo ida y vuelta, hotel 4 estrellas 8 noches, 2 entradas a partidos de la fase de grupos, city tour CDMX, traslados',
  'Pasaporte vigente obligatorio. Partidos sujetos a fixture oficial FIFA. No reembolsable.'
),
(
  'F1 Gran Premio de Mónaco',
  'Monte Carlo, Mónaco',
  4500.0,
  10,
  10,
  'AVAILABLE',
  DATE '2026-08-22',
  DATE '2026-08-28',
  'Deportivo',
  'El Gran Premio de Mónaco es la carrera más glamorosa y exclusiva de la Fórmula 1. Vívela desde los paddocks con acceso especial al circuito urbano.',
  'Vuelo ida y vuelta, hotel de lujo 5 estrellas 6 noches, entrada al GP de Mónaco, acceso paddock, cena de gala, traslados',
  'Pasaporte vigente obligatorio. Dress code elegante requerido en eventos nocturnos. No reembolsable.'
),
(
  'Rock in Rio 2026',
  'Río de Janeiro, Brasil',
  1600.0,
  30,
  30,
  'AVAILABLE',
  DATE '2026-09-18',
  DATE '2026-09-25',
  'Musical',
  'El festival de música más grande del mundo vuelve a la Ciudad Maravillosa. Vive Rock in Rio 2026 con los mejores artistas internacionales.',
  'Vuelo ida y vuelta, hotel 3 estrellas 7 noches, entradas para 3 días de festival, visita al Cristo Redentor, traslados',
  'No incluye comidas. Pasaporte vigente obligatorio. Programación sujeta a cambios del festival.'
),
(
  'Noche de Gala en la Ópera de París',
  'París, Francia',
  1800.0,
  15,
  15,
  'AVAILABLE',
  DATE '2026-09-10',
  DATE '2026-09-17',
  'Cultural',
  'Vive una noche inolvidable en la majestuosa Ópera Garnier de París con una función exclusiva de temporada. Una experiencia cultural de primer nivel.',
  'Vuelo ida y vuelta, hotel boutique 4 estrellas 7 noches, entrada a la ópera, cena de gala, tour por el Louvre y Torre Eiffel',
  'Dress code formal obligatorio. No incluye traslados internos. Pasaporte vigente obligatorio.'
),
(
  'Lago de Como - La Perla de Italia',
  'Como, Italia',
  2100.0,
  14,
  14,
  'AVAILABLE',
  DATE '2026-10-01',
  DATE '2026-10-08',
  'Cultural',
  'Descubre el Lago de Como, considerado uno de los lugares más bellos del mundo. Villas históricas, aguas cristalinas y paisajes de ensueño te esperan.',
  'Vuelo ida y vuelta, hotel villa orillas del lago 7 noches, paseo en bote por el lago, visita a Villa del Balbianello, traslados',
  'No incluye comidas. Pasaporte vigente obligatorio. Clima variable en temporada de otoño.'
),
(
  'Roma Clásica - Coliseo y Vaticano',
  'Roma, Italia',
  1700.0,
  20,
  20,
  'AVAILABLE',
  DATE '2026-08-01',
  DATE '2026-08-08',
  'Cultural',
  'Sumérgete en la historia eterna de Roma. Visita el Coliseo, el Foro Romano, la Ciudad del Vaticano, la Capilla Sixtina y la Fontana di Trevi.',
  'Vuelo ida y vuelta, hotel 4 estrellas centro histórico 7 noches, guía turístico, entradas a monumentos, traslados',
  'No incluye comidas. Pasaporte vigente obligatorio. Se recomienda ropa cómoda para caminar.'
),
(
  'Tokio Otaku - Anime, Tecnología y Pokémon',
  'Tokio, Japón',
  3000.0,
  16,
  16,
  'AVAILABLE',
  DATE '2026-11-05',
  DATE '2026-11-14',
  'Cultural',
  'La experiencia definitiva para los amantes del anime, la tecnología y la cultura japonesa. Visita el Pokémon Center Tokyo DX, recorre Akihabara y conoce el templo Senso-ji.',
  'Vuelo ida y vuelta, hotel 4 estrellas Shinjuku 9 noches, visita Pokémon Center DX, tour Akihabara, templo Senso-ji, Monte Fuji, traslados',
  'Pasaporte vigente obligatorio. Se recomienda JR Pass para transporte. No incluye comidas.'
),
(
  'Machu Picchu y el Imperio Inca',
  'Cusco, Perú',
  1400.0,
  18,
  18,
  'AVAILABLE',
  DATE '2026-07-15',
  DATE '2026-07-23',
  'Cultural',
  'Descubre una de las Siete Maravillas del Mundo Moderno. Recorre la ciudadela inca de Machu Picchu y las calles coloniales del majestuoso Cusco.',
  'Vuelo ida y vuelta, hotel 4 estrellas 8 noches, tren a Machu Picchu, guía arqueológico, visita Valle Sagrado, traslados',
  'Se recomienda aclimatación previa a la altura. No incluye comidas. Pasaporte vigente obligatorio.'
),
(
  'Cancún Todo Incluido',
  'Cancún, México',
  1200.0,
  30,
  30,
  'AVAILABLE',
  DATE '2026-07-01',
  DATE '2026-07-08',
  'Playa',
  'Relájate en las paradisíacas playas de Cancún con un resort todo incluido de primera categoría. Arena blanca, mar turquesa y diversión sin límites.',
  'Vuelo ida y vuelta, resort 5 estrellas todo incluido 7 noches, acceso a todas las amenidades, snorkel, traslados aeropuerto',
  'Pasaporte vigente obligatorio. Sujeto a disponibilidad del resort. Bebidas alcohólicas incluidas solo para mayores de 18 años.'
),
(
  'Patagonia Chilena - Torres del Paine',
  'Punta Arenas, Chile',
  1800.0,
  12,
  12,
  'AVAILABLE',
  DATE '2026-12-05',
  DATE '2026-12-14',
  'Naturaleza',
  'Explora uno de los paisajes más impresionantes del planeta. Torres del Paine, glaciares, cóndores y la Patagonia salvaje te esperan en una aventura única.',
  'Vuelo ida y vuelta, lodge premium 9 noches, trekking guiado, navegación glaciares, visita Glaciar Grey, traslados internos',
  'Requiere buen estado físico. Clima extremo variable. Se recomienda equipo de trekking adecuado. No incluye comidas.'
),
(
  'Santorini Romántico - Grecia',
  'Santorini, Grecia',
  2400.0,
  14,
  14,
  'AVAILABLE',
  DATE '2026-09-01',
  DATE '2026-09-08',
  'Playa',
  'La isla más romántica del mundo te espera. Atardeceres únicos en Oia, aguas cristalinas del Egeo y la arquitectura blanca y azul icónica de Grecia.',
  'Vuelo ida y vuelta, hotel cueva con vista al mar 7 noches, tour en catamarán, visita volcán, cena romántica con vista al atardecer, traslados',
  'Pasaporte vigente obligatorio. Temporada alta, reserva con anticipación. No incluye comidas diarias.'
)
) AS v(package_name, destination, price, slots, available_slots, package_status, start_date, end_date, trip_type, description, included_services, conditions)
WHERE NOT EXISTS (SELECT 1 FROM packages LIMIT 1);

-- Insert discounts only if table is empty
INSERT INTO discounts (discount_type, min_threshold, discount_rate, active)
SELECT * FROM (VALUES
  ('GROUP', 4.0, 0.10, true),
  ('FREQUENT_CLIENT', 3.0, 0.05, true),
  ('MULTIPLE_PACKAGES', 1.0, 0.05, true)
) AS v(discount_type, min_threshold, discount_rate, active)
WHERE NOT EXISTS (SELECT 1 FROM discounts LIMIT 1);

-- Insert promotions only if table is empty
INSERT INTO promotions (name, discount_rate, start_date, end_date, active)
SELECT * FROM (VALUES
  ('Promo Mayo', 0.05, DATE '2026-05-01', DATE '2026-05-31', true),
  ('Super Promo Flash', 0.15, DATE '2026-05-01', DATE '2026-05-31', true)
) AS v(name, discount_rate, start_date, end_date, active)
WHERE NOT EXISTS (SELECT 1 FROM promotions LIMIT 1);
