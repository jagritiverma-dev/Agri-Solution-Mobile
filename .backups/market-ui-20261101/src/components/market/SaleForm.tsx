import { View } from "react-native";
import { Copy, Field } from "../ui";
import { LabelValue, MarketPanel, marketStyles } from "./MarketUI";
import { formatMoney } from "../../utils/market";
import { usePortal } from "../../hooks/PortalProvider";
import type { SaleInput, SaleResult } from "../../utils/saleCalculator";

export function SaleFields({ value, onChange, includePrice = true, includeQuantity = true }: {
  value: SaleInput; onChange: (value: SaleInput) => void; includePrice?: boolean; includeQuantity?: boolean;
}) {
  return <View style={{ gap: 16 }}>
    {includeQuantity && <Field label="market.quantity" keyboardType="decimal-pad" value={value.quantity} onChangeText={quantity => onChange({ ...value, quantity })} maxLength={20} />}
    {includePrice && <Field label="market.sellingPrice" keyboardType="decimal-pad" value={value.price} onChangeText={price => onChange({ ...value, price })} maxLength={20} />}
    <Field label="market.transport" keyboardType="decimal-pad" value={value.transport} onChangeText={transport => onChange({ ...value, transport })} maxLength={20} placeholder="0" />
    <Field label="market.other" keyboardType="decimal-pad" value={value.other} onChangeText={other => onChange({ ...value, other })} maxLength={20} placeholder="0" />
  </View>;
}
export function SaleAmounts({ result }: { result: SaleResult }) {
  const { language } = usePortal();
  return <MarketPanel>
    <View accessibilityLiveRegion="polite" style={marketStyles.headingBlock}>
      <LabelValue label="market.gross" value={formatMoney(result.gross, language)} />
      <LabelValue label="market.deductions" value={formatMoney(result.deductions, language)} />
      <LabelValue label="market.net" value={formatMoney(result.net, language)} strong />
    </View>
    {result.net < 0 && <Copy muted>market.negativeNet</Copy>}
  </MarketPanel>;
}
