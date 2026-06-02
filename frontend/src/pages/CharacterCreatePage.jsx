import { useState } from "react";

import { createCharacter } from "../api/characterApi";
import { useApp } from "../App";
import PageHeader from "../components/PageHeader";
import { routes } from "../router";

export default function CharacterCreatePage() {
  const { logout, navigate, setSelectedCharacterId } = useApp();
  const [form, setForm] = useState({
    name: "",
    birth: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const numericAge = deriveAge(form.birth || form.age);

      const data = await createCharacter({
        name: form.name,
        age: numericAge,
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight),
      });
      setSelectedCharacterId(data.characterId);
      navigate(routes.characters);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function deriveAge(value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const birth = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
      }
      return Math.max(age, 1);
    }

    return Number(value);
  }

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content general-page character-page">
          <PageHeader title="CHARACTER CREATE" />
          <section className="section-panel character-create-panel">

            <form className="form" onSubmit={handleSubmit}>
              <div className="character-form-grid">
                <label className="form-group">
                  <span className="label">CHARACTER NAME</span>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                  />
                </label>

                <label className="form-group">
                  <span className="label">CHARACTER WEIGHT</span>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={form.weight}
                    onChange={(event) => updateField("weight", event.target.value)}
                    required
                  />
                </label>

                <fieldset className="form-group character-gender-field">
                  <legend className="label">GENDER</legend>
                  <div className="character-gender-row">
                    {["male", "female", "other"].map((gender) => (
                      <label className="choice-item" key={gender}>
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={form.gender === gender}
                          onChange={(event) =>
                            updateField("gender", event.target.value)
                          }
                        />
                        <span>{gender.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="form-group">
                  <span className="label">CHARACTER HEIGHT</span>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={form.height}
                    onChange={(event) => updateField("height", event.target.value)}
                    required
                  />
                </label>

                <label className="form-group">
                  <span className="label">CHARACTER BIRTH</span>
                  <input
                    className="input"
                    placeholder="YYYY-MM-DD or age"
                    value={form.birth}
                    onChange={(event) => updateField("birth", event.target.value)}
                    required
                  />
                </label>
              </div>

              {error && <p className="message message-error">{error}</p>}

              <div className="btn-group">
                <button className="btn btn-primary" disabled={isSubmitting}>
                  CREATE
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => navigate(routes.characters)}
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
