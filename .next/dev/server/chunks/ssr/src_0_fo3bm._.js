module.exports = [
"[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BODY",
    ()=>BODY,
    "CARD",
    ()=>CARD,
    "FOREST",
    ()=>FOREST,
    "INK",
    ()=>INK,
    "MONO",
    ()=>MONO,
    "MUTED",
    ()=>MUTED,
    "OXBLOOD",
    ()=>OXBLOOD,
    "PAPER",
    ()=>PAPER,
    "SANS",
    ()=>SANS,
    "SERIF",
    ()=>SERIF,
    "WARM",
    ()=>WARM,
    "premiumEase",
    ()=>premiumEase
]);
// ─── Design tokens ────────────────────────────────────────────────────────────
const INK = "#1C1812";
const PAPER = "#F5F0E8";
const CARD = "#FDFAF4";
const WARM = "#EDE8DC";
const OXBLOOD = "#7B1D1D";
const FOREST = "#2C3E2D";
const MUTED = "#8B7355";
const BODY = "#4A4035";
const MONO = "'DM Mono', monospace";
const SERIF = "'EB Garamond', serif";
const SANS = "'Inter', sans-serif";
const premiumEase = [
    0.22,
    1,
    0.36,
    1
];
;
}),
"[project]/src/shared/ui/motion.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Lift",
    ()=>Lift,
    "Reveal",
    ()=>Reveal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function Reveal({ children, className, delay = 0, amount = 0.22 }) {
    const reduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        className: className,
        initial: reduceMotion ? false : {
            opacity: 0,
            y: 18,
            filter: "blur(5px)"
        },
        whileInView: reduceMotion ? undefined : {
            opacity: 1,
            y: 0,
            filter: "blur(0px)"
        },
        viewport: {
            once: true,
            amount
        },
        transition: {
            duration: 0.72,
            delay,
            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/shared/ui/motion.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
function Lift({ children, className, style }) {
    const reduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        className: className,
        style: style,
        whileHover: reduceMotion ? undefined : {
            y: -3,
            boxShadow: "0 18px 48px rgba(28,24,18,0.10), 0 2px 8px rgba(28,24,18,0.05)"
        },
        transition: {
            duration: 0.32,
            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/shared/ui/motion.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/features/waitlist/api/submit-waitlist.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "submitWaitlist",
    ()=>submitWaitlist
]);
async function submitWaitlist(payload) {
    const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const body = await response.json().catch(()=>null);
    if (!response.ok) {
        const errorMessage = ("TURBOPACK compile-time value", "development") === "development" && body?.detail?.message ? `${body.error}: ${body.detail.message}` : body?.error;
        throw new Error(errorMessage ?? "Waitlist endpoint rejected the request");
    }
    return body ?? {
        ok: true
    };
}
}),
"[project]/src/features/waitlist/components/WaitlistForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WaitlistForm",
    ()=>WaitlistForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$7$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.24.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/check.mjs [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$api$2f$submit$2d$waitlist$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/api/submit-waitlist.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function WaitlistForm({ label = "Join the waitlist", dark = false }) {
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [website, setWebsite] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [formStartedAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Date.now());
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const reduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    async function handleWaitlistSubmit(event) {
        event.preventDefault();
        const normalizedEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setStatus("error");
            setMessage("Enter a valid email address.");
            return;
        }
        setStatus("loading");
        setMessage("");
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$api$2f$submit$2d$waitlist$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["submitWaitlist"])({
                email: normalizedEmail,
                source: "betaquill-waitlist",
                submittedAt: new Date().toISOString(),
                formStartedAt,
                website
            });
            setStatus("success");
            setMessage("You're on the list. Check your inbox for the discount note.");
            setEmail("");
            setWebsite("");
        } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "Something failed. Try again in a few seconds.");
        }
    }
    if (status === "success") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2.5 py-3",
            style: {
                color: dark ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"]
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$7$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                    size: 14,
                    strokeWidth: 2.5
                }, void 0, false, {
                    fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm",
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"]
                    },
                    children: message
                }, void 0, false, {
                    fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
            lineNumber: 56,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleWaitlistSubmit,
        className: "flex flex-col sm:flex-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                name: "website",
                tabIndex: -1,
                autoComplete: "off",
                value: website,
                onChange: (e)=>setWebsite(e.target.value),
                className: "sr-only",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "email",
                required: true,
                value: email,
                onChange: (e)=>{
                    setEmail(e.target.value);
                    if (status !== "loading") {
                        setStatus("idle");
                        setMessage("");
                    }
                },
                placeholder: "your@email.com",
                className: "flex-1 px-4 py-3 text-sm border-y border-l focus:outline-none transition-colors",
                style: {
                    background: dark ? "rgba(253,250,244,0.06)" : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD"],
                    borderColor: dark ? "rgba(245,240,232,0.18)" : "rgba(28,24,18,0.2)",
                    color: dark ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"],
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SANS"]
                }
            }, void 0, false, {
                fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                type: "submit",
                disabled: status === "loading",
                className: "px-6 py-3 text-sm font-medium transition-colors cursor-pointer border whitespace-nowrap",
                whileHover: reduceMotion ? undefined : {
                    y: -1
                },
                whileTap: reduceMotion ? undefined : {
                    scale: 0.985
                },
                transition: {
                    duration: 0.24,
                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
                },
                style: {
                    background: dark ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"],
                    color: dark ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"],
                    borderColor: dark ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"],
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SANS"]
                },
                onMouseEnter: (e)=>{
                    e.currentTarget.style.background = dark ? "#EDE8DC" : "#691919";
                },
                onMouseLeave: (e)=>{
                    e.currentTarget.style.background = dark ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"];
                },
                children: status === "loading" ? "Joining..." : label
            }, void 0, false, {
                fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            status === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "sm:col-span-2 mt-2 text-[11px]",
                style: {
                    color: dark ? "#F5B7B1" : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"],
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"]
                },
                role: "alert",
                children: message
            }, void 0, false, {
                fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/features/waitlist/components/WaitlistForm.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/features/waitlist/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$components$2f$WaitlistForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/components/WaitlistForm.tsx [app-ssr] (ecmascript)");
;
;
}),
"[project]/src/views/waitlist/components/FinalCtaSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinalCtaSection",
    ()=>FinalCtaSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$7$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.24.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/check.mjs [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/features/waitlist/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$components$2f$WaitlistForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/components/WaitlistForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$ui$2f$motion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/ui/motion.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function FinalCtaSection() {
    const reduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            id: "cta",
            className: "relative z-10 border-t",
            style: {
                borderColor: "rgba(28,24,18,0.1)",
                background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"]
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-6 md:px-12 py-24 max-w-5xl mx-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$ui$2f$motion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                    className: "grid md:grid-cols-[1fr_420px] gap-16 items-start",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-8 h-px mb-8",
                                    style: {
                                        background: "rgba(245,240,232,0.25)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 23,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "mb-5 leading-tight",
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                        fontSize: "clamp(2rem, 4vw, 3rem)",
                                        fontWeight: 400,
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"],
                                        letterSpacing: "-0.02em"
                                    },
                                    children: "Help shape a better beta reading workflow."
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 24,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-base leading-relaxed mb-4 max-w-md",
                                    style: {
                                        color: "rgba(245,240,232,0.65)",
                                        fontWeight: 300,
                                        lineHeight: 1.65
                                    },
                                    children: "I'm currently talking with indie authors, book coaches, and editors to understand what actually hurts during beta reading."
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm leading-relaxed max-w-sm",
                                    style: {
                                        color: "rgba(245,240,232,0.45)",
                                        fontWeight: 300
                                    },
                                    children: "If you join the waitlist, I'll follow up personally — not with a marketing sequence, but with one question about your workflow. You'll also receive a launch discount code when BetaQuill is released."
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-12 pl-5 border-l",
                                    style: {
                                        borderColor: "rgba(245,240,232,0.15)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "italic leading-relaxed",
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                                fontSize: "1.1rem",
                                                color: "rgba(245,240,232,0.55)"
                                            },
                                            children: "“After my last beta round I had 47 Google Docs comment threads, three spreadsheets, and no idea which problems were real. I needed a way to separate signal from noise.”"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                            lineNumber: 55,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] mt-3",
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                                color: "rgba(245,240,232,0.3)"
                                            },
                                            children: "— An indie fantasy author who helped shape this product"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                            lineNumber: 67,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pt-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm mb-4",
                                    style: {
                                        color: "rgba(245,240,232,0.75)",
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SANS"]
                                    },
                                    children: "Request early access"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 74,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$components$2f$WaitlistForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WaitlistForm"], {
                                    label: "Get early access",
                                    dark: true
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] mt-3",
                                    style: {
                                        color: "rgba(245,240,232,0.28)",
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"]
                                    },
                                    children: "No cost during beta. Launch discount reserved. Unsubscribe anytime."
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 81,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-10 space-y-4",
                                    children: [
                                        "Your manuscript stays private — no public sharing",
                                        "Structured annotations, not open-ended comment threads",
                                        "Revision priorities built from reader frequency, not guesswork",
                                        "Designed for indie authors, not publishing houses"
                                    ].map((point, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                            className: "flex items-start gap-3",
                                            initial: reduceMotion ? false : {
                                                opacity: 0,
                                                x: -8
                                            },
                                            whileInView: reduceMotion ? undefined : {
                                                opacity: 1,
                                                x: 0
                                            },
                                            viewport: {
                                                once: true,
                                                amount: 0.4
                                            },
                                            transition: {
                                                duration: 0.45,
                                                delay: i * 0.04,
                                                ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$7$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                    size: 11,
                                                    strokeWidth: 2.5,
                                                    className: "flex-shrink-0 mt-1",
                                                    style: {
                                                        color: "rgba(245,240,232,0.35)"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm",
                                                    style: {
                                                        color: "rgba(245,240,232,0.45)",
                                                        lineHeight: 1.55
                                                    },
                                                    children: point
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                                    lineNumber: 100,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                            lineNumber: 91,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/views/waitlist/components/FinalCtaSection.tsx",
            lineNumber: 15,
            columnNumber: 5
        }, this)
    }, void 0, false);
}
}),
"[project]/src/features/product-preview/data/mockup-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TAGS",
    ()=>TAGS,
    "annotations",
    ()=>annotations,
    "attentionItems",
    ()=>attentionItems,
    "readerProgress",
    ()=>readerProgress,
    "repeatedAnnotationIssues",
    ()=>repeatedAnnotationIssues,
    "strongestMoments",
    ()=>strongestMoments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
;
const TAGS = {
    confusing: {
        label: "Confusing",
        bg: "rgba(123,29,29,0.11)",
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"],
        bar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"]
    },
    strong: {
        label: "Strong line",
        bg: "rgba(44,62,45,0.11)",
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FOREST"],
        bar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FOREST"]
    },
    pacing: {
        label: "Pacing issue",
        bg: "rgba(139,100,40,0.12)",
        color: "#7A5020",
        bar: "#7A5020"
    },
    missing: {
        label: "Missing context",
        bg: "rgba(70,80,140,0.1)",
        color: "#424878",
        bar: "#424878"
    },
    emotional: {
        label: "Emotional impact",
        bg: "rgba(60,100,70,0.11)",
        color: "#2D5E3A",
        bar: "#2D5E3A"
    }
};
const annotations = [
    {
        id: "a1",
        tag: "confusing",
        phrase: "each one a different lie",
        comments: [
            {
                reader: "Sarah K.",
                text: "Different from what? The previous chapter established these maps as accurate — this contradicts without explanation."
            },
            {
                reader: "Marcus R.",
                text: "Confused me too. Are the maps wrong on purpose or because they're outdated?"
            },
            {
                reader: "Priya N.",
                text: "I had to reread the opening twice. The contradiction needs a beat of clarification."
            }
        ]
    },
    {
        id: "a2",
        tag: "strong",
        phrase: "he said, his voice carrying the weight of thirty years",
        comments: [
            {
                reader: "Sarah K.",
                text: "This landed. The compression of time in 'thirty years' is doing exactly the right work."
            },
            {
                reader: "Priya N.",
                text: "Best line in the chapter. The voice earned it."
            },
            {
                reader: "Tom W.",
                text: "Stopped here and read it again. Quietly devastating."
            },
            {
                reader: "Diana L.",
                text: "This is the emotional center — make sure the rest earns it."
            }
        ]
    },
    {
        id: "a3",
        tag: "pacing",
        phrase: "The commission had seemed straightforward",
        comments: [
            {
                reader: "Marcus R.",
                text: "We've been told this before. If you're repeating it, the scene needs to earn the repetition."
            },
            {
                reader: "Tom W.",
                text: "The pacing slowed here. I expected the guild meeting to start immediately."
            }
        ]
    },
    {
        id: "a4",
        tag: "missing",
        phrase: "he realized they already knew",
        comments: [
            {
                reader: "Sarah K.",
                text: "Knew what, exactly? I don't have enough context about what the guild's expectations are."
            },
            {
                reader: "Priya N.",
                text: "This felt abrupt — what did they know? The scene needs grounding before this reveal."
            }
        ]
    }
];
const repeatedAnnotationIssues = [
    {
        tag: "confusing",
        count: 18,
        chapters: "Ch 3, 5, 7"
    },
    {
        tag: "pacing",
        count: 11,
        chapters: "Ch 4, 6, 7"
    },
    {
        tag: "missing",
        count: 9,
        chapters: "Ch 3, 8"
    },
    {
        tag: "emotional",
        count: 6,
        chapters: "Ch 2, 5"
    },
    {
        tag: "strong",
        count: 21,
        chapters: "Ch 2, 3, 5, 9"
    }
];
const strongestMoments = [
    {
        chapter: "Ch 3",
        scene: "The guild confrontation",
        score: 4
    },
    {
        chapter: "Ch 2",
        scene: "Opening paragraph",
        score: 4
    },
    {
        chapter: "Ch 5",
        scene: "The border crossing",
        score: 3
    }
];
const attentionItems = [
    {
        chapter: "Ch 7",
        issue: "Scene clarity — 4 readers flagged confusion"
    },
    {
        chapter: "Ch 4",
        issue: "Pacing in the guild intro — 3 flags"
    },
    {
        chapter: "Ch 3",
        issue: "Missing context before the reveal"
    }
];
const readerProgress = [
    {
        name: "Priya N.",
        avatar: "P",
        chapter: 9,
        total: 9,
        status: "finished"
    },
    {
        name: "Sarah K.",
        avatar: "S",
        chapter: 7,
        total: 9,
        status: "reading"
    },
    {
        name: "Marcus R.",
        avatar: "M",
        chapter: 5,
        total: 9,
        status: "reading"
    },
    {
        name: "Tom W.",
        avatar: "T",
        chapter: 4,
        total: 9,
        status: "inactive"
    },
    {
        name: "Diana L.",
        avatar: "D",
        chapter: 2,
        total: 9,
        status: "reading"
    }
];
;
}),
"[project]/src/features/product-preview/components/TagBadge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TagBadge",
    ()=>TagBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/data/mockup-data.ts [app-ssr] (ecmascript)");
;
;
;
// ─── Tag badge ────────────────────────────────────────────────────────────────
function TagBadge({ tag }) {
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAGS"][tag];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center text-[9px] px-1.5 py-0.5 uppercase tracking-wide",
        style: {
            background: t.bg,
            color: t.color,
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
            border: `1px solid ${t.color}30`
        },
        children: t.label
    }, void 0, false, {
        fileName: "[project]/src/features/product-preview/components/TagBadge.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/features/product-preview/components/PrioritiesPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PrioritiesPanel",
    ()=>PrioritiesPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/data/mockup-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/TagBadge.tsx [app-ssr] (ecmascript)");
;
;
;
;
// ─── Dashboard / priorities panel ─────────────────────────────────────────────
function PrioritiesPanel() {
    const maxCount = Math.max(...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["repeatedAnnotationIssues"].map((r)=>r.count));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-5 grid md:grid-cols-2 gap-5",
        style: {
            minHeight: "380px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border",
                style: {
                    borderColor: "rgba(28,24,18,0.1)",
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD"]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[9px] uppercase tracking-widest mb-3",
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                        },
                        children: "Annotation frequency"
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2.5",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["repeatedAnnotationIssues"].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TagBadge"], {
                                                tag: r.tag
                                            }, void 0, false, {
                                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                                lineNumber: 20,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px]",
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                                },
                                                children: [
                                                    r.count,
                                                    " notes · ",
                                                    r.chapters
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                                lineNumber: 21,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 19,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-1",
                                        style: {
                                            background: "rgba(28,24,18,0.08)"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-full transition-all",
                                            style: {
                                                width: `${r.count / maxCount * 100}%`,
                                                background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAGS"][r.tag].bar,
                                                opacity: 0.7
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                            lineNumber: 26,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 25,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, r.tag, true, {
                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                lineNumber: 18,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border",
                style: {
                    borderColor: "rgba(28,24,18,0.1)",
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD"]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[9px] uppercase tracking-widest mb-3",
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                        },
                        children: "Strongest moments"
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 mb-5",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strongestMoments"].map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] mr-2",
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                                },
                                                children: s.chapter
                                            }, void 0, false, {
                                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                                lineNumber: 49,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[11px]",
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"]
                                                },
                                                children: s.scene
                                            }, void 0, false, {
                                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                                lineNumber: 50,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 48,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-0.5",
                                        children: Array.from({
                                            length: 5
                                        }).map((_, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1.5 h-1.5",
                                                style: {
                                                    background: j < s.score ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FOREST"] : "rgba(28,24,18,0.1)"
                                                }
                                            }, j, false, {
                                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                                lineNumber: 54,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 52,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[9px] uppercase tracking-widest mb-2.5",
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                        },
                        children: "Needs attention"
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attentionItems"].map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] mt-0.5 flex-shrink-0",
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"]
                                        },
                                        children: a.chapter
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 70,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] leading-snug",
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BODY"]
                                        },
                                        children: a.issue
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 71,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                lineNumber: 69,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:col-span-2 p-4 border",
                style: {
                    borderColor: "rgba(28,24,18,0.1)",
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD"]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[9px] uppercase tracking-widest mb-3",
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                        },
                        children: "Reader progress"
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid sm:grid-cols-5 gap-4",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readerProgress"].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 mb-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0",
                                                style: {
                                                    background: r.status === "finished" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FOREST"] : r.status === "inactive" ? "rgba(28,24,18,0.2)" : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"]
                                                },
                                                children: r.avatar
                                            }, void 0, false, {
                                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                                lineNumber: 86,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-medium",
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SANS"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"]
                                                },
                                                children: r.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                                lineNumber: 95,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 85,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-1 mb-1",
                                        style: {
                                            background: "rgba(28,24,18,0.08)"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-full",
                                            style: {
                                                width: `${r.chapter / r.total * 100}%`,
                                                background: r.status === "finished" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FOREST"] : r.status === "inactive" ? "rgba(28,24,18,0.25)" : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"]
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                            lineNumber: 98,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px]",
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                        },
                                        children: r.status === "finished" ? "finished" : `ch ${r.chapter}/${r.total}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, r.name, true, {
                                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/features/product-preview/components/PrioritiesPanel.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/features/product-preview/components/AnnotationMarker.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnnotationMarker",
    ()=>AnnotationMarker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/data/mockup-data.ts [app-ssr] (ecmascript)");
;
;
;
// ─── Inline annotation span ───────────────────────────────────────────────────
function AnnotationMarker({ tag, count, children, active, onClick }) {
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAGS"][tag];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        onClick: onClick,
        className: "cursor-pointer relative inline",
        style: {
            background: active ? t.bg.replace("0.11", "0.22").replace("0.12", "0.24").replace("0.1", "0.2") : t.bg,
            borderBottom: `1.5px solid ${t.color}`,
            padding: "0 2px",
            transition: "background 0.15s"
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-1 text-[9px] align-super",
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                    color: t.color,
                    opacity: 0.8
                },
                children: count
            }, void 0, false, {
                fileName: "[project]/src/features/product-preview/components/AnnotationMarker.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/features/product-preview/components/AnnotationMarker.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/features/product-preview/components/ReaderPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReaderPanel",
    ()=>ReaderPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/data/mockup-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$AnnotationMarker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/AnnotationMarker.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/TagBadge.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
// ─── Reader mockup panel ──────────────────────────────────────────────────────
function ReaderPanel() {
    const [activeId, setActiveId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("a2");
    const active = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["annotations"].find((a)=>a.id === activeId) ?? null;
    const ann = (id)=>{
        const a = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["annotations"].find((x)=>x.id === id);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$AnnotationMarker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnnotationMarker"], {
            tag: a.tag,
            count: a.comments.length,
            active: activeId === id,
            onClick: ()=>setActiveId(activeId === id ? null : id),
            children: a.phrase
        }, void 0, false, {
            fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid",
        style: {
            gridTemplateColumns: "1fr",
            minHeight: "380px"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid md:grid-cols-[1fr_260px]",
            style: {
                minHeight: "380px"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 overflow-y-auto",
                    style: {
                        borderRight: "1px solid rgba(28,24,18,0.08)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] uppercase tracking-widest",
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                    },
                                    children: "Chapter 3"
                                }, void 0, false, {
                                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-px flex-1",
                                    style: {
                                        background: "rgba(28,24,18,0.1)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                    lineNumber: 32,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1.5",
                                    children: Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAGS"]).map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TagBadge"], {
                                            tag: k
                                        }, k, false, {
                                            fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                            lineNumber: 35,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                    lineNumber: 33,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "leading-[1.85] text-[13px]",
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"],
                                fontSize: "0.95rem"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mb-4",
                                    children: [
                                        "The cartographer spread his maps across the table,",
                                        " ",
                                        ann("a1"),
                                        ". He had spent thirty years drawing borders that never existed and coastlines that had shifted since the surveys were done. The guild had never asked him to be accurate. They had asked him to be useful."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mb-4",
                                    children: [
                                        "“I mapped the world as it should be,”",
                                        " ",
                                        ann("a2"),
                                        ", carrying the weight of careful deception. “What you do with those maps is your own affair.”"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                    lineNumber: 49,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mb-4",
                                    children: [
                                        ann("a3"),
                                        " enough when the guild first approached him — a coastal survey, they had said, nothing more. Now, surrounded by their silence and the smell of old parchment, he felt the familiar vertigo of a man standing at the edge of an unmapped place."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        "He looked up from the table and",
                                        " ",
                                        ann("a4"),
                                        " — had known, perhaps, before he had walked through the door. The silence was not hostile. It was expectant."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4",
                    style: {
                        background: "rgba(245,240,232,0.4)"
                    },
                    children: active ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TagBadge"], {
                                        tag: active.tag
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                        lineNumber: 74,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px]",
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                        },
                                        children: [
                                            active.comments.length,
                                            " readers"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                        lineNumber: 75,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] italic mb-4 pb-3",
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BODY"],
                                    borderBottom: "1px solid rgba(28,24,18,0.1)"
                                },
                                children: [
                                    "“",
                                    active.phrase,
                                    "”"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: active.comments.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1.5 mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold",
                                                        style: {
                                                            background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"],
                                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"]
                                                        },
                                                        children: c.reader[0]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                                        lineNumber: 89,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-medium",
                                                        style: {
                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SANS"],
                                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"]
                                                        },
                                                        children: c.reader
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                                        lineNumber: 95,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                                lineNumber: 88,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] leading-relaxed pl-5",
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BODY"]
                                                },
                                                children: c.text
                                            }, void 0, false, {
                                                fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                                lineNumber: 99,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                        lineNumber: 87,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                                lineNumber: 85,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center h-full pt-12 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] italic",
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                            },
                            children: "Click a highlighted passage to see what readers said."
                        }, void 0, false, {
                            fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                            lineNumber: 108,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                        lineNumber: 107,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
            lineNumber: 27,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/features/product-preview/components/ReaderPanel.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/features/product-preview/components/ProductMockup.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductMockup",
    ()=>ProductMockup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$PrioritiesPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/PrioritiesPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$ReaderPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/ReaderPanel.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
// ─── Product mockup container ─────────────────────────────────────────────────
function ProductMockup() {
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("reader");
    const reduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        className: "overflow-hidden",
        style: {
            border: "1px solid rgba(28,24,18,0.14)",
            background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD"],
            boxShadow: "0 16px 56px rgba(28,24,18,0.12), 0 2px 8px rgba(28,24,18,0.06)"
        },
        initial: reduceMotion ? false : {
            opacity: 0,
            y: 18,
            scale: 0.992
        },
        whileInView: reduceMotion ? undefined : {
            opacity: 1,
            y: 0,
            scale: 1
        },
        viewport: {
            once: true,
            amount: 0.25
        },
        transition: {
            duration: 0.8,
            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-2.5 flex items-center gap-3 border-b",
                style: {
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WARM"],
                    borderColor: "rgba(28,24,18,0.1)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1.5",
                        children: [
                            0,
                            1,
                            2
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-2.5 h-2.5 rounded-full",
                                style: {
                                    background: "rgba(28,24,18,0.18)"
                                }
                            }, i, false, {
                                fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                                lineNumber: 35,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 px-3 py-0.5 text-[11px]",
                        style: {
                            background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"],
                            border: "1px solid rgba(28,24,18,0.1)",
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"],
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"]
                        },
                        children: "app.betaquill.com / manuscripts / the-last-cartographer / feedback"
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-5 py-2 flex items-center justify-between border-b",
                style: {
                    borderColor: "rgba(28,24,18,0.08)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-baseline gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold",
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"]
                                },
                                children: "The Last Cartographer"
                            }, void 0, false, {
                                fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px]",
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                },
                                children: "Draft 2 · 9 chapters · 5 readers · 64 annotations"
                            }, void 0, false, {
                                fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            "reader",
                            "priorities"
                        ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                                onClick: ()=>setTab(t),
                                className: "px-3 py-1 text-[10px] transition-colors cursor-pointer",
                                whileHover: reduceMotion ? undefined : {
                                    y: -1
                                },
                                whileTap: reduceMotion ? undefined : {
                                    scale: 0.985
                                },
                                transition: {
                                    duration: 0.24,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
                                },
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                    background: tab === t ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"] : "transparent",
                                    color: tab === t ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAPER"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"],
                                    border: `1px solid ${tab === t ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"] : "rgba(28,24,18,0.15)"}`
                                },
                                children: t === "reader" ? "Reader view" : "Revision priorities"
                            }, t, false, {
                                fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                                lineNumber: 61,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: "wait",
                initial: false,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                    initial: reduceMotion ? false : {
                        opacity: 0,
                        y: 8
                    },
                    animate: reduceMotion ? undefined : {
                        opacity: 1,
                        y: 0
                    },
                    exit: reduceMotion ? undefined : {
                        opacity: 0,
                        y: -8
                    },
                    transition: {
                        duration: 0.28,
                        ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
                    },
                    children: tab === "reader" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$ReaderPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReaderPanel"], {}, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                        lineNumber: 89,
                        columnNumber: 31
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$PrioritiesPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PrioritiesPanel"], {}, void 0, false, {
                        fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                        lineNumber: 89,
                        columnNumber: 49
                    }, this)
                }, tab, false, {
                    fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/features/product-preview/components/ProductMockup.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/features/product-preview/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$ProductMockup$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/ProductMockup.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$data$2f$mockup$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/data/mockup-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/TagBadge.tsx [app-ssr] (ecmascript)");
;
;
;
}),
"[project]/src/views/waitlist/components/HeroSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HeroSection",
    ()=>HeroSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/features/waitlist/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$components$2f$WaitlistForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/waitlist/components/WaitlistForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/features/product-preview/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/product-preview/components/TagBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function HeroSection() {
    const reduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].section, {
            className: "relative z-10 px-6 md:px-12 pt-20 pb-28 max-w-5xl mx-auto",
            initial: reduceMotion ? false : {
                opacity: 0
            },
            animate: reduceMotion ? undefined : {
                opacity: 1
            },
            transition: {
                duration: 0.55,
                ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid md:grid-cols-[1fr_380px] gap-16 items-start",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        initial: reduceMotion ? false : {
                            opacity: 0,
                            y: 18,
                            filter: "blur(4px)"
                        },
                        animate: reduceMotion ? undefined : {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)"
                        },
                        transition: {
                            duration: 0.82,
                            delay: 0.08,
                            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "mb-6 leading-[1.08]",
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                    fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                                    fontWeight: 400,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"],
                                    letterSpacing: "-0.02em"
                                },
                                children: [
                                    "Turn beta reader feedback into clear",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        children: "revision priorities."
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                        lineNumber: 37,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg mb-2 leading-relaxed max-w-lg",
                                style: {
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BODY"],
                                    fontWeight: 300,
                                    lineHeight: 1.65
                                },
                                children: "Invite readers, collect structured annotations, spot repeated issues, and understand what works before you publish."
                            }, void 0, false, {
                                fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-w-md",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$waitlist$2f$components$2f$WaitlistForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WaitlistForm"], {
                                        label: "Join the waitlist"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                        lineNumber: 48,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] mt-3",
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"],
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"]
                                        },
                                        children: "Early access, launch discount code, and no spam."
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                        lineNumber: 49,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                lineNumber: 47,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        className: "hidden md:block",
                        initial: reduceMotion ? false : {
                            opacity: 0,
                            y: 22,
                            scale: 0.99
                        },
                        animate: reduceMotion ? undefined : {
                            opacity: 1,
                            y: 0,
                            scale: 1
                        },
                        transition: {
                            duration: 0.82,
                            delay: 0.2,
                            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-5 border",
                            style: {
                                borderColor: "rgba(28,24,18,0.12)",
                                background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD"]
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[9px] uppercase tracking-widest mb-3",
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                    },
                                    children: "Annotation summary — Chapter 3"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                    lineNumber: 66,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2.5 mb-5",
                                    children: [
                                        {
                                            tag: "confusing",
                                            n: 18,
                                            note: "Scattered across 6 passages"
                                        },
                                        {
                                            tag: "pacing",
                                            n: 11,
                                            note: "Guild intro and mid-scene"
                                        },
                                        {
                                            tag: "missing",
                                            n: 9,
                                            note: "Context gaps before reveals"
                                        },
                                        {
                                            tag: "strong",
                                            n: 21,
                                            note: "Strongest response in draft"
                                        }
                                    ].map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$product$2d$preview$2f$components$2f$TagBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TagBadge"], {
                                                    tag: row.tag
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                                    lineNumber: 77,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] flex-1",
                                                    style: {
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BODY"]
                                                    },
                                                    children: row.note
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                                    lineNumber: 78,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-medium",
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"]
                                                    },
                                                    children: row.n
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                                    lineNumber: 79,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, row.tag, true, {
                                            fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                            lineNumber: 76,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                    lineNumber: 69,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pt-4 border-t",
                                    style: {
                                        borderColor: "rgba(28,24,18,0.08)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[9px] uppercase tracking-widest mb-2",
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                            },
                                            children: "Top revision note"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                            lineNumber: 87,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[12px] leading-relaxed italic",
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BODY"]
                                            },
                                            children: "“The guild confrontation scene loses clarity mid-way. Three readers flagged confusion at the same passage.”"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                            lineNumber: 90,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 text-[9px]",
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MONO"],
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTED"]
                                            },
                                            children: "— generated from 18 reader annotations"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                            lineNumber: 96,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/views/waitlist/components/HeroSection.tsx",
            lineNumber: 14,
            columnNumber: 5
        }, this)
    }, void 0, false);
}
}),
"[project]/src/views/waitlist/components/Nav.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Nav",
    ()=>Nav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_@babel+core@7.29.7_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$7$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.24.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/book-open.mjs [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@12.42.2_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/config/design-tokens.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function Nav() {
    const reduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$motion$40$12$2e$42$2e$2_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].nav, {
            className: "sticky top-0 z-20 border-b px-6 md:px-12 py-4 flex items-center justify-between",
            style: {
                borderColor: "rgba(28,24,18,0.1)",
                background: "rgba(245,240,232,0.94)",
                backdropFilter: "blur(8px)"
            },
            initial: reduceMotion ? false : {
                opacity: 0,
                y: -10
            },
            animate: reduceMotion ? undefined : {
                opacity: 1,
                y: 0
            },
            transition: {
                duration: 0.55,
                ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["premiumEase"]
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$7$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                            size: 16,
                            strokeWidth: 1.5,
                            style: {
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OXBLOOD"]
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/views/waitlist/components/Nav.tsx",
                            lineNumber: 21,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-base font-semibold",
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SERIF"],
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"]
                            },
                            children: "BetaQuill"
                        }, void 0, false, {
                            fileName: "[project]/src/views/waitlist/components/Nav.tsx",
                            lineNumber: 22,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/views/waitlist/components/Nav.tsx",
                    lineNumber: 20,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: "#cta",
                    className: "text-sm px-4 py-2 transition-colors",
                    style: {
                        border: "1px solid rgba(28,24,18,0.2)",
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INK"],
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$config$2f$design$2d$tokens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SANS"]
                    },
                    onMouseEnter: (e)=>{
                        e.currentTarget.style.background = "rgba(28,24,18,0.05)";
                    },
                    onMouseLeave: (e)=>{
                        e.currentTarget.style.background = "transparent";
                    },
                    children: "Join the waitlist"
                }, void 0, false, {
                    fileName: "[project]/src/views/waitlist/components/Nav.tsx",
                    lineNumber: 26,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/views/waitlist/components/Nav.tsx",
            lineNumber: 13,
            columnNumber: 5
        }, this)
    }, void 0, false);
}
}),
];

//# sourceMappingURL=src_0_fo3bm._.js.map