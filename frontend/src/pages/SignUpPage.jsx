import { useState } from "react";

import {
  requestVerification,
  signup,
  verifyEmail,
} from "../api/authApi";
import { useApp } from "../App";
import PageHeader from "../components/PageHeader";
import { routes } from "../router";

export default function SignUpPage() {
  const { navigate } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function run(action) {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRequestVerification() {
    run(async () => {
      const data = await requestVerification(email);
      setMessage(data.message || "Verification code sent.");
    });
  }

  function handleVerifyEmail() {
    run(async () => {
      const data = await verifyEmail({ email, code });
      setMessage(data.message || "Email verified.");
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    run(async () => {
      await signup({ name, email, password });
      navigate(routes.signin);
    });
  }

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content general-page auth-page">
          <PageHeader title="SIGN UP" />
          <section className="auth-card section-panel">
            <form className="form" onSubmit={handleSubmit}>
              <label className="form-group">
                <span className="label">NAME</span>
                <input
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label className="form-group">
                <span className="label">EMAIL</span>
                <div className="input-with-action">
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  <button
                    className="btn btn-secondary input-action"
                    type="button"
                    onClick={handleRequestVerification}
                    disabled={isSubmitting || !email}
                  >
                    SEND
                  </button>
                </div>
              </label>

              <label className="form-group">
                <span className="label">CODE</span>
                <div className="input-with-action">
                  <input
                    className="input"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />
                  <button
                    className="btn btn-secondary input-action"
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isSubmitting || !email || !code}
                  >
                    VERIFY
                  </button>
                </div>
              </label>

              <label className="form-group">
                <span className="label">PASSWORD</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              {message && <p className="message message-success">{message}</p>}
              {error && <p className="message message-error">{error}</p>}

              <div className="auth-form-actions">
                <button className="btn btn-primary" disabled={isSubmitting}>
                  SIGN UP
                </button>
                <button
                  className="btn btn-secondary auth-side-action"
                  type="button"
                  onClick={() => navigate(routes.landing)}
                >
                  BACK
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
