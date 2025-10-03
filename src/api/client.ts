import axios from "axios";

/**
 * Shared Axios client for the app.
 * - Base URL points to public PokeAPI (no key required).
 * - Timeout + JSON headers.
 * - Simple error logging via interceptor.
 */
export const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Optional: centralized logging
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.error("[API ERROR]", err?.response?.status, err?.message);
    }
    return Promise.reject(err);
  }
);
