import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../services/api";

//NEW: the message shown when the user has used all of their AI requests for the day
const USAGE_LIMIT_MESSAGE = "You have reached your usage limit for the day";

function formatConversationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function AiAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [usage, setUsage] = useState({ used: 0, dailyLimit: 10, remaining: 10 });
  const [draft, setDraft] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const loadUsage = useCallback(async () => {
    const result = await apiRequest("/api/ai/usage");
    setUsage(result);
    return result; //NEW: the latest usage is also returned so handleSend can check it
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [conversationData, usageData] = await Promise.all([
          apiRequest("/api/ai/conversations"),
          apiRequest("/api/ai/usage"),
        ]);

        if (!active) return;
        setConversations(conversationData);
        setUsage(usageData);
        if (conversationData.length > 0) {
          setActiveConversationId(conversationData[0].id);
        }
      } catch (requestError) {
        if (active && !requestError.handled) {
          setError(requestError.message || "Could not load your AI assistant.");
        }
      } finally {
        if (active) setLoadingConversations(false);
      }
    }

    loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return undefined;
    }

    let active = true;
    setMessages([]);
    setLoadingMessages(true);
    setError("");

    apiRequest(`/api/ai/conversations/${activeConversationId}/messages`)
      .then((data) => {
        if (active) setMessages(data);
      })
      .catch((requestError) => {
        if (active && !requestError.handled) {
          setError(requestError.message || "Could not load this conversation.");
        }
      })
      .finally(() => {
        if (active) setLoadingMessages(false);
      });

    return () => {
      active = false;
    };
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleNewConversation() {
    setError("");
    try {
      const conversation = await apiRequest("/api/ai/conversations", {
        method: "POST",
      });
      setConversations((previous) => [
        conversation,
        ...previous.filter((item) => item.id !== conversation.id),
      ]);
      setActiveConversationId(conversation.id);
      setMessages([]);
      textareaRef.current?.focus();
    } catch (requestError) {
      if (!requestError.handled) {
        setError(requestError.message || "Could not start a new conversation.");
      }
    }
  }

  async function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending || usage.remaining <= 0) return;

    setError("");
    setSending(true);
    setDraft("");

    let conversationId = activeConversationId;
    try {
      if (!conversationId) {
        const conversation = await apiRequest("/api/ai/conversations", {
          method: "POST",
        });
        conversationId = conversation.id;
        setConversations((previous) => [conversation, ...previous]);
      }

      const temporaryId = `pending-${Date.now()}`;
      setMessages((previous) => [
        ...previous,
        {
          id: temporaryId,
          role: "user",
          content,
          createdAtUtc: new Date().toISOString(),
        },
      ]);

      const result = await apiRequest(
        `/api/ai/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        }
      );

      setActiveConversationId(conversationId);
      setMessages((previous) => [
        ...previous.filter((message) => message.id !== temporaryId),
        result.userMessage,
        result.assistantMessage,
      ]);
      setUsage(result.usage);
      setConversations((previous) => [
        result.conversation,
        ...previous.filter((item) => item.id !== result.conversation.id),
      ]);
    } catch (requestError) {
      if (!requestError.handled) {
        setError(requestError.message || "The AI assistant could not respond.");
      }
      if (conversationId) {
        setActiveConversationId(conversationId);
        try {
          const savedMessages = await apiRequest(
            `/api/ai/conversations/${conversationId}/messages`
          );
          setMessages(savedMessages);
        } catch {
          // The original request error is already displayed.
        }
      }
      try {
        const latestUsage = await loadUsage();

        //NEW: if the request failed because the daily limit has been used up, show the usage limit message instead of the message from the backend
        if (latestUsage.remaining <= 0) {
          setError(USAGE_LIMIT_MESSAGE);
        }
      } catch {
        // Keep the last known usage value if the usage check fails.
      }
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const usagePercentage = usage.dailyLimit > 0
    ? Math.min(100, (usage.used / usage.dailyLimit) * 100)
    : 0;

  return (
    <main id="main-content" tabIndex={-1} className="ai-page">
      <header className="page-header ai-page-header">
        <span className="eyebrow">Your learning companion</span>
        <h1>AI Academic Assistant</h1>
        <p className="page-subtitle">
          Ask questions, explore difficult topics, and get help with your studies.
        </p>
      </header>

      {error && <p className="ai-error" role="alert">{error}</p>}

      <section className="ai-workspace" aria-label="AI assistant">
        <aside className="ai-sidebar" aria-label="Conversation history">
          <button
            type="button"
            className="btn ai-new-chat"
            onClick={handleNewConversation}
            disabled={sending}
          >
            <span aria-hidden="true">＋</span> New conversation
          </button>

          <div className="ai-history-heading">
            <h2>Recent conversations</h2>
          </div>

          {loadingConversations ? (
            <p className="ai-muted">Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <p className="ai-muted ai-history-empty">Your conversations will appear here.</p>
          ) : (
            <div className="ai-conversation-list">
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  disabled={sending}
                  className={`ai-conversation-item ${activeConversationId === conversation.id ? "active" : ""}`}
                  onClick={() => setActiveConversationId(conversation.id)}
                  aria-current={activeConversationId === conversation.id ? "page" : undefined}
                >
                  <span className="ai-conversation-title">{conversation.title}</span>
                  <span className="ai-conversation-date">
                    {formatConversationDate(conversation.updatedAtUtc)}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="ai-usage-card">
            <div className="ai-usage-heading">
              <strong>Daily AI requests</strong>
              <span>{usage.used}/{usage.dailyLimit}</span>
            </div>
            <div
              className="ai-usage-track"
              role="progressbar"
              aria-label="Daily AI requests used"
              aria-valuemin={0}
              aria-valuemax={usage.dailyLimit}
              aria-valuenow={usage.used}
            >
              <span style={{ width: `${usagePercentage}%` }} />
            </div>
            <p>{usage.remaining} {usage.remaining === 1 ? "request" : "requests"} remaining today</p>
          </div>
        </aside>

        <section className="ai-chat-panel" aria-label="Conversation">
          <div className="ai-chat-topbar">
            <div>
              <h2>CourseTrack AI</h2>
              <p>Powered by Google Gemma 4</p>
            </div>
            <span className="ai-status"><span aria-hidden="true" /> Ready to help</span>
          </div>

          <div className="ai-message-area" aria-live="polite" aria-busy={loadingMessages || sending}>
            {loadingMessages ? (
              <p className="ai-empty-state">Loading conversation…</p>
            ) : messages.length === 0 ? (
              <div className="ai-empty-state">
                <div className="ai-welcome-icon" aria-hidden="true">✦</div>
                <h3>What would you like to learn today?</h3>
                <p>Ask me to explain a concept, help you revise, or break a difficult topic into smaller steps.</p>
              </div>
            ) : (
              <div className="ai-messages">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`ai-message ${message.role === "user" ? "ai-message-user" : "ai-message-assistant"}`}
                  >
                    <span className="ai-message-author">
                      {message.role === "user" ? "You" : "CourseTrack AI"}
                    </span>
                    <p>{message.content}</p>
                  </article>
                ))}
                {sending && (
                  <article className="ai-message ai-message-assistant ai-thinking" role="status">
                    <span className="ai-message-author">CourseTrack AI</span>
                    <p>Thinking…</p>
                  </article>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form className="ai-composer" onSubmit={handleSend}>
            <label className="sr-only" htmlFor="ai-message-input">Your message</label>
            <textarea
              ref={textareaRef}
              id="ai-message-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your academic question…"
              rows={2}
              maxLength={3000}
              disabled={sending || usage.remaining <= 0}
            />
            <div className="ai-composer-footer">
              <span>{usage.remaining <= 0 ? USAGE_LIMIT_MESSAGE : "Enter to send · Shift + Enter for a new line"}</span>
              <button
                type="submit"
                className="btn"
                disabled={!draft.trim() || sending || usage.remaining <= 0}
              >
                {sending ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        </section>
      </section>

      <p className="ai-disclaimer">
        AI responses can contain mistakes. Check important academic information against your course materials.
      </p>
    </main>
  );
}
