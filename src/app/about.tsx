import { Ionicons } from "@expo/vector-icons";
import { Card, Copy, Screen } from "../components/ui";
export default function About() {
  return (
    <Screen>
      <Copy title>About this app</Copy>
      <Card>
        <Ionicons name="leaf-outline" size={32} color="#39814A" />
        <Copy title>Your everyday farming companion</Copy>
        <Copy>Find crop guides, weather, district information and government scheme details in one place.</Copy>
      </Card>
      <Card tone="blue">
        <Ionicons name="language-outline" size={30} color="#317DA3" />
        <Copy title>Read in your language</Copy>
        <Copy>Choose English or Hindi in Settings. Use Listen where available to hear the information.</Copy>
      </Card>
      <Card tone="amber">
        <Copy title>Information you can use</Copy>
        <Copy>Mor Kisani brings farming information together for Chhattisgarh. Open the source links for scheme rules and local farming advice.</Copy>
      </Card>
    </Screen>
  );
}
