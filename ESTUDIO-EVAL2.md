# 📘 Estudio Evaluación 2 — Microservicios + Kubernetes (TravelAgency)

> Documento vivo para la prueba **escrita**. Lo vamos completando a medida que construimos el proyecto.
> Copiable a Notion. Última actualización: 2026-07-24.

---

## ⭐ Enfoque de la prueba (palabras del profe)

> "Con hacer funcionar **un** microservicio y subirlo a Kubernetes, debíamos estar listos para
> responder la prueba. Tener claro el **funcionamiento**, sobre todo de **Eureka**. Usar
> **lenguaje técnico**. Piensen que le explican el código **a otro informático**."

**Qué implica:**
- **Profundidad > cantidad.** No hace falta tener los 7 microservicios. Basta UNO
  (`package-service`) funcionando de punta a punta (código → Docker → Kubernetes) y entenderlo perfecto.
- **Eureka es el tema estrella** → ver sección 8 (Eureka en profundidad).
- Es una **defensa oral**: te apuntan a una línea y preguntan *por qué* está ahí. Hay que narrar
  el flujo con términos precisos, no con analogías. → ver sección 9 (cómo explicar tu código).

---

## 0. Diferencia Evaluación 1 vs Evaluación 2

Las **7 épicas de negocio son idénticas** en ambas evaluaciones. Solo cambia la arquitectura y el despliegue.

| | Evaluación 1 | Evaluación 2 |
|---|---|---|
| Arquitectura | Monolito por capas | Microservicios |
| Épicas 1–7 | Las mismas | Las mismas |
| Base de datos | Una sola | Una por microservicio |
| Infra extra | — | Config Server + Eureka + API Gateway |
| Comunicación | Llamadas de método | HTTP con RestTemplate |
| Puertos | Fijos | `server.port=0` salvo infra |
| Despliegue | Docker Compose en la nube (BD + backend x3 + Nginx) | Kubernetes/minikube en VM |
| CI/CD + testing 90% | Sí | No exigido |
| Keycloak | Sí | Sí (es M1) |

**Puedo reutilizar toda mi lógica de negocio del monolito.** El único cambio de fondo:
en microservicios NO hay relaciones JPA entre servicios (cada uno su BD). Se guarda el `id`
(ej. `packageId`) y se pide el dato al otro servicio por **RestTemplate**.

---

## 1. Mapa de las 7 épicas → microservicios

| Épica | Microservicio | Qué hace |
|---|---|---|
| 1. Usuarios/clientes | **Keycloak (M1)** | Auth + roles (se configura, no se programa) |
| 2. Paquetes | **package-service (M2)** | CRUD de paquetes + validaciones |
| 3. Búsqueda | **M3** (o dentro de M2) | Filtrado de paquetes disponibles |
| 4. Reservas | **reservation-service (M4)** | Reservas + descuentos + estados |
| 5. Pagos | **payment-service (M5)** | Pago simulado |
| 6. Seguimiento | **M6** | Estados/comprobantes de reservas |
| 7. Reportes | **report-service (M7)** | Ventas por período + ranking |

---

## 2. Conceptos clave (para la prueba)

### ¿Qué es un microservicio?
App independiente que implementa **una** capacidad de negocio, con su **propia base de datos**
y su propio despliegue. Se comunican por red (HTTP). Opuesto al monolito (todo en una app + 1 BD).
Ventaja: se escalan y despliegan por separado, pueden usar distintas tecnologías.

### Eureka (Service Discovery) — "la guía telefónica"
Cada microservicio **se registra** en Eureka al arrancar (nombre + IP:puerto). Cuando un
servicio necesita llamar a otro, le pregunta a Eureka dónde está (no usa IP fija). Permite
puertos aleatorios, réplicas y balanceo de carga.
- Anotación servidor: `@EnableEurekaServer` · Puerto fijo **8761** · no se registra a sí mismo.
- Anotación cliente: `@EnableEurekaClient`.

### Config Server — "configuración centralizada"
Todas las configuraciones viven en **un repo Git**. El Config Server las lee y se las entrega a
cada microservicio al arrancar. Cada MS trae un `bootstrap.yaml` mínimo (su nombre + dónde está el Config).
- Anotación: `@EnableConfigServer` · Puerto fijo **8081** · **arranca primero**.

### API Gateway — "puerta única de entrada"
El frontend habla **solo** con el Gateway (puerto **8080**). El Gateway enruta por path:
`Path=/paquete/**` → `lb://package-service`. `lb://` = pregunta a Eureka y balancea.
Los microservicios entre ellos **NO** pasan por el Gateway.

### RestTemplate — comunicación entre microservicios
Cliente HTTP de Spring. Con `@LoadBalanced` puedes llamar por nombre lógico
(`http://package-service/...`) y Eureka resuelve a una instancia real. El enunciado
**exige RestTemplate** para la comunicación entre servicios.

### ¿Por qué `server.port=0`? (pregunta trampa típica)
Porque **Eureka descubre los servicios**, no se necesitan puertos fijos. Puerto 0 = aleatorio,
lo que permite correr varias réplicas sin choque de puertos. En el ejemplo **básico** del profe
(sin Eureka) los puertos SÍ son fijos (8001/8002/8003).

### Orden de arranque
`Config (8081)` → `Eureka (8761)` → microservicios → `Gateway (8080)`.

### Recorrido de una petición (ej: crear reserva)
1. Frontend (React) → `POST /reservation` **al Gateway**.
2. Gateway ve `/reservation/**`, pregunta a Eureka por `reservation-service` y reenvía.
3. `reservation-service` necesita validar el paquete → pregunta a Eureka por `package-service`
   y lo llama **directo con RestTemplate** (no por el Gateway).
4. Aplica descuentos, descuenta cupos, guarda en **su propia BD**.
5. Respuesta vuelve por el mismo camino al Frontend.

---

## 3. Docker

Docker empaqueta app + Java + dependencias en una **imagen** portable.

### Dockerfile (línea por línea)
```dockerfile
FROM openjdk:17                       # imagen base con Java 17
ARG JAR_FILE=target/package-service.jar   # ruta del jar compilado
COPY ${JAR_FILE} app.jar              # copia el jar dentro de la imagen
ENTRYPOINT ["java","-jar","/app.jar"] # comando al arrancar el contenedor
```

### Ciclo (por cada microservicio)
```bash
./mvnw clean package -DskipTests               # 1. compilar → genera el .jar
docker build -t usuario/package-service:latest .   # 2. construir imagen
docker login                                        # 3. login Docker Hub
docker push usuario/package-service:latest          # 4. subir imagen
```

---

## 4. Kubernetes (K8s)

Docker corre 1 contenedor; Kubernetes **orquesta muchos** (los levanta, reinicia, escala, conecta).
Corre sobre **minikube** (cluster de 1 nodo) dentro de una **VM (VirtualBox)**.

### Objetos
- **Pod**: unidad mínima, envuelve el contenedor.
- **Deployment**: define "quiero N réplicas de esta imagen" y las mantiene vivas.
- **Service**: dirección de red **estable** para un grupo de pods (los pods cambian de IP, el Service no).
  - **ClusterIP**: solo accesible **dentro** del cluster → microservicios internos.
  - **NodePort**: expuesto **hacia afuera** → **solo el API Gateway** (y el frontend).
  - **clusterIP: None** (headless): usado para las BD (MySQL).
- **ConfigMap**: configuración NO secreta (host y nombre de BD).
- **Secret**: datos sensibles (user/password) en **base64** (no es cifrado, solo codificación).
- **PersistentVolumeClaim (PVC)**: almacenamiento persistente para la BD (`/var/lib/mysql`).

### Reglas del enunciado (MUY preguntables)
- Minikube desde **VM** (no driver docker).
- **ClusterIP** para comunicación interna entre microservicios.
- **NodePort** solo para el **API Gateway**. Los MS entre ellos NO usan el Gateway.
- **Prohibido `port-forward`**. Se accede por `IP-de-minikube:NodePort`.

### Comandos
```bash
minikube start --driver=virtualbox
minikube ip                          # IP para acceder desde el navegador
kubectl apply -f <archivo>.yml       # aplicar manifiesto
kubectl get pods -o wide
kubectl get services
kubectl get configmap / get secret / get pvc
```

---

## 5. Diagramas oficiales del profe (Clases 11–14)

- **Clase 11 (Básico):** Student(8001)/Book(8002)/Pet(8003), puertos FIJOS, cada uno su BD,
  Book/Pet llaman a Student por RestTemplate. SIN Config/Eureka/Gateway.
- **Clase 12 (Avanzado):** agrega Config(8081)↔GitHub, Eureka(8761), Gateway(8080).
  Puertos pasan a aleatorios. ← **este es el diagrama que replico en mi proyecto.**
- **Clase 13 (K8s P1):** minikube, Service NodePort → Deployment 3 pods.
- **Clase 14 (K8s P2):** Backend (2 pods, NodePort) + Service clusterIP=None → Pod MySQL + PVC + ConfigMap + Secrets.

---

## 6. Plan de trabajo y progreso

- [x] **Paso 0 — Infra:** config-service + eureka-service + gateway-service corriendo, `GATEWAY-SERVICE` visible en `localhost:8761`. ✅ HECHO (2026-07-25). Config leyendo de repo Git público.
- [x] **Paso 1 — package-service (M2+M3):** ✅ HECHO local (2026-07-25). Migrada la lógica del monolito (4 capas), corre con MySQL (bdpackage), registrado en Eureka (puerto aleatorio), CRUD probado por el Gateway (POST crea paquete, GET lo recupera). Falta: seguridad Keycloak, Docker, K8s.
- [ ] **Paso 2 — reservation-service (M4):** reservas + descuentos, llama a package-service por RestTemplate.
- [ ] **Paso 3 — payment-service (M5).**
- [ ] **Paso 4 — report-service (M7).**
- [ ] **Paso 5 — Keycloak (M1).**
- [x] **Paso 3 — Docker:** ✅ HECHO (2026-07-26). Las 4 imágenes dockerizadas y subidas a Docker Hub como PÚBLICAS: tinioviedo/{package,config,eureka,gateway}-service:latest. Falta solo el frontend (opcional). Imágenes públicas = Kubernetes las baja sin credenciales.
  - Proceso: mvn clean package -DskipTests → docker build → docker tag tinioviedo/package-service → docker login → docker push.
  - Dockerfile: `FROM eclipse-temurin:11-jre` (OJO: openjdk:17 del profe ya NO existe en Docker Hub, deprecado) + ARG JAR_FILE + COPY jar + ENTRYPOINT java -jar.
  - Maven no estaba en PATH; se usó el Maven que trae IntelliJ (JetBrains/.../maven3/bin/mvn.cmd).
- [ ] **Paso 6 — Dockerizar todo → Docker Hub.**
- [x] **Paso 4/7 — Kubernetes ✅ COMPLETO Y FUNCIONANDO (2026-07-27):** minikube (virtualbox; conflicto WSL2/VT-x resuelto con `bcdedit /set hypervisorlaunchtype off` + reinicio; IP 192.168.59.100; comandos `minikube` en terminal ADMIN). Los 5 pods Running: mysql (2 secrets + ConfigMap + Service headless + PVC), config-service, eureka-service, package-service (registrado en Eureka con IP de pod), gateway-service (NodePort 30080). PRUEBA FINAL EXITOSA: `http://192.168.59.100:30080/package/` responde (creé/recuperé un paquete). Recorrido: host → NodePort → gateway → Eureka → package → MySQL. Sin port-forward. **Gotcha K8s aprendido:** la URL de Eureka (defaultZone) no se puede setear por env var normal (clave de mapa camelCase) → se usó `SPRING_APPLICATION_JSON`.

---

## 7. Preguntas típicas de la prueba (banco)

1. ¿Qué es un microservicio y en qué se diferencia de un monolito?
2. ¿Qué es Eureka / para qué sirve el Service Discovery?
3. ¿Qué es el Config Server y por qué centralizar la configuración?
4. ¿Qué hace el API Gateway? ¿Por qué el frontend solo habla con él?
5. ¿Por qué `server.port=0`?
6. ¿Cómo se comunican dos microservicios? (RestTemplate + Eureka)
7. Explica el Dockerfile paso a paso.
8. Pasos para dockerizar y subir a Docker Hub.
9. ClusterIP vs NodePort. ¿Cuál para qué?
10. ¿Qué es un Deployment, un Service, un Pod?
11. ConfigMap vs Secret.
12. ¿Por qué no se puede usar port-forward? ¿Cómo se accede entonces?
13. Recorrido completo de una petición desde el frontend hasta la BD.
14. ¿Por qué cada microservicio tiene su propia base de datos?

*(Las respuestas están en las secciones 2–4 de este documento.)*

### Detalles finos aprendidos al montar la infra (buenos para la defensa)
- **El repo `config-data` debe ser PÚBLICO** (o el Config Server necesita credenciales), porque el Config Server lo lee por HTTP desde GitHub de forma anónima. Si es privado → 404 → el microservicio arranca con valores por defecto (ej. eureka en 8080 en vez de 8761) y falla.
- **Modo de auto-preservación de Eureka:** el mensaje rojo "EMERGENCY!" en el dashboard NO es error. Eureka deja de expirar instancias cuando recibe menos renewals (heartbeats) de los esperados, por si es un problema de red temporal. Normal en desarrollo.
- En el dashboard, `UP (1) - Tini:gateway-service:8080` = hostname (Tini) : nombre-app : puerto.

---

## 8. ⭐ Eureka en profundidad (tema estrella)

**Qué es:** un **servidor de descubrimiento de servicios** (Service Discovery). Mantiene un
**registro** (registry) de todas las instancias de microservicios vivas: nombre lógico → lista de IP:puerto.

### Cómo funciona el registro (el ciclo completo)
1. **Registro (register):** cada microservicio, al arrancar, envía su info a Eureka
   (nombre de la app, IP, puerto, instance-id). Queda en estado `UP`.
2. **Renovación por heartbeat (lease renewal):** cada instancia manda un "latido" a Eureka
   cada **30 s** (por defecto) para decir "sigo viva". Eureka renueva su "lease".
3. **Expiración (lease expiration / eviction):** si Eureka no recibe heartbeat en **90 s**,
   asume que la instancia murió y la **elimina** del registro.
4. **Fetch registry:** los clientes (Gateway, otros MS) **descargan una copia** del registro
   cada 30 s y la cachean localmente, para no preguntar a Eureka en cada llamada.

### Cliente vs Servidor
- **Eureka Server** (`@EnableEurekaServer`): el registro central. Puerto **8761**.
  No se registra a sí mismo → `register-with-eureka: false`, `fetch-registry: false`.
- **Eureka Client** (`@EnableEurekaClient`): cada microservicio. Se registra y descarga el registro
  → `register-with-eureka: true`, `fetch-registry: true`.

### Las propiedades del `.yaml`, explicadas
```yaml
eureka:
  client:
    fetch-registry: true          # descarga el registro de servicios
    register-with-eureka: true    # se registra a sí mismo en Eureka
    service-url:
      default-zone: http://eureka-service:8761/eureka/   # dónde está Eureka
  instance:
    instance-id: ${spring.application.name}:${random.value}  # id único por instancia
```

### Cómo lo usan el Gateway y RestTemplate
- **Client-side load balancing:** el que llama (Gateway o un MS con RestTemplate `@LoadBalanced`)
  tiene la lista de instancias (del registro cacheado) y **elige él mismo** a cuál llamar
  (round-robin por defecto, vía Spring Cloud LoadBalancer). No hay un balanceador central.
- `lb://package-service` y `http://package-service/...` → el `package-service` es el **nombre lógico**
  registrado en Eureka; se resuelve a una IP:puerto real de una instancia sana.

### Por qué Eureka habilita `server.port=0` y las réplicas
Como el descubrimiento es por **nombre** (no por IP:puerto fijo), cada instancia puede levantar en
un puerto aleatorio y aun así ser encontrada. Por eso puedes correr N réplicas del mismo servicio:
todas se registran con el mismo nombre y el que llama balancea entre ellas.

### Frase técnica lista para la prueba
> "Cada microservicio actúa como *Eureka client*: al arrancar se **registra** en el *Eureka server*
> enviando su `instance-id`, IP y puerto, y mantiene el *lease* activo con un *heartbeat* cada 30 s.
> El Gateway y los demás servicios hacen *fetch* del *registry* y aplican *client-side load balancing*
> con Spring Cloud LoadBalancer, resolviendo el nombre lógico (`lb://package-service`) a una
> instancia concreta. Si una instancia deja de latir, Eureka la expira del registro a los 90 s."

---

## 9. Cómo explicar tu código a otro informático (lo que pide el profe)

El profe evalúa que uses **lenguaje técnico** y expliques el *por qué*. Guía por capa:

- **`@Entity` / `@Table`:** "Es la entidad JPA mapeada a la tabla `paquete`. Cada campo es una columna;
  `@Id @GeneratedValue(IDENTITY)` delega el autoincremento a MySQL. `@Enumerated(STRING)` persiste el
  enum como texto legible, no como ordinal."
- **`@Repository` (JpaRepository):** "Extiende `JpaRepository<Paquete, Long>`, que me da el CRUD sin
  implementarlo. El método `findByEstadoAnd...` es una *query derivada*: Spring Data genera el SQL a
  partir del nombre del método."
- **`@Service`:** "Acá vive la **lógica de negocio** y las validaciones de las reglas de la épica.
  El controller no valida; delega en el service. Es la capa que otro microservicio termina invocando."
- **`@RestController` / `@RequestMapping("/paquete")`:** "Expone los endpoints REST. Devuelvo
  `ResponseEntity` para controlar el código HTTP (200, 400, 404). Traduce HTTP ↔ objetos Java."
- **`@EnableEurekaClient` + `@Bean @LoadBalanced RestTemplate`:** "Registra el servicio en Eureka y
  configura el RestTemplate para resolver nombres lógicos vía descubrimiento con balanceo de carga."
- **`bootstrap.yaml` vs `application.yaml`:** "`bootstrap` se carga **antes** que `application`,
  porque ahí le digo dónde está el Config Server para traer el resto de la configuración remota."

**Regla de oro:** por cada anotación, poder decir (1) qué hace, (2) por qué está ahí, (3) qué pasaría
si la quito. Si puedes responder eso de cada `@`, estás listo.

---

## 10. ⭐ Proceso de armado de la infraestructura (para narrar en la prueba)

**Idea de fondo:** antes de programar cualquier lógica de negocio, se levanta la "columna vertebral":
3 servicios de infraestructura (sin lógica de negocio) que permiten que los demás se **configuren**,
se **encuentren** y sean **accedidos**. Los microservicios de negocio dependen de estos 3.

### Paso 1 — Config Server (config-service, puerto 8081)
- Clase con `@EnableConfigServer`. Dependencia: `spring-cloud-config-server`.
- `application.yaml`: puerto 8081 + URL del repo Git (`travelagency-config-data`, carpeta `config-data`).
- **Función:** entrega la configuración a los demás microservicios, leída desde un repo Git central.
- **Sin él:** cada microservicio tendría su config duplicada y hardcodeada.

### Paso 2 — Eureka Server (eureka-service, puerto 8761)
- Clase con `@EnableEurekaServer`. Dependencias: `eureka-server` + `config` (pide su config al Config Server).
- Su config está en `config-data/eureka-service.yaml`: puerto 8761, `register-with-eureka: false`,
  `fetch-registry: false` (es el registro mismo, no se registra en sí mismo).
- **Función:** registro de servicios (Service Discovery). Todos se anotan aquí al arrancar.

### Paso 3 — API Gateway (gateway-service, puerto 8080)
- Clase con `@EnableEurekaClient` (sí es cliente de Eureka). Dependencias: `gateway` + `eureka-client`.
- Su config está en `config-data/gateway-service.yaml`: puerto 8080 + rutas.
  Ruta: `Path=/package/**` → `uri: lb://package-service` (`lb://` = balanceo vía Eureka).
- **Función:** único punto de entrada desde afuera; enruta cada petición al microservicio correcto.

### `bootstrap.yaml` vs `application.yaml` (pregunta clásica)
- `bootstrap.yaml` se carga **ANTES** que `application.yaml`.
- En `bootstrap.yaml` va solo: nombre del servicio + dónde está el Config Server (`localhost:8081`).
- Por qué: el servicio necesita saber dónde está el Config Server **antes** de pedirle el resto de su config.
- `config-service` NO usa bootstrap (él ES el Config Server, no le pide config a nadie): usa `application.yaml`.

### Orden de arranque (y por qué)
`config-service (8081)` → `eureka-service (8761)` → `gateway-service (8080)` → microservicios de negocio.
- Config primero: los demás le piden su config.
- Eureka segundo: obtiene su config del Config Server.
- Gateway tercero: necesita que Eureka exista para registrarse y descubrir servicios.

### Detalle de adaptación hecha (vs el ejemplo del profe)
- `groupId` y paquete Java: `com.tutorial` → `com.travelagency`.
- Config Server apunta a MI repo Git (`tinioviedo/travelagency-config-data`), no al del profe.
- Ruta del Gateway preparada para `package-service` (`/package/**`).
- Versiones se mantienen tal cual el profe: Spring Boot 2.5.4, Spring Cloud 2020.0.3, Java 11.

### Cómo se prueba
1. Push del repo `travelagency-config-data` a GitHub (el Config Server lee de GitHub, no del disco).
2. Correr en orden config → eureka → gateway.
3. Verificar Config: `http://localhost:8081/eureka-service/default` devuelve el YAML como JSON.
4. Verificar Eureka: en `http://localhost:8761` aparece `GATEWAY-SERVICE` registrado.

---

## 11. ⭐ Secuencia detallada + contenido de cada archivo (repaso completo)

### Los 2 repos
- `Tingeso-PEP2` = **código** (los proyectos Spring Boot: config/eureka/gateway/package-service).
- `travelagency-config-data` = **configuración** (solo `.yaml`, sin Java). El Config Server los lee desde acá.
- Son 2 repos separados porque el Config Server lee la config desde un repo Git aparte.

### bootstrap.yaml vs application.yaml
- `bootstrap.yaml`: se carga PRIMERO. Lleva: nombre + dónde está el Config Server (+ BD en los de negocio). Lo usan los clientes.
- `application.yaml`: config normal, después. Lo usa SOLO config-service (él es el Config Server, no pide config a nadie).

### Qué hay en config-data/
- `eureka-service.yaml` (puerto 8761, no se registra), `gateway-service.yaml` (puerto 8080, rutas), `package-service.yaml` (puerto 0, cliente eureka).
- NO hay config-service.yaml (no se pide config a sí mismo).

### Contenido de cada archivo LOCAL (en Tingeso-PEP2)
- config-service/application.yaml: `server.port: 8081` + `spring.cloud.config.server.git.uri: <repo config-data>` + `search-paths: config-data`.
- eureka/gateway/package bootstrap.yaml: `spring.application.name: <nombre>` + `spring.cloud.config.uri: http://localhost:8081`.
- package bootstrap.yaml lleva ADEMÁS `spring.datasource` (url MySQL con createDatabaseIfNotExist=true, username, password) + `jpa.hibernate.ddl-auto: update`.

### Contenido de cada archivo REMOTO (en config-data/)
- eureka-service.yaml: `server.port: 8761`, `register-with-eureka: false`, `fetch-registry: false`.
- gateway-service.yaml: `server.port: 8080`, cliente eureka true, + `spring.cloud.gateway.routes` (id package-service, uri `lb://package-service`, predicate `Path=/package/**`).
- package-service.yaml: `server.port: ${PORT:${SERVER_PORT:0}}` (aleatorio), cliente eureka true, instance-id con random.value.

### Por qué config-data debe ser PÚBLICO
El Config Server lee GitHub de forma anónima (sin login). Si el repo es privado → 404 → los MS arrancan con defaults y fallan (a nosotros: eureka arrancó en 8080 en vez de 8761). Es seguro porque los .yaml NO tienen contraseñas (las claves de BD van en el bootstrap local).

### Qué es el "push"
Push = subir de tu computador a GitHub: `git add .` → `git commit -m "..."` → `git push -u origin main`. Obligatorio para config-data porque el Config Server lo lee desde GitHub, no del disco.

### Secuencia completa
1. Crear 2 repos vacíos (Tingeso-PEP2 + travelagency-config-data).
2. Clonarlos (git clone).
3. Escribir código de infra en Tingeso-PEP2 (config/eureka/gateway).
4. Escribir los .yaml en config-data.
5. PUSH de config-data + hacerlo PÚBLICO.
6. Correr en orden config → eureka → gateway. Verificar en localhost:8761.
7. Construir package-service (4 capas) + poner password MySQL en su bootstrap.
8. Correr package-service (bdpackage + tabla se crean solas con createDatabaseIfNotExist + ddl-auto).
9. Probar CRUD por el gateway (POST crea, GET recupera).

### Esquema: config-service lee de config-data/
```
Tingeso-PEP2 (CÓDIGO)                       travelagency-config-data (CONFIG, GitHub público)
  config-service  ── LEE por HTTP ─────────►  config-data/
  @EnableConfigServer, 8081                     ├── eureka-service.yaml
  su application.yaml apunta al repo            │     port 8761 (fijo), register-with-eureka: false
                                                ├── gateway-service.yaml
                                                │     port 8080 (fijo), register: true, routes /package/** → lb://package-service
                                                └── package-service.yaml
                                                      port 0 (aleatorio), register: true, instance-id random
```
Patrón: infra (eureka/gateway) = puerto fijo; negocio (package) = puerto aleatorio. Todos menos eureka se registran en eureka.

### La BD se creó sola (no CREATE DATABASE manual)
- La base `bdpackage` la creó `createDatabaseIfNotExist=true` (en la url del datasource).
- La tabla `packages` la creó Hibernate con `ddl-auto: update` (a partir del @Entity).
- Alternativa válida: crear la BD manual con `CREATE DATABASE bdpackage;`.

---

## 12. ⭐ Narración del despliegue en Kubernetes (para la prueba)

**Flujo general:** creé carpeta `k8s/` con los manifiestos → levanté minikube (driver VirtualBox) → desplegué cada componente con su YAML, aplicándolo con `kubectl apply -f`. Orden: BD → infra (config, eureka) → microservicios de negocio (package, gateway).

**MySQL (4 archivos):**
- ConfigMap: nombre de la BD (bdpackage).
- 2 Secrets: root (admin) y usuario de la app (travel/travel123).
- Archivo de deployment con 3 objetos (`---`): Service headless (dirección mysql:3306), Deployment (pod mysql:8.0), PVC (almacenamiento persistente).
- El Deployment toma valores de los otros 3 con `valueFrom` (credenciales de los Secrets, nombre de BD del ConfigMap).

**config-service (2 objetos):** Service ClusterIP (config-service:8081) + Deployment (imagen tinioviedo/config-service). SIN env vars: su config (puerto + repo GitHub) ya viene en la imagen.

**eureka-service (2 objetos):** Service ClusterIP (eureka-service:8761) + Deployment (imagen tinioviedo/eureka-service). CON env vars: `SPRING_CLOUD_CONFIG_URI=http://config-service:8081` (reemplaza el localhost:8081 del bootstrap por el nombre del Service) + `SPRING_CLOUD_CONFIG_FAIL_FAST=true` (reintenta si config no está listo, evita arrancar en 8080).

**El patrón que se repite:** cada microservicio = un Service (ClusterIP interno / NodePort para el gateway) + un Deployment (con su imagen de Docker Hub). Los que llaman a otros llevan env vars que cambian `localhost` por el nombre del Service.

**Regla de una línea:** por cada componente → escribo su YAML → `kubectl apply -f` → `kubectl get pods` (verifico).

**Concepto CLAVE de K8s+microservicios:** dentro de un contenedor `localhost` = el contenedor mismo. Por eso los servicios se buscan por el NOMBRE del Service (config-service, eureka-service, mysql), no por localhost. Ese cambio se hace con variables de entorno en el Deployment, sin tocar el código ni la imagen.
