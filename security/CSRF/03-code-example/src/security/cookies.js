/**
 * Tiny Cookie header helpers — avoid a dependency for a learning demo.
 */
export function parseCookies(header) {
  const cookies = {};
  if (!header) {
    return cookies;
  }

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) {
      continue;
    }

    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[name] = decodeURIComponent(value);
  }

  return cookies;
}

export function serializeCookie(name, value, options = {}) {
  const pieces = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path ?? "/"}`];

  if (options.httpOnly) {
    pieces.push("HttpOnly");
  }

  if (options.sameSite) {
    pieces.push(`SameSite=${options.sameSite}`);
  }

  if (options.maxAge === 0) {
    pieces.push("Max-Age=0");
  }

  return pieces.join("; ");
}
