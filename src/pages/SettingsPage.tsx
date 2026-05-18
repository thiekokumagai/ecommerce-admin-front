import { DeliverySettingsForm } from "@/components/settings/DeliverySettingsForm";
import { PaymentSettingsForm } from "@/components/settings/PaymentSettingsForm";
import { GeneralSettingsForm } from "@/components/settings/GeneralSettingsForm";
import { PaymentRulesSettingsForm } from "@/components/settings/PaymentRulesSettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Configurações do E-commerce</h1>
      <GeneralSettingsForm />
      <PaymentSettingsForm />
      <PaymentRulesSettingsForm />
      <DeliverySettingsForm />
    </div>
  );
}
