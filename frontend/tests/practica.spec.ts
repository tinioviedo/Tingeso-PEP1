/*
 * ARCHIVO DE PRÁCTICA — NO SE EJECUTA (todo el contenido está comentado).
 *
 * Escrito a mano como ejercicio de aprendizaje, con mis propias notas sobre
 * qué hace cada línea. Los tests reales que se entregan están en
 * reservas.spec.ts y pagos.spec.ts — este archivo duplicaría CA-01 y CA-03.
 *
 * Se conserva como material de estudio.
 */

/*
import { test, expect } from '@playwright/test';

test('CA-03: Botón de reserva deshabilitado si el paquete no está disponible', async ({ page }) => {
    //given correspode a la precondición del test, en este caso, que el paquete no esté disponible para reservar
    
    // Given: un paquete que no tiene estado "Disponible" (id=10, estado NOT_VALID)
    await page.goto('/packages/10'); // page.got le dice al navegador que vaya a la URL del paquete con id=10
    // id 10 corresponde a un paquete que no está disponible para reservar (roma)

    // When corresponde a la acción que realiza el usuario, en este caso, intentar reservar el paquete
    // al no estar disponibe la acción sería simplemente ver el estado del botón de reserva
    // When: el usuario ve el detalle del paquete
    const reserveButton = page.getByRole('button', { name: 'no disponible' }); //es un locator que le dice a playwright busca un elemento con rol de botón , cuyo texto sea "No disponible", solo lo guarda en variable reserveButton, no hace nada con él todavía

    // Then corresponde a la verificación de que el sistema se comporta como se espera, en este caso, que el botón de reserva esté deshabilitad
    // Then corresponde al Pass/fail del test, en este caso, que el botón de reserva esté deshabilitado
    await expect(reserveButton).toBeVisible(); //verifica que el botón de reserva esté visible, si lo está, el test pasa, si no lo está, el test falla
    await expect(reserveButton).toBeDisabled(); //verifica que el botón de reserva esté deshabilitado, si lo está, el test pasa, si no lo está, el test falla


    //Se ponen 2 expect porque si solo pusiera el tobeDisabled, y el boton no existiera , sería confuso
});

test('CA-01: Reserva exitosa con perfil completo y paquete disponible ', async ({ page }) => {
    // Given: Cual es la situación de partida
    // Contiene contexto estado inicia,quien es el ususario, en que condicion esá el sistema, qeu datos ya existe, es el como está todo antes de que pase la accion que queremos probar
    //
    //When: que hace el usuario que accion realiza: Es UNA accióno concreta y puntual. 
    //la cosa especifica que se quier eprobar, normamlmente es un click en : "Envia el formulario"

    //Then Que deberia paasar como resultado, es el resultado esperado, verificale, algo que se pueda comprobar como cierto o falso, 
    //SI ES QUE NO SE PUEDE VERIFICAR NO SIVRE COMO THEN


    //Siempre preguntarme: QUE ES Especificamte lo que este CA (Caso de prueba) quiere probar, que es lo que quiero verificar, que es lo que quiero demostrar, que es lo que quiero validar, y a partir de eso construir el Given, When y Then
    //Entonces es todo lo que pasa ANTES de esa cosa especifica

    //Si CA fuera "Usuario con sesion inciada puede cerrar sesion"
    //Given: Usuario con sesion iniciada 
    //When usuario hace click en cerrar sesion
    // El sistema cierra sesion y vuelve a pagina preincipal
    

    //CA-01: Reserva exitosa con perfil completo y paquete disponible
    //given: Usuario registrarse y completa perfil, cliente con el perfil completo y paquete disponible para reservar

    //when: Usuario hace click en reservar ahora 

    //then: El sistema confirma la reserva y muestra el voucher "reserva confirmada" y el boton de "Pagar ahora" para pagar la reserva pendiente

    //given : Un cliente nuevo, con seision iniciada y peril completo
    const timestamp = Date.now();
    const username = `qa${timestamp}`;

    //formulario de registro
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.getByRole('link', { name: 'Register' }).click();

    //llenar y enviar formulario de registro
    await page.locator('#username').fill(username);
    await page.locator('#password').fill('Eval3Test!2026');
    await page.locator('#password-confirm').fill('Eval3Test!2026');
    await page.locator('#email').fill(`${username}@test.com`);
    await page.locator('#firstName').fill('QA');
    await page.locator('#lastName').fill('Eval3');
    await page.getByRole('button', { name: 'Register' }).click();

        await page.getByRole('button', { name: 'Mi perfil' }).click();
    await page.getByPlaceholder('+56 9 1234 5678').fill('+56 9 8765 4321');
    await page.getByRole('combobox').selectOption('Chile');
    await page.getByPlaceholder('Ej: 12.345.678-9').fill('11.111.111-1');
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
    
        // When: entra a un paquete disponible y confirma la reserva
    await page.getByText('Ver paquete →').first().click();
    await page.getByRole('button', { name: 'Reservar ahora' }).click();

    // Then: el sistema confirma la reserva y muestra el total pagado
    await expect(page.getByText('¡Reserva confirmada!')).toBeVisible();
    await expect(page.getByText('Tu reserva fue creada exitosamente.')).toBeVisible();
});
*/
