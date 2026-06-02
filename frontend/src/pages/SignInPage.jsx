import { useState } from "react";

import {
  confirmPublicPasswordReset,
  login,
  sendFindEmailCode,
  sendPublicPasswordResetCode,
  verifyFindEmail,
} from "../api/authApi";
import { useApp } from "../App";
import PageHeader from "../components/PageHeader";
import { routes } from "../router";

const initialRecoveryForm = {
  name: "",
  email: "",
  code: "",
  newPassword: "",
};

export default function SignInPage() {
  const { navigate, setSelectedCharacterId, setUser } = useApp();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryForm, setRecoveryForm] = useState(initialRecoveryForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateRecoveryField(field, value) {
    setRecoveryForm((current) => ({ ...current, [field]: value }));
  }

  function openMode(nextMode) {
    setMode(nextMode);
    setSuccess("");
    setError("");
    setRecoveryForm(initialRecoveryForm);
  }

  function backToSignIn() {
    setMode("signin");
    setSuccess("");
    setError("");
    setRecoveryForm(initialRecoveryForm);
  }

  async function runRecovery(action) {
    setSuccess("");
    setError("");
    setIsSubmitting(true);

    try {
      const data = await action();
      setSuccess(data?.message || "요청이 처리되었습니다.");
      return data;
    } catch (err) {
      setError(err.message || "요청 처리 중 오류가 발생했습니다.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSuccess("");
    setError("");
    setIsSubmitting(true);

    try {
      const data = await login({ email, password });
      setUser(data.user);
      setSelectedCharacterId(null);
      navigate(routes.characters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendFindEmailCode() {
    await runRecovery(() =>
      sendFindEmailCode({
        name: recoveryForm.name,
        email: recoveryForm.email,
      })
    );
  }

  async function handleVerifyFindEmail(event) {
    event.preventDefault();
    const data = await runRecovery(() =>
      verifyFindEmail({
        name: recoveryForm.name,
        email: recoveryForm.email,
        code: recoveryForm.code,
      })
    );

    if (data?.maskedEmail) {
      setSuccess(`가입 이메일은 ${data.maskedEmail} 입니다.`);
    }
  }

  async function handleSendPasswordResetCode() {
    await runRecovery(() =>
      sendPublicPasswordResetCode({ email: recoveryForm.email })
    );
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    const data = await runRecovery(() =>
      confirmPublicPasswordReset({
        email: recoveryForm.email,
        code: recoveryForm.code,
        newPassword: recoveryForm.newPassword,
      })
    );

    if (data) {
      setRecoveryForm(initialRecoveryForm);
    }
  }

  function renderMessages() {
    return (
      <>
        {success && <p className="message message-success">{success}</p>}
        {error && <p className="message message-error">{error}</p>}
      </>
    );
  }

  function renderSignInForm() {
    return (
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-group">
          <span className="label">EMAIL</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
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

        {renderMessages()}

        <div className="auth-small-links">
          <button type="button" onClick={() => openMode("findEmail")}>
            FORGOT EMAIL
          </button>
          <button type="button" onClick={() => openMode("resetPassword")}>
            FORGOT PW
          </button>
        </div>

        <div className="auth-form-actions">
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
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
    );
  }

  function renderFindEmailForm() {
    return (
      <form className="form auth-recovery-form" onSubmit={handleVerifyFindEmail}>
        <h2 className="auth-recovery-title">FIND EMAIL</h2>
        <label className="form-group">
          <span className="label">NAME</span>
          <input
            className="input"
            value={recoveryForm.name}
            onChange={(event) => updateRecoveryField("name", event.target.value)}
            required
          />
        </label>
        <label className="form-group">
          <span className="label">EMAIL</span>
          <div className="auth-input-row">
            <input
              className="input"
              type="email"
              value={recoveryForm.email}
              onChange={(event) => updateRecoveryField("email", event.target.value)}
              required
            />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleSendFindEmailCode}
              disabled={isSubmitting}
            >
              SEND
            </button>
          </div>
        </label>
        <label className="form-group">
          <span className="label">CODE</span>
          <input
            className="input"
            value={recoveryForm.code}
            onChange={(event) => updateRecoveryField("code", event.target.value)}
            placeholder="000000"
            required
          />
        </label>

        {renderMessages()}

        <div className="auth-form-actions">
          <button className="btn btn-primary" disabled={isSubmitting}>
            VERIFY
          </button>
          <button className="btn btn-secondary" type="button" onClick={backToSignIn}>
            BACK
          </button>
        </div>
      </form>
    );
  }

  function renderPasswordResetForm() {
    return (
      <form className="form auth-recovery-form" onSubmit={handleResetPassword}>
        <h2 className="auth-recovery-title">RESET PASSWORD</h2>
        <label className="form-group">
          <span className="label">EMAIL</span>
          <div className="auth-input-row">
            <input
              className="input"
              type="email"
              value={recoveryForm.email}
              onChange={(event) => updateRecoveryField("email", event.target.value)}
              required
            />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleSendPasswordResetCode}
              disabled={isSubmitting}
            >
              SEND
            </button>
          </div>
        </label>
        <label className="form-group">
          <span className="label">CODE</span>
          <input
            className="input"
            value={recoveryForm.code}
            onChange={(event) => updateRecoveryField("code", event.target.value)}
            placeholder="000000"
            required
          />
        </label>
        <label className="form-group">
          <span className="label">NEW PASSWORD</span>
          <input
            className="input"
            type="password"
            value={recoveryForm.newPassword}
            onChange={(event) =>
              updateRecoveryField("newPassword", event.target.value)
            }
            required
          />
        </label>

        {renderMessages()}

        <div className="auth-form-actions">
          <button className="btn btn-primary" disabled={isSubmitting}>
            RESET PASSWORD
          </button>
          <button className="btn btn-secondary" type="button" onClick={backToSignIn}>
            BACK
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content general-page auth-page">
          <PageHeader title="SIGN IN" />
          <section className="auth-card section-panel">
            {mode === "signin" && renderSignInForm()}
            {mode === "findEmail" && renderFindEmailForm()}
            {mode === "resetPassword" && renderPasswordResetForm()}
          </section>
        </div>
      </main>
    </div>
  );
}
