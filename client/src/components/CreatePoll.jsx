import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function CreatePoll({ onCreate }) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    function updateOption(index, value) {
        setOptions((current) => current.map((option, i) => (i === index ? value : option)));
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        const cleanOptions = options.map((option) => option.trim()).filter(Boolean);
        if (question.trim().length < 5)
            return setError('Please enter a question with at least 5 characters.');
        if (cleanOptions.length < 2)
            return setError('Please provide at least 2 options.');
        if (new Set(cleanOptions.map((option) => option.toLowerCase())).size !== cleanOptions.length) {
            return setError('Please remove duplicate options.');
        }
        setSubmitting(true);
        try {
            await onCreate(question.trim(), cleanOptions);
            setQuestion('');
            setOptions(['', '']);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create poll.');
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("section", { className: "panel create-panel", children: [_jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "MAKE IT A QUESTION" }), _jsx("h2", { children: "Create a poll" })] }), _jsx("span", { className: "heading-icon", "aria-hidden": "true", children: "\uFF0B" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("label", { htmlFor: "poll-question", children: "Your question" }), _jsx("input", { id: "poll-question", value: question, onChange: (event) => setQuestion(event.target.value), placeholder: "e.g. Which programming language should I learn?", maxLength: 200, required: true }), _jsxs("div", { className: "options-heading", children: [_jsx("label", { children: "Answer options" }), _jsxs("span", { children: [options.length, " / 6"] })] }), _jsx("div", { className: "option-inputs", children: options.map((option, index) => (_jsxs("div", { className: "option-input-row", children: [_jsx("span", { className: "option-number", children: index + 1 }), _jsx("input", { "aria-label": `Option ${index + 1}`, value: option, onChange: (event) => updateOption(index, event.target.value), placeholder: `Option ${index + 1}`, maxLength: 100 }), options.length > 2 && (_jsx("button", { type: "button", className: "icon-button remove-button", "aria-label": `Remove option ${index + 1}`, onClick: () => setOptions((current) => current.filter((_, i) => i !== index)), children: "\u00D7" }))] }, index))) }), options.length < 6 && (_jsx("button", { type: "button", className: "text-button", onClick: () => setOptions((current) => [...current, '']), children: "\uFF0B Add another option" })), error && _jsx("p", { className: "error-message", role: "alert", children: error }), _jsxs("button", { className: "primary-button submit-button", type: "submit", disabled: submitting, children: [submitting ? 'Creating…' : 'Create poll', " ", _jsx("span", { "aria-hidden": "true", children: "\u2192" })] })] })] }));
}
