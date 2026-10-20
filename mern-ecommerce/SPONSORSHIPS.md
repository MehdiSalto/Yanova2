# Advertising and sponsorship enquiries

The public **Advertise** page is linked in the main navigation, the company
footer and the existing contact page. It contains 27 open-answer questions in
six sections: contact details, campaign, audience, placement/materials,
timing/budget/reporting, and additional questions.

Only name, reply email, the description of the advertised offer, and campaign
goal are required. Other campaign fields are optional. Contact consent is
required for sending. Optional date, duration, budget and placement answers
are free text so advertisers can describe undecided or unusual requests.

Question labels, input types and answer limits are defined once in
`backend/config/sponsorshipForm.js`. Both interfaces load this public question
schema. Submissions are saved to MongoDB; a unique submission ID prevents a
network retry from creating another enquiry.

The private **Sponsorships** section lists requests, searches by name/company/
email/campaign, filters their progress, shows every answer and stores internal
notes. Statuses are New, Reviewing, Replied (manual), Approved, Declined and
Archived. A dashboard counter tracks new requests. Replies use the supplied
contact details; changing status records progress. Campaign publication is a
separate decision agreed with the advertiser.

API routes:

- `GET /api/sponsorships/form`: public question schema only.
- `POST /api/sponsorships`: validated, CSRF-protected and rate-limited enquiry.
- `GET /api/sponsorships`: authenticated administrator list and search.
- `PATCH /api/sponsorships/:id`: authenticated, CSRF-protected status/notes.
- `DELETE /api/sponsorships/:id`: authenticated, CSRF-protected deletion.

Private enquiry responses are uncached. Public submission receipts do not
expose saved personal data or internal workflow fields. Form errors retain
answers and identify fields to correct. The public page contains no private
management navigation.

No new environment variables or services are required. Deploy the backend and
both frontend builds through the existing hosting workflow.

Verification: `npm run test:integration` in backend checks persistence,
validation, retry deduplication, access controls, workflow and pagination against
disposable MongoDB. The frontend's `AdvertisePage.test.js` checks question/label
accessibility, submission, recoverable errors, retries and duplicate-send
protection in the component test environment.
