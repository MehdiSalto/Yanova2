import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { sponsorshipAPI } from '../services/api';
import { useSite } from '../context/SiteContext';
const newSubmissionId = () => Array.from(window.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
export default function AdvertisePage() {
  const { settings } = useSite();
  const siteName = settings?.siteInfo?.siteName || 'YANOBEN';
  const [config, setConfig] = useState(null); const [form, setForm] = useState({});
  const [consent, setConsent] = useState(false); const [submissionId, setSubmissionId] = useState(newSubmissionId);
  const [busy, setBusy] = useState(false); const [success, setSuccess] = useState(false);
  const [error, setError] = useState(''); const [fieldErrors, setFieldErrors] = useState({}); const [retry, setRetry] = useState(0);
  const feedbackRef = useRef(null); const formRef = useRef(null); const pendingRef = useRef(false);
  useEffect(() => {
    const abort = new AbortController(); setError('');
    sponsorshipAPI.getForm({ signal: abort.signal }).then(({ data }) => setConfig(data)).catch(err => {
      if (!abort.signal.aborted) setError(err.response?.data?.message || 'Unable to load the sponsorship form. Please try again.');
    });
    return () => abort.abort();
  }, [retry]);
  useEffect(() => { if (success || error) feedbackRef.current?.focus(); }, [success, error]);
  const submit = async event => {
    event.preventDefault(); if (pendingRef.current) return;
    pendingRef.current = true; setBusy(true); setError(''); setFieldErrors({});
    try {
      await sponsorshipAPI.submit({ ...form, submissionId, contactConsent: consent });
      setSuccess(true); setForm({}); setConsent(false); setSubmissionId(newSubmissionId());
    } catch (err) {
      const issues = err.response?.data?.errors || [];
      setFieldErrors(Object.fromEntries(issues.map(issue => [issue.path, issue.msg])));
      setError(issues.length ? 'Please check the highlighted answers and try again.' : err.response?.data?.message || 'Unable to send your request. Your answers are still here. Please try again.');
    } finally { pendingRef.current = false; setBusy(false); }
  };
  const update = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setFieldErrors(previous => ({ ...previous, [key]: '' })); };
  return <div className="bg-canvas">
    <Helmet><title>Advertise with us | {siteName}</title><meta name="description" content={`Discuss advertising and sponsorship opportunities with ${siteName}. Tell us about your campaign, audience, budget and questions.`} /></Helmet>
    <section className="border-b border-line bg-surface-muted"><div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16"><p className="eyebrow">Partnerships & sponsorships</p><h1 className="text-4xl sm:text-5xl font-black leading-tight max-w-3xl">Advertise with {siteName}.</h1><p className="text-muted max-w-2xl mt-5 leading-relaxed">Have a product, service or brand you would like to promote? Tell us what you have in mind. We will review your request and discuss suitable placements, availability and pricing with you.</p><a href="#sponsorship-form" className="btn-primary inline-flex items-center gap-3 mt-7">Tell us about your campaign<FiArrowRight /></a></div></section>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
      <aside className="space-y-6 lg:sticky lg:top-28"><div className="glass p-6"><FiMessageSquare className="w-6 h-6 text-gold-600 mb-4" /><h2 className="font-bold text-lg">Let us understand your idea.</h2><p className="text-muted text-sm leading-relaxed mt-3">Answer in your own words. You can ask for a quote, suggest a format or explain a special request.</p><p className="text-muted text-sm leading-relaxed mt-3">Only your name, email, campaign description and goal are required. All other campaign questions are optional.</p></div><div className="text-sm text-muted space-y-4"><p><strong className="block text-ink mb-1">1. Share your plans</strong>Give us the details you already know.</p><p><strong className="block text-ink mb-1">2. Discuss the options</strong>We will get back to you using your contact details.</p><p><strong className="block text-ink mb-1">3. Agree on the campaign</strong>Confirm the placement, timing and price with our team.</p></div></aside>
      <section id="sponsorship-form" ref={formRef} className="min-w-0 scroll-mt-28">
        {success ? <div ref={feedbackRef} tabIndex={-1} role="status" className="glass-strong p-8 sm:p-12 text-center"><FiCheckCircle className="mx-auto text-green-600 w-12 h-12 mb-5" /><h2 className="text-2xl sm:text-3xl font-black">Sponsorship request received</h2><p className="text-muted leading-relaxed mt-4 max-w-lg mx-auto">Thank you for sharing your campaign. Our team will review your answers and contact you about your request.</p><div className="flex flex-wrap justify-center gap-3 mt-7"><Link to="/" className="btn-primary">Back to the website</Link><button type="button" className="btn-ghost" onClick={() => { setSuccess(false); formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Send another request</button></div></div>
          : <form onSubmit={submit} aria-label="Sponsorship request" className="space-y-7">
            <div><h2 className="text-2xl font-black">Tell us about your campaign</h2><p className="text-muted text-sm mt-2">Questions marked <span aria-hidden="true">*</span> are required. Skip any optional question you have not decided on yet.</p></div>
            {error && <div ref={feedbackRef} tabIndex={-1} role="alert" className="border border-red-300 bg-red-50 text-red-800 p-4 rounded-xl"><p>{error}</p>{!config && <button type="button" className="underline mt-2" onClick={() => setRetry(value => value + 1)}>Try again</button>}</div>}
            {!config && !error && <p role="status" className="text-muted">Loading the sponsorship questions…</p>}
            {config?.groups.map((group, index) => <fieldset key={group.title} className="glass-strong p-5 sm:p-7 min-w-0"><legend className="sr-only">{group.title}</legend><div className="flex gap-3 items-start mb-6"><span aria-hidden="true" className="bg-gold-500/15 text-gold-600 w-8 h-8 grid place-items-center rounded-full shrink-0 font-bold">{index + 1}</span><div><h3 className="font-bold text-lg">{group.title}</h3><p className="text-muted text-sm mt-1 leading-relaxed">{group.description}</p></div></div><div className="grid sm:grid-cols-2 gap-x-5 gap-y-6">{group.fields.map(field => {
              const id = `sponsor-${field.key}`; const issue = fieldErrors[field.key];
              const props = { id, name: field.key, className: 'input-field', required: !!field.required, minLength: field.minLength, maxLength: field.maxLength, placeholder: field.placeholder || '', autoComplete: field.autoComplete || 'off', value: form[field.key] || '', onChange: event => update(field.key, event.target.value), 'aria-invalid': issue ? true : undefined, 'aria-describedby': issue ? `${id}-error` : undefined };
              return <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2 min-w-0' : 'min-w-0'}><label htmlFor={id} className="block text-sm font-semibold leading-relaxed mb-2">{field.label}{field.required ? <span aria-hidden="true" className="text-gold-600 ml-1">*</span> : <span className="block text-muted text-xs font-normal mt-1">Optional</span>}</label>{field.type === 'textarea' ? <textarea {...props} rows={4} /> : <input {...props} type={field.type || 'text'} />}{issue && <p id={`${id}-error`} className="text-red-600 text-sm mt-2">{issue}</p>}</div>;
            })}</div></fieldset>)}
            {config && <div className="glass-strong p-5 sm:p-7 space-y-5"><fieldset><legend className="font-semibold text-sm leading-relaxed mb-3">{config.consentQuestion} <span aria-hidden="true">*</span></legend><label htmlFor="sponsor-consent" className="flex items-start gap-3 text-sm text-muted leading-relaxed"><input id="sponsor-consent" type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 w-4 h-4 shrink-0" aria-invalid={fieldErrors.contactConsent ? true : undefined} aria-describedby={fieldErrors.contactConsent ? 'sponsor-consent-error' : undefined} /><span>I agree to be contacted about this request and have read the <Link className="text-ink underline underline-offset-4" to="/policies?section=privacy">privacy policy</Link>.</span></label>{fieldErrors.contactConsent && <p id="sponsor-consent-error" className="text-red-600 text-sm mt-2">{fieldErrors.contactConsent}</p>}</fieldset><button type="submit" disabled={busy} className="btn-primary w-full inline-flex justify-center items-center gap-3 disabled:opacity-50">{busy ? 'Sending your request…' : 'Send sponsorship request'}<FiArrowRight /></button></div>}
          </form>}
      </section>
    </div>
  </div>;
}
