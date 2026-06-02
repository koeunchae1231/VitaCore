import { useState } from "react";

import {
  changeEmail,
  deleteAccount,
  fetchMe,
  resetPassword,
  sendEmailChangeCode,
  sendPasswordResetCode,
} from "../api/authApi";
import { setStoredUser } from "../api/client";
import { useApp } from "../App";
import PageHeader from "../components/PageHeader";
import { routes } from "../router";

const initialForms = {
  deletePassword: "",
  email: "",
  emailCode: "",
  passwordCode: "",
  newPassword: "",
};

const accountActions = [
  { id: "delete", label: "DELETE ACCOUNT" },
  { id: "email", label: "CHANGE EMAIL" },
  { id: "password", label: "RESET PASSWORD" },
];

export default function AccountSettingsPage() {
  const { logout, navigate, user, setUser } = useApp();
  const [activeSection, setActiveSection] = useState(null);
  const [form, setForm] = useState(initialForms);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const currentEmail = user?.email || "";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openSection(section) {
    setActiveSection(section);
    setMessage("");
    setError("");
  }

  function backToMenu() {
    setActiveSection(null);
    setMessage("");
    setError("");
  }

  async function runAction(action) {
    setMessage("");
    setError("");
    setIsBusy(true);

    try {
      const result = await action();
      setMessage(result?.message || "요청이 처리되었습니다.");
      return result;
    } catch (err) {
      setError(err.message || "요청 처리 중 오류가 발생했습니다.");
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDeleteAccount(event) {
    event.preventDefault();

    if (!form.deletePassword) {
      setError("계정 삭제에는 비밀번호 입력이 필요합니다.");
      return;
    }

    const result = await runAction(() =>
      deleteAccount({ password: form.deletePassword })
    );

    if (result) {
      logout();
      navigate(routes.signin);
    }
  }

  async function handleSendEmailCode() {
    await runAction(() => sendEmailChangeCode({ email: form.email }));
  }

  async function handleChangeEmail(event) {
    event.preventDefault();

    const result = await runAction(() =>
      changeEmail({ email: form.email, code: form.emailCode })
    );

    if (result) {
      const me = await fetchMe();
      setStoredUser(me.user);
      setUser(me.user);
      setForm((current) => ({ ...current, emailCode: "" }));
    }
  }

  async function handleSendPasswordCode() {
    await runAction(() => sendPasswordResetCode());
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    const result = await runAction(() =>
      resetPassword({
        code: form.passwordCode,
        newPassword: form.newPassword,
      })
    );

    if (result) {
      setForm((current) => ({
        ...current,
        passwordCode: "",
        newPassword: "",
      }));
    }
  }

  function renderMenu() {
    return (
      <div className="account-choice-list">
        {accountActions.map((action) => (
          <button
            className={`btn btn-block ${
              action.id === "delete" ? "btn-danger" : "btn-primary"
            }`}
            type="button"
            key={action.id}
            onClick={() => openSection(action.id)}
          >
            {action.label}
          </button>
        ))}
        <button
          className="btn btn-secondary btn-block account-page-back"
          type="button"
          onClick={() => navigate(routes.characters)}
        >
          BACK
        </button>
      </div>
    );
  }

  function renderDeleteSection() {
    return (
      <form className="account-form" onSubmit={handleDeleteAccount}>
        <h2>DELETE ACCOUNT</h2>
        <label className="field-label">
          PASSWORD
          <input
            className="input"
            type="password"
            value={form.deletePassword}
            onChange={(event) => updateField("deletePassword", event.target.value)}
          />
        </label>
        <div className="account-section-actions">
          <button className="btn btn-danger" type="submit" disabled={isBusy}>
            DELETE ACCOUNT
          </button>
          <button className="btn btn-secondary" type="button" onClick={backToMenu}>
            BACK
          </button>
        </div>
      </form>
    );
  }

  function renderEmailSection() {
    return (
      <form className="account-form" onSubmit={handleChangeEmail}>
        <h2>CHANGE EMAIL</h2>
        <p className="message-muted">CURRENT EMAIL: {currentEmail || "--"}</p>
        <label className="field-label">
          NEW EMAIL
          <div className="account-input-row">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="new@email.com"
            />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleSendEmailCode}
              disabled={isBusy}
            >
              SEND
            </button>
          </div>
        </label>
        <label className="field-label">
          CODE
          <input
            className="input"
            value={form.emailCode}
            onChange={(event) => updateField("emailCode", event.target.value)}
            placeholder="000000"
          />
        </label>
        <div className="account-section-actions">
          <button className="btn btn-primary" type="submit" disabled={isBusy}>
            CHANGE EMAIL
          </button>
          <button className="btn btn-secondary" type="button" onClick={backToMenu}>
            BACK
          </button>
        </div>
      </form>
    );
  }

  function renderPasswordSection() {
    return (
      <form className="account-form" onSubmit={handleResetPassword}>
        <h2>RESET PASSWORD</h2>
        <label className="field-label">
          EMAIL
          <div className="account-input-row">
            <input className="input" value={currentEmail || "--"} readOnly />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleSendPasswordCode}
              disabled={isBusy}
            >
              SEND
            </button>
          </div>
        </label>
        <label className="field-label">
          CODE
          <input
            className="input"
            value={form.passwordCode}
            onChange={(event) => updateField("passwordCode", event.target.value)}
            placeholder="000000"
          />
        </label>
        <label className="field-label">
          NEW PASSWORD
          <input
            className="input"
            type="password"
            value={form.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
          />
        </label>
        <div className="account-section-actions">
          <button className="btn btn-primary" type="submit" disabled={isBusy}>
            RESET PASSWORD
          </button>
          <button className="btn btn-secondary" type="button" onClick={backToMenu}>
            BACK
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content general-page character-page account-page">
          <PageHeader title="ACCOUNT SETTINGS" />

          <section className="section-panel account-panel">
            {!activeSection && renderMenu()}
            {activeSection === "delete" && renderDeleteSection()}
            {activeSection === "email" && renderEmailSection()}
            {activeSection === "password" && renderPasswordSection()}

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}
          </section>
        </div>
      </main>
    </div>
  );
}
