import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { usePortal } from "../../hooks/PortalProvider";
import { farmerColors } from "../../config/farmerTheme";

const services: {
  title: string;
  icon: string;
  route: Href;
}[] = [
  { title: "home.crops", icon: "🌾", route: "/(tabs)/crops" },
  { title: "home.weatherSoil", icon: "☀️", route: "/(tabs)/weather" },
  { title: "home.schemes", icon: "🏛️", route: "/schemes" },
  
  { title: "home.districtMap", icon: "📍", route: "/districts" },
  { title: "home.cropDoctor", icon: "🩺", route: "/crop-doctor" },
  { title: "home.assistant", icon: "🤖", route: "/chat" },
];

const moreServices: {
  icon: string;
  title: string;
  route: Href;
}[] = [
  {
    icon: "🏢",
    title: "home.centres",
    route: "/centres",
  },
  {
    icon: "📢",
    title: "home.notices",
    route: "/notices",
  },
];

export default function Home() {
  const { languageError, t } =
    usePortal();

  const navigate = (route: Href) => {
    router.push(route);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <Image
            source={require("../../../assets/optimized/logo.jpg")}
            style={styles.logo}
            contentFit="cover"
            accessibilityLabel={t("home.brand")}
          />
          <View style={styles.brandCopy}>
            <Text accessibilityRole="header" style={styles.brandTitle}>
              {t("home.brand")}
            </Text>
            <Text style={styles.subtitle}>{t("home.tagline")}</Text>
          </View>
        </View>

        {languageError && (
          <Text accessibilityRole="alert" style={styles.languageWarning}>
            {t("language.preferenceNotSaved")}
          </Text>
        )}

        <Text style={styles.eyebrow}>{t("home.welcome")}</Text>
        <Text accessibilityRole="header" style={styles.heading}>
          {t("home.heading")}
        </Text>
        <Text style={styles.description}>{t("home.description")}</Text>

        <View style={styles.heroCard}>
          <Image
            source={require("../../../assets/optimized/hero.jpg")}
            style={{ width: "100%", height: 220, borderRadius: 16 }}
            contentFit="cover"
            accessibilityLabel={t("home.heroTitle")}
          />
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>{t("home.heroEyebrow")}</Text>
            <Text accessibilityRole="header" style={styles.cardHeading}>
              {t("home.heroTitle")}
            </Text>
            <Text style={styles.cardDescription}>
              {t("home.heroDescription")}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t("home.quickServices")}
          </Text>
          <Text style={styles.subtitle}>
            {t("home.quickServicesDescription")}
          </Text>
        </View>

        <View style={styles.grid}>
          {services.map((service, index) => (
            <Pressable
              key={service.title}
              accessibilityRole="button"
              accessibilityLabel={t(service.title)}
              accessibilityHint={t("home.openServiceHint")}
              onPress={() => navigate(service.route)}
              style={({ pressed }) => [
                styles.serviceCard,
                { backgroundColor: ["#EDF6E9", "#EDF5FD", "#FFF4DA", "#F1EDFA", "#FDEEE7", "#E9F6F3"][index], borderTopWidth: 4, borderTopColor: ["#568844", "#407FA7", "#B88328", "#8265AA", "#B96E4D", "#3C8A79"][index] },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.serviceCardTop}>
                <View style={styles.iconBackground}>
                  <Text accessible={false} style={styles.serviceIcon}>
                    {service.icon}
                  </Text>
                </View>
                <Text style={styles.arrow}>↗</Text>
              </View>
              <Text style={styles.serviceTitle}>{t(service.title)}</Text>
            </Pressable>
          ))}
        </View>

        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {t("home.exploreMore")}
        </Text>
        {moreServices.map((service) => (
          <Pressable
            key={service.title}
            accessibilityRole="button"
            accessibilityLabel={t(service.title)}
            accessibilityHint={t("home.openServiceHint")}
            onPress={() => navigate(service.route)}
            style={({ pressed }) => [
              styles.listCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.iconBackground}>
              <Text accessible={false} style={styles.listIcon}>
                {service.icon}
              </Text>
            </View>
            <Text style={styles.listTitle}>{t(service.title)}</Text>
            <Text style={styles.listArrow}>›</Text>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("home.joinTitle")}
          accessibilityHint={t("home.openServiceHint")}
          onPress={() => navigate("/login")}
          style={({ pressed }) => [
            styles.joinCard,
            pressed && styles.pressed,
          ]}
        >
          <Text accessibilityRole="header" style={styles.cardHeading}>
            {t("home.joinTitle")}
          </Text>
          <Text style={styles.cardDescription}>
            {t("home.joinDescription")}
          </Text>
          <Text style={styles.joinLink}>{t("home.getStarted")} →</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: farmerColors.cream,
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 26,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  brandCopy: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: farmerColors.forest,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: farmerColors.muted,
    marginTop: 4,
  },
  languageWarning: {
    color: farmerColors.text,
    backgroundColor: "#FFF1D8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  eyebrow: {
    color: farmerColors.forest,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heading: {
    fontSize: 29,
    lineHeight: 38,
    fontWeight: "900",
    color: farmerColors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: farmerColors.muted,
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: farmerColors.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: farmerColors.border,
    marginBottom: 25,
  },
  heroText: {
    padding: 18,
  },
  cardHeading: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    color: farmerColors.forest,
    marginBottom: 6,
  },
  cardDescription: {
    color: farmerColors.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  sectionHeading: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800",
    color: farmerColors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  serviceCard: {
    width: "48%",
    minHeight: 132,
    backgroundColor: farmerColors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: farmerColors.border,
    padding: 15,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  serviceCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  iconBackground: {
    width: 48,
    height: 48,
    backgroundColor: farmerColors.paleGreen,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIcon: {
    fontSize: 26,
  },
  serviceTitle: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "800",
    color: farmerColors.forest,
  },
  arrow: {
    color: farmerColors.sage,
    fontSize: 22,
    paddingHorizontal: 3,
  },
  listCard: {
    minHeight: 72,
    backgroundColor: farmerColors.white,
    borderWidth: 1,
    borderColor: farmerColors.border,
    borderRadius: 17,
    padding: 13,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  listIcon: {
    fontSize: 24,
  },
  listTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: farmerColors.forest,
  },
  listArrow: {
    color: farmerColors.forest,
    fontSize: 30,
    fontWeight: "600",
  },
  joinCard: {
    backgroundColor: farmerColors.paleGreen,
    borderWidth: 1,
    borderColor: farmerColors.sage,
    padding: 20,
    borderRadius: 20,
    marginTop: 24,
  },
  joinLink: {
    color: farmerColors.forest,
    fontWeight: "800",
    fontSize: 17,
    marginTop: 12,
  },
  pressed: {
    opacity: 0.82,
  },
});