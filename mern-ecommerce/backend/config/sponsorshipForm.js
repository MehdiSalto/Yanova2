const groups = [
  { title: 'Your contact details', description: 'Tell us who you are and how you would like us to get in touch.', fields: [
    { key: 'fullName', label: 'What is your full name?', type: 'text', required: true, minLength: 2, maxLength: 200, autoComplete: 'name' },
    { key: 'email', label: 'Which email address should we reply to?', type: 'email', required: true, maxLength: 254, autoComplete: 'email' },
    { key: 'companyName', label: 'What is the name of your company, brand or project?', type: 'text', maxLength: 200, autoComplete: 'organization' },
    { key: 'role', label: 'What is your role, or are you contacting us on behalf of another brand?', type: 'text', maxLength: 500, placeholder: 'For example: owner, marketing manager or agency representative' },
    { key: 'website', label: 'Which website represents your brand or business?', type: 'url', maxLength: 2048, placeholder: 'https://example.com' },
    { key: 'phone', label: 'What phone or WhatsApp number can we use to reach you?', type: 'tel', maxLength: 100, autoComplete: 'tel', placeholder: 'Include your country code, if you would like a phone reply' },
    { key: 'contactPreference', label: 'How and when would you prefer us to contact you?', type: 'text', maxLength: 1000, placeholder: 'Email, WhatsApp, a suitable time, or another preference' },
    { key: 'countryTimezone', label: 'Which country and time zone are you based in?', type: 'text', maxLength: 300, placeholder: 'Your country, city or time zone' },
  ] },
  { title: 'Your campaign', description: 'Describe what you would like to promote and the outcome you are looking for.', fields: [
    { key: 'promotedItem', label: 'What product, service, brand or project would you like to advertise?', type: 'textarea', required: true, minLength: 3, maxLength: 6000, placeholder: 'Describe your offer and anything we should know about it' },
    { key: 'campaignGoal', label: 'What would you like this sponsorship to achieve?', type: 'textarea', required: true, minLength: 3, maxLength: 4000, placeholder: 'For example: brand awareness, website visits, a product launch or enquiries' },
    { key: 'destinationUrl', label: 'Where should visitors go when they click your advertisement?', type: 'url', maxLength: 2048, placeholder: 'https://example.com/your-campaign' },
    { key: 'socialProfiles', label: 'Which social profiles or other links would help us understand your brand?', type: 'textarea', maxLength: 2000, placeholder: 'Share any relevant profiles, handles or links' },
  ] },
  { title: 'The audience you want to reach', description: 'Share the audience that matters to your campaign. Leave anything undecided blank.', fields: [
    { key: 'targetAudience', label: 'Who would you like your advertisement to reach?', type: 'textarea', maxLength: 3000, placeholder: 'Interests, customer type, age range or other relevant audience details' },
    { key: 'targetCountries', label: 'Which countries, regions or cities would you like to reach?', type: 'text', maxLength: 2000, placeholder: 'List your preferred markets, or write worldwide' },
    { key: 'languages', label: 'Which language or languages would you like to use?', type: 'text', maxLength: 500, placeholder: 'List any preferred languages' },
  ] },
  { title: 'Placement and advertising materials', description: 'Tell us your preferences. We will discuss the available options with you.', fields: [
    { key: 'preferredPlacements', label: 'Where on our website would you like your promotion to appear?', type: 'textarea', maxLength: 2000, placeholder: 'For example: the home page, a top or middle banner, the footer, or ask us to suggest a placement' },
    { key: 'adFormat', label: 'What type of advertisement or sponsorship do you have in mind?', type: 'text', maxLength: 1000, placeholder: 'A banner, a sponsored feature, text with a link, or another idea' },
    { key: 'adCopy', label: 'What headline, message, offer or call to action should your advertisement include?', type: 'textarea', maxLength: 4000, placeholder: 'Paste your proposed wording, promotion code or message, if you have one' },
    { key: 'creativeLinks', label: 'Can you share links to your logo, images, banners or campaign materials?', type: 'textarea', maxLength: 3000, placeholder: 'Paste shareable links. Please make sure we can open them without requesting access.' },
    { key: 'creativeSupport', label: 'What help, if any, would you need with the advertising materials?', type: 'textarea', maxLength: 2000, placeholder: 'Describe any design, sizing, wording or other support you would like to discuss' },
  ] },
  { title: 'Timing, budget and reporting', description: 'An estimate is enough. You can also ask us for a proposal.', fields: [
    { key: 'startDate', label: 'When would you like the campaign to start?', type: 'text', maxLength: 500, placeholder: 'A preferred date, a date range, or flexible' },
    { key: 'duration', label: 'How long would you like the promotion to run?', type: 'text', maxLength: 500, placeholder: 'For example: one week, one month, recurring, or not decided yet' },
    { key: 'budget', label: 'What budget and currency do you have in mind, or would you like a quote?', type: 'text', maxLength: 500, placeholder: 'An amount, an estimated range, or please send me a quote' },
    { key: 'reporting', label: 'Which results or reports would you like us to discuss with you?', type: 'textarea', maxLength: 2000, placeholder: 'For example: views, outbound clicks, country breakdown, or reporting frequency' },
  ] },
  { title: 'Your questions and additional details', description: 'Use this space to ask us anything or explain requirements that were not covered above.', fields: [
    { key: 'specialRequirements', label: 'Are there any deadlines, conditions, exclusions or special requirements we should know about?', type: 'textarea', maxLength: 3000 },
    { key: 'questions', label: 'What questions would you like to ask us about prices, availability, placements or the sponsorship?', type: 'textarea', maxLength: 6000, placeholder: 'Write all the questions you would like us to answer' },
    { key: 'otherDetails', label: 'Is there anything else you would like to tell us?', type: 'textarea', maxLength: 5000 },
  ] },
];
const fields = groups.flatMap(group => group.fields);
const statuses = ['new', 'reviewing', 'replied', 'approved', 'declined', 'archived'];
const consentQuestion = 'May we use the contact details above to respond to your sponsorship request?';
module.exports = { groups, fields, statuses, consentQuestion };
