import { useState } from "react";
import { registerStudent } from "../api.js";
import { resizeImage } from "../resizeImage.js";

export default function Register() {
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [error, setError] = useState("");
  const [pass, setPass] = useState(null);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      setPhotoData(resized);
      setPhotoPreview(resized);
    } catch (err) {
      setError("Could not process that photo. Try a different one.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Enter your full name.");
    if (!photoData) return setError("Add a photo so you can be recognized at the door.");

    setStatus("submitting");
    try {
      const result = await registerStudent({
        name,
        className,
        phone,
        photo: photoData,
      });
      setPass(result);
      setStatus("idle");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  if (pass) {
    return (
      <div className="page">
        <div className="ticket" role="status">
          <div className="ticket__main">
            <p className="ticket__eyebrow">You're on the list</p>
            <h1 className="ticket__name">{pass.name}</h1>
            {pass.className && <p className="ticket__class">{pass.className}</p>}
            <img className="ticket__photo" src={pass.photo} alt="" />
            <p className="ticket__note">
              Show this screen and your face at the door — no need to screenshot it.
            </p>
          </div>
          <div className="ticket__stub">
            <span className="ticket__stub-label">code</span>
            <span className="ticket__code">{pass.code}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <p className="wordmark">Program Pass</p>
        <h1 className="card__title">Register for the program</h1>
        <p className="card__subtitle">
          Only people who register here will be let in — bring your face, it's your ID.
        </p>

        <label className="field">
          <span>Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="As it appears on your ID" />
        </label>

        <label className="field">
          <span>Church / district</span>
          <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. IPC BERHAMPUR" />
        </label>

        <label className="field">
          <span>Phone (optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For urgent contact only" />
        </label>

        <label className="field field--photo">
          <span>Photo</span>
          <div className="photo-input">
            {photoPreview ? (
              <img className="photo-input__preview" src={photoPreview} alt="Your photo preview" />
            ) : (
              <div className="photo-input__placeholder" aria-hidden="true" />
            )}
            <input type="file" accept="image/*" capture="user" onChange={handlePhoto} />
          </div>
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Getting your pass…" : "Get my pass"}
        </button>
      </form>
    </div>
  );
}
