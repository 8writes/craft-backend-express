const { createServerClient } = require('@supabase/ssr');

exports.createClient = (context) => {
  const cookies = context.req.cookies || {};

  return createServerClient(process.env.PUBLIC_URL, process.env.PUBLIC_ANON_KEY, {
    cookies: {
      get: (key) => {
        const cookie = cookies[key] || '';
        return decodeURIComponent(cookie);
      },
      set: (key, value, options) => {
        if (!context.res) return;
        context.res.cookie(key, encodeURIComponent(value), {
          ...options,
          sameSite: 'Lax',
          httpOnly: true,
        });
      },
      remove: (key, options) => {
        if (!context.res) return;
        context.res.cookie(key, '', { ...options, httpOnly: true });
      },
    },
  });
};
