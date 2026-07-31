const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

export function loadTurnstileScript() {
  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  const existingScript = document.getElementById(
    TURNSTILE_SCRIPT_ID,
  ) as HTMLScriptElement | null;

  if (existingScript?.dataset.turnstileLoaded === "true") {
    return Promise.resolve();
  }

  const script = existingScript ?? document.createElement("script");

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const handleLoad = () => {
      script.dataset.turnstileLoaded = "true";
      resolve();
    };

    const handleError = () => {
      turnstileScriptPromise = null;
      script.remove();
      reject(new Error("Could not load Cloudflare Turnstile."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });

  return turnstileScriptPromise;
}
