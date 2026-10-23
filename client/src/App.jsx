import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import CreatePoll from './components/CreatePoll';
import PollCard from './components/PollCard';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'pulse-auth-token';
const USER_KEY = 'pulse-auth-user';
function AuthScreen({ onSuccess }) {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    async function submit(event) {
        event.preventDefault();
        setError('');
        if (mode === 'register' && name.trim().length < 2)
            return setError('Name must be at least 2 characters.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
            return setError('Enter a valid email address.');
        if (password.length < 8 || password.length > 72 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
            return setError('Password needs 8+ characters, uppercase, lowercase, and a number.');
        if (mode === 'register' && password !== confirm)
            return setError('Passwords do not match.');
        setBusy(true);
        try {
            const response = await fetch(`${API_URL}/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), email: email.trim(), password }) });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Authentication failed.');
            onSuccess(data.token, data.user);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not connect to server.');
        }
        finally {
            setBusy(false);
        }
    }
    return _jsx("main", { className: "auth-page", children: _jsxs("form", { className: "auth-card", onSubmit: submit, noValidate: true, children: [_jsxs("a", { className: "brand auth-brand", href: "#top", children: [_jsx("span", { className: "brand-mark", children: "P" }), _jsxs("span", { children: ["pulse", _jsx("span", { className: "brand-dot", children: "." })] })] }), _jsx("p", { className: "eyebrow", children: "YOUR COMMUNITY, YOUR VOICE" }), _jsx("h1", { children: mode === 'login' ? 'Welcome back' : 'Create your account' }), _jsx("p", { className: "auth-subtitle", children: mode === 'login' ? 'Log in to join the conversation.' : 'Sign up to create polls and share your opinion.' }), mode === 'register' && _jsxs("label", { className: "auth-label", children: ["Full name", _jsx("input", { autoComplete: "name", value: name, onChange: e => setName(e.target.value), maxLength: 50, required: true, placeholder: "Your name" })] }), _jsxs("label", { className: "auth-label", children: ["Email address", _jsx("input", { type: "email", autoComplete: "email", value: email, onChange: e => setEmail(e.target.value), maxLength: 254, required: true, placeholder: "you@example.com" })] }), _jsxs("label", { className: "auth-label", children: ["Password", _jsx("input", { type: "password", autoComplete: mode === 'login' ? 'current-password' : 'new-password', value: password, onChange: e => setPassword(e.target.value), minLength: 8, maxLength: 72, required: true, placeholder: "At least 8 characters" }), mode === 'register' && _jsx("small", { children: "Use uppercase, lowercase, and a number." })] }), mode === 'register' && _jsxs("label", { className: "auth-label", children: ["Confirm password", _jsx("input", { type: "password", autoComplete: "new-password", value: confirm, onChange: e => setConfirm(e.target.value), required: true, placeholder: "Re-enter password" })] }), error && _jsx("div", { className: "notice error-notice auth-error", role: "alert", children: error }), _jsx("button", { className: "primary-button auth-submit", disabled: busy, type: "submit", children: busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account' }), _jsxs("p", { className: "auth-switch", children: [mode === 'login' ? 'New to Pulse?' : 'Already have an account?', " ", _jsxs("button", { type: "button", onClick: () => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }, children: [" ", mode === 'login' ? 'Register' : 'Log in'] })] })] }) });
}
function getVoterId() {
    const storageKey = 'poll-voting-app-voter-id';
    let voterId = localStorage.getItem(storageKey);
    if (!voterId) {
        voterId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `voter-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(storageKey, voterId);
    }
    return voterId;
}
async function readError(response) {
    const data = await response.json().catch(() => ({}));
    return data.message || 'Something went wrong. Please try again.';
}
export default function App() {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
    const [authUser, setAuthUser] = useState(() => { try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    }
    catch {
        return null;
    } });
    const [polls, setPolls] = useState([]);
    const [voterId] = useState(getVoterId);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [search, setSearch] = useState('');
    const authHeaders = () => token ? { Authorization: `Bearer ${token}` } : {};
    const loadPolls = useCallback(async () => {
        setPageError('');
        try {
            const response = await fetch(`${API_URL}/polls`);
            if (!response.ok)
                throw new Error(await readError(response));
            setPolls(await response.json());
        }
        catch (error) {
            setPageError(error instanceof Error ? error.message : 'Could not connect to the server.');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void loadPolls(); }, [loadPolls]);
    async function createPoll(question, options) {
        const response = await fetch(`${API_URL}/polls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ question, options })
        });
        if (!response.ok)
            throw new Error(await readError(response));
        const createdPoll = await response.json();
        setPolls((current) => [createdPoll, ...current]);
    }
    async function vote(pollId, optionId, voterIdValue) {
        const response = await fetch(`${API_URL}/polls/${pollId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionId, voterId: voterIdValue })
        });
        if (!response.ok)
            throw new Error(await readError(response));
        const updatedPoll = await response.json();
        setPolls((current) => current.map((poll) => poll._id === updatedPoll._id ? updatedPoll : poll));
    }
    async function deletePoll(pollId) {
        const response = await fetch(`${API_URL}/polls/${pollId}`, { method: 'DELETE', headers: authHeaders() });
        if (!response.ok)
            throw new Error(await readError(response));
        setPolls((current) => current.filter((poll) => poll._id !== pollId));
    }
    const filteredPolls = polls.filter((poll) => poll.question.toLowerCase().includes(search.toLowerCase()));
    const totalVotes = polls.reduce((sum, poll) => sum + poll.options.reduce((optionSum, option) => optionSum + option.voterIds.length, 0), 0);
    if (!token || !authUser)
        return _jsx(AuthScreen, { onSuccess: (newToken, user) => { localStorage.setItem(TOKEN_KEY, newToken); localStorage.setItem(USER_KEY, JSON.stringify(user)); setToken(newToken); setAuthUser(user); } });
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { className: "topbar", children: [_jsxs("a", { className: "brand", href: "#top", "aria-label": "Pulse home", children: [_jsx("span", { className: "brand-mark", children: "P" }), _jsxs("span", { children: ["pulse", _jsx("span", { className: "brand-dot", children: "." })] })] }), _jsxs("div", { className: "topbar-actions", children: [_jsxs("span", { className: "welcome-user", children: ["Hi, ", authUser.name] }), _jsxs("a", { className: "topbar-link", href: "#create", children: ["Create a poll ", _jsx("span", { children: "\u2197" })] }), _jsx("button", { className: "logout-button", onClick: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(''); setAuthUser(null); }, children: "Log out" })] })] }), _jsxs("main", { id: "top", children: [_jsxs("section", { className: "hero", children: [_jsxs("div", { className: "hero-copy", children: [_jsxs("span", { className: "hero-kicker", children: [_jsx("span", { className: "live-dot" }), " YOUR COMMUNITY, YOUR VOICE"] }), _jsxs("h1", { children: ["Good questions.", _jsx("br", {}), _jsx("span", { children: "Better decisions." })] }), _jsx("p", { children: "Create a poll, hear what people think, and turn opinions into action. Your next great idea starts with a question." }), _jsxs("a", { className: "primary-button hero-button", href: "#create", children: ["Start a poll ", _jsx("span", { children: "\u2193" })] })] }), _jsxs("div", { className: "hero-art", "aria-hidden": "true", children: [_jsx("div", { className: "art-orbit orbit-one" }), _jsx("div", { className: "art-orbit orbit-two" }), _jsxs("div", { className: "floating-card floating-card-top", children: [_jsx("span", { className: "mini-icon purple", children: "\u2733" }), _jsxs("div", { children: [_jsx("b", { children: "Every voice counts" }), _jsx("small", { children: "Share your opinion" })] }), _jsx("span", { className: "sparkle", children: "\u2726" })] }), _jsxs("div", { className: "vote-visual", children: [_jsxs("div", { className: "visual-top", children: [_jsx("span", { className: "visual-pill", children: "LIVE POLL" }), _jsx("span", { className: "visual-dots", children: "\u2022\u2022\u2022" })] }), _jsx("h3", { children: "Best way to spend a Sunday?" }), _jsxs("div", { className: "visual-option", children: [_jsx("span", { children: "\uD83C\uDF3F Outdoors" }), _jsx("span", { className: "visual-bar", children: _jsx("i", { style: { width: '68%' } }) })] }), _jsxs("div", { className: "visual-option", children: [_jsx("span", { children: "\u2615 Slow morning" }), _jsx("span", { className: "visual-bar", children: _jsx("i", { style: { width: '48%' } }) })] }), _jsxs("div", { className: "visual-option", children: [_jsx("span", { children: "\uD83C\uDFAC Movie night" }), _jsx("span", { className: "visual-bar", children: _jsx("i", { style: { width: '32%' } }) })] }), _jsxs("div", { className: "visual-footer", children: [_jsxs("span", { children: [_jsx("i", { className: "live-dot" }), " Results updating"] }), _jsx("b", { children: "128 votes" })] })] }), _jsxs("div", { className: "floating-card floating-card-bottom", children: [_jsxs("div", { className: "avatar-stack", children: [_jsx("span", { children: "A" }), _jsx("span", { children: "M" }), _jsx("span", { children: "J" }), _jsx("span", { children: "+" })] }), _jsxs("div", { children: [_jsx("b", { children: "Made for everyone" }), _jsx("small", { children: "Quick \u00B7 Simple \u00B7 Inclusive" })] })] })] })] }), _jsxs("section", { className: "stats-row", "aria-label": "Poll statistics", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-icon", children: "\u25A4" }), _jsxs("div", { children: [_jsx("strong", { children: polls.length }), _jsx("span", { children: "Polls created" })] })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-icon green", children: "\u2197" }), _jsxs("div", { children: [_jsx("strong", { children: totalVotes }), _jsx("span", { children: "Votes collected" })] })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-icon orange", children: "\u25CE" }), _jsxs("div", { children: [_jsx("strong", { children: "One voice" }), _jsx("span", { children: "Can make a difference" })] })] })] }), _jsxs("section", { className: "workspace", id: "create", children: [_jsxs("div", { className: "workspace-main", children: [_jsx("div", { className: "section-heading polls-heading", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "THE PEOPLE HAVE SPOKEN" }), _jsxs("h2", { children: ["Explore polls ", _jsx("span", { className: "count-badge", children: polls.length })] })] }) }), _jsxs("div", { className: "search-wrap", children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search questions\u2026", "aria-label": "Search polls" }), _jsx("kbd", { children: "\u2318 K" })] }), pageError && _jsxs("div", { className: "notice error-notice", role: "alert", children: [_jsx("b", { children: "Could not load polls." }), _jsx("span", { children: pageError }), _jsx("button", { className: "secondary-button", onClick: () => { setLoading(true); void loadPolls(); }, children: "Try again" })] }), loading ? _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "loader" }), _jsx("p", { children: "Loading polls\u2026" })] }) : !pageError && filteredPolls.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\u2733" }), _jsx("h3", { children: search ? 'No matching polls' : 'Your first poll starts here' }), _jsx("p", { children: search ? 'Try another search term.' : 'Create a question on the right and invite people to vote.' })] })) : (_jsx("div", { className: "poll-list", children: filteredPolls.map((poll) => _jsx(PollCard, { poll: poll, voterId: voterId, onVote: vote, onDelete: deletePoll }, poll._id)) }))] }), _jsxs("aside", { className: "workspace-aside", children: [_jsx(CreatePoll, { onCreate: createPoll }), _jsxs("div", { className: "tip-card", children: [_jsx("span", { className: "tip-icon", children: "\u2726" }), _jsxs("div", { children: [_jsx("h3", { children: "Pro tip" }), _jsx("p", { children: "Great polls are clear and specific. Keep your options simple so everyone can make their choice in seconds." })] })] }), _jsxs("div", { className: "privacy-note", children: [_jsx("span", { children: "\u25C8" }), _jsxs("p", { children: [_jsx("b", { children: "One person, one vote" }), _jsx("br", {}), "This demo remembers your voter ID in this browser. It is not a secure identity check."] })] })] })] })] }), _jsxs("footer", { className: "footer", children: [_jsxs("a", { className: "brand footer-brand", href: "#top", children: [_jsx("span", { className: "brand-mark", children: "P" }), _jsxs("span", { children: ["pulse", _jsx("span", { className: "brand-dot", children: "." })] })] }), _jsx("span", { children: "Small questions can spark big ideas." }), _jsx("a", { href: "#top", children: "Back to top \u2191" })] })] }));
}
