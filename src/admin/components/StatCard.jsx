export default function StatCard({ title, value }) {
  return (
    <div className="card">
      <p className="card-label">{title}</p>
      <h3>{value}</h3>
    </div>
  );
}
