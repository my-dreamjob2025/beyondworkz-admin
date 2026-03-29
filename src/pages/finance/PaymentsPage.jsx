import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Payments"
        description="Payment and transaction data is not stored in the backend yet — there is nothing to list."
      />
      <Card>
        <p className="text-sm text-slate-600">
          When you integrate a payment provider or persist invoices in MongoDB, this page can show
          filters, exports, and a transaction table. Until then, this screen intentionally shows no
          sample rows or fake totals.
        </p>
      </Card>
    </div>
  );
}
