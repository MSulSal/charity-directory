"use client";

import { useState } from "react";

interface ApplyRecommendFormProps {
  categoryOptions: string[];
  contactEmail: string;
}

type SubmissionType = "recommend" | "apply";

interface SubmissionFormState {
  submissionType: SubmissionType;
  organizationName: string;
  organizationWebsite: string;
  category: string;
  location: string;
  contactName: string;
  contactEmail: string;
  relationship: string;
  detailNotes: string;
  evidenceLinks: string;
  consent: boolean;
}

const relationshipOptions = [
  "Donor",
  "Volunteer",
  "Program participant",
  "Nonprofit staff",
  "Community partner",
  "Other",
];

const defaultState: SubmissionFormState = {
  submissionType: "recommend",
  organizationName: "",
  organizationWebsite: "",
  category: "",
  location: "",
  contactName: "",
  contactEmail: "",
  relationship: "",
  detailNotes: "",
  evidenceLinks: "",
  consent: false,
};

function buildEmailDraft(
  submission: SubmissionFormState,
  contactEmail: string,
) {
  const subjectPrefix =
    submission.submissionType === "apply"
      ? "Apply to Claim or Update Listing"
      : "Recommended Charity Submission";
  const subject = `${subjectPrefix}: ${submission.organizationName}`;
  const body = [
    `Type: ${submission.submissionType}`,
    `Organization: ${submission.organizationName}`,
    `Website: ${submission.organizationWebsite || "Not provided"}`,
    `Category: ${submission.category || "Not provided"}`,
    `Location: ${submission.location || "Not provided"}`,
    `Contact Name: ${submission.contactName || "Not provided"}`,
    `Contact Email: ${submission.contactEmail || "Not provided"}`,
    `Relationship: ${submission.relationship || "Not provided"}`,
    `Details: ${submission.detailNotes}`,
    `Evidence Links: ${submission.evidenceLinks || "Not provided"}`,
  ].join("\n");

  return `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ApplyRecommendForm({
  categoryOptions,
  contactEmail,
}: ApplyRecommendFormProps) {
  const [formState, setFormState] = useState<SubmissionFormState>(defaultState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailDraftLink, setEmailDraftLink] = useState<string | null>(null);

  function updateField<Key extends keyof SubmissionFormState>(
    key: Key,
    value: SubmissionFormState[Key],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formState.consent) {
      setErrorMessage("Please confirm that the details are accurate before submitting.");
      return;
    }

    const draft = buildEmailDraft(formState, contactEmail);
    setEmailDraftLink(draft);
    setSuccessMessage("Your email app should open with the details filled in. Send the email to complete your recommendation or claim request.");
    window.location.assign(draft);
  }

  return (
    <div className="space-y-6">
      <div className="dark-panel space-y-3 p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
          Apply or Recommend a Charity
        </h2>
        <p className="text-sm leading-7 text-[var(--color-text-muted)]">
          Use this form to recommend a new charity listing or apply to claim and update an existing profile.
        </p>
        <p className="text-xs leading-6 text-[var(--color-text-faint)]">
          This form opens a pre-filled email to our directory team. Your details are not stored by this website; send the email to complete your request.
        </p>
      </div>

      <form className="dark-panel space-y-5 p-5 sm:p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-[var(--color-text-muted)]">
            <span className="mb-2 block uppercase tracking-wide">Submission type</span>
            <select
              value={formState.submissionType}
              onChange={(event) =>
                updateField("submissionType", event.target.value as SubmissionType)
              }
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
            >
              <option value="recommend">Recommend a charity</option>
              <option value="apply">Apply to claim/update listing</option>
            </select>
          </label>

          <label className="text-xs text-[var(--color-text-muted)]">
            <span className="mb-2 block uppercase tracking-wide">Category</span>
            <select
              value={formState.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
            >
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
            <span className="mb-2 block uppercase tracking-wide">Charity name</span>
            <input
              value={formState.organizationName}
              onChange={(event) => updateField("organizationName", event.target.value)}
              required
              placeholder="Organization name"
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>

          <label className="text-xs text-[var(--color-text-muted)]">
            <span className="mb-2 block uppercase tracking-wide">Website</span>
            <input
              value={formState.organizationWebsite}
              onChange={(event) => updateField("organizationWebsite", event.target.value)}
              type="url"
              placeholder="https://example.org"
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>

          <label className="text-xs text-[var(--color-text-muted)]">
            <span className="mb-2 block uppercase tracking-wide">Primary location</span>
            <input
              value={formState.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="City, state, ZIP, or service area"
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>

          <label className="text-xs text-[var(--color-text-muted)]">
            <span className="mb-2 block uppercase tracking-wide">Your name</span>
            <input
              value={formState.contactName}
              onChange={(event) => updateField("contactName", event.target.value)}
              placeholder="Full name"
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>

          <label className="text-xs text-[var(--color-text-muted)]">
            <span className="mb-2 block uppercase tracking-wide">Your email</span>
            <input
              value={formState.contactEmail}
              onChange={(event) => updateField("contactEmail", event.target.value)}
              type="email"
              placeholder="name@email.com"
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>

          <label className="text-xs text-[var(--color-text-muted)]">
            <span className="mb-2 block uppercase tracking-wide">Relationship to org</span>
            <select
              value={formState.relationship}
              onChange={(event) => updateField("relationship", event.target.value)}
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
            >
              <option value="">Select relationship</option>
              {relationshipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
            <span className="mb-2 block uppercase tracking-wide">Why should this be included?</span>
            <textarea
              value={formState.detailNotes}
              onChange={(event) => updateField("detailNotes", event.target.value)}
              required
              rows={5}
              placeholder="Mission, populations served, why this listing should be included or updated..."
              className="w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 py-2 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>

          <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
            <span className="mb-2 block uppercase tracking-wide">Evidence links (optional)</span>
            <textarea
              value={formState.evidenceLinks}
              onChange={(event) => updateField("evidenceLinks", event.target.value)}
              rows={3}
              placeholder="Official website pages, Form 990 links, verification pages, and other references"
              className="w-full border border-[var(--color-border)] bg-[var(--color-field-bg-strong)] px-3 py-2 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>
        </div>

        <label className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]">
          <input
            type="checkbox"
            checked={formState.consent}
            onChange={(event) => updateField("consent", event.target.checked)}
            className="mt-1 h-4 w-4 border border-[var(--color-border)] bg-[var(--color-field-bg-strong)]"
          />
          <span>
            I confirm these details are accurate to the best of my knowledge and can be reviewed for listing quality and trust checks.
          </span>
        </label>

        {errorMessage ? (
          <p className="border border-[var(--color-rose)] bg-[color:rgb(229_106_166_/_12%)] px-3 py-2 text-sm text-[var(--color-text-strong)]">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="border border-[var(--color-soft-amethyst)] bg-[color:rgb(140_107_196_/_14%)] px-3 py-2 text-sm text-[var(--color-text-strong)]">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="h-11 border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-5 text-sm font-semibold text-[var(--color-obsidian)] transition hover:brightness-95"
          >
            Open Email Draft
          </button>
          {emailDraftLink ? (
            <a
              href={emailDraftLink}
              className="h-11 border border-[var(--color-border)] px-5 text-sm font-medium leading-[2.75rem] text-[var(--color-text-strong)] transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
            >
              Reopen Email Draft
            </a>
          ) : null}
        </div>
      </form>
    </div>
  );
}
