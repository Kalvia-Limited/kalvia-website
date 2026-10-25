"use client";

import { useEffect, useRef, useState } from "react";
import { interests, limits, validateContact, type FieldErrors } from "@/lib/contact-validation";
import { Reveal, useInteractions } from "./interactions";

export function ContactForm() {
  const { interest, setInterest } = useInteractions();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  return <Reveal as="form" id="contact-form" tabIndex={-1} className="contact reveal" aria-labelledby="contact-title" aria-describedby="contact-privacy contact-status" aria-busy={pending} noValidate onSubmit={async event => {
    event.preventDefault();
    if (active.current) return;
    const form = event.currentTarget as HTMLFormElement;
    const fields = new FormData(form);
    const input = Object.fromEntries(["name", "email", "message", "interest", "website"].map(key => [key, fields.get(key)]));
    const validation = validateContact(input);
    setSuccess(false);
    setErrors(validation.errors);
    if (!validation.data) {
      setStatus("Please check the highlighted fields.");
      form.querySelector<HTMLElement>(`[name="${Object.keys(validation.errors)[0]}"]`)?.focus();
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setStatus("Saving your enquiry…");
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validation.data), signal: controller.signal });
      const result = await response.json();
      if (response.status === 201) {
        setSuccess(true);
        setStatus("Your enquiry has been received.");
        form.reset();
        setInterest("Academy");
      } else if (response.status === 422) {
        setErrors(result.errors ?? {});
        setStatus("Please check the highlighted fields.");
        requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      } else if (response.status === 429) {
        setStatus("Too many enquiries. Please try again in 10 minutes. Your entries have been kept.");
      } else setStatus("We couldn't save your enquiry. Please try again later. Your entries have been kept.");
    } catch {
      setStatus("We couldn't confirm your enquiry was saved. Please try again later. Your entries have been kept.");
    } finally {
      clearTimeout(timer);
      active.current = null;
      setPending(false);
    }
  }}>
    <fieldset className="contact-fields" disabled={pending}>
      <legend className="sr-only">Enquiry details</legend>
      <fieldset className="interest-options"><legend>I&apos;m interested in</legend><div className="chips">{interests.map(value => <label key={value}><input type="radio" name="interest" value={value} checked={interest === value} onChange={() => setInterest(value)} aria-describedby={errors.interest ? "interest-error" : undefined} /><span>{value === "Sponsoring" ? "Sponsoring a learner" : value}</span></label>)}</div>{errors.interest && <p className="field-error" id="interest-error">{errors.interest}</p>}</fieldset>
      <div className="row2">{([ ["name", "Full name", "text", "name"], ["email", "Email", "email", "email"] ] as const).map(([key, label, type, autoComplete]) => <div className="field" key={key}><label htmlFor={`f-${key}`}>{label}</label><input id={`f-${key}`} name={key} type={type} autoComplete={autoComplete} required maxLength={limits[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />{errors[key] && <p className="field-error" id={`${key}-error`}>{errors[key]}</p>}</div>)}</div>
      <div className="field"><label htmlFor="f-msg">Message</label><textarea id="f-msg" name="message" required maxLength={limits.message} placeholder="Tell us about your goals" aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />{errors.message && <p className="field-error" id="message-error">{errors.message}</p>}</div>
      <div className="contact-honeypot" aria-hidden="true"><label htmlFor="f-website">Leave this field empty</label><input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={limits.website} /></div>
      <p className="hint" id="contact-privacy">We store your name, email, enquiry interest and message to respond to your enquiry, for up to 180 days.</p>
      <button className="btn btn-orange" type="submit" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Sending…" : "Send message"} <span className="arrow" aria-hidden="true">→</span></button>
    </fieldset>
    <p id="contact-status" role="status" aria-live="polite" aria-atomic="true" className={success ? "contact-status success" : "contact-status"}>{status}</p>
  </Reveal>;
}
