module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/features/waitlist/schemas/waitlist.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseWaitlistEmail",
    ()=>parseWaitlistEmail
]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function parseWaitlistEmail(payload) {
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!emailPattern.test(email)) {
        return null;
    }
    return email;
}
;
}),
"[project]/src/features/waitlist/server/anti-bot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isLikelyBot",
    ()=>isLikelyBot
]);
const minimumSubmitTimeMs = 900;
function isLikelyBot(payload) {
    const honeypot = typeof payload.website === "string" ? payload.website.trim() : "";
    if (honeypot) {
        return true;
    }
    const formStartedAt = typeof payload.formStartedAt === "number" ? payload.formStartedAt : Number(payload.formStartedAt);
    if (!Number.isFinite(formStartedAt)) {
        return false;
    }
    return Date.now() - formStartedAt < minimumSubmitTimeMs;
}
;
}),
"[project]/src/features/waitlist/server/confirmation-email.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "confirmationHtml",
    ()=>confirmationHtml,
    "confirmationSubject",
    ()=>confirmationSubject,
    "confirmationText",
    ()=>confirmationText
]);
const confirmationSubject = "You're on the BetaQuill waitlist";
function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function confirmationHtml(email) {
    const safeEmail = escapeHtml(email);
    return `
    <div style="margin:0;padding:0;background:#F5F0E8;color:#1C1812;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
        <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;line-height:1.1;color:#1C1812;">
          You're on the BetaQuill waitlist.
        </p>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#4A4035;">
          Thanks for joining. We'll write when BetaQuill is ready and send your waitlist-only launch discount code.
        </p>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#4A4035;">
          If one part of your beta reading workflow feels painfully manual, reply and tell us what it is. We read every note.
        </p>
        <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:#6B6456;">
          Registered email: ${safeEmail}
        </p>
        <div style="height:1px;background:rgba(28,24,18,0.12);margin:0 0 20px;"></div>
        <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8B7355;">
          BetaQuill early access · launch discount reserved
        </p>
      </div>
    </div>
  `;
}
function confirmationText(email) {
    return `You're on the BetaQuill waitlist.

Thanks for joining. We'll write when BetaQuill is ready and send your waitlist-only launch discount code. No spam.

If one part of your beta reading workflow feels painfully manual, reply and tell us what it is. We read every note.

Registered email: ${email}

BetaQuill early access`;
}
;
}),
"[project]/src/features/waitlist/server/resend-errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isDuplicateContactError",
    ()=>isDuplicateContactError,
    "resendErrorDetail",
    ()=>resendErrorDetail
]);
function errorStatus(error) {
    if (typeof error !== "object" || error === null) {
        return undefined;
    }
    if ("statusCode" in error && typeof error.statusCode === "number") {
        return error.statusCode;
    }
    if ("status" in error && typeof error.status === "number") {
        return error.status;
    }
    return undefined;
}
function errorMessage(error) {
    if (typeof error !== "object" || error === null || !("message" in error)) {
        return "";
    }
    return String(error.message);
}
function errorName(error) {
    if (typeof error !== "object" || error === null || !("name" in error)) {
        return undefined;
    }
    return String(error.name);
}
function resendErrorDetail(error) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return {
        detail: {
            name: errorName(error),
            statusCode: errorStatus(error),
            message: errorMessage(error) || "Unknown Resend error"
        }
    };
}
function isDuplicateContactError(error) {
    const status = errorStatus(error);
    const message = errorMessage(error);
    return status === 409 || /already exists|duplicate|exists/i.test(message);
}
;
}),
"[project]/src/features/waitlist/server/handle-waitlist-signup.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleWaitlistSignup",
    ()=>handleWaitlistSignup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$resend$40$6$2e$17$2e$2$2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/resend@6.17.2/node_modules/resend/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$schemas$2f$waitlist$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/schemas/waitlist.schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$anti$2d$bot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/server/anti-bot.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$confirmation$2d$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/server/confirmation-email.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$resend$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/server/resend-errors.ts [app-route] (ecmascript)");
;
;
;
;
;
async function handleWaitlistSignup(payload) {
    const email = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$schemas$2f$waitlist$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseWaitlistEmail"])(payload);
    if (!email) {
        return {
            status: 400,
            body: {
                ok: false,
                error: "Invalid email"
            }
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$anti$2d$bot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLikelyBot"])(payload)) {
        return {
            status: 200,
            body: {
                ok: true
            }
        };
    }
    if (!process.env.RESEND_API_KEY) {
        return {
            status: 500,
            body: {
                ok: false,
                error: "RESEND_API_KEY is not configured"
            }
        };
    }
    if (!process.env.RESEND_FROM) {
        return {
            status: 500,
            body: {
                ok: false,
                error: "RESEND_FROM is not configured"
            }
        };
    }
    const resend = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$resend$40$6$2e$17$2e$2$2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resend"](process.env.RESEND_API_KEY);
    const segmentId = process.env.RESEND_WAITLIST_SEGMENT_ID;
    try {
        const { error: createError } = await resend.contacts.create({
            email,
            unsubscribed: false
        });
        if (createError && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$resend$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDuplicateContactError"])(createError)) {
            console.error("Resend contact creation failed", createError);
            return {
                status: 502,
                body: {
                    ok: false,
                    error: "Could not create contact",
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$resend$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resendErrorDetail"])(createError)
                }
            };
        }
        if (segmentId) {
            const { error: segmentError } = await resend.contacts.segments.add({
                email,
                segmentId
            });
            if (segmentError && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$resend$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDuplicateContactError"])(segmentError)) {
                console.error("Resend segment add failed", segmentError);
                return {
                    status: 502,
                    body: {
                        ok: false,
                        error: "Could not add contact to waitlist segment",
                        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$resend$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resendErrorDetail"])(segmentError)
                    }
                };
            }
        }
        const { error: emailError } = await resend.emails.send({
            from: process.env.RESEND_FROM,
            to: [
                email
            ],
            subject: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$confirmation$2d$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["confirmationSubject"],
            html: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$confirmation$2d$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["confirmationHtml"])(email),
            text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$confirmation$2d$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["confirmationText"])(email),
            replyTo: process.env.RESEND_REPLY_TO || undefined,
            tags: [
                {
                    name: "source",
                    value: "waitlist"
                }
            ]
        });
        if (emailError) {
            console.error("Resend confirmation email failed", emailError);
            return {
                status: 502,
                body: {
                    ok: false,
                    error: "Contact saved, but confirmation email failed",
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$resend$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resendErrorDetail"])(emailError)
                }
            };
        }
    } catch (error) {
        console.error("Resend request failed", error);
        return {
            status: 502,
            body: {
                ok: false,
                error: "Could not reach Resend",
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$resend$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resendErrorDetail"])(error)
            }
        };
    }
    return {
        status: 200,
        body: {
            ok: true
        }
    };
}
;
}),
"[project]/src/features/waitlist/server/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$handle$2d$waitlist$2d$signup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/server/handle-waitlist-signup.ts [app-route] (ecmascript)");
;
}),
"[project]/src/app/api/waitlist/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/features/waitlist/server/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$handle$2d$waitlist$2d$signup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/server/handle-waitlist-signup.ts [app-route] (ecmascript)");
;
async function POST(request) {
    let payload;
    try {
        payload = await request.json();
    } catch  {
        return Response.json({
            ok: false,
            error: "Invalid JSON payload"
        }, {
            status: 400
        });
    }
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$server$2f$handle$2d$waitlist$2d$signup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleWaitlistSignup"])(payload);
    return Response.json(result.body, {
        status: result.status
    });
}
function GET() {
    return Response.json({
        ok: false,
        error: "Method not allowed"
    }, {
        status: 405,
        headers: {
            Allow: "POST"
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__028u88y._.js.map