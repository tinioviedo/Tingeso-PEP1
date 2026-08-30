import { test, expect } from '@playwright/test';

/**
 * HU-004 — Reservar un paquete turístico
 * Como cliente registrado, quiero reservar un paquete turístico disponible
 * indicando pasajeros y acompañantes, para asegurar mi cupo antes de pagarlo.
 */

test('CA-01: Reserva exitosa con perfil completo y paquete disponible', async ({ page }) => {

    // Given: un cliente nuevo, con sesión iniciada y perfil completo
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

    // Completar perfil (obligatorio antes de poder reservar)
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

test('CA-02: Perfil incompleto bloquea la reserva', async ({ page }) => {

    // Given: un cliente nuevo, con sesión iniciada pero SIN perfil completo
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

    // When: intenta reservar un paquete disponible sin haber completado su perfil
    await page.getByText('Ver paquete →').first().click();
    await page.getByRole('button', { name: 'Reservar ahora' }).click();

    // Then: el sistema bloquea la reserva y pide completar el perfil
    await expect(page.getByText('Debes completar todos tus datos en Mi perfil antes de realizar una reserva.')).toBeVisible();
});

test('CA-03: Botón de reserva deshabilitado si el paquete no está disponible', async ({ page }) => {

    // Given: un paquete que no tiene estado "Disponible" (id=10, estado NOT_VALID)
    await page.goto('/packages/10');

    // When: el cliente ve el detalle del paquete
    const reserveButton = page.getByRole('button', { name: 'No disponible' });

    // Then: el botón de reserva aparece deshabilitado
    await expect(reserveButton).toBeVisible();
    await expect(reserveButton).toBeDisabled();
});

test('CA-04: El sistema muestra transparencia de descuentos antes de confirmar', async ({ page }) => {

    // Given: un cliente nuevo, con sesión iniciada y perfil completo, viendo un paquete disponible
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

    // Se navega a un paquete específico con cupos de sobra (id=7), en vez de "el primero
    // de la lista": ese lo usan otros CA que sí reservan de verdad y le van bajando los
    // cupos en cada corrida, lo que terminaba topando el "+" antes de llegar a 3.
    await page.goto('/packages/7');

    // When: selecciona una cantidad de pasajeros que califica para descuento grupal (3+)
    const plusButton = page.getByRole('button', { name: '+' });
    await plusButton.click();
    await plusButton.click();

    // Then: el sistema muestra el descuento con su origen y el precio final, ANTES de confirmar
    await expect(page.getByText(/Descuento grupal: \d+%/)).toBeVisible();
    await expect(page.getByText('Total descuento')).toBeVisible();
    await expect(page.getByText('Total estimado')).toBeVisible();
});

test('CA-05: El sistema evita seleccionar más pasajeros que los cupos disponibles', async ({ page }) => {

    // Given: un paquete con cupos limitados (id=9, "Lago de Como")
    await page.goto('/packages/9');
    const cuposTexto = await page.getByText(/\d+ restantes/).textContent();
    const cuposDisponibles = Number(cuposTexto.match(/\d+/)[0]);
    const quantityDisplay = page.locator('button:has-text("−")').locator('xpath=following-sibling::span[1]');

    // When: el cliente intenta seleccionar más pasajeros que los cupos disponibles
    const plusButton = page.getByRole('button', { name: '+' });
    for (let i = 0; i < cuposDisponibles + 5; i++) {
        await plusButton.click();
    }

    // Then: el sistema no permite superar la cantidad de cupos disponibles
    await expect(quantityDisplay).toHaveText(String(cuposDisponibles));
});
