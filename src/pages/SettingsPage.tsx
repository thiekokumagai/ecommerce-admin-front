import { DeliverySettingsForm } from "@/components/settings/DeliverySettingsForm";
import { PaymentSettingsForm } from "@/components/settings/PaymentSettingsForm";
import { GeneralSettingsForm } from "@/components/settings/GeneralSettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Configuração</h1>
      <DeliverySettingsForm />
      <PaymentSettingsForm />
      <GeneralSettingsForm />
    </div>
  );
}
