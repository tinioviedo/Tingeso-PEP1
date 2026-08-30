import { test, expect, Page } from '@playwright/test';

/**
 * HU-005 — Pagar una reserva pendiente
 * Como cliente registrado, quiero pagar una reserva pendiente con tarjeta de
 * crédito, para confirmar mi cupo y recibir mi comprobante de pago.
 */

// Helper: registra un cliente nuevo, completa su perfil y crea una reserva,
// dejando al usuario en "Mis reservas" con la reserva en estado Pendiente.
// NO hace clic en "Pagar ahora" — cada test decide qué hacer desde ahí.
async function prepararReservaPendiente(page: Page) {
    const timestamp = Date.now();
    const username = `qa${timestamp}`;

    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.getByRole('link', { name: 'Register' }).click();

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

    await page.getByText('Ver paquete →').first().click();
    await page.getByRole('button', { name: 'Reservar ahora' }).click();
    await expect(page.getByText('¡Reserva confirmada!')).toBeVisible();

    await page.goto('/my-reservations');
}

// Helper: además de dejar la reserva pendiente, la paga con datos válidos.
// Se usa como Given de los CA que necesitan una reserva YA pagada.
async function crearReservaPagada(page: Page) {
    await prepararReservaPendiente(page);
    await page.getByRole('button', { name: 'Pagar ahora' }).click();
    await page.getByPlaceholder('1234 5678 9012 3456').fill('4111111111111111');
    await page.getByPlaceholder('MM/AA').fill('12/30');
    await page.getByPlaceholder('123', { exact: true }).fill('123');
    await page.getByRole('button', { name: 'Confirmar pago' }).click();
    await expect(page.getByText('PAGO APROBADO')).toBeVisible();
}

test('CA-01: Pago exitoso con tarjeta válida', async ({ page }) => {

    // Given: un cliente con una reserva pendiente de pago
    await prepararReservaPendiente(page);
    await page.getByRole('button', { name: 'Pagar ahora' }).click();

    // When: ingresa datos de tarjeta válidos y confirma el pago
    await page.getByPlaceholder('1234 5678 9012 3456').fill('4111111111111111');
    await page.getByPlaceholder('MM/AA').fill('12/30');
    await page.getByPlaceholder('123', { exact: true }).fill('123');
    await page.getByRole('button', { name: 'Confirmar pago' }).click();

    // Then: el sistema aprueba el pago y confirma la reserva
    await expect(page.getByText('PAGO APROBADO')).toBeVisible();
    await expect(page.getByText('¡Confirmado!')).toBeVisible();
});

test('CA-02: El sistema muestra un resumen del pago antes de confirmarlo', async ({ page }) => {

    // Given: un cliente con una reserva pendiente de pago
    await prepararReservaPendiente(page);

    // When: abre el formulario de pago (clic en "Pagar ahora")
    await page.getByRole('button', { name: 'Pagar ahora' }).click();

    // Then: el sistema muestra el monto total a pagar, antes de confirmar nada
    await expect(page.getByText(/Total a pagar: US\$/)).toBeVisible();
});

test('CA-03: Solo se puede realizar un pago por reserva', async ({ page }) => {

    // Given: un cliente con una reserva que ya fue pagada
    await crearReservaPagada(page);

    // When: consulta su lista de reservas
    await page.goto('/my-reservations');

    // Then: el sistema no ofrece la opción de pagar de nuevo esa reserva
    await expect(page.getByText('Confirmado')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pagar ahora' })).not.toBeVisible();
});
