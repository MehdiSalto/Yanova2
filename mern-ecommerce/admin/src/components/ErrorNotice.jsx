export const errorMessage = error => {
  const fields = error.response?.data?.errors;
  return fields?.length ? fields.map(field => `${field.path}: ${field.msg}`).join(' · ') : error.response?.data?.message || 'Unable to complete the request. Please try again.';
};
const ErrorNotice = ({ message, onRetry }) => message ? <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">{message}{onRetry && <button onClick={onRetry} className="ml-3 underline">Retry</button>}</div> : null;
export default ErrorNotice;
