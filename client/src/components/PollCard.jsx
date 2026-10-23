import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
export default function PollCard({ poll, voterId, onVote, onDelete }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [showResults, setShowResults] = useState(false);
    const alreadyVoted = useMemo(() => poll.options.some((option) => option.voterIds.includes(voterId)), [poll.options, voterId]);
    const totalVotes = poll.options.reduce((total, option) => total + option.voterIds.length, 0);
    const dateLabel = new Date(poll.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    async function handleVote() {
        if (!selectedOption)
            return setMessage('Choose an option before voting.');
        setBusy(true);
        setMessage('');
        try {
            await onVote(poll._id, selectedOption, voterId);
            setShowResults(true);
            setMessage('Your vote has been recorded.');
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not submit your vote.');
        }
        finally {
            setBusy(false);
        }
    }
    async function handleDelete() {
        if (!window.confirm('Delete this poll and all its votes?'))
            return;
        setBusy(true);
        try {
            await onDelete(poll._id);
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not delete poll.');
            setBusy(false);
        }
    }
    return (_jsxs("article", { className: "panel poll-card", children: [_jsxs("div", { className: "poll-meta", children: [_jsx("span", { className: "poll-tag", children: "COMMUNITY POLL" }), _jsx("span", { className: "poll-date", children: dateLabel })] }), _jsx("h3", { children: poll.question }), _jsxs("p", { className: "vote-count", children: [totalVotes, " ", totalVotes === 1 ? 'vote' : 'votes', " \u00B7 ", poll.options.length, " options"] }), _jsx("div", { className: "poll-options", children: poll.options.map((option, index) => {
                    const percentage = totalVotes === 0 ? 0 : Math.round((option.voterIds.length / totalVotes) * 100);
                    const resultsVisible = showResults || alreadyVoted;
                    return (_jsxs("button", { type: "button", className: `poll-option ${selectedOption === option._id ? 'selected' : ''} ${resultsVisible ? 'results-option' : ''}`, onClick: () => !alreadyVoted && !showResults && setSelectedOption(option._id), disabled: alreadyVoted || showResults || busy, "aria-pressed": selectedOption === option._id, children: [resultsVisible && _jsx("span", { className: "result-fill", style: { width: `${percentage}%` } }), _jsxs("span", { className: "option-label", children: [_jsx("span", { className: "radio-dot", children: selectedOption === option._id ? '✓' : String.fromCharCode(65 + index) }), option.text] }), resultsVisible && _jsxs("span", { className: "option-percentage", children: [percentage, "% ", _jsxs("small", { children: ["(", option.voterIds.length, ")"] })] })] }, option._id));
                }) }), message && _jsx("p", { className: message.toLowerCase().includes('could not') || message.toLowerCase().includes('choose') || message.toLowerCase().includes('already') ? 'error-message' : 'success-message', role: "status", children: message }), _jsxs("div", { className: "poll-actions", children: [!alreadyVoted && !showResults ? (_jsxs("button", { className: "primary-button vote-button", type: "button", onClick: handleVote, disabled: busy, children: [busy ? 'Submitting…' : 'Cast your vote', " ", _jsx("span", { children: "\u2192" })] })) : (_jsx("button", { className: "secondary-button vote-button", type: "button", onClick: () => setShowResults((current) => !current), children: showResults ? 'Hide results' : 'View results' })), _jsx("button", { className: "delete-button", type: "button", onClick: handleDelete, disabled: busy, "aria-label": "Delete poll", children: "Delete" })] })] }));
}
