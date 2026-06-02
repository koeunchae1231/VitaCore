export default function PageHeader({ title }) {
  return (
    <header className="general-page-header">
      <h1 className="app-top-brand">VITACORE</h1>
      {title && <h2 className="page-title">{title}</h2>}
    </header>
  );
}
