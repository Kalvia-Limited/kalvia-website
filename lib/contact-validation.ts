export const interests = ["Academy", "Sponsoring", "Marketplace", "Partnership"] as const;
export const limits = { name: 120, email: 254, message: 5000, website: 200 } as const;
export type ContactInput = { name: string; email: string; interest: typeof interests[number]; message: string; website: string };
export type FieldErrors = Partial<Record<keyof ContactInput, string>>;
export function validateContact(value: unknown): { data?: ContactInput; errors: FieldErrors } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { errors: { message: "Please complete the enquiry form." } };
  const source = value as Record<string, unknown>;
  const errors: FieldErrors = {};
  const text = (key: keyof ContactInput) => typeof source[key] === "string" ? source[key].trim().normalize("NFC") : "";
  const name = text("name");
  const email = text("email").toLowerCase();
  const message = text("message").replace(/\r\n?/g, "\n");
  const interest = text("interest");
  const website = text("website");
  if (!name || name.length > limits.name || /[\u0000-\u001f\u007f]/.test(name)) errors.name = "Enter your name (up to 120 characters).";
  if (!email || email.length > limits.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\u0000-\u001f\u007f]/.test(email)) errors.email = "Enter a valid email address.";
  if (!interests.includes(interest as ContactInput["interest"])) errors.interest = "Choose an enquiry interest.";
  if (!message || message.length > limits.message || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) errors.message = "Enter a message (up to 5,000 characters).";
  if ((source.website !== undefined && typeof source.website !== "string") || website.length > limits.website) errors.website = "Unable to accept this enquiry.";
  if (Object.keys(errors).length) return { errors };
  return { data: { name, email, message, interest: interest as ContactInput["interest"], website }, errors };
}
