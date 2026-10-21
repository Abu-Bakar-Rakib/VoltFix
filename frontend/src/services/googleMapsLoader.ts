// Robust Google Maps JavaScript API script loader with authFailure detection

type AuthFailureListener = (errorMsg: string) => void;
const authListeners: AuthFailureListener[] = [];

let loadPromise: Promise<typeof google.maps> | null = null;
let currentKeyLoaded = '';

export function onGoogleMapsAuthFailure(listener: AuthFailureListener): () => void {
  authListeners.push(listener);
  if (typeof window !== 'undefined' && (window as any).__voltfix_gm_auth_failed) {
    listener((window as any).__voltfix_gm_auth_failed_msg || 'Google Maps Authentication Failed.');
  }
  return () => {
    const idx = authListeners.indexOf(listener);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
}

export function loadGoogleMapsScript(apiKey: string): Promise<typeof google.maps> {
  const cleanKey = apiKey.trim();

  if (!cleanKey) {
    return Promise.reject(new Error('Google Maps API key is empty.'));
  }

  // Reset auth failure flag for new attempt
  if (typeof window !== 'undefined') {
    (window as any).__voltfix_gm_auth_failed = false;
  }

  // Return existing loaded maps instance if same key
  if (typeof window !== 'undefined' && (window as any).google?.maps && currentKeyLoaded === cleanKey) {
    return Promise.resolve((window as any).google.maps);
  }

  currentKeyLoaded = cleanKey;

  loadPromise = new Promise((resolve, reject) => {
    // Clean up any stale Google Maps scripts if key changed
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.remove();
      if ((window as any).google) {
        delete (window as any).google;
      }
    }

    const callbackName = '__voltfix_gmaps_cb_' + Date.now();

    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps script loaded but google.maps namespace is undefined.'));
      }
    };

    // Global listener for Google Maps Authentication Errors (ApiNotActivated, BillingNotEnabled, RefererNotAllowed)
    (window as any).gm_authFailure = () => {
      const authErrText =
        'Google Maps rejected this API key. Most common causes:\n1. "Maps JavaScript API" is not enabled in Google Cloud Console.\n2. Billing account is not linked to your Google Cloud project.\n3. Key HTTP referrer restrictions block localhost:5173.';
      (window as any).__voltfix_gm_auth_failed = true;
      (window as any).__voltfix_gm_auth_failed_msg = authErrText;
      authListeners.forEach((fn) => fn(authErrText));
      reject(new Error(authErrText));
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      cleanKey
    )}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      const netErr = 'Network error: Unable to download Google Maps API script from Google servers.';
      authListeners.forEach((fn) => fn(netErr));
      reject(new Error(netErr));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
