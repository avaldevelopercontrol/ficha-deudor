import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { defineSuite, test } from '../../../../../test/testHarness';
import { LoginForm } from './LoginForm';

const renderForm = ({
  isLoading = false,
  error = null as string | null,
} = {}) => renderToStaticMarkup(
  <LoginForm
    onSubmit={() => undefined}
    isLoading={isLoading}
    error={error}
  />
);

export const suite = defineSuite('estados críticos del formulario de login', [
  test('renderiza los campos con atributos de autocompletado seguros', () => {
    const html = renderForm();

    assert.match(html, /autoComplete="username"/);
    assert.match(html, /autoComplete="current-password"/);
    assert.match(html, /Iniciar Sesión/);
  }),
  test('muestra y deshabilita el botón durante el ingreso', () => {
    const html = renderForm({ isLoading: true });

    assert.match(html, /Ingresando\.\.\./);
    assert.match(html, /disabled=""/);
  }),
  test('expone el error de autenticación como alerta', () => {
    const html = renderForm({ error: 'Credenciales incorrectas' });

    assert.match(html, /role="alert"/);
    assert.match(html, /Credenciales incorrectas/);
  }),
]);
