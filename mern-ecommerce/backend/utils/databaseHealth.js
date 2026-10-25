const databaseFailureCode = error => {
  if (error?.code === 13) return 'DATABASE_ACCESS_DENIED';
  if (error?.code === 18) return 'DATABASE_AUTH_FAILED';
  if (/Mongo(Network|ServerSelection|Topology)/.test(error?.name || '')) return 'DATABASE_UNREACHABLE';
  return 'DATABASE_READ_FAILED';
};

const checkDatabase = async connection => {
  if (connection.readyState !== 1) return { status: 'unavailable', code: 'DATABASE_DISCONNECTED' };
  try {
    // A connected socket does not prove that the configured user can read the
    // application database. Probe the same collection used by the storefront.
    await connection.db.collection('products').findOne({}, { projection: { _id: 1 }, maxTimeMS: 2000 });
    return { status: 'ready' };
  } catch (error) {
    return { status: 'unavailable', code: databaseFailureCode(error) };
  }
};

const readinessHandler = connection => async (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  const health = await checkDatabase(connection);
  res.status(health.status === 'ready' ? 200 : 503).json(health);
};
module.exports = { checkDatabase, databaseFailureCode, readinessHandler };
