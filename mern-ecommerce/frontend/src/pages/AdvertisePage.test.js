global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(window, 'crypto', { configurable: true, value: { getRandomValues: array => require('crypto').randomFillSync(array) } });
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const { Simulate } = require('react-dom/test-utils');
const { MemoryRouter } = require('react-router-dom');
const { HelmetProvider } = require('react-helmet-async');
const { groups, consentQuestion } = require('../../../backend/config/sponsorshipForm');
const AdvertisePage = require('./AdvertisePage').default;
const { sponsorshipAPI } = require('../services/api');
jest.mock('react-router-dom', () => { const R = require('react'); return { MemoryRouter: ({ children }) => children, Link: ({ to, children, ...props }) => R.createElement('a', { href: to, ...props }, children) }; });
jest.mock('../services/api', () => ({ sponsorshipAPI: { getForm: jest.fn(), submit: jest.fn() } }));
jest.mock('../context/SiteContext', () => ({ useSite: () => ({ settings: { siteInfo: { siteName: 'YANOBEN' } } }) }));
let container, root;
const render = async () => { await act(async () => { root.render(<HelmetProvider><MemoryRouter><AdvertisePage /></MemoryRouter></HelmetProvider>); }); };
const change = async (key, value) => { await act(async () => { Simulate.change(container.querySelector(`#sponsor-${key}`), { target: { value } }); }); };
const fillEssentials = async () => {
  await change('fullName', 'Campaign Manager'); await change('email', 'advertiser@example.invalid');
  await change('promotedItem', 'A collection of original desk accessories.'); await change('campaignGoal', 'Introduce our new collection to interested visitors.');
  await act(async () => { Simulate.change(container.querySelector('#sponsor-consent'), { target: { checked: true } }); });
};
beforeEach(() => {
  jest.clearAllMocks(); sponsorshipAPI.getForm.mockResolvedValue({ data: { groups, consentQuestion } }); sponsorshipAPI.submit.mockResolvedValue({ data: { message: 'Received.' } });
  HTMLElement.prototype.scrollIntoView = jest.fn(); container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => { root.unmount(); }); container.remove(); });
test('shows all questions above freely editable answers and marks only essentials as required', async () => {
  await render(); const questions = groups.flatMap(group => group.fields);
  expect(container.querySelectorAll('.input-field')).toHaveLength(27); expect(container.querySelectorAll('select')).toHaveLength(0);
  for (const field of questions) {
    const input = container.querySelector(`#sponsor-${field.key}`); const label = container.querySelector(`label[for="sponsor-${field.key}"]`);
    expect(label.textContent).toContain(field.label); expect(label.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(input.required).toBe(!!field.required);
  }
});
test('submits advertiser answers and displays a receipt, then starts a fresh request', async () => {
  await render(); await fillEssentials(); await change('questions', 'What placements are available?\nPlease send a quote.'); await change('budget', 'Flexible, 500 MAD');
  await act(async () => { Simulate.submit(container.querySelector('form')); });
  const payload = sponsorshipAPI.submit.mock.calls[0][0];
  expect(payload.contactConsent).toBe(true); expect(payload.questions).toContain('Please send a quote.'); expect(payload.budget).toBe('Flexible, 500 MAD'); expect(payload.submissionId).toMatch(/^[a-f0-9]{32}$/);
  expect(container.textContent).toContain('Sponsorship request received'); expect(container.querySelector('form')).toBeNull();
  const again = [...container.querySelectorAll('button')].find(button => button.textContent === 'Send another request'); await act(async () => { Simulate.click(again); });
  expect(container.querySelector('#sponsor-fullName').value).toBe(''); expect(container.querySelector('#sponsor-consent').checked).toBe(false);
  await fillEssentials(); await act(async () => { Simulate.submit(container.querySelector('form')); }); expect(sponsorshipAPI.submit.mock.calls[1][0].submissionId).not.toBe(payload.submissionId);
});
test('preserves answers after a failed submission and connects field errors to the input', async () => {
  sponsorshipAPI.submit.mockRejectedValueOnce({ response: { data: { errors: [{ path: 'email', msg: 'Please check this email address.' }] } } });
  await render(); await fillEssentials(); await change('otherDetails', 'Keep these details while I correct an answer.');
  await act(async () => { Simulate.submit(container.querySelector('form')); });
  expect(container.querySelector('#sponsor-otherDetails').value).toContain('Keep these details'); expect(container.querySelector('#sponsor-email').getAttribute('aria-invalid')).toBe('true');
  expect(container.querySelector('#sponsor-email-error').textContent).toBe('Please check this email address.'); expect(document.activeElement.getAttribute('role')).toBe('alert');
  await change('email', 'corrected@example.invalid'); await act(async () => { Simulate.submit(container.querySelector('form')); });
  expect(sponsorshipAPI.submit.mock.calls[0][0].submissionId).toBe(sponsorshipAPI.submit.mock.calls[1][0].submissionId);
});
test('prevents duplicate sends while a request is pending', async () => {
  let complete; sponsorshipAPI.submit.mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
  await render(); await fillEssentials(); await act(async () => { const form = container.querySelector('form'); Simulate.submit(form); Simulate.submit(form); });
  expect(sponsorshipAPI.submit).toHaveBeenCalledTimes(1); expect(container.querySelector('button[type="submit"]').disabled).toBe(true);
  await act(async () => { complete({ data: { message: 'Received.' } }); }); expect(container.textContent).toContain('Sponsorship request received');
});
test('offers a working retry when questions cannot load', async () => {
  sponsorshipAPI.getForm.mockRejectedValueOnce(new Error('offline'));
  await render(); expect(container.textContent).toContain('Unable to load the sponsorship form');
  await act(async () => { Simulate.click([...container.querySelectorAll('button')].find(button => button.textContent === 'Try again')); });
  expect(sponsorshipAPI.getForm).toHaveBeenCalledTimes(2); expect(container.querySelectorAll('.input-field')).toHaveLength(27);
});
