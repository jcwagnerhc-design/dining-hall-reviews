import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { submitVote } from '../api';

export default function SuggestionCard({ suggestion, onVoted }) {
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  function getDeviceFingerprint() {
    let fp = localStorage.getItem('device_fp');
    if (!fp) {
      fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('device_fp', fp);
    }
    return fp;
  }

  const handleVote = async (voteType) => {
    setError('');
    setVoting(true);
    try {
      await submitVote(suggestion.id, voteType, getDeviceFingerprint());
      onVoted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  const localVoteKey = `vote_${suggestion.id}_${suggestion.month_year}`;
  const hasVotedLocally = localStorage.getItem(localVoteKey);

  const handleVoteWithLocal = async (voteType) => {
    await handleVote(voteType);
    if (!hasVotedLocally || hasVotedLocally !== voteType) {
      localStorage.setItem(localVoteKey, voteType);
    } else {
      localStorage.removeItem(localVoteKey);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {suggestion.image_url && (
          <div className="sm:w-48 sm:flex-shrink-0">
            <img
              src={suggestion.image_url}
              alt={suggestion.title}
              className="w-full h-40 sm:h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{suggestion.title}</h3>
          {suggestion.description && (
            <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVoteWithLocal('upvote')}
              disabled={voting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                suggestion.user_vote === 'upvote'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <ThumbsUp size={16} />
              {suggestion.upvotes}
            </button>

            <button
              onClick={() => handleVoteWithLocal('downvote')}
              disabled={voting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                suggestion.user_vote === 'downvote'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <ThumbsDown size={16} />
              {suggestion.downvotes}
            </button>

            <span className={`text-sm font-semibold ${
              suggestion.net_votes > 0 ? 'text-green-600' : suggestion.net_votes < 0 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {suggestion.net_votes > 0 ? '+' : ''}{suggestion.net_votes} net
            </span>
          </div>

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
