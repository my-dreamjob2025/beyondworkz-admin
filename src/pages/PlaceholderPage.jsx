import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

export default function PlaceholderPage({ title, description }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <p className="text-sm text-slate-600">
          This screen has no admin API behind it yet, so there are no real records, metrics, or actions to
          show. The route exists for navigation only until you implement the backend and UI.
        </p>
      </Card>
    </div>
  );
}
